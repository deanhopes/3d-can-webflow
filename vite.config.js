/**
 * Vite Build Configuration
 * ========================
 * 
 * Vite is a modern build tool that provides fast development and optimized production builds.
 * This configuration file customizes Vite's behavior for our 3D product showcase.
 * 
 * LEARNING OBJECTIVES:
 * - Understand modern build tool configuration
 * - Learn about CORS handling in development
 * - Explore module resolution and aliasing
 * - Grasp development vs production optimization
 */

// Import Vite's configuration function and file system utilities
import { defineConfig } from "vite";
import { copyFileSync } from "fs";

/**
 * Export Vite configuration object
 * ================================
 * 
 * defineConfig provides TypeScript intellisense and validation for the config object
 */
export default defineConfig({
  /**
   * BUILD CONFIGURATION
   * ===================
   * 
   * Configuration for production builds
   */
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'copy-headers',
          writeBundle() {
            // Copy _headers file to dist directory for Netlify
            try {
              copyFileSync('_headers', 'dist/_headers');
              console.log('✅ _headers file copied to dist/');
            } catch (error) {
              console.warn('⚠️ Could not copy _headers file:', error.message);
            }
          }
        }
      ]
    }
  },
  /**
   * DEVELOPMENT SERVER CONFIGURATION
   * =================================
   * 
   * These settings control how Vite's development server behaves during development
   */
  server: {
    /**
     * CORS (Cross-Origin Resource Sharing) Configuration
     * ==================================================
     * 
     * Enables CORS for the development server, allowing requests from different origins.
     * This is particularly important when:
     * - Loading 3D models from external sources
     * - Testing with different local development setups
     * - Integrating with external APIs during development
     */
    cors: true,
  },
  
  /**
   * MODULE RESOLUTION CONFIGURATION
   * ===============================
   * 
   * Controls how Vite resolves imports and dependencies
   */
  resolve: {
    /**
     * IMPORT ALIASES
     * ==============
     * 
     * Create shorter, cleaner import paths for commonly used modules.
     * In this case, we're ensuring Three.js is properly resolved.
     * 
     * Benefits:
     * - Cleaner import statements
     * - Easier refactoring if dependencies change
     * - Better IDE autocompletion
     * 
     * Example usage in code:
     * import * as THREE from "three"; // Works thanks to this alias
     */
    alias: {
      three: "three", // Explicit Three.js resolution
    },
  },
  
  /**
   * ADDITIONAL VITE FEATURES (not configured but available):
   * ========================================================
   * 
   * build: {
   *   // Production build configuration
   *   outDir: 'dist',              // Output directory
   *   sourcemap: true,             // Generate source maps
   *   minify: 'terser',            // Minification strategy
   *   rollupOptions: {             // Advanced Rollup configuration
   *     external: ['some-external-lib']
   *   }
   * },
   * 
   * optimizeDeps: {
   *   // Dependency pre-bundling configuration
   *   include: ['three'],          // Force include specific dependencies
   *   exclude: ['some-lib']        // Exclude from pre-bundling
   * },
   * 
   * css: {
   *   // CSS processing configuration
   *   modules: true,               // Enable CSS modules
   *   preprocessorOptions: {       // Sass/Less configuration
   *     scss: { additionalData: '@import "variables.scss";' }
   *   }
   * },
   * 
   * plugins: [
   *   // Vite plugins for additional functionality
   *   // Example: react(), vue(), or custom plugins
   * ]
   */
});
