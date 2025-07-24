class AudioService {
  private static instance: AudioService;
  private backgroundMusic: HTMLAudioElement | null = null;
  private clickSound: HTMLAudioElement | null = null;
  private isInitialized = false;
  private isMuted = false;
  private backgroundVolume = 0.3;

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  initialize(backgroundMusicSrc: string, clickSoundSrc: string, backgroundVolume = 0.3, clickVolume = 0.5) {
    if (this.isInitialized) return;

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
  }

  async playBackgroundMusic() {
    if (!this.backgroundMusic || this.isMuted) return;
    
    try {
      // Only play if not already playing
      if (this.backgroundMusic.paused) {
        await this.backgroundMusic.play();
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
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
}

export const audioService = AudioService.getInstance();