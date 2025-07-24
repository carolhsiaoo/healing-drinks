/// <reference types="vite/client" />

declare global {
  interface Window {
    playClickSound?: () => void;
  }
}

declare module 'vanta/dist/vanta.fog.min';
declare module 'vanta/dist/vanta.clouds.min';
