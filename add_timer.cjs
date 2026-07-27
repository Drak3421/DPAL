const fs = require('fs');

let homeHtml = fs.readFileSync('public/dpal/home.html', 'utf8');
let updateStats = fs.readFileSync('update_home_stats.cjs', 'utf8');

// 1. Add timer UI to home.html nav bar
homeHtml = homeHtml.replace(
    '<!-- Downloads -->',
    `<!-- Update Timer -->
                    <div class="hidden md:flex flex-col items-end mr-4">
                        <span class="text-[10px] font-label-sm text-muted-text uppercase tracking-wider mb-[2px]">Next Database Sync</span>
                        <div id="updateTimer" class="text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            Calculating...
                        </div>
                    </div>
                    <!-- Downloads -->`
);

// 2. Add timer logic and timestamp block to bottom of home.html
const timerScript = `
    <!-- Timer Logic -->
    <script>
        // <!-- SCRAPER_TIME_START -->
        window.LAST_SCRAPE_TIME = ${Date.now()};
        // <!-- SCRAPER_TIME_END -->

        function updateTimer() {
            const el = document.getElementById('updateTimer');
            if (!el || !window.LAST_SCRAPE_TIME) return;

            // Next update is 10 days after LAST_SCRAPE_TIME
            const targetDate = window.LAST_SCRAPE_TIME + (10 * 24 * 60 * 60 * 1000);
            const now = Date.now();
            let diff = targetDate - now;

            if (diff <= 0) {
                el.textContent = "Updating now...";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diff -= days * (1000 * 60 * 60 * 24);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            diff -= hours * (1000 * 60 * 60);
            const mins = Math.floor(diff / (1000 * 60));
            diff -= mins * (1000 * 60);
            const secs = Math.floor(diff / 1000);

            el.textContent = \`\${days}d \${hours.toString().padStart(2, '0')}h \${mins.toString().padStart(2, '0')}m \${secs.toString().padStart(2, '0')}s\`;
        }
        setInterval(updateTimer, 1000);
        updateTimer();
    </script>
`;

homeHtml = homeHtml.replace('</body>', `${timerScript}\n</body>`);

// 3. Update update_home_stats.cjs to inject timestamp
updateStats = updateStats.replace(
    `fs.writeFileSync(homePath, homeHtml, 'utf8');`,
    `
    // Update scraper timestamp for the countdown timer
    const timeRegex = /<!-- SCRAPER_TIME_START -->.*?<!-- SCRAPER_TIME_END -->/s;
    const nowMs = Date.now();
    homeHtml = homeHtml.replace(timeRegex, \`<!-- SCRAPER_TIME_START -->\\n        window.LAST_SCRAPE_TIME = \${nowMs};\\n        <!-- SCRAPER_TIME_END -->\`);

    fs.writeFileSync(homePath, homeHtml, 'utf8');`
);

fs.writeFileSync('public/dpal/home.html', homeHtml, 'utf8');
fs.writeFileSync('update_home_stats.cjs', updateStats, 'utf8');

console.log("Timer added successfully!");
