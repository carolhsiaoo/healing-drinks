import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '../services/audioService';
import styles from './Header.module.css';

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

  const handleMusicToggle = async () => {
    window.playClickSound?.();
    const newMuteState = await audioService.toggleMute();
    setIsMuted(newMuteState);
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.playClickSound?.();
    navigate('/about');
  };

  const handleLogoClick = () => {
    window.playClickSound?.();
    navigate('/');
  };
  return (
    <div 
      className={styles.header}
      style={{ zIndex: showMusicIcon ? 100 : 20 }}
    >
      <div 
        className={styles.logoContainer}
        onClick={handleLogoClick}
      >
        <img 
          src="/Logo.svg" 
          alt="Healing Drinks Logo" 
          className={styles.logo}
        />
        <span 
          className={styles.brandName}
          style={{ color: showMusicIcon ? '#1a1a1a' : 'black' }}
        >
          Healing Drinks
        </span>
      </div>
      
      <div className={styles.navContainer}>
        <a 
          href="/about"
          onClick={handleAboutClick}
          className={styles.aboutLink}
          style={{ color: showMusicIcon ? '#1a1a1a' : 'black' }}
        >
          About
        </a>
        <button
          onClick={handleMusicToggle}
          className={styles.musicButton}
          style={{ opacity: isMuted ? 0.5 : 1 }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <img 
            src={isMuted ? '/music_off.svg' : '/music_note.svg'} 
            alt={isMuted ? 'Music Off' : 'Music On'}
            className={styles.musicIcon}
          />
        </button>
      </div>
    </div>
  );
};

export default Header;