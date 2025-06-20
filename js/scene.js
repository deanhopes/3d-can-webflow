/**
 * GRND Product Showcase - 3D Scene & Scroll Animation System
 * =========================================================
 *
 * This file creates an interactive 3D product showcase that combines:
 * 1. Three.js for 3D model rendering
 * 2. GSAP for smooth animations
 * 3. Lenis for smooth scrolling
 * 4. ScrollTrigger for scroll-based animations
 *
 * LEARNING OBJECTIVES:
 * - Understand 3D scene setup and optimization
 * - Learn scroll-triggered animations
 * - Explore text animation techniques
 * - Grasp performance optimization strategies
 */

// Import required libraries for 3D rendering and animation
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Lenis from "lenis";

/**
 * Wait for DOM to be fully loaded before initializing the scene
 * This ensures all HTML elements are available for manipulation
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Hello World");

  /**
   * STEP 1: ANIMATION SYSTEM SETUP
   * ==============================
   *
   * Register GSAP plugins for advanced animation capabilities:
   * - ScrollTrigger: Trigger animations based on scroll position
   * - SplitText: Split text into individual characters/lines for animation
   */
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /**
   * STEP 2: SMOOTH SCROLLING SETUP
   * ===============================
   *
   * Lenis provides smooth, momentum-based scrolling that feels natural
   * and integrates perfectly with GSAP's ScrollTrigger system
   */
  const lenis = new Lenis();

  // Sync Lenis scroll with ScrollTrigger for accurate trigger points
  lenis.on("scroll", ScrollTrigger.update);

  // Connect Lenis to GSAP's ticker for optimal performance
  // The ticker runs at 60fps and ensures smooth animation updates
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0); // Disable lag smoothing for consistent performance

  /**
   * STEP 3: TEXT ANIMATION PREPARATION
   * ==================================
   *
   * SplitText breaks text elements into individual characters and lines,
   * allowing for sophisticated typography animations like typewriter effects
   */

  // Split the main header into individual characters for staggered animation
  const headerSplit = new SplitText(".header-1 h1", {
    type: "chars",
    charsClass: "char", // CSS class applied to each character wrapper
  });

  // Function to properly split tooltip text after layout is ready
  function initializeTooltipText() {
    // Force layout calculation by accessing offsetHeight
    document.querySelectorAll(".tooltip").forEach((tooltip) => {
      tooltip.offsetHeight; // Force reflow
    });

    // Split tooltip titles into lines for smooth line-by-line animation
    const titleSplits = new SplitText(".tooltip .title", {
      type: "lines",
      linesClass: "line", // CSS class applied to each line wrapper
    });

    // Split tooltip descriptions into lines with proper width calculation
    const descriptionSplits = new SplitText(".tooltip .description p", {
      type: "lines",
      linesClass: "line",
      // Force recalculation of line breaks
      reduceWhiteSpace: false,
    });

    return { titleSplits, descriptionSplits };
  }

  // Initialize text splitting after a brief delay to ensure layout is ready
  let titleSplits, descriptionSplits;

  function setupTooltipText() {
    const splits = initializeTooltipText();
    titleSplits = splits.titleSplits;
    descriptionSplits = splits.descriptionSplits;

    // Wrap each line in a span for smooth reveal animations
    [...titleSplits.lines, ...descriptionSplits.lines].forEach(
      (line) => (line.innerHTML = `<span>${line.innerHTML}</span>`)
    );

    // Create timelines after text elements exist
    createTooltipTimelines();
  }

  setTimeout(setupTooltipText, 100); // Small delay to ensure layout is complete

  // Re-split text on window resize to maintain proper line breaks
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Revert any existing splits first
      if (titleSplits) titleSplits.revert();
      if (descriptionSplits) descriptionSplits.revert();

      // Clear existing timelines
      tooltipTimelines.forEach((timeline) => timeline.kill());
      tooltipTimelines = [];

      // Re-initialize with new layout
      setupTooltipText();
    }, 250); // Debounce resize events
  });

  /**
   * ANIMATION-READY HTML STRUCTURE CREATION
   * ========================================
   *
   * Wrap each character in a <span> element for precise animation control.
   * This creates the necessary HTML structure for transform-based animations.
   */

  // Wrap each character in a span for individual animation control
  headerSplit.chars.forEach(
    (char) => (char.innerHTML = `<span>${char.innerHTML}</span>`)
  );

  // Note: Tooltip line wrapping is handled in the setTimeout above after layout is ready

  /**
   * ANIMATION CONFIGURATION
   * =======================
   *
   * Define reusable animation settings for consistent timing and easing
   */
  const animOptions = {
    duration: 1, // Animation duration in seconds
    ease: "power3.inOut", // Smooth easing curve (starts slow, speeds up, slows down)
    stagger: 0.025, // Delay between each element (creates wave effect)
  };

  /**
   * TOOLTIP ANIMATION CONFIGURATION
   * ===============================
   *
   * Define when tooltips should appear based on scroll progress.
   * Each tooltip has a trigger point and list of elements to animate.
   */
  const tooltipSelectors = [
    {
      trigger: 0.45, // Appear when scroll is 45% through the section
      elements: [
        ".tooltip:nth-child(2) .divider",
        ".tooltip:nth-child(2) .icon",
        ".tooltip:nth-child(2) .title .line > span",
        ".tooltip:nth-child(2) .description .line > span",
      ],
    },
    {
      trigger: 0.47, // Appear when scroll is 47% through the section (slight stagger)
      elements: [
        ".tooltip:nth-child(3) .divider",
        ".tooltip:nth-child(3) .icon",
        ".tooltip:nth-child(3) .title .line > span",
        ".tooltip:nth-child(3) .description .line > span",
      ],
    },
  ];

  /**
   * TOOLTIP TIMELINE CREATION
   * =========================
   *
   * Timelines will be created after text splitting is complete
   */
  let tooltipTimelines = [];

  function createTooltipTimelines() {
    tooltipTimelines = tooltipSelectors.map(({ elements }) => {
      const timeline = gsap.timeline({ paused: true });

      // Separate elements by type for different animations
      const dividerElements = elements.filter((el) => el.includes(".divider"));
      const iconElements = elements.filter((el) => el.includes(".icon"));
      const textElements = elements.filter(
        (el) => !el.includes(".icon") && !el.includes(".divider")
      );

      // Set initial states
      gsap.set(dividerElements, { scaleX: 0 }); // Dividers start with 0 width
      gsap.set(textElements, { y: "125%" }); // Text elements start below viewport
      gsap.set(iconElements, { y: -40, opacity: 0 }); // Icons start above with 0 opacity

      // Create coordinated animation sequence
      timeline
        .to(
          dividerElements,
          {
            scaleX: 1,
            duration: 1.5,
            ease: "power3.out",
          },
          0
        ) // Dividers animate first
        .to(
          iconElements,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
          },
          0.2
        ) // Icons follow shortly after
        .to(
          textElements,
          {
            y: "0%",
            duration: 0.4,
            ease: "power3.out",
            stagger: {
              amount: 0.3,
              from: "start",
            },
          },
          0.8
        ); // Text follows icons

      return timeline;
    });
  }

  /**
   * HEADER ANIMATION TRIGGER
   * ========================
   *
   * Animate the main header characters when the product overview section comes into view.
   * This creates a smooth typewriter-like effect as the user scrolls.
   */

  // Set initial state for model container
  gsap.set(".model-container", {
    scale: 0.8,
  });

  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "75% bottom", // Start when section is 75% visible from bottom
    onEnter: () => {
      // Animate header characters
      gsap.to(".header-1 h1 .char > span", {
        y: "0%", // Move to normal position
        duration: 1,
        ease: "power3.inOut",
        stagger: 0.025, // Stagger creates typewriter effect
      });
    },
    onLeaveBack: () => {
      // Reverse header animation when scrolling back up
      gsap.to(".header-1 h1 .char > span", {
        y: "100%", // Move below visible area
        duration: 1.5,
        ease: "power3.inOut",
        stagger: 0.025,
      });
    },
  });

  /**
   * STEP 4: THREE.JS 3D SCENE SETUP
   * ================================
   *
   * Initialize the core Three.js components for 3D rendering:
   * - Scene: The 3D world container
   * - Camera: The viewer's perspective
   * - Renderer: Converts 3D scene to 2D pixels
   */

  /**
   * MODEL CONFIGURATION
   * ===================
   * Easy-to-adjust parameters for can size and positioning
   */
  const modelConfig = {
    // Scale settings
    scaleFactor: 4, // Overall size multiplier (higher = bigger can)

    // Camera distance settings (affects apparent size)
    cameraDistance: {
      mobile: 4, // Distance on mobile (higher = smaller appearance)
      desktop: 3, // Distance on desktop (higher = smaller appearance)
    },

    // Position settings
    position: {
      // Horizontal offset on desktop (higher = more left offset)
      horizontalOffset: 0.4, // 0.4 = 40% of model width offset

      // Vertical offset (higher = more upward)
      verticalOffset: -0.05, // 0.085 = 8.5% of model height above center
    },

    // Rotation settings (in degrees)
    rotation: {
      mobile: 0, // Rotation on mobile
      desktop: -15, // Rotation on desktop (negative = counter-clockwise)
    },
  };

  // Global variables for 3D scene management
  let model, // The loaded 3D model
    currentRotation = 0, // Track model rotation for smooth animation
    modelSize = 0, // Model dimensions for positioning calculations
    finalModelPosition = { x: 0, y: 0, z: 0 }, // Store the final position for entrance animation
    currentScrollProgress = 0; // Track current scroll progress for resize handling

  /**
   * SCENE CREATION
   * ==============
   * The scene is like a stage where all 3D objects live
   */
  const scene = new THREE.Scene();

  /**
   * CAMERA SETUP
   * ============
   * PerspectiveCamera mimics human vision with depth perception.
   * Parameters: Field of View, Aspect Ratio, Near plane, Far plane
   */
  const camera = new THREE.PerspectiveCamera(
    35, // Field of view (60° is natural looking)
    window.innerWidth / window.innerHeight, // Aspect ratio matches screen
    0.1, // Near clipping plane (objects closer are invisible)
    1000 // Far clipping plane (objects farther are invisible)
  );

  /**
   * RENDERER CONFIGURATION
   * ======================
   * The renderer converts the 3D scene into pixels on the screen.
   * Optimization is crucial for smooth performance.
   */
  let renderer;

  try {
    // Try to create WebGL2 renderer first
    renderer = new THREE.WebGLRenderer({
      antialias: true, // Smooth edges (slight performance cost)
      powerPreference: "high-performance", // Request dedicated GPU if available
    });
  } catch (error) {
    console.warn("WebGL2 not available, falling back to WebGL1:", error);

    try {
      // Fallback to WebGL1 with reduced features
      renderer = new THREE.WebGLRenderer({
        antialias: false, // Disable antialiasing for better compatibility
        powerPreference: "default", // Use default power preference
        alpha: true, // Enable alpha for transparency
      });
    } catch (fallbackError) {
      console.error("WebGL not supported on this device:", fallbackError);

      // Show fallback message and hide 3D container
      const modelContainer = document.querySelector(".model-container");
      if (modelContainer) {
        modelContainer.innerHTML = `
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100%; 
            color: #666; 
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
          ">
            <div>
              <p>3D visualization not supported on this device.</p>
              <p style="font-size: 0.9em; margin-top: 10px;">Please use a modern browser with WebGL support.</p>
            </div>
          </div>
        `;
      }
      return; // Exit early if WebGL is completely unavailable
    }
  }

  // Only proceed if renderer was successfully created
  if (!renderer) return;

  // Transparent background allows HTML content to show through
  renderer.setClearColor(0x000000, 0); // Color: black, Alpha: 0 (transparent)

  // Match renderer size to window
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Limit pixel ratio for performance (prevents super-high DPI from slowing down)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /**
   * SHADOW SYSTEM OPTIMIZATION
   * ===========================
   * Shadows add realism but are expensive. We optimize for best performance/quality balance.
   */
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // Less expensive than PCFSoftShadowMap
  renderer.shadowMap.autoUpdate = false; // Only update when needed (manual control)

  /**
   * COLOR SPACE CONFIGURATION
   * ==========================
   * Control how colors are displayed for consistent appearance across devices
   */
  renderer.toneMapping = THREE.NoToneMapping; // No tone mapping for web-safe colors
  renderer.toneMappingExposure = 1; // Standard exposure

  // Attach the renderer's canvas to the HTML container
  document.querySelector(".model-container").appendChild(renderer.domElement);

  /**
   * STEP 5: LIGHTING SETUP
   * ======================
   * Good lighting is crucial for realistic 3D rendering.
   * We use a three-point lighting setup for professional results.
   */

  /**
   * AMBIENT LIGHT - Overall scene illumination
   * Provides base lighting so no part of the model is completely black
   */
  scene.add(new THREE.AmbientLight(0xffffff, 0.9)); // White light, 70% intensity

  /**
   * MAIN LIGHT - Primary directional light with shadows
   * This is like the sun - provides main illumination and creates shadows
   */
  const mainLight = new THREE.DirectionalLight(0xffffff, 1); // White light, full intensity
  mainLight.position.set(1, 1, 3); // Position above and to the side
  mainLight.castShadow = true; // Enable shadow casting
  mainLight.shadow.bias = -0.001; // Prevent shadow acne (visual artifacts)

  // Optimize shadow quality vs performance
  mainLight.shadow.mapSize.set(512, 512); // Shadow map resolution (512 is good balance)
  mainLight.shadow.camera.near = 0.1; // Shadow camera near plane
  mainLight.shadow.camera.far = 10; // Shadow camera far plane
  scene.add(mainLight);

  /**
   * FILL LIGHT - Secondary light to soften harsh shadows
   * This fills in the dark areas created by the main light
   */
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8); // Softer intensity
  fillLight.position.set(-2, 0, -2); // Opposite side from main light
  scene.add(fillLight);

  /**
   * APPLY ENTRANCE ANIMATION STATE
   * ==============================
   *
   * Apply the current entrance animation position based on scroll progress
   */
  function applyEntranceAnimationState() {
    if (
      model &&
      finalModelPosition &&
      modelSize &&
      currentScrollProgress !== undefined
    ) {
      const entranceProgress = Math.max(
        0,
        Math.min(1, currentScrollProgress / 0.12)
      ); // 0-12% of scroll
      const currentY =
        finalModelPosition.y - (1 - entranceProgress) * modelSize.y * 1.5;
      model.position.y = currentY; // Set directly without animation during resize
    }
  }

  /**
   * STEP 6: MODEL POSITIONING SYSTEM
   * =================================
   *
   * This function handles responsive positioning of the 3D model.
   * It adjusts position, rotation, and camera distance based on screen size.
   */
  function setupModel() {
    // Exit early if model isn't loaded yet
    if (!model || !modelSize) return;

    // Responsive design: different layouts for mobile vs desktop
    const isMobile = window.innerWidth < 768;

    // Calculate model's bounding box and center point
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    /**
     * MODEL POSITIONING LOGIC
     * =======================
     *
     * Mobile: Center the model horizontally
     * Desktop: Offset model to the left to make room for text
     */
    const newPositionX = isMobile
      ? center.x * 1 // Center horizontally
      : -center.x - modelSize.x * modelConfig.position.horizontalOffset; // Configurable offset

    const newPositionY =
      -center.y + modelSize.y * modelConfig.position.verticalOffset; // Configurable vertical offset
    const newPositionZ = -center.z; // Center on Z-axis

    // Store the final position for entrance animation
    finalModelPosition = { x: newPositionX, y: newPositionY, z: newPositionZ };

    // Set initial position below viewport for entrance animation
    // Calculate how far below to start (1.5x model height below final position)
    const startPositionY = newPositionY - modelSize.y * 1.5;

    model.position.set(newPositionX, startPositionY, newPositionZ);

    /**
     * MODEL ROTATION
     * ==============
     * Configurable rotation for both mobile and desktop
     */
    const rotationDegrees = isMobile
      ? modelConfig.rotation.mobile
      : modelConfig.rotation.desktop;
    model.rotation.z = THREE.MathUtils.degToRad(rotationDegrees);

    /**
     * CAMERA POSITIONING
     * ==================
     * Position camera based on model size and device type
     */
    const cameraDistance = isMobile
      ? modelConfig.cameraDistance.mobile
      : modelConfig.cameraDistance.desktop;

    // Calculate camera distance based on largest model dimension
    const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const cameraZ = maxDimension * cameraDistance;

    camera.position.set(0, 0, cameraZ); // Position camera on Z-axis
    camera.lookAt(0, 0, 0); // Point camera at scene center
  }

  /**
   * STEP 7: 3D MODEL LOADING
   * =========================
   *
   * Load the GLTF model asynchronously and configure it for optimal performance
   */

  // Only load model if WebGL is available
  if (!renderer) {
    console.log("Skipping 3D model loading - WebGL not available");
    return;
  }

  // Construct absolute path to model file
  const modelPath = new URL("../assets/models/can.glb", import.meta.url).href;

  // Load the 3D model using GLTFLoader
  new GLTFLoader().load(
    modelPath,
    (gltf) => {
      /**
       * SUCCESS CALLBACK - Model loaded successfully
       * ============================================
       */
      model = gltf.scene; // Extract the 3D scene from GLTF data

      /**
       * MODEL SCALING
       * =============
       * Scale the model to appropriate size for the scene
       */
      model.scale.setScalar(modelConfig.scaleFactor);

      /**
       * MATERIAL OPTIMIZATION AND STYLING
       * ==================================
       * Traverse through all mesh objects and optimize their materials
       */
      model.traverse((node) => {
        if (node.isMesh) {
          // Enable frustum culling for better performance
          // (Objects outside camera view won't be rendered)
          node.frustumCulled = true;

          // Configure material properties for realistic metallic appearance
          if (node.material.isMeshStandardMaterial) {
            Object.assign(node.material, {
              roughness: 0.3, // 0 = mirror-like, 1 = completely rough
              metalness: 0.8, // 0 = non-metallic, 1 = fully metallic
            });

            // Force material update for changes to take effect
            node.material.needsUpdate = true;
          }
        }
      });

      /**
       * MODEL SIZE CALCULATION
       * ======================
       * Calculate model dimensions after scaling for positioning calculations
       */
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      modelSize = size;

      // Add model to scene and position it
      scene.add(model);
      setupModel();
    },
    undefined, // Progress callback (not used)
    (error) => {
      /**
       * ERROR CALLBACK - Model failed to load
       * ====================================
       */
      console.error("Failed to load 3D model:", error);
    }
  );

  /**
   * STEP 8: RENDER LOOP
   * ===================
   *
   * The animation loop that continuously renders the 3D scene.
   * This runs at 60fps for smooth animation.
   */
  function animate() {
    // Schedule next frame
    requestAnimationFrame(animate);

    // Only render if model is loaded to avoid unnecessary renders
    if (model) {
      renderer.render(scene, camera);
    }
  }

  // Start the render loop
  animate();

  /**
   * STEP 9: RESPONSIVE DESIGN HANDLING
   * ==================================
   *
   * Handle window resizing to maintain proper aspect ratios and positioning
   */
  window.addEventListener("resize", () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Apply aspect ratio changes

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Reposition model for new screen size
    setupModel();

    // Re-apply the current entrance animation state
    applyEntranceAnimationState();
  });

  /**
   * STEP 10: MAIN SCROLL ANIMATION SYSTEM
   * =====================================
   *
   * A streamlined scroll-triggered animation that coordinates headers, masks,
   * tooltips, and 3D model rotation, ending shortly after tooltips complete.
   */
  ScrollTrigger.create({
    trigger: ".product-overview", // Element that triggers the animation
    start: "top top", // Start when section reaches top of viewport
    end: `+=${window.innerHeight * 1.5}`, // End after 1.5 viewport heights (right after tooltips)
    pin: true, // Pin the section during scroll
    pinSpacing: true, // Maintain spacing around pinned element
    scrub: 1, // Smooth scrubbing (animation follows scroll)

    /**
     * SCROLL PROGRESS CALLBACK
     * ========================
     *
     * This function runs continuously as the user scrolls, with 'progress'
     * ranging from 0 (start) to 1 (end). Different animations trigger at
     * different progress points for a choreographed experience.
     */
    onUpdate: ({ progress }) => {
      // Track current scroll progress for resize handling
      currentScrollProgress = progress;

      /**
       * 3D MODEL ENTRANCE ANIMATION (0% - 12% progress)
       * ===============================================
       *
       * The 3D model moves up from below the viewport to its final position
       */
      if (model && finalModelPosition && modelSize) {
        const entranceProgress = Math.max(0, Math.min(1, progress / 0.12)); // 0-12% of scroll
        const currentY =
          finalModelPosition.y - (1 - entranceProgress) * modelSize.y * 1.5;

        gsap.to(model.position, {
          y: currentY,
          duration: 0.3,
          ease: "power3.out",
        });
      }

      /**
       * MODEL CONTAINER REVEAL (15% - 25% progress)
       * ===========================================
       *
       * The 3D model container scales up smoothly with header-2 animation
       */
      const modelProgress = Math.max(0, Math.min(1, (progress - 0.15) / 0.1));
      gsap.to(".model-container", {
        scale: progress < 0.35 ? 0.8 : 0.8 + 0.2 * modelProgress, // Scale from 0.8 to 1.0
        duration: 0.2,
        ease: "power2.out",
      });

      /**
       * HEADER 1 SLIDE-OUT ANIMATION (30% - 65% progress)
       * ===============================================
       *
       * The first header slides out to the left as the user scrolls
       */
      const headerProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.35));
      gsap.to(".header-1", {
        xPercent:
          progress < 0.2
            ? 0 // Stay in place before 30%
            : progress > 0.8
            ? -100 // Fully off-screen after 65%
            : -100 * headerProgress, // Gradual slide from 30% to 65%
        duration: 0.4,
        ease: "linear",
      });

      /**
       * CIRCULAR MASK REVEAL (45% - 60% progress)
       * =========================================
       *
       * A circular mask expands to reveal the second header underneath
       */
      const maskSize =
        progress < 0.45
          ? 0 // Hidden before 45%
          : progress > 0.6
          ? 100 // Fully revealed after 60%
          : (100 * (progress - 0.45)) / 0.15; // Expand from 45% to 60%

      gsap.to(".circular-mask", {
        clipPath: `circle(${maskSize}% at 50% 50%)`, // CSS clip-path for circular reveal
        duration: 0.15,
        ease: "power2.out",
      });

      /**
       * HEADER 2 SLIDE-THROUGH ANIMATION (45% - 90% progress)
       * ====================================================
       *
       * The second header slowly slides from right to left across a longer scroll range
       */
      let header2XPercent;
      if (progress < 0.45) {
        header2XPercent = 100; // Start off-screen right
      } else if (progress > 0.9) {
        header2XPercent = -100; // End off-screen left
      } else {
        // Gradually slide from right (100%) to left (-100%) over 45% of scroll
        const slideProgress = (progress - 0.45) / 0.45; // 0 to 1 over the 45% range
        header2XPercent = 100 - 200 * slideProgress; // 100 to -100
      }

      gsap.to(".header-2", {
        xPercent: header2XPercent,
        zIndex: progress >= 0.45 ? 10 : 1, // Bring to front during mask reveal
        duration: 0.3, // Shorter duration for smoother follow
        ease: "none", // Linear easing for consistent scroll mapping
      });

      /**
       * TOOLTIP CONTENT REVEAL
       * ======================
       *
       * Each tooltip's content animates in at its designated trigger point
       * Using timelines ensures smooth forward/reverse animations
       */
      tooltipSelectors.forEach(({ trigger }, index) => {
        const timeline = tooltipTimelines[index];

        // Only animate if timeline exists (after text has been split)
        if (timeline) {
          if (progress >= trigger) {
            // Calculate progress within the tooltip animation range (10% window)
            const tooltipProgress = Math.min(1, (progress - trigger) / 0.1);
            timeline.progress(tooltipProgress);
          } else {
            // Reset timeline when below trigger point
            timeline.progress(0);
          }
        }
      });

      /**
       * 3D MODEL ROTATION ANIMATION (0% - 100% progress)
       * ===============================================
       *
       * The 3D model rotates throughout the entire pinned section duration
       */
      if (model) {
        // Calculate target rotation based on full scroll progress (0-100%)
        const targetRotation = Math.PI * 2 * progress; // 2 full rotations across entire timeline

        // Calculate rotation difference for smooth animation
        const rotationDiff = targetRotation - currentRotation;

        // Only rotate if there's a significant change (prevents jitter)
        if (Math.abs(rotationDiff) > 0.001) {
          model.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationDiff); // Rotate on Y-axis
          currentRotation = targetRotation; // Update current rotation tracker
        }
      }

      /**
       * HEADER 2 COLOR TRANSITION (45% - 60% progress)
       * =============================================
       *
       * The second header transitions from white to black as the mask reveals it
       */
      const colorProgress =
        progress < 0.45
          ? 0 // White before 45%
          : progress > 0.6
          ? 1 // Black after 60%
          : (progress - 0.45) / 0.15; // Transition from 45% to 60%

      const colorValue = Math.round(255 * (1 - colorProgress)); // 255 = white, 0 = black
      gsap.to(".header-2", {
        color: `rgb(${colorValue}, ${colorValue}, ${colorValue})`,
        duration: 0.15,
        ease: "power2.out",
      });
    },
  });
});
