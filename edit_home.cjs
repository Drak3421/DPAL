const fs = require('fs');
let html = fs.readFileSync('public/dpal/home.html', 'utf8');

const target = `            <a href="./index.html#All" class="nav-btn">
                Open Directory
                <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span>
            </a>`;
const replacement = `            <a href="./index.html#All" class="nav-btn">
                Open Website
                <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span>
            </a>`;

// Normalize line endings in both source text and target/replacement for exact match
html = html.replace(/\r\n/g, '\n');

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('public/dpal/home.html', html, 'utf8');
    console.log("Successfully replaced Open Directory with Open Website");
} else {
    console.log("Failed to find target string in home.html");
}
