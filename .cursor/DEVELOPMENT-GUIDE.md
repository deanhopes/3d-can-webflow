# Development Guide: 3D Scene Enhancement

## 🎯 Quick Reference

### Current Animation Timeline (scene.js)

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

### Key Configuration Objects

#### Model Configuration

```javascript
const modelConfig = {
  scaleFactor: 4, // Overall model size
  cameraDistance: { mobile: 4, desktop: 3 },
  position: {
    horizontalOffset: 0.4, // Desktop left offset
    verticalOffset: -0.05, // Vertical positioning
  },
  rotation: { mobile: 0, desktop: -15 },
};
```

#### Animation Options

```javascript
const animOptions = {
  duration: 1,
  ease: "power3.inOut",
  stagger: 0.025,
};
```

### HTML Structure (READ-ONLY)

```html
<section class="section product-overview">
  <div class="header-1">
    <h1 class="h1">You were never meant to move in straight lines.</h1>
  </div>
  <div class="header-2">
    <h1 class="h1">This is your chance to unchoose...</h1>
  </div>
  <div class="circular-mask"></div>
  <div class="tooltips u-d-flex">
    <div class="tooltip"><!-- Tooltip 1 --></div>
    <div class="tooltip align-right"><!-- Tooltip 2 --></div>
  </div>
  <div class="model-container"><!-- 3D Scene injected here --></div>
</section>
```

### Responsive Breakpoints

- **Mobile**: `< 768px`
- **Desktop**: `>= 768px`

### Performance Constraints

- Shadow map resolution: `512x512` (performance vs quality balance)
- Animation frame rate: 60fps via `requestAnimationFrame`
- WebGL fallback: Graceful degradation for unsupported devices

## 🔧 Common Modification Scenarios

### 1. Adjusting Model Position

```javascript
// In modelConfig object
position: {
  horizontalOffset: 0.5,  // Increase for more left offset
  verticalOffset: 0.1     // Positive moves up, negative moves down
}
```

### 2. Changing Animation Speed

```javascript
// In ScrollTrigger configuration
end: `+=${window.innerHeight * 2}`,  // Increase multiplier for slower scroll

// Or in individual animations
const headerProgress = (progress - 0.3) / 0.2;  // Decrease divisor for faster
```

### 3. Adding New Scroll-Based Effects

```javascript
// Add to onUpdate callback
if (progress >= 0.8) {
  // New trigger at 80%
  const effectProgress = Math.min(1, (progress - 0.8) / 0.1);
  gsap.to(".new-element", {
    opacity: effectProgress,
    scale: 1 + effectProgress * 0.2,
    duration: 0.3,
  });
}
```

### 4. Modifying 3D Model Properties

```javascript
// In model loading success callback
model.traverse((node) => {
  if (node.isMesh && node.material.isMeshStandardMaterial) {
    Object.assign(node.material, {
      roughness: 0.2, // 0 = mirror, 1 = completely rough
      metalness: 0.9, // 0 = non-metal, 1 = full metal
      envMapIntensity: 1.5, // Environment reflection strength
    });
  }
});
```

### 5. Modifying Model Entrance Animation

```javascript
// In main scroll animation onUpdate callback
if (model && finalModelPosition && modelSize) {
  const entranceProgress = Math.max(0, Math.min(1, progress / 0.12)); // 0-12% of scroll
  const currentY = finalModelPosition.y - (1 - entranceProgress) * modelSize.y * 1.5;
  
  gsap.to(model.position, {
    y: currentY,
    duration: 0.3,
    ease: "power3.out", // Change easing curve
  });
}

// Adjust entrance timing by modifying the divisor (0.12 = 12% of scroll)
// Adjust starting distance by modifying the multiplier (1.5 = 1.5x model height below)
```

### 6. Fixing Tooltip Initialization Issues

Recent enhancement to handle tooltip visibility on page refresh:

```javascript
// Enhanced tooltip initialization with manual progress calculation
function createTooltipScrollTriggers() {
  // ... existing timeline creation ...

  // Force initial state check after all triggers are created
  setTimeout(() => {
    ScrollTrigger.refresh();
    
    // Manual progress calculation for reliable initialization
    const productOverview = document.querySelector('.product-overview');
    if (productOverview) {
      const rect = productOverview.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const triggerTop = scrollTop + rect.top;
      const currentScroll = scrollTop;
      const endPoint = triggerTop + window.innerHeight * 1.8;
      
      if (currentScroll >= triggerTop && currentScroll <= endPoint) {
        const progress = (currentScroll - triggerTop) / (window.innerHeight * 1.8);
        const isInTooltipRange = progress >= 0.7 && progress <= 0.89;
        
        tooltipTimelines.forEach((timeline) => {
          if (isInTooltipRange) {
            timeline.progress(1); // Show immediately
          } else {
            timeline.progress(0); // Hide immediately
          }
        });
      }
    }
  }, 200);
}
```

This fix ensures tooltips appear correctly when users refresh the page at any scroll position.

## 🚨 Critical Constraints Reminder

1. **File Scope**: Only modify `js/scene.js`
2. **No HTML Changes**: Work with existing DOM structure
3. **No CSS Modifications**: Use GSAP for styling changes
4. **No New Dependencies**: Use existing Three.js, GSAP, Lenis only
5. **Preserve Comments**: Maintain educational documentation
6. **Minimal Changes**: Only modify code related to your specific task

## 🎨 Animation Best Practices

### GSAP Performance Tips

- Use `transform` properties: `x`, `y`, `rotation`, `scale`
- Avoid layout-triggering properties: `left`, `top`, `width`, `height`
- Use `will-change: transform` on animated elements (already set in CSS)
- Utilize `ease` curves: `"power2.out"`, `"power3.inOut"`, `"back.out(1.7)"`

### Three.js Optimization

- Limit geometry complexity for real-time performance
- Use frustum culling (already enabled)
- Minimize draw calls through material sharing
- Update shadow maps manually when needed

### ScrollTrigger Efficiency

- Use `scrub` for smooth scroll-following animations
- Batch DOM reads/writes in `onUpdate` callbacks
- Leverage `pin` for complex scroll sections
- Use `invalidateOnRefresh` for responsive behavior

This guide provides the technical foundation for enhancing the 3D scene while maintaining the sophisticated choreography already in place.
