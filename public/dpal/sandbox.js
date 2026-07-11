const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const dom = new JSDOM('', { runScripts: 'dangerously' });
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(""document.addEventListener('DOMContentLoaded', () => {"", '(() => {');
appjs = appjs.replace('init();\n});', 'init(); setTimeout(() => console.log(""CONTAINER HTML:"", document.getElementById(""contentContainer"").innerHTML.length), 1000); })();');

dom.window.document.body.innerHTML = \
<div id="app">
  <div id="searchContainer"><input id="searchInput"/><input id="mobileSearchInput"/></div>
  <div id="navChips"></div>
  <div id="contentContainer"></div>
  <div id="sentinel"></div>
</div>
<div id="onboardingOverlay"></div>
<div id="onboardingModal"></div>
<button id="startExploringBtn"></button>
<div id="detailsPanelOverlay"></div>
<div id="detailsPanel"></div>
<button id="dpClose"></button>
<div id="dpTitle"></div>
<div id="dpDesc"></div>
<div id="dpUrlText"></div>
<a id="dpLaunchBtn"></a>
<img id="dpImage"/>
<div id="dpTags"></div>
<button id="dpFavBtn"></button>
<button id="dpCopy"></button>
<button id="themeToggle"></button>
\;

dom.window.eval('window.fetch = async () => ({ json: async () => require("./data.json") }); ');

dom.window.addEventListener('error', (e) => {
    console.error('RUNTIME ERROR:', e.error || e.message);
});

try {
    dom.window.eval(appjs);
} catch (e) {
    console.error("EVAL ERROR:", e);
}
