# Beanoss Spectacular Site - 3D Scene Experiment

A personal experiment showcasing an interactive 3D product showcase with sophisticated scroll-triggered animations. This project combines Three.js 3D rendering with GSAP animations and smooth scrolling for a premium web experience.

## 🎯 What This Is

This is a **personal experiment** exploring advanced web animation techniques. The project demonstrates how to create a sophisticated 3D product showcase with coordinated scroll animations, perfect for modern product marketing sites.

**Feel free to clone, explore, and use this code for your own projects!**

## ✨ Features

### 🎮 3D Interactive Scene
- **Three.js powered 3D model rendering** with optimized performance
- **Responsive 3D positioning** that adapts to mobile and desktop
- **Real-time model rotation** synchronized with scroll progress
- **Professional lighting setup** with shadows and material optimization
- **Graceful WebGL fallbacks** for unsupported devices

### 🎬 Advanced Scroll Animations
- **Smooth momentum scrolling** powered by Lenis
- **Coordinated animation timeline** with precise scroll triggers
- **Text reveal animations** using SplitText for character-level control
- **Circular mask transitions** for dramatic reveals
- **Tooltip system** with scroll-based visibility
- **3D model entrance animation** from below viewport

### 🎨 Animation Highlights
- Header typewriter effects with staggered character reveals
- Smooth header transitions and slide-through effects
- 3D model scaling and rotation tied to scroll progress
- Tooltip animations with proper refresh handling
- Circular mask reveals for content transitions

## 🛠 Technology Stack

- **Three.js** (v0.177.0) - 3D rendering and model loading
- **GSAP** - High-performance animations with ScrollTrigger & SplitText
- **Lenis** - Smooth momentum-based scrolling
- **Vite** - Fast development and building
- **Vanilla JavaScript** - No framework dependencies

## 📁 Project Structure

```
beanoss-spectacular-site.webflow/
├── js/
│   ├── scene.js          ← Main animation system (START HERE!)
│   └── webflow.js        
├── css/                  
├── assets/models/        
├── .cursor/              ← Development documentation
│   ├── DEVELOPMENT-GUIDE.md
│   └── instructions.md
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Modern browser with WebGL support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd beanoss-spectacular-site.webflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📖 Understanding the Code

### 🎯 Start Here: `js/scene.js`

The entire animation system is contained in `js/scene.js`. This file demonstrates:

- **Animation System Setup** - GSAP plugins and smooth scrolling
- **Text Animation Preparation** - SplitText for character-level control
- **3D Scene Configuration** - Three.js setup with optimized settings
- **Scroll Animation Choreography** - Coordinated timeline of effects
- **Performance Optimizations** - Best practices for smooth 60fps

### 🎬 Animation Timeline

| Progress | Animation | Description |
|----------|-----------|-------------|
| 0-12% | Model Entrance | 3D model rises from below viewport |
| 25-54% | Header Exit | First header slides left |
| 47-60% | Mask Reveal | Circular mask expands |
| 45-90% | Header Journey | Second header slides through |
| 70-89% | Tooltips | Interactive elements appear |
| 0-100% | Model Rotation | Continuous 3D rotation |

### 🔧 Key Configuration Objects

```javascript
// Easy-to-modify model settings
const modelConfig = {
  scaleFactor: 4,
  cameraDistance: { mobile: 4, desktop: 3 },
  position: {
    horizontalOffset: 0.4,
    verticalOffset: -0.05,
  },
  rotation: { mobile: 0, desktop: -15 },
};
```

## 🎨 Customization

### Modifying Animations
All animations are centralized in `js/scene.js`. Key areas to customize:

- **Model Configuration** - Adjust size, position, rotation
- **Animation Timing** - Modify scroll trigger points
- **Text Effects** - Change stagger timing and easing
- **3D Scene** - Update lighting, materials, camera settings

### Adding New Elements
The system is designed to be extensible. See the development guide in `.cursor/DEVELOPMENT-GUIDE.md` for detailed modification patterns.

## 📚 Documentation

- **`.cursor/DEVELOPMENT-GUIDE.md`** - Technical implementation details
- **`.cursor/instructions.md`** - Development guidelines and constraints
- **Code Comments** - Extensive inline documentation in `scene.js`

## 🎯 Use Cases

This experiment is perfect for:
- **Product showcase websites** - Premium brand presentations
- **Portfolio sites** - Creative developer showcases  
- **Landing pages** - High-impact marketing sites
- **Learning** - Understanding advanced web animation techniques

## 🤝 Contributing

This is a personal experiment, but contributions are welcome! Feel free to:
- Fork and create your own variations
- Submit issues for bugs or improvements
- Share your own implementations and modifications

## 📄 License

This project is available for personal and commercial use. Feel free to clone, modify, and use in your own projects.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by premium product marketing sites
- Optimized for performance and accessibility

---

**Ready to explore?** Navigate to `js/scene.js` to see how everything works together! 🚀 