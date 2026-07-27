const fs = require('fs');
const https = require('https');
const path = require('path');

const dataFilePath = path.join(__dirname, '../public/dpal/data.js');
const cacheFilePath = path.join(__dirname, '../.screenshot_cache.json');

// Read data.js and extract fmhyData
let dataContent = fs.readFileSync(dataFilePath, 'utf8');
// Strip the "const fmhyData = " prefix and any trailing semicolons to parse it as JSON
let jsonStr = dataContent.replace(/^window\.fmhyData\s*=\s*/, '').trim();
if (jsonStr.endsWith(';')) {
    jsonStr = jsonStr.slice(0, -1);
}

let fmhyData = [];
try {
    fmhyData = JSON.parse(jsonStr);
} catch(e) {
    console.error("Failed to parse data.js. Ensure it is valid JSON assigned to fmhyData.", e.message);
    process.exit(1);
}

// Load cache
let cache = {};
if (fs.existsSync(cacheFilePath)) {
    try {
        cache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    } catch(e) {
        console.warn("Invalid cache file, starting fresh.");
    }
}

// Extract all URLs
const allUrls = new Set();
fmhyData.forEach(cat => {
    if(cat.subcategories) {
        cat.subcategories.forEach(sub => {
            if(sub.items) {
                sub.items.forEach(item => {
                    if (item.links && item.links.length > 0) {
                        allUrls.add(item.links[0].url);
                    }
                });
            }
        });
    }
});

const newUrls = Array.from(allUrls).filter(url => !cache[url]);

if (newUrls.length === 0) {
    console.log("No new URLs found. Screenshot cache is up to date!");
    process.exit(0);
}

console.log(`Found ${newUrls.length} new URLs. Warming up screenshots...`);

// Process in batches with a delay
let currentIndex = 0;

function pingNext() {
    if (currentIndex >= newUrls.length) {
        // Save cache
        fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
        console.log("Finished warming up screenshots and saved cache!");
        
        // Add cache file to git staging if we're in a git hook
        require('child_process').execSync('git add .screenshot_cache.json');
        process.exit(0);
    }

    const url = newUrls[currentIndex];
    const encodedUrl = encodeURIComponent(url);
    const mshotsUrl = `https://s0.wp.com/mshots/v1/${encodedUrl}?w=600`;
    
    process.stdout.write(`[${currentIndex + 1}/${newUrls.length}] Pinging ${url}... `);
    
    https.get(mshotsUrl, (res) => {
        if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
            console.log("OK");
            cache[url] = true;
        } else {
            console.log(`Failed (${res.statusCode})`);
        }
        
        currentIndex++;
        setTimeout(pingNext, 200); // 200ms delay to avoid aggressive rate limiting
    }).on('error', (e) => {
        console.log(`Error (${e.message})`);
        currentIndex++;
        setTimeout(pingNext, 200);
    });
}

pingNext();
