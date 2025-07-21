import React from 'react';

interface HeaderProps {
  showMusicIcon?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showMusicIcon = false }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '30px 50px',
      zIndex: showMusicIcon ? 100 : 20,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem', 
      }}>
        <img 
          src="/Logo.svg" 
          alt="Healing Drinks Logo" 
          style={{ 
            width: '2rem', // 32px
            height: '2rem' // 32px
          }} 
        />
        <span style={{
          fontSize: '1.5rem', // 24px
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontWeight: 'bold',
          color: showMusicIcon ? '#1a1a1a' : 'black',
        }}>
          Healing Drinks
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a 
          href="/about"
          style={{
            fontSize: '18px',
            color: showMusicIcon ? '#1a1a1a' : 'black',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          About
        </a>
        <span style={{ fontSize: '24px' }}>♪</span>
      </div>
    </div>
  );
};

export default Header;