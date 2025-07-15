# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server on http://localhost:5173/
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Architecture Overview

This is a React + TypeScript 3D visualization application showcasing "Healing Drinks" using Three.js and React Three Fiber.

### Core Technologies
- **React 19.1.0** with TypeScript 5.8.3
- **Three.js** (v0.178.0) for 3D graphics with React Three Fiber (v9.2.0) as React renderer
- **Vite 7.0.0** as build tool
- **GSAP** for animations
- **Leva** for GUI controls

### Key Components

**App.tsx** - Main 3D scene component that:
- Loads 5 drink GLB models from `/public/drink1-5.glb`
- Arranges drinks in a circular pattern
- Implements click-to-focus interaction where drinks animate to center
- Applies custom materials (glass effect and chocolate shader)
- Uses Leva controls for camera adjustment

**Shader/ChocolateShaderMaterial.ts** - Custom shader material:
- Implements gradient effect from light to dark chocolate
- Uses Three.js ShaderMaterial with custom vertex/fragment shaders
- Applied to specific drink models for visual enhancement

### Project Structure
```
src/
├── App.tsx                          # Main 3D scene component
├── Shader/
│   └── ChocolateShaderMaterial.ts   # Custom chocolate gradient shader
├── main.tsx                         # React entry point
└── assets/                          # Static assets
```

### Material System
The app dynamically replaces materials on loaded GLB models:
- Glass materials: Applied to drinks 1, 2, and 5 with transparency
- Chocolate shader: Applied to drinks 3 and 4 with gradient effect

### State Management
- Uses React hooks for local state (focused drink, camera position)
- Leva controls for real-time parameter adjustment
- GSAP for smooth animations during focus transitions

## Important Notes

- **No test framework** is currently configured
- **TypeScript** is configured with separate configs for app and node environments
- **ESLint** is set up but no Prettier formatting
- The project uses modern ESLint v9 flat config format
- All 3D models must be placed in the `/public` directory for Vite to serve them correctly