import weddingSong from './assets/music.mp3'

class WeddingAudioEngine {
  constructor() {
    this.audioElement = null
    this.isPlaying = false
  }

  init() {
    if (this.audioElement) return
    const audio = new Audio(weddingSong)
    audio.loop = true
    audio.volume = 0.6
    this.audioElement = audio
  }

  play() {
    this.init()
    if (!this.audioElement) return
    const playPromise = this.audioElement.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true
        })
        .catch((err) => {
          console.warn('Autoplay prevented or audio playback issue:', err)
        })
    }
    this.isPlaying = true
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause()
    }
    this.isPlaying = false
  }

  toggle() {
    if (this.isPlaying) {
      this.pause()
      return false
    } else {
      this.play()
      return true
    }
  }
}

export const weddingAudio = new WeddingAudioEngine()
