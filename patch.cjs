const fs = require('fs');
let app = fs.readFileSync('public/dpal/app.js', 'utf8');

// 1. Fix sentinel
app = app.replace(
    "contentContainer.parentNode.insertBefore(sentinel, contentContainer.nextSibling);",
    "if (contentContainer && contentContainer.parentNode) { contentContainer.parentNode.insertBefore(sentinel, contentContainer.nextSibling); }"
);

// 2. Early return in init if no contentContainer
app = app.replace(
    "function init() {\n        buildNav();",
    "function init() {\n        setupSearchAndSort();\n        setupCommandPalette();\n        updateRecentHistoryUI();\n        if (!contentContainer) return;\n        buildNav();"
);

// 3. Prevent renderNextBatch crash
app = app.replace(
    "function renderNextBatch() {",
    "function renderNextBatch() {\n        if (!contentContainer) return;"
);

// 4. Update window.goToCategory to redirect to index.html if we are on home.html
app = app.replace(
    "window.goToCategory = function(cat, sub = null) {",
    "window.goToCategory = function(cat, sub = null) {\n        if (!contentContainer) {\n            window.location.href = './index.html#' + encodeURIComponent(cat);\n            return;\n        }"
);

fs.writeFileSync('public/dpal/app.js', app, 'utf8');
console.log("Patched app.js successfully");
