import { useEffect, useRef, useState } from 'react';

interface UseAudioProps {
  src: string;
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

export const useAudio = ({ src, volume = 1, loop = false, autoPlay = false }: UseAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.volume = volume;
    audioRef.current.loop = loop;

    const handleLoaded = () => {
      setIsLoaded(true);
      if (autoPlay) {
        play();
      }
    };

    const handleEnded = () => {
      if (!loop) {
        setIsPlaying(false);
      }
    };

    audioRef.current.addEventListener('canplaythrough', handleLoaded);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', handleLoaded);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, loop, autoPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = () => {
    if (audioRef.current && isLoaded) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      play();
    }
  };

  return {
    play,
    pause,
    toggle,
    restart,
    isPlaying,
    isLoaded,
  };
};