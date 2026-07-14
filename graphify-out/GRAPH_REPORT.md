# 🔬 Graphify Report — Sun King Website

> Generated: 2026-07-13T21:18:53+05:30  
> Source: `/Users/dexter/Downloads/ag-interview-space/job-applications/sun-king/website`  
> Files: 3 · ~4,850 words · 53,992 bytes

---

## Graph Summary

| Metric | Value |
|--------|-------|
| **Total Nodes** | 29 |
| **Total Edges** | 38 |
| **Communities** | 4 |
| **Files** | 3 (HTML, CSS, JS) |
| **Components** | 5 (Nav, Hero, Video, Projects, Footer) |
| **Functions** | 5 (4 init + 1 helper) |
| **Design System Nodes** | 3 (Tokens, Animations, Responsive) |
| **Content Entities** | 5 projects |
| **Assets** | 4 (profile pic, 2 videos, platform images) |

---

## 🏛 Architecture Overview

This is a **static single-page website** with zero build step and zero dependencies (no framework, no bundler, no npm). The architecture is intentionally minimal:

```
index.html          → Structure & content (360 lines)
├── styles.css      → Complete design system + all component styles (1010 lines)
├── script.js       → Client-side interactivity (167 lines)
└── assets/         → Media files (profile pic, videos, placeholder images)
```

**Page flow:** Fixed Nav → Full-viewport Hero → Video Section (Deliverable 1) → Projects Section (Deliverable 2) → Footer

---

## 🌟 God Nodes (Most Connected)

These nodes have the highest edge count and are central to the codebase:

| Node | Type | Edges | Why It Matters |
|------|------|-------|---------------|
| **design_tokens** | Design System | 7 | Every component depends on these CSS custom properties. Changing any token cascades everywhere. |
| **section_projects** | Component | 9 | Largest section — contains 5 project cards, CTA, dexterAI video, platforms grid. Most complex HTML. |
| **section_nav** | Component | 7 | Referenced by 3 JS functions + responsive breakpoints + internal links. |
| **section_hero** | Component | 6 | Uses most animations, profile pic asset, scroll indicator, responsive adaptations. |
| **file_index_html** | File | 5 | Root document — imports CSS, JS, fonts; contains all sections. |

---

## 🔗 Key Relationships

### File Dependencies
```
index.html ──imports──→ styles.css
index.html ──imports──→ script.js
index.html ──imports──→ Google Fonts (Inter, 300-800)
```

### JS → DOM Coupling
```
initNavigation()        → #navbar, #nav-toggle, #mobile-nav, .mobile-nav-link, a[href^="#"]
initScrollAnimations()  → .fade-up (IntersectionObserver → adds .visible)
initVideoFallbacks()    → #walkthrough-video, #dexter-video + their fallback overlays
initActiveNavTracking() → section[id], .nav-link (IntersectionObserver → toggles .active)
```

### CSS Design Token → Component Flow
```
:root tokens ──styles──→ Navigation (--bg-nav, --border-subtle, --gold-primary)
:root tokens ──styles──→ Hero (gold palette, spacing, font sizes)
:root tokens ──styles──→ Video cards (--bg-card, --border-gold)
:root tokens ──styles──→ Project cards (--bg-card, --bg-card-hover)
:root tokens ──styles──→ Footer (--bg-section, --gold-primary, --text-muted)
```

---

## 🏘 Communities

### 1. Page Structure & Navigation
**Nodes:** index.html, Nav, Hero, Video, Projects, Footer, SEO Meta  
**Summary:** The HTML skeleton. Single-page with smooth-scroll navigation between 4 sections. Fixed navbar with mobile overlay.

### 2. Visual Design System
**Nodes:** styles.css, Design Tokens, Animations, Responsive, Google Fonts  
**Summary:** Gold-on-dark brand system. 6 gold color variants, 3 neutral tiers. 4 keyframe animations. Responsive at 768px/480px. Inter font family.

### 3. JavaScript Interactivity
**Nodes:** script.js, initNavigation, initScrollAnimations, initVideoFallbacks, setupVideoFallback, initActiveNavTracking  
**Summary:** 4 init functions called on DOMContentLoaded. Two IntersectionObservers (scroll reveal + nav tracking). Video fallback with 3s timeout. Zero external dependencies.

### 4. Project Content & Assets
**Nodes:** 5 projects, profile pic, 2 videos, platform images  
**Summary:** Portfolio content. 3/5 projects have public links. Platform images directory is empty (placeholder fallbacks active).

---

## ⚡ Surprising Connections

1. **Two separate IntersectionObservers** — `initScrollAnimations()` and `initActiveNavTracking()` both create IntersectionObservers with different configs. They don't share state or code, but could potentially be unified.

2. **Video fallback is duplicated** — The same fallback pattern (overlay + error events + 3s timeout) is applied identically to both the walkthrough and dexterAI videos. This is already handled via the shared `setupVideoFallback()` function.

3. **Profile pic has JS+CSS double fallback** — The `onerror` handler shows the `#profile-pic-fallback` div, but the CSS also positions it absolutely behind the image. Two separate fallback mechanisms for one asset.

4. **Platform images directory is empty** — `assets/images/` exists but contains no files. All three platform cards show the CSS-driven "Image coming soon" placeholder via the `onerror` → `.platform-image--empty` pattern.

5. **Hero section bypasses JS scroll animation** — Hero's `.fade-up` elements use CSS `animation: heroFadeIn` directly, while `initScrollAnimations()` explicitly excludes them with `:not(.hero-section .fade-up)`. This is intentional (play on load, not on scroll) but non-obvious.

---

## 📋 Suggested Questions

Use these to query the graph efficiently:

- "What CSS tokens does the hero section depend on?" → Traverse `design_tokens → section_hero`
- "What happens when I change `--gold-primary`?" → Follow all edges from `design_tokens`
- "Which JS functions touch the DOM?" → List all `fn_*` nodes and their `dom_dependencies`
- "What assets are missing?" → Check `asset_platform_images` (empty directory)
- "How does mobile layout differ?" → Read `css_responsive` node
- "What external URLs does the page link to?" → Scan project content entities

---

## 🔧 Quick Reference: How to Modify

| Want to... | Consult Node | Files to Edit |
|-----------|-------------|---------------|
| Change brand colors | `design_tokens` | styles.css L4-53 |
| Add a new section | `section_*` pattern | index.html (add section), styles.css (add styles), script.js (if interactive) |
| Add a new project card | `section_projects` | index.html L168-251 (copy a `.project-card` block) |
| Change nav links | `section_nav` | index.html L24-28 (desktop) + L38-42 (mobile) |
| Modify animations | `css_animations` | styles.css (keyframes at L327, L394, L496, L918) |
| Fix video fallback behavior | `fn_init_video_fallbacks` | script.js L94-137 |
| Update responsive breakpoints | `css_responsive` | styles.css L926-1009 |
| Change fonts | `external_google_fonts` | index.html L11-13 + styles.css L36 |
| Update SEO/meta | `seo_meta` | index.html L4-10 |

---

## 📊 Token Savings

| Operation | Without Graph | With Graph | Savings |
|-----------|--------------|-----------|---------|
| Full codebase read | ~54,000 bytes | — | — |
| Answer "what colors are used?" | Read all 3 files (~54K) | Read `design_tokens` node (~800 bytes) | **~67x** |
| Answer "add a project card" | Read index.html + styles.css (~48K) | Read `section_projects` node + pattern | **~30x** |
| Answer "how does mobile work?" | Read styles.css (~22K) | Read `css_responsive` node (~400 bytes) | **~55x** |
| Answer "what JS functions exist?" | Read script.js (~5.5K) | Read `fn_*` nodes (~600 bytes) | **~9x** |

**Average savings: ~40x fewer tokens per targeted query.**
