const fs = require('fs');

let html = fs.readFileSync('public/dpal/home.html', 'utf8');

// 1. Inject Auto-redirect into <head>
const redirectScript = `
    <!-- Onboarding Auto-Redirect -->
    <script>
        (function() {
            try {
                const pref = localStorage.getItem('dpal-preferred-category');
                const skipTime = localStorage.getItem('dpal-preferred-skip');
                
                if (pref && pref !== 'skip') {
                    // Instant redirect before page renders
                    window.location.replace('./index.html#' + encodeURIComponent(pref));
                } else if (skipTime) {
                    const now = Date.now();
                    // 7 days = 7 * 24 * 60 * 60 * 1000 = 604800000 ms
                    if (now - parseInt(skipTime) > 604800000) {
                        localStorage.removeItem('dpal-preferred-skip');
                    }
                }
            } catch(e) {}
        })();
    </script>
`;

if (!html.includes('Onboarding Auto-Redirect')) {
    html = html.replace('<head>', `<head>\n${redirectScript}`);
}

// 2. Inject Modal UI and CSS into <body>
const modalUI = `
    <!-- Onboarding Modal -->
    <style>
        .category-btn {
            background: rgba(128, 128, 128, 0.05); 
            border: 1px solid var(--border); 
            padding: 14px 16px; 
            border-radius: 12px; 
            color: var(--text); 
            cursor: pointer; 
            font-family: var(--font-sans); 
            font-weight: 500; 
            font-size: 0.95rem; 
            text-align: left; 
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
        }
        .category-btn:hover {
            background: rgba(128, 128, 128, 0.15);
            border-color: var(--text-muted);
            transform: scale(1.02);
        }
        #skipOnboardingBtn:hover {
            background: rgba(128,128,128,0.1) !important;
            color: var(--text) !important;
        }
        /* Custom scrollbar for modal grid */
        .onboarding-grid::-webkit-scrollbar { width: 6px; }
        .onboarding-grid::-webkit-scrollbar-track { background: transparent; }
        .onboarding-grid::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 10px; }
    </style>
    <div id="onboardingModal" style="display: none; opacity: 0; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); transition: opacity 0.3s ease;">
        <div class="onboarding-content" style="background: var(--bg); border: 1px solid var(--border); border-radius: 24px; padding: 40px; max-width: 900px; width: 90%; max-height: 90vh; box-shadow: 0 24px 64px rgba(0,0,0,0.4); text-align: center; position: relative; display: flex; flex-direction: column;">
            
            <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 8px; color: var(--text);">What are you looking for?</h2>
            <p style="color: var(--text-muted); margin-bottom: 32px; font-size: 1.1rem;">Select a category. We'll automatically route you there next time.</p>
            
            <div class="onboarding-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 32px; text-align: left; overflow-y: auto; padding-right: 8px; flex: 1; min-height: 200px;">
                <!-- Buttons injected here -->
            </div>

            <div>
                <button id="skipOnboardingBtn" style="background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 12px 24px; border-radius: 99px; cursor: pointer; font-family: var(--font-sans); font-weight: 500; font-size: 0.9rem; transition: all 0.2s;">
                    Skip & explore homepage
                </button>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const pref = localStorage.getItem('dpal-preferred-category');
            const skipTime = localStorage.getItem('dpal-preferred-skip');
            const modal = document.getElementById('onboardingModal');
            
            if (!pref && !skipTime) {
                modal.style.display = 'flex';
                requestAnimationFrame(() => {
                    modal.style.opacity = '1';
                });
            }
            
            const cats = [
                "Adblocking & Privacy", "Artificial Intelligence", "Movies / TV / Anime",
                "Music & Audio", "Gaming & Emulation", "Books & Reading", "Downloading",
                "Torrenting", "Educational", "Android & iOS", "Linux & macOS", "Non-English",
                "Miscellaneous", "System Tools", "File Tools", "Internet Tools", "Social Media Tools",
                "Text Tools", "Gaming Tools", "Image Tools", "Video Tools", "Developer Tools"
            ];
            
            const grid = modal.querySelector('.onboarding-grid');
            cats.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'category-btn';
                
                let icon = 'folder';
                const lower = cat.toLowerCase();
                if (lower.includes('movie') || lower.includes('video')) icon = 'movie';
                else if (lower.includes('music') || lower.includes('audio')) icon = 'headphones';
                else if (lower.includes('gaming')) icon = 'sports_esports';
                else if (lower.includes('book') || lower.includes('read') || lower.includes('education')) icon = 'menu_book';
                else if (lower.includes('android') || lower.includes('ios') || lower.includes('mobile')) icon = 'phone_iphone';
                else if (lower.includes('developer') || lower.includes('tool')) icon = 'code';
                else if (lower.includes('download') || lower.includes('torrent')) icon = 'download';
                else if (lower.includes('ai') || lower.includes('artificial')) icon = 'smart_toy';
                else if (lower.includes('privacy')) icon = 'security';
                else if (lower.includes('social')) icon = 'group';
                
                btn.innerHTML = \`<span class="material-symbols-outlined" style="opacity: 0.8; font-size: 20px; margin-right: 12px;">\${icon}</span><span style="flex: 1;">\${cat}</span>\`;
                
                btn.addEventListener('click', () => {
                    localStorage.setItem('dpal-preferred-category', cat);
                    window.location.href = './index.html#' + encodeURIComponent(cat);
                });
                grid.appendChild(btn);
            });
            
            document.getElementById('skipOnboardingBtn').addEventListener('click', () => {
                localStorage.setItem('dpal-preferred-skip', Date.now().toString());
                modal.style.opacity = '0';
                setTimeout(() => modal.style.display = 'none', 300);
            });
        });
    </script>
`;

if (!html.includes('Onboarding Modal')) {
    html = html.replace('</body>', `${modalUI}\n</body>`);
}

fs.writeFileSync('public/dpal/home.html', html, 'utf8');
console.log("Injected onboarding modal into home.html!");
