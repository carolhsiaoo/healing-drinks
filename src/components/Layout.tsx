import { Outlet } from 'react-router-dom';
import { AudioManager } from './AudioManager';
import { useExternalLinkHandler } from '../hooks/useExternalLinkHandler';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export default function Layout() {
  // Use external link handler globally
  useExternalLinkHandler();
  
  // Track page views with Google Analytics
  useGoogleAnalytics();

  return (
    <>
      <AudioManager 
        backgroundMusicSrc="/background-music.mp3"
        clickSoundSrc="/click-sound.mp3"
        backgroundVolume={0.3}
        clickVolume={0.5}
        endTimeSeconds={120} // End music after 2 minutes
      />
      <Outlet />
    </>
  );
}