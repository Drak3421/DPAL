const fs = require('fs');

let index = fs.readFileSync('public/dpal/index.html', 'utf8');
let home = fs.readFileSync('public/dpal/home.html', 'utf8');

// 1. Extract Command Palette
const cmdStart = index.indexOf('<div id="commandPaletteOverlay"');
const cmdEnd = index.indexOf('<!-- Floating Widget -->');
const cmdHtml = index.substring(cmdStart, cmdEnd).trim();

// 2. Inject into home.html right before </body>
const scriptTags = `
    <!-- Search Data & Logic -->
    <script src="./data.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js"></script>
    <script src="./app.js"></script>
`;

home = home.replace('</body>', `\n    <!-- Command Palette -->\n    ${cmdHtml}\n    ${scriptTags}\n</body>`);

// 3. Remove the form redirect from the search bar
home = home.replace(
    '<form action="./index.html" method="GET" class="search-container">',
    '<div class="search-container cursor-pointer">'
);
home = home.replace('</form>', '</div>');
home = home.replace(
    '<input type="text" name="q" placeholder="Search anything..."',
    '<input type="text" id="searchInput" placeholder="Search anything..."'
);

fs.writeFileSync('public/dpal/home.html', home, 'utf8');
console.log("Successfully added Command Palette to home.html");
