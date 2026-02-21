# AI Resume Enhancer - Animation & Code Guide

## 📚 Table of Contents
1. [Project Structure](#project-structure)
2. [GSAP Animations Overview](#gsap-animations-overview)
3. [Theme System (Light/Dark Mode)](#theme-system)
4. [How to Modify Animations](#how-to-modify-animations)
5. [Common Customizations](#common-customizations)

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── App.tsx                          # Main app component (page navigation)
│   └── components/
│       ├── navigation.tsx               # Top navigation bar
│       ├── theme-toggle.tsx             # Light/dark mode toggle button
│       ├── landing-page.tsx             # Landing page wrapper
│       ├── hero-section.tsx             # Hero section with counters
│       ├── features-section.tsx         # 6 feature cards
│       ├── about-section.tsx            # About project section
│       ├── contact-section.tsx          # Contact form
│       ├── landing-footer.tsx           # Footer
│       └── signin-page.tsx              # Sign in/up page
└── styles/
    └── theme.css                        # Color theme definitions
```

---

## 🎬 GSAP Animations Overview

### Animation Types Used

| Type | Purpose | Example Use |
|------|---------|-------------|
| `gsap.to()` | Animate TO a state | Page fade out |
| `gsap.fromTo()` | Animate FROM → TO | Elements sliding in |
| `gsap.timeline()` | Chain multiple animations | Hero section sequence |
| `ScrollTrigger` | Trigger animations on scroll | Feature cards reveal |
| `gsap.utils.toArray()` | Animate multiple elements | Individual card animations |

---

### 📍 File-by-File Animation Breakdown

#### 1️⃣ **App.tsx** - Page Transitions
**Location:** `/src/app/App.tsx`

**Animations:**
- **Page Exit** (when navigating away)
  - Fades out and moves up 20px
  - Duration: 0.3 seconds
  
- **Page Enter** (when navigating in)
  - Fades in and moves from 20px below to original position
  - Duration: 0.3 seconds

**How to Modify:**
```typescript
// Change fade-out distance
gsap.to(pageRef.current, {
  y: -50,  // Change from -20 to -50 for more dramatic effect
  duration: 0.5  // Slow down from 0.3s to 0.5s
})

// Change fade-in starting position
gsap.fromTo(pageRef.current,
  { y: 100 },  // Start further down (was 20)
  { y: 0, duration: 0.5 }
)
```

---

#### 2️⃣ **navigation.tsx** - Navbar Entrance
**Location:** `/src/app/components/navigation.tsx`

**Animation:**
- Slides down from -100px above viewport
- Fades from 0 to 1 opacity
- Duration: 0.8 seconds
- Easing: power3.out (smooth deceleration)

**How to Modify:**
```typescript
// Change slide distance and speed
gsap.fromTo(navRef.current,
  { y: -200 },  // Start further up (was -100)
  { 
    y: 0, 
    duration: 1.2,  // Slower animation (was 0.8)
    ease: "bounce.out"  // Bouncy effect (was power3.out)
  }
)
```

---

#### 3️⃣ **hero-section.tsx** - Hero Entrance & Counters
**Location:** `/src/app/components/hero-section.tsx`

**Animations:**

**A. Cascading Text Entrance (Timeline)**
```
Title      ━━━━━━━━━━━━━ (1.0s)
Subtitle        ━━━━━━━━━━ (0.8s) [starts 0.5s before title ends]
Buttons             ━━━━━━━━ (0.8s) [starts 0.4s before subtitle ends]
```

**B. Counter Animation**
- Counts from 0 → 30, 0 → 99.9, 0 → 100
- Duration: 2 seconds
- Delay: 1 second (waits for text animations)

**How to Modify Timeline Overlap:**
```typescript
// Adjust overlap values (negative = overlap, positive = gap)
tl.fromTo(titleRef.current, ...)
  .fromTo(subtitleRef.current, ..., "-=0.8")  // More overlap (was -=0.5)
  .fromTo(buttonsRef.current, ..., "+=0.2")   // Add gap instead of overlap
```

**How to Modify Counter Speed:**
```typescript
gsap.to({}, {
  duration: 3,  // Slower count (was 2)
  delay: 0.5,   // Start sooner (was 1)
  onUpdate: function() {
    const progress = this.progress();
    setStat1(Math.floor(50 * progress));  // Count to 50 instead of 30
  }
})
```

---

#### 4️⃣ **features-section.tsx** - Scroll-Based Card Reveals
**Location:** `/src/app/components/features-section.tsx`

**Animations:**

**A. Section Title**
- Triggers when title is 80% down viewport
- Completes when title is 30% down viewport
- Uses `scrub: 1` (follows scroll position smoothly)

**B. Individual Feature Cards**
- Each card animates independently
- Slides up 100px, fades in, scales from 90% to 100%
- Uses `scrub: 1.5` (slightly laggier than title)

**ScrollTrigger Explained:**
```typescript
scrollTrigger: {
  trigger: card,        // Element to watch
  start: "top 85%",     // When card top reaches 85% down viewport
  end: "top 30%",       // Animation complete at 30% down viewport
  scrub: 1.5,           // Smooth scroll-link (higher = more lag)
  toggleActions: "play none none reverse"  // Reverse on scroll up
}
```

**How to Modify:**
```typescript
// Make cards slide from right instead of bottom
gsap.fromTo(card,
  { 
    x: 200,        // Start 200px to the right (instead of y: 100)
    opacity: 0,
    scale: 0.8     // Start smaller (was 0.9)
  },
  {
    x: 0,
    opacity: 1,
    scale: 1,
    scrollTrigger: {
      start: "top 90%",  // Trigger sooner (was 85%)
      scrub: 2,          // More laggy effect (was 1.5)
    }
  }
)
```

---

#### 5️⃣ **about-section.tsx** - Split Panel Reveal
**Location:** `/src/app/components/about-section.tsx`

**Animations:**

**A. Image Panel (Left)**
- Slides from -150px left
- Scales from 90% to 100%
- Fades in

**B. Content Panel (Right)**
- Slides from +150px right (opposite of image)
- Creates "split reveal" effect

**C. Value Cards**
- Animate individually as they scroll into view
- Slide from 50px right

**How to Modify Split Effect:**
```typescript
// Make panels slide from top/bottom instead of left/right
// Image from top:
gsap.fromTo(imageRef.current,
  { y: -150, opacity: 0 },  // From top (instead of x: -150)
  { y: 0, opacity: 1, ... }
)

// Content from bottom:
gsap.fromTo(contentRef.current,
  { y: 150, opacity: 0 },   // From bottom (instead of x: 150)
  { y: 0, opacity: 1, ... }
)
```

---

#### 6️⃣ **contact-section.tsx** - Simple Fade In
**Location:** `/src/app/components/contact-section.tsx`

**Animation:**
- Form fades in and slides up 60px
- **No scrub** - triggers once, doesn't follow scroll
- Duration: 1 second

**Difference from Other Sections:**
This animation is **one-time only** and doesn't reverse when scrolling up.

**How to Make It Reversible:**
```typescript
gsap.fromTo(formRef.current,
  { y: 60, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    scrollTrigger: {
      trigger: sectionRef.current,
      start: "top 70%",
      end: "top 30%",
      scrub: 1,  // ADD scrub to make it follow scroll
      toggleActions: "play none none reverse"  // ADD reverse action
    }
  }
)
```

---

#### 7️⃣ **signin-page.tsx** - Two-Panel Slide In
**Location:** `/src/app/components/signin-page.tsx`

**Animations:**

**A. Initial Load (Timeline)**
- Left panel slides from -100px left
- Right panel slides from +100px right
- 0.7 second overlap creates simultaneous effect

**B. Mode Toggle (Sign In ↔ Sign Up)**
- Quick scale/fade effect (0.3s)
- Prevents jarring transition when "Full Name" field appears/disappears

**How to Modify Panel Animation:**
```typescript
// Change panel slide directions
tl.fromTo(imageRef.current,
  { y: -100 },  // Slide from top (instead of x: -100)
  { y: 0, duration: 1, ease: "power3.out" }
)
.fromTo(formRef.current,
  { y: 100 },   // Slide from bottom (instead of x: 100)
  { y: 0, duration: 1, ease: "power3.out" },
  "-=0.9"       // More overlap (was -=0.7)
)
```

---

## 🎨 Theme System (Light/Dark Mode)

### How It Works

1. **HTML Class Toggle**
   - Clicking theme toggle adds/removes `dark` class on `<html>` element
   - All dark mode styles use `dark:` Tailwind prefix

2. **localStorage Persistence**
   - Theme preference saved to browser storage
   - Persists across page reloads

3. **System Preference Detection**
   - Checks user's OS preference on first visit
   - Falls back to light mode if no preference

### Color Variables

**Location:** `/src/styles/theme.css`

#### Light Mode Colors
```css
--bg-dark: oklch(0.98 0.005 182);     /* Lightest background */
--bg: oklch(0.96 0.005 182);          /* Default background */
--bg-light: oklch(0.94 0.005 182);    /* Card backgrounds */
--text: oklch(0.15 0.01 182);         /* Dark text */
--text-muted: oklch(0.45 0.01 182);   /* Muted text */
```

#### Dark Mode Colors
```css
--bg-dark: oklch(0.1 0.005 182);      /* Darkest background */
--bg: oklch(0.15 0.005 182);          /* Default background */
--bg-light: oklch(0.2 0.005 182);     /* Card backgrounds */
--text: oklch(0.96 0.01 182);         /* Light text */
--text-muted: oklch(0.76 0.01 182);   /* Muted text */
```

### How to Modify Theme Colors

**Change Background Color:**
```css
:root {
  --bg: oklch(0.98 0.005 180);  /* Lighter, slightly different hue */
}

.dark {
  --bg: oklch(0.12 0.005 180);  /* Slightly lighter dark mode */
}
```

**Change Primary Color (Blue):**
```css
:root {
  --primary: oklch(0.76 0.1 220);  /* More purple (was 182) */
}
```

---

## 🔧 How to Modify Animations

### Common Animation Properties

| Property | What It Does | Example Values |
|----------|-------------|----------------|
| `x` | Horizontal position | `-100` (left), `100` (right) |
| `y` | Vertical position | `-50` (up), `50` (down) |
| `opacity` | Transparency | `0` (invisible), `1` (visible) |
| `scale` | Size | `0.9` (90%), `1` (100%), `1.2` (120%) |
| `rotation` | Rotation in degrees | `0`, `90`, `180`, `360` |
| `duration` | Animation time (seconds) | `0.3`, `1`, `2` |
| `delay` | Wait before starting | `0.5`, `1`, `2` |
| `ease` | Animation curve | See below |

### Easing Functions (ease property)

| Ease | Effect | Best For |
|------|--------|----------|
| `"power1.out"` | Gentle deceleration | Subtle movements |
| `"power3.out"` | Strong deceleration | Dramatic entrances |
| `"back.out"` | Slight overshoot | Playful effects |
| `"elastic.out"` | Bouncy overshoot | Attention-grabbing |
| `"bounce.out"` | Multiple bounces | Playful landing |

**Example:**
```typescript
// Change from smooth to bouncy
gsap.fromTo(element,
  { y: 50 },
  { 
    y: 0, 
    ease: "bounce.out"  // Was "power3.out"
  }
)
```

### ScrollTrigger Properties

| Property | What It Does | Example |
|----------|-------------|---------|
| `trigger` | Element to watch | `sectionRef.current` |
| `start` | When to start | `"top 80%"` = element top at 80% down viewport |
| `end` | When to finish | `"top 30%"` = element top at 30% down viewport |
| `scrub` | Scroll-link smoothness | `1` (smooth), `2` (laggy), `true` (instant) |
| `toggleActions` | What to do on scroll events | `"play none none reverse"` |

**toggleActions Explained:**
```
"play none none reverse"
 │    │    │    └─ onLeaveBack (scrolling up past trigger)
 │    │    └────── onLeave (scrolling down past end)
 │    └─────────── onEnterBack (scrolling up back into view)
 └──────────────── onEnter (scrolling down into view)

Common values: play, pause, resume, reverse, restart, complete, none
```

---

## 🎯 Common Customizations

### 1. Change Animation Speed Globally

**Make everything slower:**
```typescript
// Add to top of each animation file
gsap.globalTimeline.timeScale(0.5);  // 50% speed (everything takes 2x longer)
```

### 2. Disable All Animations

**Useful for debugging:**
```typescript
// Add to App.tsx
gsap.globalTimeline.pause();
```

### 3. Add Stagger Effect to Cards

**Animate cards one after another:**
```typescript
gsap.fromTo(".feature-card",
  { y: 100, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    stagger: 0.2,  // 0.2 second delay between each card
    duration: 0.8
  }
)
```

### 4. Add Rotation to Entrance Animations

```typescript
gsap.fromTo(titleRef.current,
  { 
    y: 50, 
    opacity: 0,
    rotation: -5  // Start rotated 5° counter-clockwise
  },
  { 
    y: 0, 
    opacity: 1,
    rotation: 0,  // End at normal rotation
    duration: 1 
  }
)
```

### 5. Change ScrollTrigger Start/End Points

**Make animation trigger sooner:**
```typescript
scrollTrigger: {
  start: "top 90%",  // Was "top 80%" - triggers 10% sooner
  end: "top 40%"     // Was "top 30%" - finishes 10% later
}
```

### 6. Add Parallax Effect

```typescript
gsap.fromTo(imageRef.current,
  { y: 0 },
  {
    y: -100,  // Move up 100px as you scroll
    scrollTrigger: {
      trigger: sectionRef.current,
      scrub: true,  // Tied directly to scroll (no lag)
      start: "top bottom",
      end: "bottom top"
    }
  }
)
```

---

## 🐛 Troubleshooting

### Animation Not Working?

1. **Check if ref is attached:**
   ```typescript
   console.log(elementRef.current);  // Should not be null
   ```

2. **Check if GSAP is imported:**
   ```typescript
   import gsap from "gsap";
   ```

3. **Check if ScrollTrigger is registered:**
   ```typescript
   import { ScrollTrigger } from "gsap/ScrollTrigger";
   gsap.registerPlugin(ScrollTrigger);
   ```

### Animation Jumping or Flickering?

- Add `will-change: transform` CSS property
- Check if multiple animations are targeting the same element

### ScrollTrigger Not Triggering?

- Make sure trigger element exists in DOM
- Check start/end values (use ScrollTrigger.refresh() after content loads)
- Add markers for debugging: `markers: true` in scrollTrigger config

---

## 📝 Quick Reference Cheat Sheet

```typescript
// ============================================================
// BASIC ANIMATION
// ============================================================
gsap.to(element, {
  x: 100,           // Move 100px right
  y: 50,            // Move 50px down
  opacity: 0.5,     // 50% transparency
  duration: 1,      // Takes 1 second
  ease: "power3.out"
});

// ============================================================
// FROM → TO ANIMATION
// ============================================================
gsap.fromTo(element,
  { opacity: 0, y: 50 },           // Starting state
  { opacity: 1, y: 0, duration: 1 } // Ending state
);

// ============================================================
// TIMELINE (Sequence)
// ============================================================
const tl = gsap.timeline();
tl.fromTo(element1, {}, {}, )
  .fromTo(element2, {}, {}, "-=0.5")  // Overlap 0.5s
  .fromTo(element3, {}, {}, "+=0.3"); // Wait 0.3s

// ============================================================
// SCROLL-TRIGGERED ANIMATION
// ============================================================
gsap.fromTo(element,
  { opacity: 0, y: 100 },
  {
    opacity: 1,
    y: 0,
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      end: "top 30%",
      scrub: 1,
      toggleActions: "play none none reverse"
    }
  }
);

// ============================================================
// CLEANUP (Always add to useEffect)
// ============================================================
useEffect(() => {
  const ctx = gsap.context(() => {
    // Your animations here
  }, containerRef);
  
  return () => ctx.revert();  // Cleanup
}, []);
```

---

## 🎓 Learning Resources

- **GSAP Docs:** https://greensock.com/docs/
- **ScrollTrigger Docs:** https://greensock.com/docs/v3/Plugins/ScrollTrigger
- **Easing Visualizer:** https://greensock.com/ease-visualizer/
- **GSAP Cheat Sheet:** https://greensock.com/cheatsheet/

---

**Last Updated:** February 5, 2026  
**Project:** AI Resume Enhancer  
**Team:** KMR (Arman Milani & Ramtin Loghmani)
