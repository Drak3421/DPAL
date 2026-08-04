const fs = require('fs');
let html = fs.readFileSync('public/dpal/home.html', 'utf8');

// The background elements to inject
const bgInjection = `
    <!-- Background Video and Overlay from Directory -->
    <video id="bg-video" autoplay muted loop playsinline preload="auto"
        style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; pointer-events: none; opacity: 0; transition: opacity 900ms ease;">
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_055001_8e16d972-3b2b-441c-86ad-2901a54682f9.mp4" type="video/mp4">
    </video>
    <div id="bg-gradient-overlay" style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: -1; pointer-events: none; background:linear-gradient(to bottom, rgba(10,10,12,0.2), rgba(10,10,12,0.35)); transition: opacity 300ms ease;"></div>
    <script>
    (function(){
      const v = document.getElementById('bg-video');
      if (!v) return;
      const BASE_OPACITY = 0.85;
      const FADE_WINDOW = 0.8;
      let lastTime = 0;
      v.playbackRate = 1;
      
      const fadeIn = () => { if (document.documentElement.classList.contains('dark')) v.style.opacity = String(BASE_OPACITY); };
      v.addEventListener('playing', fadeIn);
      if (!v.paused) fadeIn();

      const playVideo = () => {
        v.play().then(fadeIn).catch(() => {});
        window.removeEventListener('pointerdown', playVideo);
        window.removeEventListener('touchstart', playVideo);
      };
      window.addEventListener('pointerdown', playVideo, { once: true });
      window.addEventListener('touchstart', playVideo, { once: true });

      v.addEventListener('timeupdate', function(){
        if (!document.documentElement.classList.contains('dark')) return;
        const d = v.duration || 0;
        if (!d) return;
        const remaining = d - v.currentTime;
        if (v.currentTime < lastTime - 0.5) {
          v.style.opacity = '0';
          requestAnimationFrame(() => { v.style.opacity = String(BASE_OPACITY); });
        }
        lastTime = v.currentTime;
        if (remaining < FADE_WINDOW) {
          v.style.opacity = String(BASE_OPACITY * (remaining / FADE_WINDOW));
        } else if (v.currentTime > FADE_WINDOW) {
          v.style.opacity = String(BASE_OPACITY);
        }
      });
      
      // Handle theme toggle for video
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            if (document.documentElement.classList.contains('dark')) {
                v.style.display = 'block';
                if (!v.paused) v.style.opacity = String(BASE_OPACITY);
                document.getElementById('bg-gradient-overlay').style.opacity = '1';
            } else {
                v.style.opacity = '0';
                setTimeout(() => { v.style.display = 'none'; }, 900);
                document.getElementById('bg-gradient-overlay').style.opacity = '0';
            }
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
    })();
    </script>
`;

// Insert the background after <body>
if (!html.includes('id="bg-video"')) {
    html = html.replace('<body>', '<body>\n' + bgInjection);
    
    // Also, we must make body background transparent in dark mode so the video shows!
    // We update :root --bg to transparent. But wait, if --bg is transparent, elements using --bg will be transparent too.
    // Let's just update the body rule to have background-color: transparent in dark mode.
    
    const bodyRuleTarget = `        body {
            background-color: var(--bg);`;
    const bodyRuleReplacement = `        body {
            background-color: transparent; /* Changed from var(--bg) to reveal video */`;
            
    html = html.replace(bodyRuleTarget, bodyRuleReplacement);

    fs.writeFileSync('public/dpal/home.html', html, 'utf8');
    console.log("Successfully added video background to home.html");
} else {
    console.log("Background video already present in home.html");
}
