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
/* VIDEO FALLBACKS                               */
/* -------------------------------------------- */
function initVideoFallbacks() {
    setupVideoFallback('walkthrough-video', 'walkthrough-fallback');
    setupVideoFallback('dexter-video', 'dexter-fallback');
}

function setupVideoFallback(videoId, fallbackId) {
    const video = document.getElementById(videoId);
    const fallback = document.getElementById(fallbackId);

    if (!video || !fallback) return;

    // Try to detect if the video source is available
    const source = video.querySelector('source');
    if (!source) {
        fallback.classList.remove('hidden');
        return;
    }

    // When video metadata loads, hide fallback
    video.addEventListener('loadedmetadata', () => {
        fallback.classList.add('hidden');
    });

    // When video can play, hide fallback
    video.addEventListener('canplay', () => {
        fallback.classList.add('hidden');
    });

    // On error, show fallback
    video.addEventListener('error', () => {
        fallback.classList.remove('hidden');
    });

    source.addEventListener('error', () => {
        fallback.classList.remove('hidden');
    });

    // Timeout fallback — if video hasn't loaded in 3 seconds, show fallback
    setTimeout(() => {
        if (video.readyState < 1) {
            fallback.classList.remove('hidden');
        }
    }, 3000);
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
            /* pdf.js loaded as ES-module; import it */
            import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs').then(function (mod) {
                window.pdfjsLib = mod;
                window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
                loadPdf();
            });
        } else {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
            loadPdf();
        }
    }

    function loadPdf() {
        pdfjsLib.getDocument(PDF_SRC).promise.then(function (pdf) {
            pdfDoc     = pdf;
            totalPages = pdf.numPages;
            updateUI();
            renderPage(1);
        });
    }

    tryInit();
}
