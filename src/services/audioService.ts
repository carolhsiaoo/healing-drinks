class AudioService {
  private static instance: AudioService;
  private backgroundMusic: HTMLAudioElement | null = null;
  private clickSound: HTMLAudioElement | null = null;
  private isInitialized = false;
  private isMuted = false;

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  initialize(backgroundMusicSrc: string, clickSoundSrc: string, backgroundVolume = 0.3, clickVolume = 0.5) {
    if (this.isInitialized) return;

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

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.backgroundMusic) {
      this.backgroundMusic.muted = this.isMuted;
    }
    
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  setBackgroundVolume(volume: number) {
    if (this.backgroundMusic) {
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