const fs = require('fs');
const https = require('https');
const path = require('path');

// The FMHY base raw URL for markdown files
const BASE_URL = 'https://raw.githubusercontent.com/fmhy/FMHYEdit/main/docs/';

// Map FMHY markdown files to DPAL Categories
const categoryMapping = [
    { file: 'video.md', name: 'Movies / TV / Anime' },
    { file: 'audio.md', name: 'Music & Audio' },
    { file: 'reading.md', name: 'Books & Reading' },
    { file: 'gaming.md', name: 'Gaming & Emulation' },
    { file: 'mobile.md', name: 'Android & iOS' },
    { file: 'developer-tools.md', name: 'Developer Tools' },
    { file: 'torrenting.md', name: 'Torrenting' },
    { file: 'educational.md', name: 'Educational' },
    { file: 'privacy.md', name: 'Adblocking & Privacy' },
    { file: 'non-english.md', name: 'Non-English' },
    { file: 'misc.md', name: 'Miscellaneous' },
    { file: 'ai.md', name: 'Artificial Intelligence' },
    { file: 'system-tools.md', name: 'System Tools' },
    { file: 'internet-tools.md', name: 'Internet Tools' },
    { file: 'social-media-tools.md', name: 'Social Media Tools' },
    { file: 'image-tools.md', name: 'Image Tools' },
    { file: 'video-tools.md', name: 'Video Tools' },
    { file: 'file-tools.md', name: 'File Tools' },
    { file: 'text-tools.md', name: 'Text Tools' },
    { file: 'gaming-tools.md', name: 'Gaming Tools' },
    { file: 'linux-macos.md', name: 'Linux / MacOS' },
    { file: 'downloading.md', name: 'Downloading' },
    { file: 'storage.md', name: 'Storage' }
];

const dataPath = path.join(__dirname, 'public', 'dpal', 'data.js');

function fetchMarkdown(filename) {
    return new Promise((resolve, reject) => {
        https.get(BASE_URL + filename, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch ${filename}: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseMarkdown(md, categoryName) {
    const lines = md.split('\n');
    let subcategories = [];
    let currentSub = null;
    let currentDesc = "";

    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;

    for (let line of lines) {
        if (line.startsWith('## ') || line.startsWith('### ')) {
            const subName = line.replace(/^#+\s*/, '').trim();
            currentSub = { name: subName, items: [] };
            subcategories.push(currentSub);
            currentDesc = subName; // Use subcategory name as description for simplicity
        } else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            if (currentSub) {
                let match;
                let links = [];
                // Extract all markdown links from the bullet point
                while ((match = linkRegex.exec(line)) !== null) {
                    links.push({ name: match[1], url: match[2] });
                }
                if (links.length > 0) {
                    currentSub.items.push({
                        links: links,
                        description: currentDesc,
                        starred: line.includes('⭐')
                    });
                }
            }
        }
    }
    
    // Filter out empty subcategories
    return subcategories.filter(sub => sub.items.length > 0);
}

function getExistingUrls(dataArr) {
    const urls = new Set();
    for (const cat of dataArr) {
        if (cat.name === "Newly Added Websites") continue; // Skip the new ones container
        if (cat.subcategories) {
            for (const sub of cat.subcategories) {
                for (const item of sub.items) {
                    if (item.links) {
                        for (const link of item.links) {
                            urls.add(link.url);
                        }
                    }
                }
            }
        }
    }
    return urls;
}

async function updateDirectory() {
    console.log("Fetching old data to diff...");
    const oldContent = fs.existsSync(dataPath) ? fs.readFileSync(dataPath, 'utf8') : '';
    let oldUrls = new Set();
    
    try {
        const startIndex = oldContent.indexOf('[');
        if (startIndex !== -1) {
            const arrayStr = oldContent.slice(startIndex).replace(/;$/, '');
            const oldData = JSON.parse(arrayStr);
            oldUrls = getExistingUrls(oldData);
            console.log(`Found ${oldUrls.size} existing URLs.`);
        }
    } catch(e) {
        console.warn("Could not parse existing data.js, assuming empty database.");
    }

    const newData = [];
    const newlyAddedSubcategories = [];

    console.log("Fetching new data from FMHY...");
    for (const mapping of categoryMapping) {
        try {
            console.log(`- Fetching ${mapping.file}...`);
            const md = await fetchMarkdown(mapping.file);
            const subcategories = parseMarkdown(md, mapping.name);
            
            // Build the main category
            newData.push({
                name: mapping.name,
                subcategories: subcategories
            });

            // Diff for new items
            let newItemsForCat = [];
            for (const sub of subcategories) {
                for (const item of sub.items) {
                    // if the primary link isn't in oldUrls, it's new
                    if (item.links.length > 0 && !oldUrls.has(item.links[0].url)) {
                        newItemsForCat.push(item);
                    }
                }
            }

            if (newItemsForCat.length > 0) {
                newlyAddedSubcategories.push({
                    name: `New in ${mapping.name}`,
                    items: newItemsForCat
                });
            }

        } catch (err) {
            console.error(`Error processing ${mapping.file}:`, err.message);
        }
    }

    // Insert "Newly Added Websites" category at the very beginning
    if (newlyAddedSubcategories.length > 0) {
        console.log(`Found ${newlyAddedSubcategories.reduce((acc, sub) => acc + sub.items.length, 0)} newly added websites!`);
        newData.unshift({
            name: "Newly Added Websites",
            subcategories: newlyAddedSubcategories
        });
    } else {
        console.log("No new websites found.");
    }

    // Write back to data.js
    const fileContent = `window.fmhyData = ${JSON.stringify(newData, null, 2)};`;
    fs.writeFileSync(dataPath, fileContent, 'utf8');
    console.log("Successfully rebuilt data.js!");
}

updateDirectory();
