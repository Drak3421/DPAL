const fs = require('fs');

let app = fs.readFileSync('public/dpal/app.js', 'utf8');

app = app.replace(
    /function init\(\) \{[\s\S]*?parseHash\(\); \/\/ This will trigger renderChips and renderContent\n    \}/,
    `function init() {
        setupOfflineListener();
        initFuse();
        if (typeof fmhyData === 'undefined' || !fmhyData || fmhyData.length === 0) {
            if (contentContainer) {
                contentContainer.innerHTML = \`<div class="font-body-lg text-muted-text text-center py-20">No resources available.</div>\`;
            }
            return;
        }

        setupThemeToggle();
        setupSearchAndSort();
        setupAdBlocker();
        
        if (!contentContainer) {
            return; // We are on home.html, don't run directory logic
        }

        setupCustomSites();
        checkForUpdates();

        parseHash(); // This will trigger renderChips and renderContent
    }`
);

fs.writeFileSync('public/dpal/app.js', app, 'utf8');
console.log("App.js initialization patched securely.");
