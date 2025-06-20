# Cursor Instructions: Beanoss Spectacular Site - 3D Scene Development

## 🚨 CRITICAL CONSTRAINT: SCENE.JS ONLY MODIFICATIONS

**⚠️ ABSOLUTE RULE: You MUST only modify code within `js/scene.js`. NO changes to any other files are permitted.**

- ❌ NO HTML modifications (index.html, components.html, etc.)
- ❌ NO CSS changes (any .css files)
- ❌ NO configuration file changes (package.json, vite.config.js)
- ❌ NO asset modifications (models, images, etc.)
- ✅ ONLY `js/scene.js` modifications are allowed

## 📁 Project Architecture Overview

This is a **Webflow-exported site** enhanced with custom 3D interactions. The architecture is:

```
beanoss-spectacular-site.webflow/
├── index.html (STATIC - DO NOT MODIFY)
├── js/
│   ├── scene.js ← YOUR ONLY WORKABLE FILE
│   └── webflow.js (STATIC - DO NOT MODIFY)
├── css/ (STATIC - DO NOT MODIFY)
├── assets/models/ (STATIC - REFERENCE ONLY)
├── .cursor/ ← Development documentation
│   ├── DEVELOPMENT-GUIDE.md
│   └── instructions.md
├── README.md
└── package.json (STATIC - DO NOT MODIFY)
```

## 🛠 Technology Stack

- **Build Tool**: Vite (ES6 modules, hot reload)
- **3D Rendering**: Three.js (v0.177.0)
- **Animation**: GSAP with ScrollTrigger & SplitText plugins
- **Scroll**: Lenis for smooth scrolling
- **Style**: Vanilla CSS (pre-built via Webflow)

## 🎯 Current Implementation (scene.js)

The `scene.js` file implements a clean, focused 3D scene system:

### 1. **Animation System** (Lines 1-100)

- GSAP plugins registration
- Lenis smooth scrolling setup
- Text splitting with SplitText for main header

### 2. **Tooltip Text Setup** (Lines 100-200)

- Tooltip text preparation
- Responsive text handling
- Timeline creation for tooltip animations

### 3. **3D Scene Setup** (Lines 200-500)

- Three.js scene, camera, renderer
- Lighting system (ambient + directional)
- Model configuration object

### 4. **Model Loading & Positioning** (Lines 500-650)

- GLTF model loading
- Responsive positioning system
- Material optimization

### 5. **Main Scroll Animation System** (Lines 650-900)

- Primary ScrollTrigger animation with pinning
- Progress-based triggers for headers, masks, model
- 3D model rotation and entrance animation
- Tooltip scroll triggers with refresh handling

## 💻 Development Guidelines

### Code Quality Standards

Follow these principles for all scene.js modifications:

#### 1. **Functional & Immutable Style**

```javascript
// ✅ GOOD: Pure functions
const calculateModelPosition = (screenWidth, modelSize) => {
  const isMobile = screenWidth < 768;
  return isMobile ? { x: 0, y: 0 } : { x: -modelSize.x * 0.4, y: 0 };
};

// ❌ AVOID: Side effects in functions
function setModelPosition() {
  model.position.x = window.innerWidth < 768 ? 0 : -1;
}
```

#### 2. **Descriptive Names & Constants**

```javascript
// ✅ GOOD: Descriptive constants
const ANIMATION_DURATION = 1.5;
const MOBILE_BREAKPOINT = 768;
const TOOLTIP_REVEAL_TRIGGER = 0.7;

// ❌ AVOID: Magic numbers
gsap.to(element, { duration: 1.5, delay: 0.7 });
```

#### 3. **Early Returns**

```javascript
// ✅ GOOD: Early returns
function setupModel() {
  if (!model || !modelSize) return;

  // Main logic here
}

// ❌ AVOID: Nested conditions
function setupModel() {
  if (model && modelSize) {
    // Deep nesting
  }
}
```

#### 4. **Minimal Code Changes**

- Only modify code sections directly related to your task
- Preserve existing comments and structure
- Don't refactor unrelated code

### Performance Optimization Rules

#### 1. **Animation Performance**

```javascript
// ✅ GOOD: Use transform properties for GPU acceleration
gsap.to(element, {
  x: 100, // transform: translateX(100px)
  rotation: 45, // transform: rotate(45deg)
  scale: 1.2, // transform: scale(1.2)
});

// ❌ AVOID: Layout-triggering properties
gsap.to(element, {
  left: "100px", // Triggers layout
  width: "200px", // Triggers layout
});
```

#### 2. **Three.js Optimizations**

```javascript
// ✅ GOOD: Conditional rendering
function animate() {
  requestAnimationFrame(animate);
  if (model) {
    renderer.render(scene, camera);
  }
}

// ✅ GOOD: Limit shadow map resolution
mainLight.shadow.mapSize.set(512, 512); // Not 2048 or higher
```

#### 3. **ScrollTrigger Optimizations**

```javascript
// ✅ GOOD: Use scrub for smooth scroll-driven animations
ScrollTrigger.create({
  scrub: 1, // Smooth following
  onUpdate: ({ progress }) => {
    // Use progress-based calculations
  },
});
```

## 🎨 Common Modification Patterns

### Adding New Text Animations

When adding new text-based animations, follow this pattern:

```javascript
// 1. Set up SplitText
const newTextSplit = new SplitText(".new-element", {
  type: "chars", // or "words" or "lines"
  charsClass: "char",
});

// 2. Wrap in spans
newTextSplit.chars.forEach(
  (char) => (char.innerHTML = `<span>${char.innerHTML}</span>`)
);

// 3. Set initial state
gsap.set(".new-element .char > span", {
  y: "100%",
});

// 4. Create ScrollTrigger
ScrollTrigger.create({
  trigger: ".new-element-container",
  start: "top 80%",
  onEnter: () => {
    gsap.to(".new-element .char > span", {
      y: "0%",
      duration: 1,
      ease: "power3.inOut",
      stagger: 0.025,
    });
  },
});
```

### Adding New Scroll-Based Animations

For new scroll-triggered effects, add to the main ScrollTrigger:

```javascript
// Add to existing ScrollTrigger onUpdate
onUpdate: ({ progress }) => {
  // Existing animations...

  // New animation at specific progress point
  if (progress >= 0.8) {
    const animProgress = Math.min(1, (progress - 0.8) / 0.1);
    gsap.to(".new-element", {
      opacity: animProgress,
      duration: 0.3,
      ease: "power2.out",
    });
  }
};
```

### Modifying Model Behavior

For 3D model modifications, use the `modelConfig` object:

```javascript
// ✅ GOOD: Update configuration object
const modelConfig = {
  scaleFactor: 4,
  cameraDistance: {
    mobile: 4,
    desktop: 3,
  },
  position: {
    horizontalOffset: 0.4,
    verticalOffset: -0.05,
  },
  rotation: {
    mobile: 0,
    desktop: -15,
  },
  // Add new properties here
  newProperty: value,
};
```

## 🐛 Debugging Best Practices

### Console Logging

```javascript
// ✅ GOOD: Descriptive console logs
console.log("Model loaded successfully:", model);
console.log("Animation progress:", progress.toFixed(3));

// Add TODO comments for debugging code
// TODO: Remove debug logging before production
console.log("Debug: tooltip timeline state:", timeline.progress());
```

### Error Handling

```javascript
// ✅ GOOD: Graceful error handling
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
} catch (error) {
  console.warn("WebGL2 not available, falling back:", error);
  // Fallback code
}
```

## 📋 Common Tasks & Examples

### 1. Adjusting Animation Timing

```javascript
// Modify scroll trigger points in onUpdate callback
const headerProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.35));
//                                                    ↑ start    ↑ duration
```

### 2. Adding New Model Properties

```javascript
// In model loading success callback
model.traverse((node) => {
  if (node.isMesh) {
    Object.assign(node.material, {
      roughness: 0.3,
      metalness: 0.8,
      newProperty: newValue, // Add new material properties
    });
  }
});
```

### 3. Modifying Scroll Behavior

```javascript
// Adjust ScrollTrigger configuration
ScrollTrigger.create({
  trigger: ".product-overview",
  start: "top top",
  end: `+=${window.innerHeight * 2}`, // Extend scroll distance
  pin: true,
  scrub: 1.5, // Slower scrub for smoother animation
  // ... rest of config
});
```

## 🚫 What NOT to Do

### ❌ Don't Modify HTML Structure

```javascript
// ❌ NEVER: Create new HTML elements
document.body.innerHTML += "<div>New content</div>";

// ❌ NEVER: Modify existing HTML
document.querySelector(".header-1").innerHTML = "New text";
```

### ❌ Don't Add External Dependencies

```javascript
// ❌ NEVER: Import new libraries
import NewLibrary from "new-library"; // Not allowed

// ✅ USE: Only existing imports
import * as THREE from "three"; // OK - already imported
```

### ❌ Don't Modify CSS via JavaScript

```javascript
// ❌ AVOID: Direct style manipulation
element.style.color = "red";

// ✅ PREFER: GSAP for animations
gsap.to(element, { color: "red" });
```

## 📚 Reference: Key Functions & Objects

### Animation Functions

- `gsap.to()`, `gsap.set()`, `gsap.timeline()`
- `ScrollTrigger.create()`
- `SplitText()` for text splitting

### Three.js Objects

- `scene`, `camera`, `renderer`
- `model` (loaded GLTF object)
- `modelConfig` (configuration object)

### Scroll & Text

- `lenis` (smooth scroll instance)
- `titleSplits`, `descriptionSplits` (SplitText instances)
- `tooltipTimelines` (GSAP timeline array)

### Key HTML Selectors (READ-ONLY)

- `.model-container` - 3D scene container
- `.header-1`, `.header-2` - Main headers
- `.tooltip` - Interactive tooltips
- `.circular-mask` - Reveal mask
- `.product-overview` - Main scroll section

## 🎯 Current Animation Timeline Reference

| Progress Range | Animation        | Elements                                  |
| -------------- | ---------------- | ----------------------------------------- |
| 0% - 12%       | Model entrance   | 3D model rises from below viewport        |
| 0% - 15%       | Initial state    | Model container at scale 0.8              |
| 15% - 25%      | Model reveal     | Model container scales to 1.0             |
| 30% - 65%      | Header 1 exit    | `.header-1` slides left (-100%)           |
| 47% - 60%      | Mask reveal      | `.circular-mask` expands (0% to 100%)     |
| 45% - 90%      | Header 2 journey | `.header-2` slides right to left          |
| 70% - 89%      | Tooltip 1 & 2    | Both tooltip contents reveal              |
| 0% - 100%      | Model rotation   | Continuous Y-axis rotation (2 full turns) |

### 🎬 3D Model Entrance Animation

The 3D model features a sophisticated entrance animation:

**Implementation Details:**
- **Initial Position**: Model starts 1.5× its height below the final position
- **Animation Range**: 0% - 12% of scroll progress (early in the sequence)
- **Easing**: `power3.out` for smooth deceleration
- **Duration**: 0.3s with GSAP smooth interpolation
- **Responsive**: Maintains proportional positioning across all screen sizes

**Key Variables:**
- `finalModelPosition` - Stores the target position after entrance
- `currentScrollProgress` - Tracks scroll state for resize handling
- `applyEntranceAnimationState()` - Handles resize repositioning

### 🛠 Recent Enhancements

#### Circular Mask Timing Adjustment
- **Previous**: 52% - 65% progress range
- **Current**: 47% - 60% progress range (moved 5% earlier for better choreography)

#### Tooltip Initialization Fix
Enhanced tooltip system to handle page refresh scenarios:
- Added `onRefresh` callback to ScrollTrigger instances
- Manual progress calculation for reliable initialization
- Immediate state setting based on current scroll position
- 200ms timeout for proper DOM readiness

#### Code Cleanup
- **Removed**: Header caps animation system (simplified for focus)
- **Removed**: Data attribute text animations (simplified for focus)
- **Removed**: Small text animation system (simplified for focus)
- **Maintained**: Core 3D scene and main header animation system

This ensures tooltips appear correctly regardless of where users refresh the page in the scroll timeline.

Remember: Your goal is to enhance the existing 3D scene experience while maintaining the sophisticated animation choreography already in place. Every modification should feel like a natural extension of the existing system.
