const fs = require('fs');

let css = fs.readFileSync('public/dpal/index.css', 'utf8');

const overrides = `
/* Light Mode Force Overrides (Fix for hardcoded dark mode CSS) */
html:not(.dark) {
    background-color: var(--bg) !important;
}
html:not(.dark) body {
    background-color: var(--bg) !important;
    color: var(--on-bg) !important;
}
html:not(.dark) #leftSidebar h3 { color: #555 !important; }
html:not(.dark) #leftSidebar #navChips a { color: #333 !important; }
html:not(.dark) #leftSidebar #navChips a.active { color: #111 !important; background: rgba(0,0,0,0.08) !important; }
html:not(.dark) #leftSidebar #navChips a:hover { color: #111 !important; background: rgba(0,0,0,0.05) !important; }

html:not(.dark) .bento-card, html:not(.dark) .tilt-card { 
    background-color: #fff !important; 
    border-color: rgba(0,0,0,0.1) !important; 
}
html:not(.dark) .bento-card:hover, html:not(.dark) .tilt-card:hover { 
    background-color: #fafafa !important; 
    border-color: rgba(0,0,0,0.2) !important; 
}
html:not(.dark) .bento-card h3, html:not(.dark) .tilt-card h3 { color: #111 !important; }
html:not(.dark) .bento-card p, html:not(.dark) .tilt-card p { color: #555 !important; }
html:not(.dark) .bento-card .text-primary, html:not(.dark) .tilt-card .text-primary { color: #111 !important; }

html:not(.dark) #commandInput { color: #111 !important; }
html:not(.dark) #commandPalette { background-color: #fff !important; border-color: rgba(0,0,0,0.1) !important; }
html:not(.dark) .cmd-item.active { background: rgba(0,0,0,0.05) !important; }
html:not(.dark) .cmd-item-name { color: #111 !important; }

html:not(.dark) #sortSelect { background: #fff !important; color: #111 !important; border-color: rgba(0,0,0,0.2) !important; }
html:not(.dark) #sortSelect option { background: #fff !important; color: #111 !important; }

html:not(.dark) .nav { background: rgba(255,255,255,0.8) !important; border-bottom: 1px solid rgba(0,0,0,0.1) !important; }
html:not(.dark) .nav-logo { color: #111 !important; }
html:not(.dark) .nav-btn { background: #111 !important; color: #fff !important; }

html:not(.dark) .hero h1 { background: none !important; -webkit-text-fill-color: #111 !important; color: #111 !important; }
html:not(.dark) .search-bar { background: #fff !important; border-color: rgba(0,0,0,0.1) !important; }
html:not(.dark) .search-left input { color: #111 !important; }
html:not(.dark) .search-left .material-symbols-outlined { color: #111 !important; }

/* Force text visibility */
html:not(.dark) h1, html:not(.dark) h2, html:not(.dark) h3, html:not(.dark) p {
    color: inherit;
}
html:not(.dark) .text-white { color: #111 !important; }
`;

if (!css.includes('Light Mode Force Overrides')) {
    css += '\n' + overrides;
    fs.writeFileSync('public/dpal/index.css', css, 'utf8');
}
console.log("Light mode CSS appended successfully");
