/** Maps terminal categories to the ambient audio track to loop while connected. */
export const CATEGORY_AMBIENT: Record<string, string> = {
  'corrupted':     'static',
  'corporate':     'server-room',
  'high-security': 'server-room',
  'personal':      'terminal',
  'ship-systems':  'terminal',
  'public-kiosk':  'terminal',
  'research':      'server-room',
  'criminal':      'static',
  'maintenance':   'static',
  'government':    'terminal',
  'default':       'terminal',
};

class AudioManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private muted = false;
  private volume = 0.3;
  private currentAmbientKey: string | null = null;

  preloadSounds() {
    const soundFiles = {
      'access_granted': '/audio/success-chime.mp3',
      'access_denied': '/audio/error-buzz.mp3',
      'warning': '/audio/warning-beep.mp3',
      'glitch': '/audio/glitch-sound.mp3',
      'corruption': '/audio/data-corruption.mp3',
      'keypress': '/audio/mechanical-key.mp3',
      'connection': '/audio/connection-lost.mp3',
      'interference': '/audio/signal-interference.mp3',
      'static': '/audio/static-hum.mp3',
      'terminal': '/audio/terminal-hum.mp3',
      'server-room': '/audio/server-room.mp3',
      'door_unlock': '/audio/door-unlock.wav',
      'alarm': '/audio/warning-beep.mp3',
      'alarm_disable': '/audio/alarm-disable.wav',
      'data_download': '/audio/data-download.wav',
      'power_down': '/audio/power-down.wav',
      'seal_disengage': '/audio/seal-disengage.wav'
    };

    Object.entries(soundFiles).forEach(([key, src]) => {
      try {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = this.volume;
        this.sounds[key] = audio;
      } catch (error) {
        console.warn(`Failed to preload sound: ${key}`, error);
      }
    });
  }

  playEffect(effect: string, volume: number = this.volume) {
    if (this.muted || !this.sounds[effect]) return;

    try {
      const sound = this.sounds[effect].cloneNode() as HTMLAudioElement;
      sound.volume = Math.min(volume, 1);

      // Clean up cloned audio node after it finishes playing to prevent memory leak
      const cleanup = () => {
        sound.removeEventListener('ended', cleanup);
        sound.removeEventListener('error', cleanup);
        sound.src = '';
        sound.load();
      };

      sound.addEventListener('ended', cleanup);
      sound.addEventListener('error', cleanup);

      sound.play().catch(e => {
        // NotAllowedError is expected before user interacts with the page
        if (e.name !== 'NotAllowedError') {
          console.warn('Audio play failed:', e);
        }
        cleanup();
      });
    } catch (error) {
      console.warn(`Failed to play effect: ${effect}`, error);
    }
  }

  playAmbient(track: string = 'terminal') {
    if (this.muted || !this.sounds[track]) return;
    if (this.currentAmbientKey === track) return; // already playing this track

    // Stop any current ambient first
    this.stopAmbient();
    this.currentAmbientKey = track;

    try {
      const ambient = this.sounds[track];
      ambient.loop = true;
      ambient.volume = this.volume * 0.35;
      ambient.currentTime = 0;
      ambient.play().catch(e => {
        if (e.name !== 'NotAllowedError') {
          console.warn('Ambient play failed:', e);
        }
      });
    } catch (error) {
      console.warn(`Failed to play ambient: ${track}`, error);
    }
  }

  stopAmbient() {
    this.currentAmbientKey = null;
    Object.values(this.sounds).forEach(sound => {
      if (sound.loop) {
        sound.pause();
        sound.currentTime = 0;
        sound.loop = false;
      }
    });
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    
    if (this.muted) {
      this.stopAmbient();
    }
    
    return this.muted;
  }

  setVolume(level: number) {
    this.volume = Math.max(0, Math.min(1, level));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  isMuted() {
    return this.muted;
  }
}

const audioManager = new AudioManager();
export default audioManager;