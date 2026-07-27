const fs = require('fs');
let homeHtml = fs.readFileSync('public/dpal/home.html', 'utf8');

const lightCss = `
        /* Light Mode Overrides */
        html:not(.dark) {
            --bg: #ffffff;
            --text: #111111;
            --text-muted: #666666;
            --surface: #f9f9f9;
            --surface-hover: #f1f1f1;
            --border: rgba(0,0,0,0.1);
        }
        html:not(.dark) body { background-color: var(--bg); color: var(--text); }
        html:not(.dark) body::before {
            background-image: linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px);
        }
        html:not(.dark) .nav { background: rgba(255, 255, 255, 0.8); border-bottom: 1px solid var(--border); }
        html:not(.dark) .nav-logo { color: #111; }
        html:not(.dark) .nav-btn { background: #111; color: #fff; }
        html:not(.dark) .hero h1 { background: linear-gradient(180deg, #111 0%, #555 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        html:not(.dark) .hero p { color: var(--text-muted); }
        html:not(.dark) .hero-badge { background: rgba(0,0,0,0.05); }
        html:not(.dark) .hero-badge span:last-child { color: #333; }
        html:not(.dark) .search-bar { background: #fff; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        html:not(.dark) .search-bar:hover { background: #fafafa; border-color: rgba(0,0,0,0.2); }
        html:not(.dark) .search-left .material-symbols-outlined { color: #111; }
        html:not(.dark) .search-left input { color: #111; }
        html:not(.dark) .search-kbd { background: #f0f0f0; color: #111; border: 1px solid #ddd; }
        html:not(.dark) .bento-card { background: #fff; border: 1px solid var(--border); }
        html:not(.dark) .bento-card:hover { border-color: rgba(0,0,0,0.2); background: #fafafa; }
        html:not(.dark) .bento-card h3 { color: #111; }
        html:not(.dark) .bento-card p { color: var(--text-muted); }
        html:not(.dark) .topic-pill { background: rgba(0,0,0,0.05); color: #333; }
        html:not(.dark) .new-chip { background: #fff; border: 1px solid var(--border); color: #111; }
        html:not(.dark) .new-chip:hover { border-color: #10b981; background: rgba(16,185,129,0.05); }
        html:not(.dark) .new-chip .count { background: rgba(0,0,0,0.05); color: #333; }
`;

if (!homeHtml.includes('Light Mode Overrides')) {
    homeHtml = homeHtml.replace('<style>', '<style>\n' + lightCss + '\n');
    fs.writeFileSync('public/dpal/home.html', homeHtml, 'utf8');
}
console.log("Light mode CSS injected");
