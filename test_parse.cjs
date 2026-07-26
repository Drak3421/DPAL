const fs = require('fs');
const content = fs.readFileSync('public/dpal/data.js', 'utf8');

// Find where the array starts
const startIndex = content.indexOf('[');
const arrayStr = content.slice(startIndex).replace(/;$/, '');

try {
    const data = JSON.parse(arrayStr);
    const moviesCategory = data.find(cat => cat.name === "Movies / TV / Anime");
    console.log("Successfully parsed data.js!");
    console.log("Movies category found:", !!moviesCategory);
    if (moviesCategory) {
        console.log("Number of subcategories in Movies:", moviesCategory.subcategories.length);
    }
} catch (e) {
    console.error("Failed to parse:", e.message);
}
