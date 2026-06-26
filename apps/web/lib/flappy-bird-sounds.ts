type FlappyBirdSounds = {
  unlock: () => void
  playFlap: () => void
  playScore: () => void
  playLoseLife: () => void
  playGameOver: () => void
  dispose: () => void
}

const pickGermanVoice = () => {
  if (typeof window === "undefined" || !window.speechSynthesis) return undefined

  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((voice) => voice.lang === "de-DE") ??
    voices.find((voice) => voice.lang.startsWith("de"))
  )
}

export const createFlappyBirdSounds = (): FlappyBirdSounds => {
  let audioContext: AudioContext | null = null
  let germanVoice: SpeechSynthesisVoice | undefined
  let voicesReady = false

  const getContext = () => {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    return audioContext
  }

  const ensureVoices = () => {
    if (voicesReady || typeof window === "undefined" || !window.speechSynthesis) return

    germanVoice = pickGermanVoice()
    if (germanVoice) {
      voicesReady = true
      return
    }

    const handleVoicesChanged = () => {
      germanVoice = pickGermanVoice()
      if (germanVoice) {
        voicesReady = true
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged)
      }
    }

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged)
    handleVoicesChanged()
  }

  const unlock = () => {
    ensureVoices()
    const context = getContext()
    if (context.state === "suspended") {
      void context.resume()
    }
  }

  const playTone = (
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume = 0.12,
    startTime?: number,
  ) => {
    unlock()
    const context = getContext()
    const start = startTime ?? context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + duration)
  }

  const playNoise = (duration: number, volume = 0.08) => {
    unlock()
    const context = getContext()
    const bufferSize = Math.floor(context.sampleRate * duration)
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)

    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize)
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()

    source.buffer = buffer
    filter.type = "lowpass"
    filter.frequency.value = 900
    gain.gain.setValueAtTime(volume, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)
    source.start()
  }

  const speakNein = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    ensureVoices()
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance("NEIN!")
    utterance.lang = "de-DE"
    utterance.rate = 0.92
    utterance.pitch = 0.78
    utterance.volume = 1

    if (germanVoice) {
      utterance.voice = germanVoice
    }

    window.speechSynthesis.speak(utterance)
  }

  return {
    unlock,

    playFlap: () => {
      unlock()
      const context = getContext()
      const start = context.currentTime
      playTone(520, 0.05, "square", 0.04, start)
      playTone(780, 0.04, "sine", 0.06, start + 0.01)
    },

    playScore: () => {
      unlock()
      const context = getContext()
      const start = context.currentTime
      playTone(660, 0.07, "sine", 0.08, start)
      playTone(880, 0.1, "sine", 0.07, start + 0.07)
    },

    playLoseLife: () => {
      unlock()
      const context = getContext()
      const start = context.currentTime
      playTone(220, 0.12, "sawtooth", 0.07, start)
      playTone(140, 0.18, "triangle", 0.08, start + 0.08)
      playNoise(0.14, 0.1)
      speakNein()
    },

    playGameOver: () => {
      unlock()
      const context = getContext()
      const start = context.currentTime
      playTone(330, 0.16, "sawtooth", 0.07, start)
      playTone(220, 0.22, "sawtooth", 0.07, start + 0.12)
      playTone(110, 0.3, "triangle", 0.06, start + 0.28)
    },

    dispose: () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      void audioContext?.close()
      audioContext = null
    },
  }
}

export type { FlappyBirdSounds }
