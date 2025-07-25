class AudioService {
  private static instance: AudioService;
  private backgroundMusic: HTMLAudioElement | null = null;
  private clickSound: HTMLAudioElement | null = null;
  private isInitialized = false;
  private isMuted = false;
  private backgroundVolume = 0.3;
  private wasPlayingBeforePause = false;

  private constructor() {
    // Set up visibility change listener
    this.setupVisibilityChangeListener();
    // Set up beforeunload listener
    this.setupBeforeUnloadListener();
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  initialize(backgroundMusicSrc: string, clickSoundSrc: string, backgroundVolume = 0.3, clickVolume = 0.5) {
    // If already initialized, clean up existing audio elements
    if (this.isInitialized) {
      console.log('[AudioService] Already initialized, cleaning up existing audio');
      this.cleanup();
    }

    // Store background volume for fade effects
    this.backgroundVolume = backgroundVolume;

    // Initialize background music
    this.backgroundMusic = new Audio(backgroundMusicSrc);
    this.backgroundMusic.volume = backgroundVolume;
    this.backgroundMusic.loop = true;

    // Initialize click sound
    this.clickSound = new Audio(clickSoundSrc);
    this.clickSound.volume = clickVolume;
    this.clickSound.loop = false;

    // Set up global click sound function
    window.playClickSound = () => this.playClickSound();

    this.isInitialized = true;
    console.log('[AudioService] Initialized with music:', backgroundMusicSrc);
  }

  async playBackgroundMusic() {
    if (!this.backgroundMusic || this.isMuted) return;
    
    try {
      // Only play if not already playing
      if (this.backgroundMusic.paused) {
        console.log('[AudioService] Attempting to play background music');
        await this.backgroundMusic.play();
        console.log('[AudioService] Background music started successfully');
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      console.log('[AudioService] Pausing background music');
      this.backgroundMusic.pause();
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  async fadeOutAndStop(duration: number = 2000) {
    if (!this.backgroundMusic || this.backgroundMusic.paused) return;
    
    const startVolume = this.backgroundMusic.volume;
    const fadeSteps = 20;
    const stepDuration = duration / fadeSteps;
    const volumeDecrement = startVolume / fadeSteps;
    
    for (let i = 0; i < fadeSteps; i++) {
      this.backgroundMusic.volume = Math.max(0, startVolume - (volumeDecrement * (i + 1)));
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
    
    this.stopBackgroundMusic();
    this.backgroundMusic.volume = startVolume; // Reset volume for next play
  }

  setEndTime(seconds: number) {
    if (!this.backgroundMusic) return;
    
    const handleTimeUpdate = () => {
      if (this.backgroundMusic && this.backgroundMusic.currentTime >= seconds) {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
    
    this.backgroundMusic.addEventListener('timeupdate', handleTimeUpdate);
  }

  playClickSound() {
    if (!this.clickSound || this.isMuted) return;
    
    // Reset and play
    this.clickSound.currentTime = 0;
    this.clickSound.play().catch(error => {
      console.error('Error playing click sound:', error);
    });
  }

  async toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.backgroundMusic) {
      if (this.isMuted) {
        // Fade out when muting
        await this.fadeOut(300); // 300ms fade out
        this.backgroundMusic.muted = true;
      } else {
        // Fade in when unmuting
        this.backgroundMusic.muted = false;
        await this.fadeIn(300); // 300ms fade in
      }
    }
    
    return this.isMuted;
  }

  private async fadeIn(duration: number = 300) {
    if (!this.backgroundMusic || this.backgroundMusic.paused) return;
    
    const targetVolume = this.backgroundVolume;
    const fadeSteps = 20;
    const stepDuration = duration / fadeSteps;
    const volumeIncrement = targetVolume / fadeSteps;
    
    this.backgroundMusic.volume = 0;
    
    for (let i = 0; i < fadeSteps; i++) {
      this.backgroundMusic.volume = Math.min(targetVolume, volumeIncrement * (i + 1));
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  private async fadeOut(duration: number = 300) {
    if (!this.backgroundMusic || this.backgroundMusic.paused) return;
    
    const startVolume = this.backgroundMusic.volume;
    const fadeSteps = 20;
    const stepDuration = duration / fadeSteps;
    const volumeDecrement = startVolume / fadeSteps;
    
    for (let i = 0; i < fadeSteps; i++) {
      this.backgroundMusic.volume = Math.max(0, startVolume - (volumeDecrement * (i + 1)));
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  getMuteState() {
    return this.isMuted;
  }

  setBackgroundVolume(volume: number) {
    this.backgroundVolume = volume;
    if (this.backgroundMusic && !this.isMuted) {
      this.backgroundMusic.volume = volume;
    }
  }

  setClickVolume(volume: number) {
    if (this.clickSound) {
      this.clickSound.volume = volume;
    }
  }

  private setupVisibilityChangeListener() {
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      console.log('[AudioService] Visibility changed:', document.hidden ? 'hidden' : 'visible');
      if (document.hidden) {
        // Page is hidden, pause music
        if (this.backgroundMusic && !this.backgroundMusic.paused && !this.isMuted) {
          console.log('[AudioService] Page hidden - storing play state and pausing');
          this.wasPlayingBeforePause = true;
          this.pauseBackgroundMusic();
        }
      } else {
        // Page is visible again, resume music if it was playing before
        if (this.wasPlayingBeforePause && !this.isMuted) {
          console.log('[AudioService] Page visible - resuming music');
          this.wasPlayingBeforePause = false;
          this.playBackgroundMusic();
        }
      }
    });

    // Also handle focus events for better reliability
    window.addEventListener('focus', () => {
      console.log('[AudioService] Window gained focus');
      // Page gained focus, resume music if it was playing before
      if (this.wasPlayingBeforePause && !this.isMuted) {
        console.log('[AudioService] Resuming music after focus gain');
        this.wasPlayingBeforePause = false;
        this.playBackgroundMusic();
      }
    });

    window.addEventListener('blur', () => {
      console.log('[AudioService] Window blur event');
      // Only pause if the entire window loses focus (not just clicking inside the page)
      // This helps differentiate between tab switches and clicking elements
      setTimeout(() => {
        if (!document.hasFocus() && this.backgroundMusic && !this.backgroundMusic.paused && !this.isMuted) {
          console.log('[AudioService] Window lost focus - pausing music');
          this.wasPlayingBeforePause = true;
          this.pauseBackgroundMusic();
        }
      }, 100);
    });
  }

  private setupBeforeUnloadListener() {
    window.addEventListener('beforeunload', () => {
      // Pause music when user navigates away
      this.pauseBackgroundMusic();
    });
  }

  // Method to handle external link clicks
  handleExternalLinkClick() {
    if (this.backgroundMusic && !this.backgroundMusic.paused && !this.isMuted) {
      this.wasPlayingBeforePause = true;
      this.pauseBackgroundMusic();
    }
  }

  // Clean up audio resources
  private cleanup() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.src = '';
      this.backgroundMusic = null;
    }
    if (this.clickSound) {
      this.clickSound.pause();
      this.clickSound.currentTime = 0;
      this.clickSound.src = '';
      this.clickSound = null;
    }
    this.wasPlayingBeforePause = false;
  }
}

export const audioService = AudioService.getInstance();