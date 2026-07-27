const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../public/dpal/data.js');
const cacheFilePath = path.join(__dirname, '../.screenshot_cache.json');

// Read data.js
let dataContent = fs.readFileSync(dataFilePath, 'utf8');
let jsonStr = dataContent.replace(/^window\.fmhyData\s*=\s*/, '').trim();
if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

let fmhyData = JSON.parse(jsonStr);
let cache = {};

fmhyData.forEach(cat => {
    if(cat.subcategories) {
        cat.subcategories.forEach(sub => {
            if(sub.items) {
                sub.items.forEach(item => {
                    if (item.links && item.links.length > 0) {
                        cache[item.links[0].url] = true;
                    }
                });
            }
        });
    }
});

fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');
console.log(`Initialized baseline cache with ${Object.keys(cache).length} URLs.`);
