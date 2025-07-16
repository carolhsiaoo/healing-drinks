import { CSSProperties } from 'react';

interface HolographicBackgroundProps {
  primaryColor: string;
  secondaryColor?: string;
  gradientOpacity?: number;
  blurAmount?: number;
  animationDuration?: number;
  animationScale?: number;
  noiseOpacity?: number;
  overlayOpacity?: number;
}

export default function HolographicBackground({ 
  primaryColor, 
  secondaryColor,
  gradientOpacity = 0.4,
  blurAmount = 40,
  animationDuration = 15,
  animationScale = 1.1,
  noiseOpacity = 0.03,
  overlayOpacity = 0.1
}: HolographicBackgroundProps) {
  const backgroundStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    zIndex: -1,
  };

  const gradientStyle: CSSProperties = {
    position: 'absolute',
    width: '150%',
    height: '150%',
    top: '-25%',
    left: '-25%',
    background: secondaryColor 
      ? `radial-gradient(ellipse at top left, ${primaryColor}${Math.round(gradientOpacity * 100)} 0%, transparent 50%),
         radial-gradient(ellipse at top right, ${secondaryColor}${Math.round(gradientOpacity * 75)} 0%, transparent 50%),
         radial-gradient(ellipse at bottom left, ${secondaryColor}${Math.round(gradientOpacity * 75)} 0%, transparent 50%),
         radial-gradient(ellipse at bottom right, ${primaryColor}${Math.round(gradientOpacity * 100)} 0%, transparent 50%),
         linear-gradient(135deg, ${primaryColor}${Math.round(gradientOpacity * 50)} 0%, ${secondaryColor}${Math.round(gradientOpacity * 50)} 100%)`
      : `radial-gradient(ellipse at top left, ${primaryColor}${Math.round(gradientOpacity * 100)} 0%, transparent 50%),
         radial-gradient(ellipse at top right, ${primaryColor}${Math.round(gradientOpacity * 75)} 0%, transparent 50%),
         radial-gradient(ellipse at bottom left, ${primaryColor}${Math.round(gradientOpacity * 75)} 0%, transparent 50%),
         radial-gradient(ellipse at bottom right, ${primaryColor}${Math.round(gradientOpacity * 100)} 0%, transparent 50%),
         linear-gradient(135deg, ${primaryColor}${Math.round(gradientOpacity * 50)} 0%, ${primaryColor}${Math.round(gradientOpacity * 25)} 100%)`,
    filter: `blur(${blurAmount}px)`,
    animation: `holographicShift ${animationDuration}s ease-in-out infinite`,
  };

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(255,255,255,${overlayOpacity}) 100%)`,
    mixBlendMode: 'overlay' as const,
  };

  const noiseStyle: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: noiseOpacity,
    mixBlendMode: 'overlay' as const,
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
  };

  return (
    <div style={backgroundStyle}>
      <div style={gradientStyle} />
      <div style={overlayStyle} />
      <div style={noiseStyle} />
      <style>
        {`
          @keyframes holographicShift {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
            25% {
              transform: translate(-5%, 5%) rotate(90deg) scale(${animationScale});
            }
            50% {
              transform: translate(5%, -5%) rotate(180deg) scale(1);
            }
            75% {
              transform: translate(-3%, -3%) rotate(270deg) scale(${animationScale});
            }
          }
        `}
      </style>
    </div>
  );
}