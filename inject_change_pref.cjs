const fs = require('fs');

let html = fs.readFileSync('public/dpal/index.html', 'utf8');

const changePrefUI = `
                <button id="changePrefBtn" class="flex items-center gap-3 bg-surface border border-grid-line text-on-surface font-label-sm px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors w-full text-left mb-6 cursor-pointer" style="display: none;">
                    <span class="material-symbols-outlined text-lg text-primary">manage_search</span>
                    Change Default Category
                </button>
`;

if (!html.includes('changePrefBtn')) {
    html = html.replace('<!-- Category Chips Container (Populated by JS) -->', `${changePrefUI}\n                <!-- Category Chips Container (Populated by JS) -->`);
    
    const changePrefScript = `
    <!-- Change Preference Logic -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const pref = localStorage.getItem('dpal-preferred-category');
            if (pref && pref !== 'skip') {
                const btn = document.getElementById('changePrefBtn');
                if (btn) {
                    btn.style.display = 'flex';
                    btn.addEventListener('click', () => {
                        localStorage.removeItem('dpal-preferred-category');
                        window.location.href = './home.html';
                    });
                }
            }
        });
    </script>
    `;
    
    html = html.replace('</body>', `${changePrefScript}\n</body>`);
}

fs.writeFileSync('public/dpal/index.html', html, 'utf8');
console.log("Injected change preference button into index.html!");
