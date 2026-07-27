const fs = require('fs');

function addThemeToggle(filePath, isHome) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add inline script to <head> to prevent theme flashing
    const themeInitScript = `
    <script>
        (function() {
            const savedTheme = localStorage.getItem('dpal-theme');
            if (savedTheme === 'light') {
                document.documentElement.classList.remove('dark');
            } else if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                // Default to dark
                document.documentElement.classList.add('dark');
            }
        })();
    </script>
    `;
    
    // Insert after <head>
    if (!content.includes('dpal-theme')) {
        content = content.replace('<head>', `<head>${themeInitScript}`);
    }

    // 2. Add Theme Toggle Button UI
    // In home.html it goes in nav-inner before timer
    // In index.html it goes in flex items-center before rightSidebarToggle
    const btnHtml = `
            <button class="themeToggleBtn material-symbols-outlined hover:bg-surface-container transition-colors duration-200" 
                    style="margin-right: 16px; background: transparent; border: 1px solid var(--outline); color: var(--on-bg); cursor: pointer; border-radius: 50%; width: 36px; height: 36px; display: grid; place-items: center; font-size: 20px;">
                light_mode
            </button>`;

    if (isHome) {
        if (!content.includes('themeToggleBtn')) {
            content = content.replace('<div style="flex: 1;"></div>', `<div style="flex: 1;"></div>${btnHtml}`);
        }
    } else {
        if (!content.includes('themeToggleBtn')) {
            // Find right side of header
            content = content.replace('<button id="rightSidebarToggle"', `${btnHtml}\n                <button id="rightSidebarToggle"`);
        }
    }

    // 3. Add JS logic at the bottom of the body
    const logicScript = `
    <!-- Theme Toggle Logic -->
    <script>
        document.querySelectorAll('.themeToggleBtn').forEach(btn => {
            // Set initial icon
            btn.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
            
            btn.addEventListener('click', () => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('dpal-theme', isDark ? 'dark' : 'light');
                
                document.querySelectorAll('.themeToggleBtn').forEach(b => {
                    b.textContent = isDark ? 'light_mode' : 'dark_mode';
                });
            });
        });
    </script>
    `;
    if (!content.includes('Theme Toggle Logic')) {
        content = content.replace('</body>', `${logicScript}\n</body>`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

addThemeToggle('public/dpal/home.html', true);
addThemeToggle('public/dpal/index.html', false);

console.log("Theme toggle added successfully!");
