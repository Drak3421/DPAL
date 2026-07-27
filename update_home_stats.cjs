const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'dpal', 'data.js');
const homePath = path.join(__dirname, 'public', 'dpal', 'home.html');

try {
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const startIndex = dataContent.indexOf('[');
    const arrayStr = dataContent.slice(startIndex).replace(/;$/, '');
    const data = JSON.parse(arrayStr);

    let homeHtml = fs.readFileSync(homePath, 'utf8');
    let totalResources = 0;
    
    const catMap = {};
    for (const cat of data) {
        let catTotal = 0;
        if (cat.subcategories) {
            for (const sub of cat.subcategories) {
                catTotal += sub.items.length;
            }
        }
        catMap[cat.name] = catTotal;
        if (cat.name !== "Newly Added Websites") {
            totalResources += catTotal;
        }
    }
    
    // Update main hero stat
    const formattedTotal = new Intl.NumberFormat('en-US').format(totalResources);
    homeHtml = homeHtml.replace(/<span>[\d,]+\+? Verified Resources<\/span>/g, `<span>${formattedTotal}+ Verified Resources</span>`);
    
    // Update individual pills using a reliable regex
    // Movies / TV / Anime
    if (catMap['Movies / TV / Anime'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Movies.*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Movies / TV / Anime']} topics$2`);
    }
    if (catMap['Artificial Intelligence'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Artificial.*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Artificial Intelligence']} topics$2`);
    }
    if (catMap['Adblocking & Privacy'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Adblocking.*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Adblocking & Privacy']} topics$2`);
    }
    if (catMap['Music & Audio'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Music.*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Music & Audio']} topics$2`);
    }
    if (catMap['Books & Reading'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Books.*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Books & Reading']} topics$2`);
    }
    if (catMap['Gaming & Emulation'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Gaming.*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Gaming & Emulation']} topics$2`);
    }
    if (catMap['Android & iOS'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Android.*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Android & iOS']} topics$2`);
    }
    if (catMap['Developer Tools'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Developer.*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Developer Tools']} topics$2`);
    }
    if (catMap['Torrenting'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Torrenting".*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Torrenting']} topics$2`);
    }
    if (catMap['Educational'] !== undefined) {
        homeHtml = homeHtml.replace(/(href="\.\/index\.html#Educational".*?<div class="topic-pill">)[\d,]+ topics(<\/div>)/s, `$1${catMap['Educational']} topics$2`);
    }

    // Generate HTML for Newly Added chips
    const newCat = data.find(c => c.name === "Newly Added Websites");
    let chipsHtml = '';
    if (newCat && newCat.subcategories) {
        for (const sub of newCat.subcategories) {
            const count = sub.items.length;
            // encode the hash link properly, e.g. "Newly Added Websites" -> #Newly%20Added%20Websites
            chipsHtml += `\n            <a href="./index.html#Newly%20Added%20Websites" class="new-chip">
                ${sub.name}
                <span class="count">${count}</span>
            </a>`;
        }
    }
    
    // Inject chips into home.html
    const chipRegex = /<!-- NEW_WEBSITES_START -->.*?<!-- NEW_WEBSITES_END -->/s;
    if (chipsHtml) {
        homeHtml = homeHtml.replace(chipRegex, `<!-- NEW_WEBSITES_START -->${chipsHtml}\n            <!-- NEW_WEBSITES_END -->`);
    } else {
        homeHtml = homeHtml.replace(chipRegex, `<!-- NEW_WEBSITES_START -->\n            <p style="color: var(--text-muted); font-size: 0.9rem;">No new sites this week. Check back later!</p>\n            <!-- NEW_WEBSITES_END -->`);
    }

    // Inject timestamp for countdown timer
    const timeRegex = /\/\/ <!-- SCRAPER_TIME_START -->.*?\/\/ <!-- SCRAPER_TIME_END -->/s;
    homeHtml = homeHtml.replace(timeRegex, `// <!-- SCRAPER_TIME_START -->\n        window.LAST_SCRAPE_TIME = ${Date.now()};\n        // <!-- SCRAPER_TIME_END -->`);

    fs.writeFileSync(homePath, homeHtml, 'utf8');
    console.log("Successfully updated home.html stats with total:", formattedTotal);

} catch (err) {
    console.error("Failed to update home stats:", err);
}
