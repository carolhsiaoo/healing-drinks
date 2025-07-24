import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '../services/audioService';

interface HeaderProps {
  showMusicIcon?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showMusicIcon = false }) => {
  const [isMuted, setIsMuted] = useState(audioService.getMuteState());
  const navigate = useNavigate();

  useEffect(() => {
    // Sync with audio service state
    setIsMuted(audioService.getMuteState());
  }, []);

  const handleMusicToggle = () => {
    window.playClickSound?.();
    const newMuteState = audioService.toggleMute();
    setIsMuted(newMuteState);
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.playClickSound?.();
    navigate('/about');
  };
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
          onClick={handleAboutClick}
          style={{
            fontSize: '18px',
            color: showMusicIcon ? '#1a1a1a' : 'black',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          About
        </a>
        <button
          onClick={handleMusicToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            transition: 'opacity 0.3s ease',
            opacity: isMuted ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'none',
            outline: 'none',
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <img 
            src={isMuted ? '/music_off.svg' : '/music_note.svg'} 
            alt={isMuted ? 'Music Off' : 'Music On'}
            style={{
              width: '24px',
              height: '24px',
              filter: 'brightness(0) saturate(100%)',
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default Header;