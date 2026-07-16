/* ============================================ */
/* Sun King APM Submission — Script              */
/* ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initVideoFallbacks();
    initActiveNavTracking();
    initSlideDeck();
});

/* -------------------------------------------- */
/* NAVIGATION                                    */
/* -------------------------------------------- */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Sticky nav background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile nav toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            mobileNav.classList.toggle('open');
            document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
        });
    }

    // Close mobile nav on link click
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#' || targetId === '#linkedin' || targetId === '#resume') return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const offset = 64; // nav height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* -------------------------------------------- */
/* SCROLL ANIMATIONS (IntersectionObserver)       */
/* -------------------------------------------- */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-up:not(.hero-section .fade-up)');

    if (!elements.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    elements.forEach(el => observer.observe(el));
}

/* -------------------------------------------- */
/* CUSTOM VIDEO PLAYER                           */
/* -------------------------------------------- */
function initVideoFallbacks() {
    initCustomVideoPlayer({
        videoId: 'walkthrough-video',
        fallbackId: 'walkthrough-fallback',
        controlsId: 'walkthrough-controls',
        progressBarId: 'walkthrough-progress-bar',
        progressFilledId: 'walkthrough-progress-filled',
        bufferedId: 'walkthrough-buffered',
        playBtnId: 'walkthrough-play-btn',
        bigPlayId: 'walkthrough-big-play',
    });
    initCustomVideoPlayer({
        videoId: 'dexter-video',
        fallbackId: 'dexter-fallback',
        controlsId: 'dexter-controls',
        progressBarId: 'dexter-progress-bar',
        progressFilledId: 'dexter-progress-filled',
        bufferedId: 'dexter-buffered',
        playBtnId: 'dexter-play-btn',
        bigPlayId: 'dexter-big-play',
    });
}

function initCustomVideoPlayer(ids) {
    const video = document.getElementById(ids.videoId);
    const fallback = document.getElementById(ids.fallbackId);
    const controls = document.getElementById(ids.controlsId);
    const progressBar = document.getElementById(ids.progressBarId);
    const progressFilled = document.getElementById(ids.progressFilledId);
    const bufferedBar = document.getElementById(ids.bufferedId);
    const playBtn = document.getElementById(ids.playBtnId);
    const bigPlay = document.getElementById(ids.bigPlayId);

    if (!video || !controls) return;

    const wrapper = video.closest('.video-wrapper');
    const iconPlay = playBtn.querySelector('.cv-icon-play');
    const iconPause = playBtn.querySelector('.cv-icon-pause');
    const rewindBtn = controls.querySelector('.cv-rewind-btn');
    const forwardBtn = controls.querySelector('.cv-forward-btn');
    const muteBtn = controls.querySelector('.cv-mute-btn');
    const iconVol = muteBtn.querySelector('.cv-icon-vol');
    const iconMuted = muteBtn.querySelector('.cv-icon-muted');
    const volumeSlider = controls.querySelector('.cv-volume-slider');
    const fullscreenBtn = controls.querySelector('.cv-fullscreen-btn');
    const timeCurrent = controls.querySelector('.cv-time-current');
    const timeDuration = controls.querySelector('.cv-time-duration');

    let isDragging = false;
    let hideControlsTimer = null;

    // --- Fallback Logic (preserved from original) ---
    const source = video.querySelector('source');
    if (fallback) {
        if (!source) {
            fallback.classList.remove('hidden');
            return;
        }
        video.addEventListener('loadedmetadata', () => fallback.classList.add('hidden'));
        video.addEventListener('canplay', () => fallback.classList.add('hidden'));
        video.addEventListener('error', () => fallback.classList.remove('hidden'));
        source.addEventListener('error', () => fallback.classList.remove('hidden'));
        setTimeout(() => {
            if (video.readyState < 1) fallback.classList.remove('hidden');
        }, 3000);
    }

    // --- Helper: format time ---
    function formatTime(sec) {
        if (!isFinite(sec) || isNaN(sec)) return '0:00';
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    // --- Play / Pause ---
    function togglePlay() {
        if (video.paused || video.ended) {
            video.play();
        } else {
            video.pause();
        }
    }

    function updatePlayState() {
        const playing = !video.paused && !video.ended;
        iconPlay.style.display = playing ? 'none' : '';
        iconPause.style.display = playing ? '' : 'none';
        if (bigPlay) {
            bigPlay.classList.toggle('hidden', playing);
        }
    }

    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);
    video.addEventListener('ended', updatePlayState);

    playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
    if (bigPlay) bigPlay.addEventListener('click', togglePlay);

    // Click on video to toggle play (but not on controls)
    wrapper.addEventListener('click', (e) => {
        if (e.target.closest('.custom-video-controls') || e.target.closest('.cv-big-play-overlay')) return;
        togglePlay();
    });

    // --- Progress Bar ---
    function updateProgress() {
        if (isDragging || !isFinite(video.duration)) return;
        const pct = (video.currentTime / video.duration) * 100;
        progressFilled.style.width = pct + '%';
        timeCurrent.textContent = formatTime(video.currentTime);
    }

    function updateBuffered() {
        if (!isFinite(video.duration) || video.buffered.length === 0) return;
        const buffEnd = video.buffered.end(video.buffered.length - 1);
        bufferedBar.style.width = (buffEnd / video.duration) * 100 + '%';
    }

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('progress', updateBuffered);
    video.addEventListener('loadedmetadata', () => {
        timeDuration.textContent = formatTime(video.duration);
    });
    // Also set duration when it becomes available later (e.g. streaming)
    video.addEventListener('durationchange', () => {
        timeDuration.textContent = formatTime(video.duration);
    });

    // --- Seek via progress bar ---
    function seek(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        video.currentTime = pos * video.duration;
        progressFilled.style.width = (pos * 100) + '%';
    }

    progressBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        progressBar.classList.add('cv-dragging');
        seek(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) seek(e);
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            progressBar.classList.remove('cv-dragging');
        }
    });

    // Touch support for progress bar
    progressBar.addEventListener('touchstart', (e) => {
        isDragging = true;
        progressBar.classList.add('cv-dragging');
        seek(e.touches[0]);
    }, { passive: true });

    progressBar.addEventListener('touchmove', (e) => {
        if (isDragging) seek(e.touches[0]);
    }, { passive: true });

    progressBar.addEventListener('touchend', () => {
        isDragging = false;
        progressBar.classList.remove('cv-dragging');
    });

    // --- Rewind / Forward ---
    rewindBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.currentTime = Math.max(0, video.currentTime - 10);
    });
    forwardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
    });

    // --- Volume ---
    volumeSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        video.volume = parseFloat(volumeSlider.value);
        video.muted = false;
        updateMuteIcon();
    });

    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        if (video.muted) {
            volumeSlider.value = 0;
        } else {
            volumeSlider.value = video.volume || 1;
        }
        updateMuteIcon();
    });

    function updateMuteIcon() {
        const muted = video.muted || video.volume === 0;
        iconVol.style.display = muted ? 'none' : '';
        iconMuted.style.display = muted ? '' : 'none';
    }

    // --- Fullscreen ---
    fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.fullscreenElement === wrapper) {
            document.exitFullscreen();
        } else if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
            wrapper.webkitRequestFullscreen();
        }
    });

    // --- Auto-hide controls ---
    function showControls() {
        wrapper.classList.add('cv-show-controls');
        clearTimeout(hideControlsTimer);
        if (!video.paused) {
            hideControlsTimer = setTimeout(() => {
                wrapper.classList.remove('cv-show-controls');
            }, 3000);
        }
    }

    wrapper.addEventListener('mousemove', showControls);
    wrapper.addEventListener('touchstart', showControls, { passive: true });
    video.addEventListener('pause', () => {
        wrapper.classList.add('cv-show-controls');
        clearTimeout(hideControlsTimer);
    });
    video.addEventListener('play', () => {
        showControls();
    });

    // --- Keyboard shortcuts (when wrapper is focused or hovered) ---
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', (e) => {
        switch (e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 10);
                showControls();
                break;
            case 'ArrowRight':
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                showControls();
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                volumeSlider.value = video.volume;
                updateMuteIcon();
                showControls();
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                volumeSlider.value = video.volume;
                updateMuteIcon();
                showControls();
                break;
            case 'm':
                video.muted = !video.muted;
                volumeSlider.value = video.muted ? 0 : video.volume;
                updateMuteIcon();
                showControls();
                break;
            case 'f':
                fullscreenBtn.click();
                break;
        }
    });
}

/* -------------------------------------------- */
/* ACTIVE NAV LINK TRACKING                      */
/* -------------------------------------------- */
function initActiveNavTracking() {
    // Track both <section id="..."> and any other anchored elements with nav links
    const sectionEls = Array.from(document.querySelectorAll('section[id]'));
    const extraEls   = Array.from(document.querySelectorAll('div[id]')).filter(el => {
        return document.querySelector(`.nav-link[href="#${el.id}"]`) !== null;
    });
    const trackable  = [...sectionEls, ...extraEls];
    const navLinks   = document.querySelectorAll('.nav-link');

    if (!trackable.length || !navLinks.length) return;

    const NAV_HEIGHT = 64;

    // Helper: get absolute top of any element regardless of nesting depth
    function getAbsoluteTop(el) {
        return el.getBoundingClientRect().top + window.scrollY;
    }

    function updateActiveLink() {
        const scrollY = window.scrollY + NAV_HEIGHT + 10; // small buffer past nav

        // Find the last trackable element whose absolute top is at or above scroll position
        let currentId = null;
        trackable.forEach(el => {
            if (getAbsoluteTop(el) <= scrollY) {
                currentId = el.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink(); // Run once on load
}

/* -------------------------------------------- */
/* PROJECT CARD ACCORDION                        */
/* -------------------------------------------- */
function toggleProject(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const btn    = card.querySelector('.pc-header');
    const body   = card.querySelector('.pc-body');
    const isOpen = card.classList.contains('is-open');

    if (isOpen) {
        card.classList.remove('is-open');
        body.classList.remove('pc-body--open');
        btn.setAttribute('aria-expanded', 'false');
    } else {
        card.classList.add('is-open');
        body.classList.add('pc-body--open');
        btn.setAttribute('aria-expanded', 'true');
    }
}

/* -------------------------------------------- */
/* PDF SLIDE DECK CAROUSEL  (pdf.js canvas)      */
/* -------------------------------------------- */
function initSlideDeck() {
    const canvas    = document.getElementById('slide-deck-canvas');
    const ctx       = canvas.getContext('2d');
    const prevBtn   = document.getElementById('slide-prev');
    const nextBtn   = document.getElementById('slide-next');
    const currentEl = document.getElementById('slide-current');
    const totalEl   = document.getElementById('slide-total');

    if (!canvas || !prevBtn || !nextBtn) return;

    const PDF_SRC = 'assets/The_Eshopbox_Revenue_Engine.pdf';
    let pdfDoc      = null;
    let currentPage = 1;
    let totalPages  = 8;
    let rendering   = false;

    /* ---- render one page to canvas ---- */
    function renderPage(pageNum) {
        if (!pdfDoc || rendering) return;
        rendering = true;

        pdfDoc.getPage(pageNum).then(function (page) {
            /* Scale so the rendered page matches container width at device DPR */
            var containerWidth = canvas.parentElement.clientWidth;
            var baseViewport   = page.getViewport({ scale: 1 });
            var dpr            = window.devicePixelRatio || 1;
            var scale          = (containerWidth / baseViewport.width) * dpr;
            var viewport       = page.getViewport({ scale: scale });

            canvas.width  = viewport.width;
            canvas.height = viewport.height;

            page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                rendering = false;
            });
        });
    }

    /* ---- UI helpers ---- */
    function updateUI() {
        currentEl.textContent = currentPage;
        totalEl.textContent   = totalPages;
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
    }

    function goToPage(page) {
        currentPage = Math.max(1, Math.min(page, totalPages));
        renderPage(currentPage);
        updateUI();
    }

    prevBtn.addEventListener('click', function () { goToPage(currentPage - 1); });
    nextBtn.addEventListener('click', function () { goToPage(currentPage + 1); });

    /* ---- load pdf.js & initialise ---- */
    function tryInit() {
        if (typeof pdfjsLib === 'undefined') {
            /* pdf.js not yet available — should not happen with the <script> tag in <head> */
            console.error('pdf.js failed to load');
            return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        loadPdf();
    }

    function loadPdf() {
        pdfjsLib.getDocument(PDF_SRC).promise.then(function (pdf) {
            pdfDoc     = pdf;
            totalPages = pdf.numPages;
            updateUI();
            renderPage(1);
        }).catch(function (err) {
            console.error('pdf.js failed to load document:', err);
        });
    }

    tryInit();
}
