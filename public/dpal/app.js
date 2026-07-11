document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('contentContainer');
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const navChips = document.getElementById('navChips');
    const sortSelect = document.getElementById('sortSelect');
    
    // Create Scroll Sentinel for Infinite Scrolling
    const sentinel = document.createElement('div');
    sentinel.id = 'scrollSentinel';
    sentinel.className = 'w-full h-20';
    contentContainer.parentNode.insertBefore(sentinel, contentContainer.nextSibling);

    let currentCategory = 'My Favorites';
    let currentSort = 'featured';
    let searchQuery = '';
    let isListView = localStorage.getItem('dpal_view_mode') === 'list';
    let currentSubcategory = null;

    // --- Smart Intent ---
    const intentMap = {
        'edit a video': 'Video Tools',
        'cut a video': 'Video Tools',
        'edit video': 'Video Tools',
        'generate an image': 'AI Tools',
        'generate image': 'AI Tools',
        'ai art': 'AI Tools',
        'download torrents': 'Torrenting',
        'download movie': 'Torrenting'
    };

    function processSearchIntent(query) {
        const q = query.toLowerCase().trim();
        for (const [key, category] of Object.entries(intentMap)) {
            if (q.includes(key)) {
                return { isIntent: true, originalQuery: query, category: category };
            }
        }
        return { isIntent: false, originalQuery: query, category: null };
    }

    // --- Robust Mobile Scroll Locking ---
    let savedScrollY = 0;
    window.lockAppScroll = function() {
        document.body.style.overflow = 'hidden';
    };
    
    window.unlockAppScroll = function() {
        document.body.style.overflow = '';
    };

    // --- Slide-out Panel ---
    window.openPanel = function(itemStr, domain, screenshot) {
        const item = JSON.parse(decodeURIComponent(itemStr));
        document.getElementById('panelTitle').textContent = item.links[0].name;
        document.getElementById('panelDesc').textContent = item.description || domain;
        document.getElementById('panelIcon').src = getFaviconUrl(domain);
        document.getElementById('panelImage').style.backgroundImage = 'url(' + screenshot + ')';
        
        const visitBtn = document.getElementById('panelVisitBtn');
        visitBtn.onclick = (e) => {
            e.preventDefault();
            closePanel();
            openInAppBrowser(item.links[0].url);
        };
        
        const tagsContainer = document.getElementById('panelTags');
        tagsContainer.innerHTML = '';
        const tags = buildTags(item, item._subcatName);
        tags.forEach(tag => {
            tagsContainer.innerHTML += '<span class="font-label-sm text-[10px] text-muted-text bg-surface-container-low px-2 py-1 rounded-full">#' + tag.toLowerCase() + '</span>';
        });

        const panel = document.getElementById('slideOutPanel');
        const overlay = document.getElementById('slideOutOverlay');
        overlay.classList.remove('hidden');
        // trigger reflow
        void overlay.offsetWidth;
        overlay.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
        lockAppScroll();
    };

    function closePanel() {
        const panel = document.getElementById('slideOutPanel');
        const overlay = document.getElementById('slideOutOverlay');
        overlay.classList.add('opacity-0');
        panel.classList.add('translate-x-full');
        unlockAppScroll();
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
    
    document.getElementById('closePanelBtn')?.addEventListener('click', closePanel);
    document.getElementById('slideOutOverlay')?.addEventListener('click', closePanel);

    // --- Floating Widget Drag Logic ---
    const floatingWidget = document.getElementById('floatingWidget');
    const widgetToggleBtn = document.getElementById('widgetToggleBtn');
    
    let isWidgetDragging = false;
    let hasWidgetMoved = false;
    let widgetStartX, widgetStartY, widgetInitialLeft, widgetInitialTop;

    widgetToggleBtn?.addEventListener('pointerdown', (e) => {
        if (floatingWidget.classList.contains('expanded')) return;
        
        isWidgetDragging = true;
        hasWidgetMoved = false;
        widgetStartX = e.clientX;
        widgetStartY = e.clientY;
        
        const rect = floatingWidget.getBoundingClientRect();
        widgetInitialLeft = rect.left;
        widgetInitialTop = rect.top;
        
        floatingWidget.style.bottom = 'auto';
        floatingWidget.style.right = 'auto';
        floatingWidget.style.left = widgetInitialLeft + 'px';
        floatingWidget.style.top = widgetInitialTop + 'px';
        floatingWidget.style.transition = 'none';
        
        widgetToggleBtn.setPointerCapture(e.pointerId);
    });

    widgetToggleBtn?.addEventListener('pointermove', (e) => {
        if (!isWidgetDragging) return;
        
        const dx = e.clientX - widgetStartX;
        const dy = e.clientY - widgetStartY;
        
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
            hasWidgetMoved = true;
        }
        
        if (hasWidgetMoved) {
            floatingWidget.style.left = `${widgetInitialLeft + dx}px`;
            floatingWidget.style.top = `${widgetInitialTop + dy}px`;
        }
    });

    widgetToggleBtn?.addEventListener('pointerup', (e) => {
        if (isWidgetDragging) {
            isWidgetDragging = false;
            floatingWidget.style.transition = ''; 
            widgetToggleBtn.releasePointerCapture(e.pointerId);
            
            // Intelligently anchor left or right based on screen position
            const rect = floatingWidget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            
            if (centerX > window.innerWidth / 2) {
                // Anchor to right
                floatingWidget.style.left = 'auto';
                floatingWidget.style.right = (window.innerWidth - rect.right) + 'px';
                floatingWidget.classList.add('flex-row-reverse');
            } else {
                // Anchor to left
                floatingWidget.style.right = 'auto';
                floatingWidget.style.left = rect.left + 'px';
                floatingWidget.classList.remove('flex-row-reverse');
            }
        }
    });

    widgetToggleBtn?.addEventListener('click', (e) => {
        if (hasWidgetMoved) {
            e.preventDefault();
            e.stopPropagation();
            hasWidgetMoved = false;
            return;
        }
        floatingWidget.classList.toggle('expanded');
    });

    // --- In-App Browser ---
    window.startLoadingBar = function() {
        const bar = document.getElementById('topLoadingBar');
        if (!bar) return;
        bar.style.transition = 'none';
        bar.style.width = '0%';
        bar.style.opacity = '1';
        void bar.offsetWidth;
        bar.style.transition = 'width 10s cubic-bezier(0.1, 0.5, 0.1, 1)';
        bar.style.width = '90%';
    };

    window.finishLoadingBar = function() {
        const bar = document.getElementById('topLoadingBar');
        if (!bar) return;
        bar.style.transition = 'width 0.3s ease-out, opacity 0.3s ease-out 0.3s';
        bar.style.width = '100%';
        bar.style.opacity = '0';
        setTimeout(() => { bar.style.width = '0%'; bar.style.transition = 'none'; }, 600);
    };

    // --- In-App Browser ---
    window.openInAppBrowser = async function(url) {
        const modal = document.getElementById('browserModal');
        const iframe = document.getElementById('browserIframe');
        const externalBtn = document.getElementById('browserExternalBtn');
        const warning = document.getElementById('browserWarning');

        // Apply strict sandbox if Ad Blocker is enabled to kill all popups on Web & Desktop
        const adBlockerEnabled = localStorage.getItem('adBlockerEnabled') === 'true';
        if (adBlockerEnabled) {
            // allows everything EXCEPT popups (allow-popups) and top navigation (allow-top-navigation)
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
        } else {
            iframe.removeAttribute('sandbox');
        }
        const isDesktopApp = window.navigator.userAgent.includes('Electron') || window.location.protocol.includes('file');
        if (!isDesktopApp) {
            warning.classList.remove('hidden');
        } else {
            warning.classList.add('hidden');
        }

        externalBtn.href = url;
        startLoadingBar();
        iframe.classList.add('opacity-0');
        
        const handleIframeLoad = () => {
            iframe.classList.remove('opacity-0');
            finishLoadingBar();
        };
        
        iframe.onload = handleIframeLoad;
        iframe.onerror = handleIframeLoad;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Trigger reflow for transition
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        lockAppScroll();

        // Delay loading the heavy iframe content so it doesn't freeze the modal's opening animation
        setTimeout(() => {
            iframe.src = url;
        }, 300);

        // Auto-enter Immersive Fullscreen Mode for all devices
        try {
            if (window.AndroidBridge) {
                window.AndroidBridge.setFullscreen(true);
            } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => console.log(err));
            }
        } catch(e) {}

        // Listen for internal video player fullscreen changes to ensure bridge sync
        document.addEventListener('fullscreenchange', () => {
            if (window.AndroidBridge) {
                window.AndroidBridge.setFullscreen(!!document.fullscreenElement);
            }
        });

        // Reset widget position so it doesn't get lost off-screen on next load
        floatingWidget.style.left = '';
        floatingWidget.style.top = '';
        floatingWidget.style.right = '1.5rem';
        floatingWidget.style.bottom = '1.5rem';

        const isDesktop = window.navigator.userAgent.includes('Electron');
        if (!isDesktop) {
            warning.classList.remove('hidden');
        } else {
            warning.classList.add('hidden');
        }
    };

    document.getElementById('browserCloseBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('browserModal');
        modal.classList.add('opacity-0');
        unlockAppScroll();
        
        // Exit Immersive Fullscreen Mode
        try {
            if (window.AndroidBridge) {
                window.AndroidBridge.setFullscreen(false);
            } else if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log(err));
            }
        } catch(e) {}

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            
            // Destroy and completely recreate the iframe to wipe its internal history stack.
            // This prevents the Android hardware back button from traversing old websites
            // after the modal has been closed.
            const oldIframe = document.getElementById('browserIframe');
            if (oldIframe) {
                const parent = oldIframe.parentElement;
                oldIframe.remove();
                
                const newIframe = document.createElement('iframe');
                newIframe.id = 'browserIframe';
                newIframe.className = 'absolute inset-0 w-full h-full border-none';
                newIframe.style.width = '100%';
                newIframe.style.minWidth = '100%';
                newIframe.setAttribute('allowfullscreen', 'true');
                parent.appendChild(newIframe);
            }
        }, 300); // Wait for transition
    });

    window.handleAndroidBackButton = function() {
        const browserModal = document.getElementById('browserModal');
        if (!browserModal.classList.contains('hidden')) {
            document.getElementById('browserCloseBtn').click();
            return true;
        }
        
        const slideOutPanel = document.getElementById('slideOutPanel');
        if (!slideOutPanel.classList.contains('translate-x-full')) {
            closePanel();
            return true;
        }

        const mobileSidebar = document.getElementById('mobileSidebar');
        if (mobileSidebar && !mobileSidebar.classList.contains('-translate-x-full')) {
            toggleMobileSidebar(false);
            return true;
        }

        return false;
    };

    document.getElementById('browserRefreshBtn')?.addEventListener('click', () => {
        const iframe = document.getElementById('browserIframe');
        iframe.src = iframe.src;
    });

    // --- 3D Hover Effect ---
    document.addEventListener('mousemove', (e) => {
        const target = e.target.closest('.tilt-card');
        if (!target) return;
        
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;
        
        target.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
        target.style.zIndex = '30';
    });
    
    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('.tilt-card');
        if (!target) return;
        if (e.relatedTarget && target.contains(e.relatedTarget)) return;
        target.style.transform = ''; // Clear inline transform so CSS classes take over!
        target.style.zIndex = ''; // Clear inline zIndex
    });

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.tilt-card');
        if (card) {
            if (e.target.closest('.fav-btn') || e.target.closest('.del-btn')) return; // Ignore if clicking favorite or delete button
            e.preventDefault();
            const itemStr = card.getAttribute('data-item');
            const domain = card.getAttribute('data-domain');
            const screenshot = card.getAttribute('data-screenshot');
            if (itemStr) {
                try {
                    const item = JSON.parse(decodeURIComponent(itemStr));
                    let recents = JSON.parse(localStorage.getItem('fmhy_recent') || '[]');
                    recents = recents.filter(r => r.links[0].url !== item.links[0].url);
                    recents.unshift(item);
                    if (recents.length > 50) recents.pop(); // Keep last 50
                    localStorage.setItem('fmhy_recent', JSON.stringify(recents));
                } catch(e) { console.error('Recent tracking error:', e); }
                window.openPanel(itemStr, domain, screenshot);
            }
        }
    });

    
    // --- Favorites System ---
    let favorites = new Set(JSON.parse(localStorage.getItem('fmhy_favorites') || '[]'));
    function toggleFavorite(url, e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (favorites.has(url)) {
            favorites.delete(url);
        } else {
            favorites.add(url);
        }
        localStorage.setItem('fmhy_favorites', JSON.stringify(Array.from(favorites)));
        
        // If we are currently viewing favorites, re-render everything
        if (currentCategory === 'My Favorites') {
            renderContent();
        } else {
            // Otherwise just update the buttons in DOM
            document.querySelectorAll(`.fav-btn[data-url="${url}"] span`).forEach(icon => {
                icon.textContent = favorites.has(url) ? 'favorite' : 'favorite_border';
                if (favorites.has(url)) {
                    icon.classList.add('text-red-500', 'fill-current');
                    // Favoriting animation
                    const btn = icon.parentElement;
                    if (btn) {
                        icon.classList.add('heart-pop');
                        setTimeout(() => icon.classList.remove('heart-pop'), 400);
                        
                        // Add particles
                        for(let i=0; i<8; i++) {
                            const angle = (i / 8) * Math.PI * 2;
                            const dist = 30 + Math.random() * 20;
                            const tx = Math.cos(angle) * dist;
                            const ty = Math.sin(angle) * dist;
                            
                            const particle = document.createElement('div');
                            particle.className = 'heart-particle';
                            particle.style.setProperty('--tx', tx + 'px');
                            particle.style.setProperty('--ty', ty + 'px');
                            btn.style.position = 'relative';
                            btn.appendChild(particle);
                            
                            setTimeout(() => particle.remove(), 600);
                        }
                    }
                } else {
                    icon.classList.remove('text-red-500', 'fill-current');
                }
            });
        }
    }
    
    window.toggleFavorite = toggleFavorite; // Expose to inline onclick

    // --- Routing System ---
    let isNavigating = false;
    function parseHash() {
        const hash = window.location.hash.substring(1); // remove '#'
        if (!hash || hash.startsWith('subcat-')) {
            currentCategory = 'All'; // Default to All if they refreshed on a subcat anchor
            searchQuery = '';
        } else {
            const parts = hash.split('?');
            currentCategory = decodeURIComponent(parts[0]) || 'My Favorites';
            if (parts[1]) {
                const params = new URLSearchParams(parts[1]);
                searchQuery = params.get('q') || '';
                currentSort = params.get('sort') || 'featured';
            }
        }
        
        updateRecentHistoryUI();
        
        if (searchInput) searchInput.value = searchQuery;
        if (mobileSearchInput) mobileSearchInput.value = searchQuery;
        
        isNavigating = true;
        renderChips();
        renderContent();
        isNavigating = false;
    }

    function updateHash() {
        if (isNavigating) return;
        let newHash = encodeURIComponent(currentCategory);
        if (searchQuery) {
            newHash += `?q=${encodeURIComponent(searchQuery)}`;
        }
        window.history.pushState(null, '', `#${newHash}`);
    }

    window.addEventListener('hashchange', () => {
        if (window.location.hash.startsWith('#subcat-')) return;
        if (!isNavigating) parseHash();
    });

    // Intersection Observers
    const spotlightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('spotlight-focused');
            } else {
                entry.target.classList.remove('spotlight-focused');
            }
        });
    }, { root: null, rootMargin: '-35% 0px -35% 0px', threshold: 0 });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                const src = container.dataset.src;
                if (src) {
                    const img = new Image();
                    img.onload = () => {
                        container.classList.remove('skeleton-bg');
                        container.style.backgroundImage = `url('${src}')`;
                    };
                    img.src = src;
                    container.dataset.src = ''; // remove so we don't load again
                }
                observer.unobserve(container);
            }
        });
    }, { rootMargin: '200px' }); // Preload images 200px before they enter screen

    function setupOfflineListener() {
        function updateOnlineStatus() {
            const overlay = document.getElementById('offlineOverlay');
            if (!overlay) return;
            
            if (navigator.onLine) {
                overlay.classList.remove('opacity-100', 'translate-y-0');
                overlay.classList.add('opacity-0', '-translate-y-full');
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    overlay.classList.remove('flex');
                }, 500);
            } else {
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
                void overlay.offsetWidth; // Reflow
                overlay.classList.remove('opacity-0', '-translate-y-full');
                overlay.classList.add('opacity-100', 'translate-y-0');
            }
        }

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    let flattenedData = [];
    let fuse = null;

    function initFuse() {
        if (!fmhyData || typeof Fuse === 'undefined') return;
        fmhyData.forEach(cat => {
            if(cat.subcategories) {
                cat.subcategories.forEach(sub => {
                    if(sub.items) {
                        sub.items.forEach(item => {
                            if (item.links && item.links.length > 0) {
                                flattenedData.push({
                                    name: item.links[0].name,
                                    description: item.description || '',
                                    url: item.links[0].url,
                                    category: cat.name,
                                    subcategory: sub.name,
                                    item: item
                                });
                            }
                        });
                    }
                });
            }
        });
        
        fuse = new Fuse(flattenedData, {
            keys: ['name', 'description'],
            threshold: 0.3,
            ignoreLocation: true
        });
    }

    function init() {
        setupOfflineListener();
        initFuse();
        if (typeof fmhyData === 'undefined' || !fmhyData || fmhyData.length === 0) {
            contentContainer.innerHTML = `<div class="font-body-lg text-muted-text text-center py-20">No resources available.</div>`;
            return;
        }

        setupThemeToggle();
        setupSearchAndSort();
        setupAdBlocker();
        setupCustomSites();
        checkForUpdates();

        if (!localStorage.getItem('onboardingComplete')) {
            const modal = document.getElementById('onboardingModal');
            const content = document.getElementById('onboardingContent');
            const btn = document.getElementById('startDpalBtn');
            if (modal) {
                modal.classList.remove('hidden');
                // Trigger reflow
                void modal.offsetWidth;
                modal.classList.remove('opacity-0');
                content.classList.remove('scale-95');
                
                btn.addEventListener('click', () => {
                    modal.classList.add('opacity-0');
                    content.classList.add('scale-95');
                    localStorage.setItem('onboardingComplete', 'true');
                    setTimeout(() => modal.classList.add('hidden'), 500);
                });
            }
        }
        
        parseHash(); // This will trigger renderChips and renderContent
    }

    function observeElements() {
        document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => revealObserver.observe(el));
        document.querySelectorAll('.lazy-image[data-src]').forEach(el => imageObserver.observe(el));
        document.querySelectorAll('.tilt-card:not(.spotlight-card)').forEach(el => {
            el.classList.add('spotlight-card');
            spotlightObserver.observe(el);
        });
    }

    function getDomain(urlStr) {
        try {
            if (!urlStr.startsWith('http')) return 'fmhy.net';
            const url = new URL(urlStr);
            let domain = url.hostname;
            if (domain.startsWith('www.')) domain = domain.substring(4);
            return domain;
        } catch (e) {
            return 'Website';
        }
    }

    function getFaviconUrl(domain) {
        if (domain === 'fmhy.net') return 'https://www.google.com/s2/favicons?domain=fmhy.net&sz=128';
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }

    // Export a global method to delete custom sites
    window.deleteCustomSite = (urlToDelete, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        let savedSites = JSON.parse(localStorage.getItem('fmhy_custom_sites') || '[]');
        savedSites = savedSites.filter(site => site.links[0].url !== urlToDelete);
        localStorage.setItem('fmhy_custom_sites', JSON.stringify(savedSites));
        
        const catObj = fmhyData.find(c => c.name === 'My Custom Sites');
        if (catObj && catObj.subcategories[0]) {
            catObj.subcategories[0].items = savedSites;
        }

        showToast("Custom site deleted");
        if (currentCategory === 'My Custom Sites') {
            renderContent();
        }
    };

    function handleTagClick(e, tag) {
        e.preventDefault();
        e.stopPropagation();
        searchQuery = tag;
        if (searchInput) searchInput.value = tag;
        if (mobileSearchInput) mobileSearchInput.value = tag;
        updateHash();
        renderContent();
    }
    window.handleTagClick = handleTagClick;

    let isSubcategoriesExpanded = true;

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const leftSidebar = document.getElementById('leftSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleMobileSidebar(show) {
        if (!leftSidebar || !sidebarOverlay) return;
        if (show) {
            sidebarOverlay.classList.remove('hidden');
            // Trigger reflow for transition
            void sidebarOverlay.offsetWidth;
            sidebarOverlay.classList.remove('opacity-0');
            leftSidebar.classList.remove('-translate-x-full');
            lockAppScroll(); // Prevent background scrolling
        } else {
            leftSidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('opacity-0');
            unlockAppScroll();
            setTimeout(() => {
                sidebarOverlay.classList.add('hidden');
            }, 300);
        }
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleMobileSidebar(true));
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => toggleMobileSidebar(false));
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => toggleMobileSidebar(false));
    function showFetchingAnimation(callback) {
        contentContainer.innerHTML = `
            <div class="w-full h-[50vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <div class="relative">
                    <span class="material-symbols-outlined text-6xl text-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce" style="animation-duration: 1s;">data_exploration</span>
                    <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                </div>
                <h2 class="font-headline-lg text-2xl tracking-[0.4em] text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse font-bold" style="animation-duration: 0.8s;">FETCHING</h2>
            </div>
        `;
        setTimeout(() => {
            if (callback) callback();
        }, 500); // Wait 500ms for cinematic effect
    }

    function renderChips() {
        if (!navChips) return;
        navChips.innerHTML = '';
        
        const createChip = (name, isActive, isSubcategory = false) => {
            const a = document.createElement('a');
            if (isSubcategory) {
                a.href = `#subcat-${encodeURIComponent(name)}`;
                a.className = `font-label-sm text-label-sm transition-all duration-200 block w-full text-left py-2 px-4 pl-10 border-l-2 border-transparent text-muted-text hover:text-primary hover:bg-surface-container-low/50 hover:border-outline`;
                a.innerHTML = `<span class="flex items-center gap-2"><span class="material-symbols-outlined text-[14px]">subdirectory_arrow_right</span>${name}</span>`;
                
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.innerWidth < 768) toggleMobileSidebar(false);
                    
                    // Use exact filtering instead of scrolling through the DOM!
                    currentSubcategory = name;
                    updateHash();
                    renderChips();
                    
                    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
                    showFetchingAnimation(() => {
                        renderContent();
                    });
                });
            } else {
                a.href = `#${encodeURIComponent(name)}${searchQuery ? '?q='+encodeURIComponent(searchQuery) : ''}`;
                a.className = `font-label-sm text-label-sm transition-all duration-200 block w-full text-left py-3 px-4 rounded-none border-l-2 ${isActive ? 'text-primary bg-surface-container-low border-primary flex justify-between items-center' : 'text-muted-text border-transparent hover:text-primary hover:bg-surface-container-low/50 hover:border-outline flex justify-between items-center'}`;
                
                const titleHtml = name === 'My Favorites' ? `<span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm text-red-500 fill-current">favorite</span>${name}</span>` : name === 'Recent' ? `<span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm text-primary">history</span>${name}</span>` : name;
                
                // Add a chevron if this is the active main category (and not All/Fav/Recent)
                const isSpecial = ['All', 'My Favorites', 'Recent'].includes(name);
                const chevronHtml = (isActive && !isSpecial) ? `<span class="material-symbols-outlined text-sm transition-transform duration-300 ${isSubcategoriesExpanded ? 'rotate-180' : ''}">expand_more</span>` : '';
                
                a.innerHTML = `${titleHtml} ${chevronHtml}`;
                
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (currentCategory === name && !isSpecial && !currentSubcategory) {
                        // Toggle subcategories expansion if clicking the already active category
                        isSubcategoriesExpanded = !isSubcategoriesExpanded;
                        renderChips();
                        return;
                    }
                    
                    if (window.innerWidth < 768) toggleMobileSidebar(false);
                    
                    const updateUI = () => {
                        currentCategory = name;
                        currentSubcategory = null; // Clear subcategory filter!
                        isSubcategoriesExpanded = true; // Reset to expanded when selecting a new category
                        updateHash();
                        renderChips();
                        window.scrollTo({top: 0, left: 0, behavior: 'instant'});
                        
                        // Inject fetching spinner synchronously for the transition capture
                        document.getElementById('contentContainer').innerHTML = `
                            <div class="flex flex-col items-center justify-center py-32">
                                <div class="relative w-24 h-24 mb-8">
                                    <div class="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    <div class="absolute inset-2 border-4 border-secondary/30 border-b-secondary rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
                                    <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                </div>
                                <h2 class="font-headline-lg text-2xl tracking-[0.4em] text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse font-bold">FETCHING</h2>
                            </div>
                        `;
                    };

                    const proceed = () => {
                        setTimeout(() => renderContent(), 50);
                    };

                    if (document.startViewTransition) {
                        const transition = document.startViewTransition(() => updateUI());
                        // Wait for the crossfade animation to completely finish before doing heavy JS filtering
                        // This guarantees 60fps smooth animations without screen freezing
                        transition.finished.then(proceed).catch(proceed);
                    } else {
                        updateUI();
                        proceed();
                    }
                });
            }
            return a;
        };

        navChips.appendChild(createChip('All', currentCategory === 'All'));
        navChips.appendChild(createChip('My Favorites', currentCategory === 'My Favorites'));
        navChips.appendChild(createChip('My Custom Sites', currentCategory === 'My Custom Sites'));
        navChips.appendChild(createChip('Recent', currentCategory === 'Recent'));

        fmhyData.forEach(cat => {
            if (!cat.name) return;
            const isActive = currentCategory === cat.name;
            navChips.appendChild(createChip(cat.name, isActive));
            
            // If this is the active category and it's expanded, render its subcategories
            if (isActive && isSubcategoriesExpanded && cat.subcategories) {
                cat.subcategories.forEach(sub => {
                    if (sub.items && sub.items.length > 0) {
                        navChips.appendChild(createChip(sub.name, false, true));
                    }
                });
            }
        });
    }

    function chunkArray(array, size) {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }
    
    // Check if device is mobile
    const isMobile = window.innerWidth < 768;

    // --- View Toggle System ---
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    if (viewToggleBtn) {
        viewToggleBtn.textContent = isListView ? 'grid_view' : 'view_list';
        viewToggleBtn.addEventListener('click', () => {
            isListView = !isListView;
            localStorage.setItem('dpal_view_mode', isListView ? 'list' : 'grid');
            viewToggleBtn.textContent = isListView ? 'grid_view' : 'view_list';
            if (contentContainer) contentContainer.classList.toggle('list-view-active', isListView);
            renderContent();
        });
    }

    function buildTags(item, subcategoryName) {
        const tags = [];
        if (subcategoryName) tags.push(subcategoryName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, ''));
        if (item.links && item.links.length > 0) {
            const domain = getDomain(item.links[0].url);
            const domainParts = domain.split('.');
            if (domainParts.length >= 2) tags.push(domainParts[domainParts.length-2]);
        }
        return [...new Set(tags)].filter(t => t.length > 2).slice(0, 2);
    }

    function generateChunkHtml(chunk) {
        if (!chunk || chunk.length === 0) return '';
        
        let sectionHtml = '';
        
        if (isListView) {
            sectionHtml = `<div class="flex flex-col gap-2 mt-4 stagger reveal">`;
            chunk.forEach((item, i) => {
                const link = item.links[0];
                const domain = getDomain(link.url);
                const isFav = favorites.has(link.url);
                const tags = buildTags(item, item._subcatName);
                
                sectionHtml += `
                <div data-item="${encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27")}" data-domain="${domain}" data-screenshot="https://s0.wp.com/mshots/v1/${encodeURIComponent(link.url)}?w=600" class="flex items-center justify-between p-4 bg-surface-container-lowest dark:bg-background border border-grid-line rounded-xl hover:bg-surface-container-low transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer group" style="--stagger-idx: ${i}">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <img src="${item._customIcon || getFaviconUrl(domain)}" class="w-6 h-6 object-contain flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" alt="">
                        <div class="flex flex-col min-w-0">
                            <h3 class="font-headline-lg text-sm md:text-base text-primary truncate pb-0.5">${highlightText(link.name, searchQuery)}</h3>
                            <div class="flex gap-2 truncate opacity-70">
                                <span class="font-label-sm text-[10px] text-muted-text bg-surface-container px-2 py-0.5 rounded">${domain}</span>
                                ${item.starred ? '<span class="font-label-sm text-[10px] text-background bg-primary px-2 py-0.5 rounded">Featured</span>' : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-1 sm:gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button class="flex items-center justify-center text-muted-text hover:text-primary transition-colors bg-surface-container p-2 rounded-full cursor-pointer z-30" onclick="window.shareSite('${link.name}', '${link.url}', event)" title="Share">
                            <span class="material-symbols-outlined block text-[18px]">share</span>
                        </button>
                        <button class="fav-btn flex items-center justify-center text-muted-text hover:text-red-500 transition-colors bg-surface-container p-2 rounded-full cursor-pointer z-30" data-url="${link.url}" onclick="toggleFavorite('${link.url}', event)">
                            <span class="material-symbols-outlined block text-[18px] transition-transform ${isFav ? 'text-red-500 fill-current' : ''}">${isFav ? 'favorite' : 'favorite_border'}</span>
                        </button>
                        <span class="material-symbols-outlined text-muted-text group-hover:text-primary transition-colors bg-surface-container p-2 rounded-full hidden sm:flex items-center justify-center text-[18px]">arrow_outward</span>
                    </div>
                </div>`;
            });
            sectionHtml += `</div>`;
            return sectionHtml;
        }

        sectionHtml = `<div class="grid grid-cols-1 lg:grid-cols-12 gap-px bg-grid-line mt-12 border border-grid-line shadow-xl hover:shadow-2xl dark:shadow-none dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-all duration-500 rounded-xl overflow-hidden stagger reveal">`;
        
        const mainItem = chunk[0];
        const mainLink = mainItem.links[0];
        const mainDomain = getDomain(mainLink.url);
        const mainScreenshot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(mainLink.url)}?w=1000`;
        const isMainFav = favorites.has(mainLink.url);
        const mainTags = buildTags(mainItem, mainItem._subcatName);
        
        sectionHtml += `
        <div data-item="${encodeURIComponent(JSON.stringify(mainItem)).replace(/'/g, "%27")}" data-domain="${mainDomain}" data-screenshot="${mainScreenshot}" class="${chunk.length === 1 ? 'lg:col-span-12' : 'lg:col-span-6'} bg-surface-container-lowest dark:bg-background p-8 flex flex-col justify-between group hover:bg-surface-container-low dark:hover:bg-surface-container-low transition-all duration-300 ease-out active:scale-[0.98] tilt-card cursor-pointer min-h-[400px] relative overflow-hidden reveal" style="--stagger-idx: 0">
            <!-- Background Website Screenshot with Skeleton -->
            <div class="absolute inset-0 opacity-20 group-hover:opacity-100 group-hover:scale-110 duration-700 ease-out pointer-events-none bg-cover bg-top lazy-image skeleton-bg" data-src="${mainScreenshot}"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
            
            <div class="relative z-10 flex justify-between items-start">
                <div class="flex gap-2">
                    <span class="font-label-sm text-label-sm text-primary bg-surface-container border border-grid-line px-3 py-1">${mainDomain}</span>
                    ${mainItem.starred ? '<span class="font-label-sm text-label-sm text-background bg-primary px-3 py-1">Featured</span>' : ''}
                </div>
                <div class="flex items-center gap-2">
                    <button class="flex items-center justify-center text-muted-text hover:text-primary transition-colors bg-background/50 p-2 rounded-full cursor-pointer z-30 opacity-100 md:opacity-0 group-hover:opacity-100" onclick="window.shareSite('${mainLink.name}', '${mainLink.url}', event)" title="Share">
                        <span class="material-symbols-outlined block text-[20px]">share</span>
                    </button>
                    <button class="fav-btn flex items-center justify-center text-muted-text hover:text-red-500 transition-colors bg-background/50 p-2 rounded-full cursor-pointer z-30 opacity-100 md:opacity-0 group-hover:opacity-100" data-url="${mainLink.url}" onclick="toggleFavorite('${mainLink.url}', event)">
                        <span class="material-symbols-outlined block transition-transform ${isMainFav ? 'text-red-500 fill-current' : ''}">${isMainFav ? 'favorite' : 'favorite_border'}</span>
                    </button>
                    ${currentCategory === 'My Custom Sites' ? `
                    <button class="del-btn flex items-center justify-center text-muted-text hover:text-red-500 transition-colors bg-background/50 p-2 rounded-full cursor-pointer z-30 opacity-100 md:opacity-0 group-hover:opacity-100" onclick="window.deleteCustomSite('${mainLink.url}', event)" title="Delete Custom Site">
                        <span class="material-symbols-outlined block text-sm">delete</span>
                    </button>
                    ` : ''}
                    <span class="material-symbols-outlined text-muted-text group-hover:text-primary transition-colors bg-background/50 p-2 rounded-full flex items-center justify-center text-[20px]">arrow_outward</span>
                </div>
            </div>
            
            <div class="relative z-10 mt-auto pt-16 text-center md:text-left">
                <div class="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-3 md:gap-4 mb-4 w-full">
                    <img src="${mainItem._customIcon || getFaviconUrl(mainDomain)}" class="w-10 h-10 md:w-8 md:h-8 object-contain flex-shrink-0" alt="">
                    <h3 class="font-headline-lg text-headline-lg text-primary drop-shadow-md break-words line-clamp-3 w-full md:flex-1 md:w-auto min-w-0 pb-1">${highlightText(mainLink.name, searchQuery)}</h3>
                </div>
                <p class="font-body-md text-body-md text-muted-text max-w-xl mx-auto md:mx-0 drop-shadow-md mb-4">${highlightText(mainItem.description || '', searchQuery)}</p>
                <div class="flex flex-wrap justify-center md:justify-start gap-2">
                    ${mainTags.map(tag => `<span class="font-label-sm text-[10px] text-muted-text bg-surface-container-low px-2 py-1 rounded-full cursor-pointer hover:bg-outline hover:text-primary transition-colors" onclick="handleTagClick(event, '${tag}')">#${tag.toLowerCase()}</span>`).join('')}
                </div>
            </div>
        </div>
        `;

        if (chunk.length > 1) {
            const sideItemCount = chunk.length - 1;
            let containerClass = "lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-px bg-grid-line";
            if (sideItemCount <= 2) {
                containerClass = "lg:col-span-6 flex flex-col gap-px bg-grid-line";
            }
            
            sectionHtml += `<div class="${containerClass}">`;
            for (let i = 1; i < chunk.length; i++) {
                const sideItem = chunk[i];
                const sideLink = sideItem.links[0];
                const sideDomain = getDomain(sideLink.url);
                const sideScreenshot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(sideLink.url)}?w=600`;
                const isSideFav = favorites.has(sideLink.url);
                const sideTags = buildTags(sideItem, sideItem._subcatName);
                
                let itemClass = "bg-surface-container-lowest dark:bg-background p-6 group hover:bg-surface-container-low dark:hover:bg-surface-container-low transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[200px] relative overflow-hidden reveal";
                if (sideItemCount <= 2) itemClass += " flex-1";
                
                sectionHtml += `
                <div data-item="${encodeURIComponent(JSON.stringify(sideItem)).replace(/'/g, "%27")}" data-domain="${sideDomain}" data-screenshot="${sideScreenshot}" class="${itemClass} tilt-card" style="--stagger-idx: ${i}">
                    <div class="absolute inset-0 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out pointer-events-none bg-cover bg-top lazy-image skeleton-bg" data-src="${sideScreenshot}"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none"></div>

                    <div class="relative z-10 flex justify-between items-start mb-8">
                        <img src="${sideItem._customIcon || getFaviconUrl(sideDomain)}" class="w-8 h-8 object-contain opacity-70 group-hover:opacity-100 transition-opacity" alt="">
                        <div class="flex items-center gap-2">
                            <button class="flex items-center justify-center text-muted-text hover:text-primary transition-colors text-sm bg-background/50 p-1.5 rounded-full cursor-pointer z-30 opacity-100 md:opacity-0 group-hover:opacity-100" onclick="window.shareSite('${sideLink.name}', '${sideLink.url}', event)" title="Share">
                                <span class="material-symbols-outlined block text-[18px]">share</span>
                            </button>
                            <button class="fav-btn flex items-center justify-center text-muted-text hover:text-red-500 transition-colors text-sm bg-background/50 p-1.5 rounded-full cursor-pointer z-30 opacity-100 md:opacity-0 group-hover:opacity-100" data-url="${sideLink.url}" onclick="toggleFavorite('${sideLink.url}', event)">
                                <span class="material-symbols-outlined block transition-transform ${isSideFav ? 'text-red-500 fill-current' : ''}">${isSideFav ? 'favorite' : 'favorite_border'}</span>
                            </button>
                            ${currentCategory === 'My Custom Sites' ? `
                            <button class="del-btn flex items-center justify-center text-muted-text hover:text-red-500 transition-colors bg-background/50 p-1.5 rounded-full cursor-pointer z-30" onclick="window.deleteCustomSite('${sideLink.url}', event)" title="Delete Custom Site">
                                <span class="material-symbols-outlined block text-xs">delete</span>
                            </button>
                            ` : ''}
                            <span class="material-symbols-outlined text-muted-text group-hover:text-primary transition-colors text-sm bg-background/50 p-1.5 rounded-full flex items-center justify-center">arrow_outward</span>
                        </div>
                    </div>
                    <div class="relative z-10 text-center md:text-left">
                        <div class="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-1 md:gap-2 mb-1 w-full">
                            <h4 class="font-body-lg text-body-lg text-primary drop-shadow-md break-words line-clamp-2 w-full md:flex-1 md:w-auto min-w-0 pb-1">${highlightText(sideLink.name, searchQuery)}</h4>
                            ${sideItem.starred ? '<span class="text-xs flex-shrink-0 mt-1 hidden md:block">⭐</span>' : ''}
                        </div>
                        <p class="font-label-sm text-label-sm text-muted-text normal-case line-clamp-2 drop-shadow-md mb-3 w-full mx-auto pb-1">${highlightText(sideItem.description || sideDomain, searchQuery)}</p>
                        <div class="flex flex-wrap justify-center md:justify-start gap-2">
                            ${sideTags.map(tag => `<span class="font-label-sm text-[10px] text-muted-text bg-surface-container-low px-2 py-0.5 rounded-full cursor-pointer hover:bg-outline hover:text-primary transition-colors" onclick="handleTagClick(event, '${tag}')">#${tag.toLowerCase()}</span>`).join('')}
                        </div>
                    </div>
                </div>
                `;
            }
            sectionHtml += `</div>`;
        }
        
        sectionHtml += `</div>`;
        return sectionHtml;
    }

    let renderTasks = [];
    let taskIndex = 0;
    let currentRenderCycle = 0;
    const CHUNKS_PER_PAGE = 4; // Render 20 items per batch to fill screen

    function renderNextBatch() {
        if (taskIndex >= renderTasks.length) return;
        
        let htmlBatch = '';
        let chunkCount = 0;
        
        while (taskIndex < renderTasks.length && chunkCount < CHUNKS_PER_PAGE) {
            const task = renderTasks[taskIndex];
            if (task.type === 'category-header') {
                let actionBtn = '';
                if (task.name === 'Recent') {
                    actionBtn = `<button onclick="window.clearRecents()" class="material-symbols-outlined text-muted-text hover:text-red-500 transition-colors cursor-pointer text-lg p-0 bg-transparent border-none active:scale-90" title="Clear all recents">delete</button>`;
                } else if (task.name === 'My Custom Sites') {
                    actionBtn = `<button onclick="window.openAddSiteModal()" class="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary hover:text-background px-3 py-1 rounded-full text-[11px] font-label-sm uppercase tracking-widest transition-colors cursor-pointer border border-primary/20"><span class="material-symbols-outlined text-sm">add</span> Add Site</button>`;
                }

                htmlBatch += `
                <section class="w-full relative reveal">
                    <div class="sticky top-16 z-40 w-full bg-background/80 backdrop-blur-md py-4 px-6 border-b border-t border-grid-line flex items-center justify-between mb-8 shadow-sm">
                        <h2 class="font-label-sm text-label-sm text-primary uppercase tracking-widest">${highlightText(task.name, searchQuery)}</h2>
                        ${actionBtn}
                    </div>
                </section>
                `;
            } else if (task.type === 'subcategory-header') {
                const subcatId = 'subcat-' + encodeURIComponent(task.name);
                htmlBatch += `<h3 id="${subcatId}" class="font-headline-lg text-headline-lg text-primary mt-12 mb-6 reveal pt-4">${highlightText(task.name, searchQuery)}</h3>`;
            } else if (task.type === 'chunk') {
                htmlBatch += generateChunkHtml(task.chunk);
                chunkCount++;
            }
            taskIndex++;
        }

        if (htmlBatch) {
            contentContainer.insertAdjacentHTML('beforeend', htmlBatch);
            observeElements();
        }
    }

    // Intersection observer for infinite scroll
    const scrollObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && taskIndex < renderTasks.length) {
            renderNextBatch();
        }
    }, { rootMargin: '400px' }); // Trigger 400px before reaching sentinel
    scrollObserver.observe(sentinel);

    function renderContent() {
        contentContainer.innerHTML = '';
        currentRenderCycle++;
        const cycle = currentRenderCycle;
        
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (cycle !== currentRenderCycle) return;
                
                const query = searchQuery.toLowerCase().trim();
                
                // Pre-compute global fuzzy results once for O(1) lookups
                window.globalFuzzyResults = new Set();
                if (query && fuse) {
                    fuse.search(query).forEach(res => window.globalFuzzyResults.add(res.item.item));
                }
                
                let allItems = [];
                
                renderTasks = [];
                taskIndex = 0;
        
        const intent = processSearchIntent(searchQuery);
        let activeCategory = currentCategory;
        
        const searchIcon = document.getElementById('searchIcon');
        const mobileSearchIcon = document.getElementById('mobileSearchIcon');
        if (searchIcon) {
            searchIcon.textContent = intent.isIntent ? 'auto_awesome' : 'search';
            searchIcon.classList.toggle('text-primary', intent.isIntent);
        }
        if (mobileSearchIcon) {
            mobileSearchIcon.textContent = intent.isIntent ? 'auto_awesome' : 'search';
            mobileSearchIcon.classList.toggle('text-primary', intent.isIntent);
        }
        
        if (intent.isIntent) {
            activeCategory = intent.category; // Override currently viewed category with intent category
        }


        // If custom categories are selected
        if (currentCategory === 'My Favorites' || currentCategory === 'Recent' || currentCategory === 'My Custom Sites') {
            if (currentCategory === 'My Favorites') {
                const seenUrls = new Set();
                let categoryGroups = {};
                let hasAny = false;
                
                fmhyData.forEach(cat => {
                    if (cat.subcategories) {
                        cat.subcategories.forEach(sub => {
                            if (sub.items) {
                                sub.items.forEach(item => {
                                    if (item.links && item.links.length > 0) {
                                        const url = item.links[0].url;
                                        if (favorites.has(url) && !seenUrls.has(url)) {
                                            seenUrls.add(url);
                                            item._subcatName = sub.name; // Tagging info
                                            item._catName = cat.name;
                                            
                                            const primaryLink = item.links[0];
                                            let matches = !query;
                                            if (query) {
                                                if (fuse) matches = window.globalFuzzyResults.has(item);
                                                else matches = primaryLink.name.toLowerCase().includes(query) || 
                                                               primaryLink.url.toLowerCase().includes(query) || 
                                                               (item.description || '').toLowerCase().includes(query);
                                            }
                                            
                                            if (matches) {
                                                if (!categoryGroups[cat.name]) categoryGroups[cat.name] = [];
                                                categoryGroups[cat.name].push(item);
                                                hasAny = true;
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
                
                if (!hasAny) {
                    contentContainer.innerHTML = `<div class="font-body-lg text-muted-text text-center py-20">You haven't saved any favorites yet, or no favorites match your search.</div>`;
                    return;
                }
                
                Object.keys(categoryGroups).forEach(catName => {
                    if (categoryGroups[catName].length > 0) {
                        let catItems = categoryGroups[catName];
                        if (currentSort === 'az') catItems.sort((a, b) => a.links[0].name.localeCompare(b.links[0].name));
                        else if (currentSort === 'za') catItems.sort((a, b) => b.links[0].name.localeCompare(a.links[0].name));
                        else catItems.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
                        
                        renderTasks.push({ type: 'category-header', name: catName });
                        let chunks = chunkArray(catItems, 5);
                        chunks.forEach(c => renderTasks.push({ type: 'chunk', chunk: c }));
                    }
                });
                
            } else {
                if (currentCategory === 'My Custom Sites') {
                    try {
                        allItems = JSON.parse(localStorage.getItem('fmhy_custom_sites') || '[]');
                    } catch(e) { allItems = []; }
                } else if (currentCategory === 'Recent') {
                    try {
                        allItems = JSON.parse(localStorage.getItem('fmhy_recent') || '[]');
                    } catch(e) { allItems = []; }
                }
                
                if (query) {
                    allItems = allItems.filter(item => {
                        if (fuse) return window.globalFuzzyResults.has(item);
                        const primaryLink = item.links[0];
                        return primaryLink.name.toLowerCase().includes(query) || 
                               primaryLink.url.toLowerCase().includes(query) || 
                               (item.description || '').toLowerCase().includes(query);
                    });
                }
                
                if (allItems.length === 0) {
                    let msg = '';
                    if (currentCategory === 'Recent') msg = "You haven't opened any websites recently.";
                    else if (currentCategory === 'My Custom Sites') msg = "You haven't added any custom websites yet. Click the + button to add one!";
                    
                    contentContainer.innerHTML = `<div class="font-body-lg text-muted-text text-center py-20">${msg}</div>`;
                    return;
                }
                
                if (currentSort === 'az') {
                    allItems.sort((a, b) => a.links[0].name.localeCompare(b.links[0].name));
                } else if (currentSort === 'za') {
                    allItems.sort((a, b) => b.links[0].name.localeCompare(a.links[0].name));
                } else {
                    allItems.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
                }

                renderTasks.push({ type: 'category-header', name: currentCategory });
                let chunks = chunkArray(allItems, 5);
                chunks.forEach(c => renderTasks.push({ type: 'chunk', chunk: c }));
            }
            
        } else {
            // Standard directory rendering
            fmhyData.forEach(categoryObj => {
                if (!categoryObj.name) return;
                if (activeCategory !== 'All' && categoryObj.name !== activeCategory) return;

                let categoryHasMatch = false;

                if (categoryObj.subcategories) {
                    categoryObj.subcategories.forEach((sub) => {
                        if (currentSubcategory && sub.name !== currentSubcategory) return;
                        
                        let filteredItems = [];
                        if (sub.items) {
                            filteredItems = sub.items.filter(item => {
                                if (!item.links || item.links.length === 0) return false;
                                item._subcatName = sub.name; // For tags
                                
                                if (!query) return true;
                                
                                if (fuse) {
                                    return window.globalFuzzyResults.has(item);
                                }

                                const primaryLink = item.links[0];
                                return primaryLink.name.toLowerCase().includes(query) || 
                                       primaryLink.url.toLowerCase().includes(query) || 
                                       (item.description || '').toLowerCase().includes(query);
                            });
                        }

                        if (filteredItems.length === 0) return;

                        if (!categoryHasMatch) {
                            renderTasks.push({ type: 'category-header', name: categoryObj.name });
                            categoryHasMatch = true;
                        }

                        renderTasks.push({ type: 'subcategory-header', name: sub.name, parentCategory: categoryObj.name });

                        // Sort
                        if (currentSort === 'az') {
                            filteredItems.sort((a, b) => a.links[0].name.localeCompare(b.links[0].name));
                        } else if (currentSort === 'za') {
                            filteredItems.sort((a, b) => b.links[0].name.localeCompare(a.links[0].name));
                        } else {
                            filteredItems.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
                        }

                        let chunks = chunkArray(filteredItems, 5);
                        chunks.forEach(c => renderTasks.push({ type: 'chunk', chunk: c }));
                    });
                }
            });
        }

        if (renderTasks.length === 0) {
            contentContainer.innerHTML = `<div class="font-body-lg text-muted-text text-center py-20">No results found.</div>`;
            return;
        }

        renderNextBatch(); // Initial load
            }, 0);
        });
    }


    function setupSearchAndSort() {
        const openCmd = (e) => {
            e.preventDefault();
            e.target.blur(); // Prevent mobile keyboard from opening
            const cmdOverlay = document.getElementById('commandPaletteOverlay');
            const cmdPalette = document.getElementById('commandPalette');
            const cmdInput = document.getElementById('commandInput');
            if(cmdOverlay) {
                cmdOverlay.classList.remove('hidden');
                void cmdOverlay.offsetWidth;
                cmdOverlay.classList.remove('opacity-0');
                cmdPalette.classList.remove('scale-95', 'opacity-0');
                setTimeout(() => cmdInput.focus(), 50);
            }
        };
        if (searchInput) {
            searchInput.addEventListener('click', openCmd);
            searchInput.addEventListener('focus', openCmd);
        }
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('click', openCmd);
            mobileSearchInput.addEventListener('focus', openCmd);
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                renderContent();
            });
        }
    }

    function updateRecentHistoryUI() {
        const historyContainer = document.getElementById('recentHistoryContainer');
        const historyTrack = document.getElementById('recentHistoryTrack');
        if (!historyContainer || !historyTrack) return;
        
        const history = JSON.parse(localStorage.getItem('fmhy_history') || '[]');
        
        // Only show jump back in if we are NOT on the Recent page, and we actually have history
        if (history.length > 0 && currentCategory !== 'Recent') {
            historyContainer.classList.remove('hidden');
            historyContainer.classList.add('flex');
            
            historyTrack.innerHTML = '';
            // Show up to 8 recent items
            history.slice(0, 8).forEach((item, i) => {
                const link = item.links[0];
                const domain = getDomain(link.url);
                historyTrack.innerHTML += `
                <div data-item="${encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27")}" class="flex-shrink-0 w-48 sm:w-56 bg-surface-container border border-grid-line p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group flex items-center gap-3">
                    <img src="${item._customIcon || getFaviconUrl(domain)}" class="w-6 h-6 object-contain flex-shrink-0 opacity-80 group-hover:opacity-100" alt="">
                    <div class="min-w-0 flex-1">
                        <div class="font-headline-lg text-sm text-primary truncate">${link.name}</div>
                        <div class="font-label-sm text-[10px] text-muted-text truncate">${domain}</div>
                    </div>
                </div>`;
            });
        } else {
            historyContainer.classList.add('hidden');
            historyContainer.classList.remove('flex');
        }
    }

    // --- Sharing System ---
    window.shareSite = async function(name, url, e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        const shareData = {
            title: name,
            text: `Check out ${name} on DPAL:`,
            url: url
        };
        
        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(url);
                showToast('Link copied to clipboard!');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                showToast('Failed to share link.');
            }
        }
    };

    function setupThemeToggle() {
        const btn = document.getElementById('themeToggle');
        const html = document.documentElement;
        
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = "theme-color";
            document.head.appendChild(metaTheme);
        }

        const applyMetaTheme = (isDark) => {
            metaTheme.content = isDark ? "#09090b" : "#ffffff";
        };

        if (localStorage.getItem('theme') === 'light') {
            html.classList.remove('dark');
            if (btn) btn.textContent = 'dark_mode';
            applyMetaTheme(false);
        } else {
            html.classList.add('dark');
            if (btn) btn.textContent = 'light_mode';
            applyMetaTheme(true);
        }
        
        if (btn) {
            btn.addEventListener('click', () => {
                const isDark = html.classList.contains('dark');
                
                const switchTheme = () => {
                    if (isDark) {
                        html.classList.remove('dark');
                        btn.textContent = 'dark_mode';
                        localStorage.setItem('theme', 'light');
                        applyMetaTheme(false);
                    } else {
                        html.classList.add('dark');
                        btn.textContent = 'light_mode';
                        localStorage.setItem('theme', 'dark');
                        applyMetaTheme(true);
                    }
                };

                // We don't use View Transitions here because taking a snapshot of thousands of DOM nodes causes heavy lag
                switchTheme();
            });
        }
    }

    function showToast(message) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'bg-surface-container border border-grid-line text-on-surface font-label-sm px-6 py-3 rounded-full shadow-2xl transform translate-y-8 opacity-0 transition-all duration-300';
        toast.textContent = message;
        container.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-8', 'opacity-0');
        });
        
        setTimeout(() => {
            toast.classList.add('translate-y-8', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    let magicTimeout;
    window.closeMagicOverlay = function() {
        const overlay = document.getElementById('magicOverlay');
        const content = document.getElementById('magicOverlayContent');
        if (!overlay || !content) return;
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }, 500);
        clearTimeout(magicTimeout);
    };

    function showMagicOverlay(enabled) {
        const overlay = document.getElementById('magicOverlay');
        const content = document.getElementById('magicOverlayContent');
        const subtitle = document.getElementById('magicSubtitle');
        const title = document.getElementById('magicTitle');
        if (!overlay || !content) return;
        
        subtitle.textContent = enabled ? 'Ad Blocker Activated' : 'Ad Blocker Disabled';
        title.textContent = enabled ? 'Magic will happen' : 'Magic will stop now';
        
        title.className = enabled 
            ? 'font-display-2xl text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-300 to-emerald-500 drop-shadow-2xl animate-pulse'
            : 'font-display-2xl text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-400 to-red-600 drop-shadow-2xl animate-pulse';
            
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        
        void overlay.offsetWidth; // Force reflow
        
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
        
        clearTimeout(magicTimeout);
        magicTimeout = setTimeout(() => {
            window.closeMagicOverlay();
        }, 3000);
    }

    function setupAdBlocker() {
        const toggleContainer = document.getElementById('adBlockerToggleContainer');
        const icon = document.getElementById('adBlockerIcon');
        const track = document.getElementById('adBlockerTrack');
        const thumb = document.getElementById('adBlockerThumb');
        
        let isEnabled = localStorage.getItem('adBlockerEnabled') === 'true';

        function updateState() {
            if (toggleContainer && icon && track && thumb) {
                if (isEnabled) {
                    icon.classList.remove('text-muted-text');
                    icon.classList.add('text-green-500');
                    track.classList.remove('bg-surface-container-high', 'border', 'border-grid-line');
                    track.classList.add('bg-green-600');
                    thumb.style.transform = 'translateX(0)'; // Move thumb to right (default position)
                    thumb.classList.remove('bg-muted-text');
                    thumb.classList.add('bg-gray-300');
                } else {
                    icon.classList.add('text-muted-text');
                    icon.classList.remove('text-green-500');
                    track.classList.add('bg-surface-container-high', 'border', 'border-grid-line');
                    track.classList.remove('bg-green-600');
                    thumb.style.transform = 'translateX(-24px)'; // Move thumb to left
                    thumb.classList.add('bg-muted-text');
                    thumb.classList.remove('bg-gray-300');
                }
            }
            if (window.electronAPI) {
                window.electronAPI.setAdBlocker(isEnabled);
            }
        }

        if (toggleContainer) {
            toggleContainer.addEventListener('click', () => {
                isEnabled = !isEnabled;
                localStorage.setItem('adBlockerEnabled', isEnabled);
                updateState();
                showMagicOverlay(isEnabled);
            });
            updateState();
        }
    }

    function setupCustomSites() {
        // Create custom site category if missing
        if (!fmhyData.find(c => c.name === 'My Custom Sites')) {
            let savedSites = [];
            try { savedSites = JSON.parse(localStorage.getItem('fmhy_custom_sites') || '[]'); } catch(e) {}
            fmhyData.push({
                name: 'My Custom Sites',
                subcategories: [{ name: 'Custom', items: savedSites }]
            });
        }
    }

    window.clearRecents = function() {
        if (confirm("Are you sure you want to clear all your recently opened websites?")) {
            localStorage.removeItem('fmhy_recent');
            if (currentCategory === 'Recent') {
                renderContent();
            }
            showToast('Recent history cleared');
        }
    };

    function highlightText(text, query) {
        if (!text) return '';
        if (!query) return text;
        const textStr = String(text);
        const index = textStr.toLowerCase().indexOf(query);
        if (index === -1) return textStr;
        const matched = textStr.substring(index, index + query.length);
        const before = textStr.substring(0, index);
        const after = textStr.substring(index + query.length);
        return `${before}<span class="bg-transparent text-muted-text">${matched}</span>${highlightText(after, query)}`;
    }

    const APP_VERSION = '1.0.0';

    function checkForUpdates() {
        const isApp = window.location.protocol.includes('file') || window.location.protocol.includes('capacitor') || navigator.userAgent.includes('Electron');
        if (!isApp) return;

        fetch('https://flourishing-starlight-55e95b.netlify.app/version.json', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.version && data.version !== APP_VERSION) {
                    if (sessionStorage.getItem('updateDismissed_' + data.version)) return;
                    
                    const popup = document.createElement('div');
                    popup.className = 'fixed bottom-4 right-4 bg-surface-container border border-grid-line shadow-2xl p-6 rounded-xl z-[100] max-w-sm flex flex-col gap-4 text-on-surface';
                    popup.innerHTML = `
                        <div class="flex justify-between items-center">
                            <h3 class="font-headline-lg text-lg text-primary m-0">Update Available</h3>
                            <button id="closeUpdateBtn" class="material-symbols-outlined text-muted-text hover:text-primary cursor-pointer border-none bg-transparent p-0">close</button>
                        </div>
                        <p class="font-body-md text-sm m-0">Version ${data.version} is now available. You are currently on version ${APP_VERSION}.</p>
                        <a href="${data.downloadUrl || 'https://flourishing-starlight-55e95b.netlify.app'}" target="_blank" class="bg-primary text-background text-center py-2 rounded-lg font-label-sm font-semibold hover:bg-primary/90 transition-colors mt-2 no-underline block">Download Update</a>
                    `;
                    document.body.appendChild(popup);
                    
                    document.getElementById('closeUpdateBtn').addEventListener('click', () => {
                        popup.remove();
                        sessionStorage.setItem('updateDismissed_' + data.version, 'true');
                    });
                }
            })
            .catch(err => console.log('Update check failed:', err));
    }

    // --- PWA Install Logic ---
    let deferredPrompt;
    const installAppBtns = document.querySelectorAll('.install-app-btn');
    const downloadWindowsBtn = document.getElementById('downloadWindowsBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        
        const showPrompt = async () => {
            if (!deferredPrompt) return;
            // Show the prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
        };

        // Update UI to notify the user they can add to home screen
        installAppBtns.forEach(btn => {
            btn.classList.remove('hidden');
            // Use flex for desktop button and flex for mobile button
            btn.classList.add('flex');
            
            btn.addEventListener('click', async () => {
                installAppBtns.forEach(b => {
                    b.classList.add('hidden');
                    b.classList.remove('flex');
                });
                await showPrompt();
            });
        });

        if (downloadWindowsBtn) {
            downloadWindowsBtn.addEventListener('click', async (e) => {
                e.preventDefault(); // Stop it from trying to download the broken .exe
                await showPrompt();
            });
        }
    });

    window.addEventListener('appinstalled', () => {
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
        installAppBtns.forEach(btn => {
            btn.classList.add('hidden');
            btn.classList.remove('flex');
        });
        showToast('App installed successfully!');
    });

    // --- Custom Sites Logic ---
    const addSiteOverlay = document.getElementById('addSiteOverlay');
    const addSiteModal = document.getElementById('addSiteModal');
    const closeAddSiteBtn = document.getElementById('closeAddSiteBtn');
    const addSiteForm = document.getElementById('addSiteForm');

    window.openAddSiteModal = () => {
        if (!addSiteOverlay) return;
        addSiteOverlay.classList.remove('hidden');
        void addSiteOverlay.offsetWidth;
        addSiteOverlay.classList.remove('opacity-0');
        addSiteModal.classList.remove('scale-95');
        document.getElementById('siteUrlInput').focus();
    };

    const closeAddSiteModal = () => {
        if (!addSiteOverlay) return;
        addSiteOverlay.classList.add('opacity-0');
        addSiteModal.classList.add('scale-95');
        setTimeout(() => addSiteOverlay.classList.add('hidden'), 200);
        addSiteForm.reset();
    };

    if (closeAddSiteBtn) closeAddSiteBtn.addEventListener('click', closeAddSiteModal);
    if (addSiteOverlay) {
        addSiteOverlay.addEventListener('click', (e) => {
            if (e.target === addSiteOverlay) closeAddSiteModal();
        });
    }

    if (addSiteForm) {
        addSiteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = document.getElementById('siteUrlInput').value.trim();
            const name = document.getElementById('siteNameInput').value.trim();
            const desc = document.getElementById('siteDescInput').value.trim();
            
            if (!url || !name) return;

            let customSites = [];
            try { customSites = JSON.parse(localStorage.getItem('fmhy_custom_sites') || '[]'); } catch(e) {}
            
            // Prevent exact duplicates
            if (!customSites.find(s => s.links[0].url === url)) {
                customSites.unshift({
                    description: desc,
                    links: [{ name: name, url: url }],
                    isNew: true,
                    starred: false,
                    isCustom: true // Flag to identify custom items
                });
                localStorage.setItem('fmhy_custom_sites', JSON.stringify(customSites));
                
                // Inject into fmhyData so it renders
                const catObj = fmhyData.find(c => c.name === 'My Custom Sites');
                if (catObj && catObj.subcategories[0]) {
                    catObj.subcategories[0].items = customSites;
                }

                showToast(`Added ${name} to your Custom Sites!`);
            } else {
                showToast(`Site already exists in your Custom Sites!`);
            }
            
            closeAddSiteModal();
            // Re-render if we are looking at the custom sites
            if (currentCategory === 'My Custom Sites') {
                renderContent();
            }
        });
    }

    // --- Command Palette Logic ---
    const cmdOverlay = document.getElementById('commandPaletteOverlay');
    const cmdPalette = document.getElementById('commandPalette');
    const cmdInput = document.getElementById('commandInput');
    const cmdResults = document.getElementById('commandResults');

    if (cmdOverlay && cmdInput) {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                toggleCommandPalette();
            }
            if (e.key === 'Escape' && !cmdOverlay.classList.contains('hidden')) {
                toggleCommandPalette(false);
            }
        });

        cmdOverlay.addEventListener('click', (e) => {
            if (e.target === cmdOverlay) toggleCommandPalette(false);
        });

        function toggleCommandPalette(forceState) {
            const isHidden = cmdOverlay.classList.contains('hidden');
            const show = forceState !== undefined ? forceState : isHidden;
            
            if (show) {
                cmdOverlay.classList.remove('hidden');
                void cmdOverlay.offsetWidth;
                cmdOverlay.classList.remove('opacity-0');
                cmdPalette.classList.remove('scale-95');
                cmdInput.value = '';
                cmdInput.focus();
                renderCmdResults('');
            } else {
                cmdOverlay.classList.add('opacity-0');
                cmdPalette.classList.add('scale-95');
                setTimeout(() => cmdOverlay.classList.add('hidden'), 200);
            }
        }

        let cmdDebounceTimer;
        cmdInput.addEventListener('input', (e) => {
            clearTimeout(cmdDebounceTimer);
            cmdDebounceTimer = setTimeout(() => {
                renderCmdResults(e.target.value.toLowerCase().trim());
            }, 150);
        });

        function renderCmdResults(query) {
            if (!fmhyData) return;
            cmdResults.classList.remove('hidden');
            if (!query) {
                cmdResults.innerHTML = '<div class="text-muted-text font-body-sm p-4 text-center">Type to search the entire directory...</div>';
                return;
            }
            
            let results = [];
            if (fuse) {
                const searchResults = fuse.search(query);
                results = searchResults.slice(0, 10).map(r => r.item.item);
            } else {
                // Fallback if Fuse failed to load
                for (const cat of fmhyData) {
                    for (const subcat of cat.subcategories) {
                        for (const item of subcat.items) {
                            if (item.links && item.links.length > 0) {
                                if (item.links[0].name.toLowerCase().includes(query) || 
                                    (item.description && item.description.toLowerCase().includes(query))) {
                                    results.push(item);
                                    if (results.length >= 10) break;
                                }
                            }
                        }
                        if (results.length >= 10) break;
                    }
                    if (results.length >= 10) break;
                }
            }
            
            if (results.length === 0) {
                cmdResults.innerHTML = '<div class="text-muted-text font-body-sm p-4 text-center">No results found</div>';
                return;
            }
            
            cmdResults.innerHTML = results.map(item => `
                <div class="px-4 py-3 hover:bg-surface-container-low cursor-pointer rounded-lg flex items-center justify-between group border border-transparent hover:border-grid-line transition-all active:scale-[0.98] mb-1" 
                     onclick="window.openPanel('${encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27")}', '${getDomain(item.links[0].url)}', 'https://s0.wp.com/mshots/v1/${encodeURIComponent(item.links[0].url)}?w=600'); document.getElementById('commandPaletteOverlay').classList.add('opacity-0'); setTimeout(()=>document.getElementById('commandPaletteOverlay').classList.add('hidden'), 200);">
                    <div class="flex items-center gap-3 overflow-hidden w-full">
                        <img src="${item._customIcon || getFaviconUrl(getDomain(item.links[0].url))}" class="w-5 h-5 object-contain flex-shrink-0" alt="">
                        <div class="font-body-md text-primary group-hover:text-primary transition-colors truncate flex-1">${highlightText(item.links[0].name, query)}</div>
                    </div>
                    <span class="material-symbols-outlined text-muted-text group-hover:text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity ml-2">keyboard_return</span>
                </div>
            `).join('');
        }
    }

    init();
});
