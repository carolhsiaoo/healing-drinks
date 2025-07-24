import { useEffect } from 'react';
import { audioService } from '../services/audioService';

interface AudioManagerProps {
  backgroundMusicSrc: string;
  clickSoundSrc: string;
  backgroundVolume?: number;
  clickVolume?: number;
  endTimeSeconds?: number;
}

export const AudioManager = ({ 
  backgroundMusicSrc, 
  clickSoundSrc, 
  backgroundVolume = 0.3, 
  clickVolume = 0.5,
  endTimeSeconds
}: AudioManagerProps) => {
  useEffect(() => {
    // Initialize audio service only once
    audioService.initialize(backgroundMusicSrc, clickSoundSrc, backgroundVolume, clickVolume);

    // Set end time if provided
    if (endTimeSeconds) {
      audioService.setEndTime(endTimeSeconds);
    }

    // Start background music on first user interaction
    const handleFirstInteraction = () => {
      audioService.playBackgroundMusic();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [backgroundMusicSrc, clickSoundSrc, backgroundVolume, clickVolume, endTimeSeconds]);

  return null;
};