const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/naman/Music/observation/kind-company-keeper';
const destDir = 'C:/Users/naman/Music/observation/harmony-grove-insights';

function copyRecursiveSync(src, dest) {
    const stats = fs.existsSync(src) ? fs.statSync(src) : null;
    if (stats && stats.isDirectory()) {
        const basename = path.basename(src);
        if (basename === '.git' || basename === 'node_modules' || basename === '.lovable' || basename === '.vercel') {
            return;
        }
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        if (stats) {
            fs.copyFileSync(src, dest);
        }
    }
}

console.log('Syncing files...');
copyRecursiveSync(srcDir, destDir);

console.log('Applying performance patch...');
let appJs = fs.readFileSync('public/dpal/app.js', 'utf8');
const targetAppJs = /const revealObserver = new IntersectionObserver\(\(entries\)\s*=>\s*\{\s*entries\.forEach\(entry\s*=>\s*\{\s*if\s*\(entry\.isIntersecting\)\s*\{\s*entry\.target\.classList\.add\('is-visible'\);\s*\}\s*\}\);\s*\}, \{ root: null, rootMargin: '0px', threshold: 0\.1 \}\);/g;
const replacementAppJs = `const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });`;

appJs = appJs.replace(targetAppJs, replacementAppJs);

console.log('Applying animation patch...');
appJs = appJs.replace(
    "panel.classList.remove('translate-x-full');",
    "panel.classList.remove('is-closing', 'translate-x-full');\n        panel.classList.add('is-opening');"
);
appJs = appJs.replace(
    "panel.classList.add('translate-x-full');",
    "panel.classList.add('is-closing');\n        panel.classList.remove('is-opening');"
);
appJs = appJs.replace(
    "setTimeout(() => overlay.classList.add('hidden'), 300);",
    "setTimeout(() => {\n            overlay.classList.add('hidden');\n            panel.classList.remove('is-closing');\n            panel.classList.add('translate-x-full');\n        }, 400);"
);

fs.writeFileSync('public/dpal/app.js', appJs, 'utf8');

console.log('Applying audio patch...');
let audioPlayer = fs.readFileSync('src/components/AudioPlayer.tsx', 'utf8');
audioPlayer = audioPlayer.replace('sharedAudio.preload = "none";', 'sharedAudio.preload = "auto";');
audioPlayer = audioPlayer.replace(/export function getSharedAudio\(\) \{/g, `if (typeof window !== "undefined") {\n  getSharedAudio();\n}\n\nexport function getSharedAudio() {`);
fs.writeFileSync('src/components/AudioPlayer.tsx', audioPlayer, 'utf8');

console.log('All updates complete.');
