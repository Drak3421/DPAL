const fs = require('fs');
let html = fs.readFileSync('public/dpal/home.html', 'utf8');

// 1. Revert the video opacity and gradient to be bright again
html = html.replace(
    /background:linear-gradient\(to bottom, rgba\(10,10,12,0\.7\), rgba\(10,10,12,0\.9\)\)/,
    'background:linear-gradient(to bottom, rgba(10,10,12,0.2), rgba(10,10,12,0.35))'
);

html = html.replace(
    /const BASE_OPACITY = 0\.45;/,
    'const BASE_OPACITY = 0.85;'
);

// 2. Add the contrast CSS block right before </style>
const contrastCSS = `
        /* High Contrast Enhancements for Bright Video */
        .hero h1, .hero p, .flow-step h3, .flow-step p, .newly-added-header h2, .newly-added-header p, .nav-logo {
            text-shadow: 0 4px 32px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.9);
        }
        
        .search-bar, .new-chip, .bento-card, .cat-generic, .hero-badge, .nav-btn, .onboarding-content {
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            background: rgba(10, 10, 12, 0.75) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
            border: 1px solid rgba(255,255,255,0.15) !important;
        }
        
        .new-chip:hover, .bento-card:hover, .search-bar:hover, .cat-generic:hover {
            background: rgba(20, 20, 24, 0.85) !important;
            border-color: rgba(255,255,255,0.3) !important;
        }
`;

if (!html.includes('High Contrast Enhancements')) {
    html = html.replace('</style>', contrastCSS + '\n    </style>');
}

fs.writeFileSync('public/dpal/home.html', html, 'utf8');
console.log("Successfully reverted background brightness and added high-contrast text/button styling.");
