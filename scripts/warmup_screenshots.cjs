const fs = require('fs');
const https = require('https');
const path = require('path');

const dataFilePath = path.join(__dirname, '../public/dpal/data.js');
const cacheFilePath = path.join(__dirname, '../.screenshot_cache.json');

// Read data.js and extract fmhyData
let dataContent = fs.readFileSync(dataFilePath, 'utf8');
let jsonStr = dataContent.replace(/^window\.fmhyData\s*=\s*/, '').trim();
if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

let fmhyData = [];
try {
    fmhyData = JSON.parse(jsonStr);
} catch(e) {
    console.error("Failed to parse data.js.", e.message);
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

console.log(`Found ${newUrls.length} missing URLs. Warming up screenshots...`);

let currentIndex = 0;
let saveCounter = 0;

function pingNext() {
    if (currentIndex >= newUrls.length) {
        fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
        console.log("\nFinished warming up screenshots and saved cache!");
        try {
            require('child_process').execSync('git add .screenshot_cache.json');
        } catch (e) {}
        process.exit(0);
    }

    const url = newUrls[currentIndex];
    const encodedUrl = encodeURIComponent(url);
    const mshotsUrl = `https://s0.wp.com/mshots/v1/${encodedUrl}?w=600`;
    
    // Use stdout.write to keep it on one line if possible, or just log occasionally
    if (currentIndex % 50 === 0) {
        console.log(`[${currentIndex + 1}/${newUrls.length}] Pinging batch starting with ${url}...`);
    }
    
    https.get(mshotsUrl, (res) => {
        if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
            cache[url] = true;
        }
        
        currentIndex++;
        saveCounter++;
        
        // Save cache every 100 requests to preserve progress
        if (saveCounter >= 100) {
            fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
            saveCounter = 0;
        }
        
        setTimeout(pingNext, 200); // 200ms delay (5 req/sec)
    }).on('error', (e) => {
        currentIndex++;
        setTimeout(pingNext, 200);
    });
}

pingNext();
