# Ayushman Tripathi — Personal Portfolio

An ultra-modern, interactive portfolio for an **Associate Product Manager (APM)** and **Software Engineer**, designed with the motion systems and editorial aesthetics inspired by [iritiksingh.in](https://www.iritiksingh.in/).

---

## ⚡ Highlights & Key Features

- **Concentric Ripple Loader**: 8 concentric pulsing rings radiating in neon orange (`#FF5C1A`) with an expand-wipe exit transition that engulfs the screen on load.
- **Dual-Layer Glow Cursor with Card Absorption**: Smooth trailing orange glow dot and halo that automatically shrinks and sinks into the background when hovering over case study cards.
- **3D Depth Tilt & Idle Sway Engine**: Full 3D perspective manipulation (`perspective(3000px)`) that dynamically tilts cards relative to mouse coordinates, with a gentle multi-axis sinusoidal float when idle.
- **Spotlight Border Glow**: Cursor-following radial light border highlight on hover.
- **Interactive APM PRD & Architecture Modal**: Clickable "Inspect PRD & Case Study" buttons opening in-depth APM teardowns (Problem Opportunity, Personas, 0-to-1 MVP Scope, Quantified Business Metrics, and Learnings).
- **Sticky Frosted Navigation**: Floating glass pill navigation with neon slide-in underlines on hover, theme toggle, and mobile drawer.
- **Signature Reveal Animation**: Left-to-right clip-path inset reveal of Ayushman's cursive signature as you scroll into the About section.
- **Theme Toggle**: Instant seamless Dark Mode (`#0a0a0b`) and Light Mode (`#f5f3ef`) switching with `localStorage` persistence.
- **Copy-to-Clipboard Email**: One-click email copy with instant visual badge confirmation.
- **Responsive Design**: Flawlessly optimized across mobile (375px+), tablet (768px+), laptop, and 4K desktop screens.

---

## 🚀 Run Locally

You can open `index.html` directly in any web browser, or serve it locally using Python:

```bash
python -m http.server 8000
```

Then visit:
```
http://localhost:8000
```

---

## 📁 File Structure

- `index.html` — Complete semantic structure, HUD headers, and PRD modal.
- `styles.css` — High-performance dark/light design system, glassmorphism, 3D cards, and keyframe animations.
- `script.js` — Motion controller, concentric ripple loader, dual-layer cursor, 3D tilt engine, and modal system.
