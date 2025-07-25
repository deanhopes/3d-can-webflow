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
import Lenis from "lenis";

/**
 * Wait for DOM to be fully loaded before initializing the scene
 * This ensures all HTML elements are available for manipulation
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * STEP 1: ANIMATION SYSTEM SETUP
   * ==============================
   *
   * Register GSAP plugins for advanced animation capabilities:
   * - ScrollTrigger: Trigger animations based on scroll position
   * - SplitText: Split text into individual characters/lines for animation
   */
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

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
  const headerSplit = new SplitText(".header-1 h3", {
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

    // Create tooltip ScrollTriggers after timelines are ready
    setTimeout(createTooltipScrollTriggers, 50);
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

      // Clear existing timelines and ScrollTriggers
      tooltipTimelines.forEach((timeline) => timeline.kill());
      tooltipTimelines = [];

      tooltipScrollTriggers.forEach((trigger) => trigger.kill());
      tooltipScrollTriggers = [];

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
   * TOOLTIP ANIMATION CONFIGURATION
   * ===============================
   *
   * Define tooltip elements to animate. Tooltips now appear at 80%-99% scroll progress
   * using dedicated ScrollTrigger instances instead of progress-based animation.
   */
  const tooltipSelectors = [
    {
      elements: [
        ".tooltip:nth-child(2) .divider",
        ".tooltip:nth-child(2) .icon",
        ".tooltip:nth-child(2) .title .line > span",
        ".tooltip:nth-child(2) .description .line > span",
      ],
    },
    {
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
  let tooltipScrollTriggers = []; // Track tooltip ScrollTrigger instances

  function createTooltipTimelines() {
    tooltipTimelines = tooltipSelectors.map(({ elements }) => {
      const timeline = gsap.timeline({ paused: true });

      // Separate elements by type for different animations
      const dividerElements = document.querySelectorAll(".divider path");
      const iconElements = elements.filter((el) => el.includes(".icon"));
      const textElements = elements.filter(
        (el) => !el.includes(".icon") && !el.includes(".divider")
      );

      // Set initial states
      gsap.set(dividerElements, { drawSVG: "0%" }); // Dividers start with 0 width
      gsap.set(textElements, { y: "125%" }); // Text elements start below viewport
      gsap.set(iconElements, { y: -40, opacity: 0 }); // Icons start above with 0 opacity

      // Create coordinated animation sequence
      timeline
        .to(
          dividerElements,
          {
            drawSVG: "100%",
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
   * LOGO COLOR ANIMATION SYSTEM
   * ===========================
   *
   * Simple GSAP timeline approach for logo color changes based on sections
   */

  // Set initial logo color (black for hero section)
  gsap.set(".logo", { color: "#000000" });
  gsap.set(".nav-menu_btn", { color: "#000000" });

  // Hero section: Black logo
  ScrollTrigger.create({
    trigger: ".section.intro",
    start: "top bottom",
    end: "bottom top",
    //markers: true,
    onEnter: () => {
      gsap.to(".logo", { color: "#000000", duration: 0.3 });
      gsap.to(".nav-menu_btn", { color: "#000000", duration: 0.3 });
    },
    onEnterBack: () => {
      gsap.to(".logo", { color: "#000000", duration: 0.3 });
      gsap.to(".nav-menu_btn", { color: "#000000", duration: 0.3 });
    },
  });

  // Pinned section: White logo at start, transitions to black with mask
  ScrollTrigger.create({
    trigger: ".product-overview",
    //markers: true,
    start: "top top",
    end: `+=${window.innerHeight * 5}`,
    onEnter: () => {
      gsap.to(".logo", { color: "#ffffff", duration: 0.3 });
      gsap.to(".nav-menu_btn", { color: "#ffffff", duration: 0.3 });
    },
    onUpdate: ({ progress }) => {
      // Transition from white to black during mask reveal (20% - 28% to match circular mask)
      if (progress >= 0.2 && progress <= 0.28) {
        const transitionProgress = (progress - 0.2) / 0.01; // 0 to 1 over the 8% range (20% to 28%)
        const colorValue = Math.round(255 * (1 - transitionProgress)); // 255 (white) to 0 (black)
        gsap.to(".logo", {
          color: `rgb(${colorValue}, ${colorValue}, ${colorValue})`,
          duration: 0.1,
        });
        gsap.to(".nav-menu_btn", {
          color: `rgb(${colorValue}, ${colorValue}, ${colorValue})`,
          duration: 0.1,
        });
      } else if (progress > 0.28) {
        gsap.to(".logo", { color: "#000000", duration: 0.1 });
        gsap.to(".nav-menu_btn", { color: "#000000", duration: 0.1 });
      } else {
        gsap.to(".logo", { color: "#ffffff", duration: 0.1 });
        gsap.to(".nav-menu_btn", { color: "#ffffff", duration: 0.1 });
      }
    },
    onLeave: () => {
      gsap.to(".logo", { color: "#fff", duration: 0.3 });
      gsap.to(".nav-menu_btn", { color: "#fff", duration: 0.3 });
    },
    onLeaveBack: () => {
      gsap.to(".logo", { color: "#000000", duration: 0.3 });
      gsap.to(".nav-menu_btn", { color: "#000000", duration: 0.3 });
    },
  });

  /**
   * HEADER ANIMATION TRIGGER
   * ========================
   *
   * Animate the main header characters when the product overview section comes into view.
   * This creates a smooth typewriter-like effect as the user scrolls.
   */

  // Set initial states for various elements
  gsap.set(".model-container", {
    scale: 0.8,
  });

  // Set header-2 to be invisible initially (opacity animated in at 45% progress)
  gsap.set(".header-2", {
    opacity: 0,
  });

  // Set initial tooltip positioning
  gsap.set(".tooltip:nth-child(2)", {
    position: "absolute",
    bottom: "2rem",
    left: "4rem",
  });

  gsap.set(".tooltip:nth-child(3)", {
    position: "absolute",
    top: "2rem",
    right: "6rem",
  });

  // Set initial state for pinned fixed text - hidden initially
  gsap.set(".pinned-fixed-text", {
    opacity: 0,
    y: 30, // Start slightly below
    zIndex: 100, // Ensure it's above other elements
  });

  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "75% bottom", // Start when section is 75% visible from bottom
    onEnter: () => {
      // Animate header characters
      gsap.to(".header-1 h3 .char > span", {
        y: "0%", // Move to normal position
        duration: 1,
        ease: "power3.inOut",
        stagger: 0.025, // Stagger creates typewriter effect
      });
    },
    onLeaveBack: () => {
      // Reverse header animation when scrolling back up
      gsap.to(".header-1 h3 .char > span", {
        y: "100%", // Move below visible area
        duration: 1.5,
        ease: "power3.inOut",
        stagger: 0.025,
      });
    },
  });

  /**
   * PINNED FIXED TEXT ANIMATION
   * ===========================
   *
   * Shows the fixed text element just before the circular mask animation
   * and properly reverses when scrolling back up past the mask animation
   */
  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "top top",
    end: `+=${window.innerHeight * 1.8}`, // Match main scroll animation timeline
    scrub: false, // No scrubbing for discrete show/hide behavior

    onUpdate: ({ progress }) => {
      // Show text at 40% progress (7% before circular mask at 47%)
      // Hide text at 65% progress (5% after circular mask completes at 60%)
      const shouldShowText = progress >= 0.4 && progress <= 0.65;

      if (shouldShowText) {
        // Animate text in
        gsap.to(".pinned-fixed-text", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        });
      } else {
        // Animate text out
        gsap.to(".pinned-fixed-text", {
          opacity: 0,
          y: 30,
          duration: 0.4,
          ease: "power3.in",
        });
      }
    },

    // Handle initial state on page load/refresh
    onRefresh: ({ progress }) => {
      const shouldShowText = progress >= 0.4 && progress <= 0.65;

      if (shouldShowText) {
        gsap.set(".pinned-fixed-text", { opacity: 1, y: 0 });
      } else {
        gsap.set(".pinned-fixed-text", { opacity: 0, y: 30 });
      }
    },
  });

  /**
   * INITIAL HERO SECTION ANIMATIONS
   * ===============================
   *
   * These animations trigger on page load or when scrolling into view
   * for elements that are visible in the initial viewport
   */

  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "75% bottom", // Start when section is 75% visible from bottom
    onEnter: () => {
      // Animate header characters
      gsap.to(".header-1 h3 .char > span", {
        y: "0%", // Move to normal position
        duration: 1,
        ease: "power3.inOut",
        stagger: 0.025, // Stagger creates typewriter effect
      });
    },
    onLeaveBack: () => {
      // Reverse header animation when scrolling back up
      gsap.to(".header-1 h3 .char > span", {
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
    end: `+=${window.innerHeight * 4}`, // End after 1.8 viewport heights (20% longer timeline)
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
       * MODEL GRADIENT FADE (8% progress)
       * ==================================
       *
       * Hide the model gradient overlay early to improve can animation visibility
       * (Adjusted for 4x longer timeline: 17% / 2.2 = 8%)
       */
      const gradientOpacity = progress >= 0.08 ? 0 : 1;
      gsap.to(".styles__model_gradient", {
        opacity: gradientOpacity,
        duration: 0.3,
        ease: "power2.out",
      });

      /**
       * 3D MODEL ENTRANCE ANIMATION (0% - 5% progress)
       * ===============================================
       *
       * The 3D model moves up from below the viewport to its final position
       * (Adjusted for 4x longer timeline: 10% / 2 = 5%)
       */
      if (model && finalModelPosition && modelSize) {
        const entranceProgress = Math.max(0, Math.min(1, progress / 0.05)); // 0-5% of scroll
        const currentY =
          finalModelPosition.y - (1 - entranceProgress) * modelSize.y * 1.5;

        gsap.to(model.position, {
          y: currentY,
          duration: 0.3,
          ease: "power3.out",
        });
      }

      /**
       * MODEL CONTAINER REVEAL & STICKY EFFECT (6% - 90% progress)
       * ===========================================================
       *
       * Handle both scale animation and sticky behavior across longer timeline
       * (Adjusted for 4x longer timeline: spread across more of the scroll)
       */
      const modelProgress = Math.max(0, Math.min(1, (progress - 0.06) / 0.04));
      const modelScale = progress < 0.15 ? 0.8 : 0.8 + 0.2 * modelProgress; // Scale from 0.8 to 1.0

      if (progress >= 0.9) {
        // At 90%: sticky behavior with full viewport size
        gsap.to(".model-container", {
          scale: modelScale,
          zIndex: 1000,
          width: "100vw",
          height: "100vh",
          duration: 0.2,
          ease: "power2.out",
        });
      } else {
        // Before 90%: normal scaling behavior
        gsap.to(".model-container", {
          scale: modelScale,
          zIndex: "auto",
          width: "auto",
          height: "auto",
          duration: 0.2,
          ease: "power2.out",
        });
      }

      /**
       * HEADER 1 SLIDE-OUT ANIMATION (12% - 25% progress)
       * ===============================================
       *
       * The first header slides out to the left as the user scrolls
       * (Adjusted for 4x longer timeline: earlier and more spread out)
       */
      const headerProgress = Math.max(0, Math.min(1, (progress - 0.12) / 0.13));
      gsap.to(".header-1", {
        xPercent:
          progress < 0.08
            ? 0 // Stay in place before 12%
            : progress > 0.3
            ? -100 // Fully off-screen after 25%
            : -100 * headerProgress, // Gradual slide from 12% to 25%
        duration: 0.4,
        ease: "linear",
      });

      /**
       * CIRCULAR MASK REVEAL (20% - 28% progress)
       * =========================================
       *
       * A circular mask expands to reveal the second header underneath
       * (Adjusted for 4x longer timeline: earlier timing, shorter duration)
       */
      const maskSize =
        progress < 0.2
          ? 0 // Hidden before 20%
          : progress > 0.28
          ? 100 // Fully revealed after 28%
          : (100 * (progress - 0.2)) / 0.08; // Expand from 20% to 28%

      gsap.to(".circular-mask", {
        clipPath: `circle(${maskSize}% at 50% 50%)`, // CSS clip-path for circular reveal
        duration: 2,
        ease: "power2.out",
      });

      /**
       * HEADER 2 SLIDE-THROUGH ANIMATION (18% - 35% progress)
       * ====================================================
       *
       * The second header slowly slides from right to left across the timeline
       * (Adjusted for 4x longer timeline: earlier and more condensed)
       */
      let header2XPercent;
      if (progress < 0.18) {
        header2XPercent = 100; // Start off-screen right
      } else if (progress > 0.35) {
        header2XPercent = -100; // End off-screen left
      } else {
        // Gradually slide from right (100%) to left (-100%) over 17% of scroll
        const slideProgress = (progress - 0.18) / 0.17; // 0 to 1 over the 17% range
        header2XPercent = 100 - 200 * slideProgress; // 100 to -100
      }

      gsap.to(".header-2", {
        xPercent: header2XPercent,
        zIndex: progress >= 0.18 ? 10 : 1, // Bring to front during mask reveal
        duration: 0.3, // Shorter duration for smoother follow
        ease: "none", // Linear easing for consistent scroll mapping
      });

      /**
       * HEADER 2 OPACITY ANIMATION (18% progress)
       * =========================================
       *
       * Fade in header-2 opacity just before the mask reveal animation starts
       * (Adjusted for 4x longer timeline: much earlier)
       */
      const header2Opacity = progress >= 0.18 ? 1 : 0;
      gsap.to(".header-2", {
        opacity: header2Opacity,
        duration: 0.3,
        ease: "power2.out",
      });

      // Tooltip animations are now handled by dedicated ScrollTrigger instances
      // See tooltip ScrollTrigger setup below the main scroll animation

      /**
       * 3D MODEL ROTATION ANIMATION (0% - 100% progress)
       * ===============================================
       *
       * The 3D model rotates throughout the entire pinned section duration
       * (Now 4x longer, so more total rotation)
       */
      if (model) {
        // Calculate target rotation based on full scroll progress (0-100%)
        const targetRotation = Math.PI * 8 * progress; // 8 full rotations across entire timeline (4x more)

        // Calculate rotation difference for smooth animation
        const rotationDiff = targetRotation - currentRotation;

        // Only rotate if there's a significant change (prevents jitter)
        if (Math.abs(rotationDiff) > 0.001) {
          model.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationDiff); // Rotate on Y-axis
          currentRotation = targetRotation; // Update current rotation tracker
        }
      }

      /**
       * HEADER 2 COLOR TRANSITION (18% - 24% progress)
       * =============================================
       *
       * The second header transitions from white to black as the mask reveals it
       * (Adjusted for 4x longer timeline: much earlier and shorter duration)
       */
      const colorProgress =
        progress < 0.18
          ? 0 // White before 18%
          : progress > 0.24
          ? 1 // Black after 24%
          : (progress - 0.18) / 0.06; // Transition from 18% to 24%

      const colorValue = Math.round(255 * (1 - colorProgress)); // 255 = white, 0 = black
      gsap.to(".header-2", {
        color: `rgb(${colorValue}, ${colorValue}, ${colorValue})`,
        duration: 0.15,
        ease: "power2.out",
      });
    },
  });

  /**
   * TOOLTIP SCROLL TRIGGERS
   * =======================
   *
   * Dedicated ScrollTrigger instances for tooltip animations at 80%-99% progress.
   * Each tooltip gets its own trigger for proper enter/leave handling.
   */
  function createTooltipScrollTriggers() {
    // Only create triggers if timelines exist (after text splitting is complete)
    if (tooltipTimelines.length === 0) {
      // Retry after a short delay if timelines aren't ready yet
      setTimeout(createTooltipScrollTriggers, 100);
      return;
    }

    tooltipTimelines.forEach((timeline, index) => {
      const trigger = ScrollTrigger.create({
        trigger: ".product-overview",
        start: "top top",
        end: `+=${window.innerHeight * 4}`, // Match main scroll animation (4x longer)
        scrub: false, // No scrubbing - discrete enter/leave animations

        onUpdate: ({ progress }) => {
          // Tooltip visibility window: 35% - 45% of scroll progress (adjusted for 4x timeline)
          const isInTooltipRange = progress >= 0.45 && progress <= 0.85;

          if (isInTooltipRange) {
            // Play tooltip animation when entering the range
            timeline.play();
          } else {
            // Reverse tooltip animation when leaving the range
            timeline.reverse();
          }
        },

        // Initialize tooltip state on refresh based on current scroll position
        onRefresh: ({ progress }) => {
          const isInTooltipRange = progress >= 0.35 && progress <= 0.45;

          if (isInTooltipRange) {
            timeline.progress(1); // Show tooltip immediately if in range
          } else {
            timeline.progress(0); // Hide tooltip immediately if out of range
          }
        },

        // Additional enter/leave callbacks for reliability
        onEnter: ({ progress }) => {
          if (progress >= 0.35) {
            timeline.play();
          }
        },

        onLeave: ({ progress }) => {
          if (progress > 0.45) {
            timeline.reverse();
          }
        },

        onEnterBack: ({ progress }) => {
          if (progress >= 0.35 && progress <= 0.45) {
            timeline.play();
          }
        },

        onLeaveBack: ({ progress }) => {
          if (progress < 0.35) {
            timeline.reverse();
          }
        },
      });

      // Store the ScrollTrigger instance for cleanup
      tooltipScrollTriggers.push(trigger);
    });

    // Force initial state check after all triggers are created
    setTimeout(() => {
      ScrollTrigger.refresh();

      // Double-check initial state after refresh
      const productOverview = document.querySelector(".product-overview");
      if (productOverview) {
        const rect = productOverview.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const triggerTop = scrollTop + rect.top;
        const currentScroll = scrollTop;
        const endPoint = triggerTop + window.innerHeight * 1.8;

        if (currentScroll >= triggerTop && currentScroll <= endPoint) {
          const progress =
            (currentScroll - triggerTop) / (window.innerHeight * 1.8);
          const isInTooltipRange = progress >= 0.7 && progress <= 0.89;

          tooltipTimelines.forEach((timeline) => {
            if (isInTooltipRange) {
              timeline.progress(1);
            } else {
              timeline.progress(0);
            }
          });
        }
      }
    }, 200);
  }
});
