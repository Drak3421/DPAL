const fs = require('fs');
let html = fs.readFileSync('public/dpal/home.html', 'utf8');

// 1. Remove the theme toggle button
const toggleBtnRegex = /<button class="themeToggleBtn[^>]*>[\s\S]*?<\/button>/;
html = html.replace(toggleBtnRegex, '');

// 2. Remove the theme toggle script
const toggleScriptRegex = /<!-- Theme Toggle Logic -->\s*<script>[\s\S]*?<\/script>/;
html = html.replace(toggleScriptRegex, '');

// 3. Remove all Light Mode Overrides CSS
const lightModeCssRegex = /\/\* Light Mode Overrides \*\/[\s\S]*?html:not\(\.dark\) \.newly-added-header p \{ color: var\(--text-muted\); \}\s*/;
html = html.replace(lightModeCssRegex, '');

// 4. Force 'dark' class on html and remove any script that toggles it based on localStorage in the <head>
const headScriptRegex = /<script>\s*\(\s*function\(\)\s*\{[\s\S]*?const savedTheme = localStorage\.getItem\('dpal-theme'\);[\s\S]*?\}\)\(\);\s*<\/script>/;
html = html.replace(headScriptRegex, '');

fs.writeFileSync('public/dpal/home.html', html, 'utf8');
console.log("Successfully removed light mode and toggle button from home.html!");
