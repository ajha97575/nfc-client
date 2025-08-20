// Enhanced sound utility functions with better error handling

// Create a simple beep sound using Web Audio API
const createBeepSound = (frequency = 800, duration = 0.3, volume = 0.3) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)

    return true
  } catch (error) {
    console.log("Web Audio API not supported:", error)
    return false
  }
}

// Create success sound sequence
const createSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = "sine"

      const startTime = audioContext.currentTime + index * 0.15
      gainNode.gain.setValueAtTime(0.2, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
    })

    return true
  } catch (error) {
    console.log("Web Audio API not supported:", error)
    return false
  }
}

export const playBeepSound = () => {
  try {
    console.log("🔊 Playing beep sound...")

    // Try to create beep sound using Web Audio API
    const audioCreated = createBeepSound(800, 0.5, 0.3)

    if (audioCreated) {
      console.log("✅ Beep sound played successfully using Web Audio API")
    } else {
      console.log("⚠️ Web Audio API not available, using silent fallback")
    }
  } catch (error) {
    console.log("❌ Error playing beep sound:", error)
  }
}

export const playSuccessSound = () => {
  try {
    console.log("🎉 Playing success sound...")

    // Try to create success sound using Web Audio API
    const audioCreated = createSuccessSound()

    if (audioCreated) {
      console.log("✅ Success sound played successfully using Web Audio API")
    } else {
      console.log("⚠️ Web Audio API not available, using silent fallback")
    }
  } catch (error) {
    console.log("❌ Error playing success sound:", error)
  }
}

// Preload function (now just logs that audio is ready)
export const preloadAudio = () => {
  try {
    // Test if Web Audio API is available
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      console.log("✅ Web Audio API available - sounds ready")
      return true
    } else {
      console.log("⚠️ Web Audio API not available - using silent mode")
      return false
    }
  } catch (error) {
    console.log("⚠️ Audio preload check failed:", error)
    return false
  }
}

// Test audio function
export const testAudio = () => {
  console.log("🧪 Testing audio capabilities...")

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      console.log("✅ Web Audio API: Supported")
      playBeepSound()
      setTimeout(() => {
        playSuccessSound()
      }, 1000)
    } else {
      console.log("❌ Web Audio API: Not supported")
    }
  } catch (error) {
    console.log("❌ Audio test failed:", error)
  }
}
