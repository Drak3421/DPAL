const fs = require('fs');

let js = fs.readFileSync('public/dpal/app.js', 'utf8');

// 1. Update parseHash to default to pref
const targetHash = `
    function parseHash() {
        const hash = window.location.hash.substring(1); // remove '#'
        if (!hash || hash.startsWith('subcat-')) {
            currentCategory = 'All'; // Default to All if they refreshed on a subcat anchor
            searchQuery = '';
        } else {
`;

const replacementHash = `
    function parseHash() {
        const hash = window.location.hash.substring(1); // remove '#'
        if (!hash || hash.startsWith('subcat-')) {
            const pref = localStorage.getItem('dpal-preferred-category');
            if (pref && pref !== 'skip') {
                currentCategory = pref;
            } else {
                currentCategory = 'All'; // Default to All if they refreshed on a subcat anchor
            }
            searchQuery = '';
        } else {
`;

js = js.replace(targetHash.trim(), replacementHash.trim());

// 2. Update renderChips to pin pref to top
const targetChips = `
        navChips.appendChild(createChip('All', currentCategory === 'All'));
        navChips.appendChild(createChip('My Favorites', currentCategory === 'My Favorites'));
        navChips.appendChild(createChip('My Custom Sites', currentCategory === 'My Custom Sites'));
        navChips.appendChild(createChip('Recent', currentCategory === 'Recent'));

        fmhyData.forEach(cat => {
            if (!cat.name) return;
            const isActive = currentCategory === cat.name;
`;

const replacementChips = `
        navChips.appendChild(createChip('All', currentCategory === 'All'));
        navChips.appendChild(createChip('My Favorites', currentCategory === 'My Favorites'));
        navChips.appendChild(createChip('My Custom Sites', currentCategory === 'My Custom Sites'));
        navChips.appendChild(createChip('Recent', currentCategory === 'Recent'));

        const pref = localStorage.getItem('dpal-preferred-category');
        if (pref && pref !== 'skip') {
            const prefIsActive = currentCategory === pref;
            const prefChip = createChip(pref, prefIsActive);
            const chevronHtml = (prefIsActive) ? \`<span class="material-symbols-outlined text-sm transition-transform duration-300 \${isSubcategoriesExpanded ? 'rotate-180' : ''}">expand_more</span>\` : '';
            prefChip.innerHTML = \`<span class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-[#f59e0b] fill-current">star</span>\${pref}</span> \${chevronHtml}\`;
            navChips.appendChild(prefChip);
            
            const catData = fmhyData.find(c => c.name === pref);
            if (prefIsActive && isSubcategoriesExpanded && catData && catData.subcategories) {
                catData.subcategories.forEach(sub => {
                    if (sub.items && sub.items.length > 0) {
                        navChips.appendChild(createChip(sub.name, false, true));
                    }
                });
            }
        }

        fmhyData.forEach(cat => {
            if (!cat.name || cat.name === pref) return;
            const isActive = currentCategory === cat.name;
`;

js = js.replace(targetChips.trim(), replacementChips.trim());

fs.writeFileSync('public/dpal/app.js', js, 'utf8');
console.log("Updated app.js!");
