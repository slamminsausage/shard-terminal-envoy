class AudioManager {
  private muted = true;

  preloadSounds() {
    // Audio disabled intentionally.
  }

  playAmbient() {
    // Audio disabled intentionally.
  }

  stopAmbient() {
    // Audio disabled intentionally.
  }

  playEffect() {
    // Audio disabled intentionally.
  }

  toggleMute(): boolean {
    // Maintain toggle state for UI without triggering audio.
    this.muted = !this.muted;
    return this.muted;
  }

  setVolume() {
    // Audio disabled intentionally.
  }

  isMuted() {
    return true;
  }
}

const audioManager = new AudioManager();
export default audioManager;
