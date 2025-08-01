# Healing Drinks

An interactive 3D visualization application showcasing healing drinks using React, TypeScript, and Three.js. Experience an immersive gallery of 5 unique healing beverages with stunning 3D models, custom shaders, and smooth animations.

## 🌟 Features

- **Interactive 3D Scene**: Click on any drink to focus and view details
- **Custom Materials**: Glass effects and chocolate gradient shaders
- **Smooth Animations**: GSAP-powered transitions and camera movements
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Audio Integration**: Background music and sound effects
- **Modern UI**: Clean interface with navigation header and drink details

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.0 with TypeScript 5.8.3
- **3D Graphics**: Three.js (v0.178.0) with React Three Fiber (v9.2.0)
- **Build Tool**: Vite 7.0.0
- **Animations**: GSAP 3.13.0
- **UI Controls**: Leva 0.10.0
- **Routing**: React Router DOM 7.6.3
- **Background Effects**: Vanta.js

## 📁 Project Structure

```
src/
├── App.tsx                          # Main 3D scene component
├── DrinkDetail.tsx                  # Drink detail view component
├── About.tsx                        # About page component
├── components/
│   ├── Header.tsx                   # Navigation header
│   ├── Layout.tsx                   # App layout wrapper
│   └── AudioManager.tsx             # Audio controls
├── Shader/
│   └── ChocolateShaderMaterial.ts   # Custom chocolate gradient shader
├── hooks/                           # Custom React hooks
├── services/                        # Service utilities
└── *.module.css                     # CSS modules for styling

public/
├── drink1-5.glb                     # 3D drink models
├── background-music.mp3             # Background audio
├── click-sound.mp3                  # Click sound effect
└── fonts/                           # Custom fonts
```

## 🎨 Key Components

### App.tsx
Main 3D scene that:
- Loads and displays 5 drink GLB models in a circular arrangement
- Implements click-to-focus interaction with smooth camera transitions
- Applies custom materials (glass and chocolate shaders)
- Provides Leva controls for real-time adjustments

### DrinkDetail.tsx
Individual drink view featuring:
- Detailed 3D model presentation
- Animated descriptions and nutritional information
- Interactive carousel navigation
- Responsive layout for all devices

### Custom Shaders
- **ChocolateShaderMaterial**: Creates a gradient effect from light to dark chocolate
- **Glass Material**: Adds transparency and reflections to drink models

## 🎮 Controls

- **Click**: Focus on a drink to view details
- **Navigation**: Use header links or carousel dots to switch between drinks
- **Audio**: Toggle background music with the audio button
- **Camera**: Adjust view using Leva controls panel (development mode)

## 📱 Responsive Design

The application is fully responsive with optimized layouts for:
- Desktop (full 3D experience with all effects)
- Tablet (adjusted scaling and touch interactions)
- Mobile (optimized performance and simplified effects)

## 🔧 Development

```bash
# Run linting
npm run lint

# TypeScript type checking
npm run build
```

### Configuration Files
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules (v9 flat config)

## 📝 Notes

- All 3D models must be placed in the `/public` directory
- No test framework is currently configured
- Uses CSS modules for component styling
- Modern ESLint v9 flat config format

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires WebGL 2.0 support for optimal performance.

## 📄 License

This project is private and not licensed for public use.