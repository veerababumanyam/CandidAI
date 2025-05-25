/**
 * SilenceDetector - Advanced silence detection service
 * Implements voice activity detection (VAD) algorithms
 * Provides configurable silence detection with callbacks
 */

/**
 * SilenceDetector - Detects silence in audio streams
 * Implements energy-based and zero-crossing rate detection
 */
export class SilenceDetector {
  constructor() {
    // Detection configuration
    this.config = {
      threshold: 0.01, // Energy threshold for silence
      duration: 1500, // Minimum silence duration in ms
      windowSize: 50, // Analysis window size in ms
      zcrThreshold: 0.1, // Zero-crossing rate threshold
      adaptiveThreshold: true, // Enable adaptive threshold
      smoothingFactor: 0.95, // Exponential smoothing factor
    };

    // Detection state
    this.state = {
      isSilent: true,
      silenceStartTime: null,
      lastSpeechTime: null,
      consecutiveSilentFrames: 0,
      energyHistory: [],
      adaptiveThreshold: 0.01,
    };

    // Analyser node reference
    this.analyserNode = null;

    // Callbacks
    this.callbacks = {
      onSilenceStart: null,
      onSilenceEnd: null,
      onSpeechDetected: null,
    };

    // Analysis interval
    this.analysisInterval = null;
  }

  /**
   * Initialize silence detector with analyser node
   * Sets up detection parameters and callbacks
   */
  initialize(analyserNode, options = {}) {
    this.analyserNode = analyserNode;

    // Merge configuration
    Object.assign(this.config, options);

    // Set callbacks
    if (options.onSilenceStart) {
      this.callbacks.onSilenceStart = options.onSilenceStart;
    }
    if (options.onSilenceEnd) {
      this.callbacks.onSilenceEnd = options.onSilenceEnd;
    }
    if (options.onSpeechDetected) {
      this.callbacks.onSpeechDetected = options.onSpeechDetected;
    }

    // Start analysis
    this.startAnalysis();
  }

  /**
   * Start silence analysis
   * Sets up periodic analysis interval
   */
  startAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    this.analysisInterval = setInterval(() => {
      this.analyze();
    }, this.config.windowSize);
  }

  /**
   * Stop silence analysis
   */
  stopAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  /**
   * Analyze audio for silence
   * Implements main detection algorithm
   */
  analyze() {
    if (!this.analyserNode) {
      return;
    }

    // Get time domain data
    const bufferLength = this.analyserNode.fftSize;
    const timeData = new Uint8Array(bufferLength);
    this.analyserNode.getByteTimeDomainData(timeData);

    // Calculate energy and zero-crossing rate
    const energy = this.calculateEnergy(timeData);
    const zcr = this.calculateZeroCrossingRate(timeData);

    // Update adaptive threshold if enabled
    if (this.config.adaptiveThreshold) {
      this.updateAdaptiveThreshold(energy);
    }

    // Determine if current frame is silent
    const threshold = this.config.adaptiveThreshold
      ? this.state.adaptiveThreshold
      : this.config.threshold;

    const isSilent = energy < threshold || zcr < this.config.zcrThreshold;

    // Update state and trigger callbacks
    this.updateState(isSilent);
  }

  /**
   * Calculate signal energy
   * Implements RMS energy calculation
   */
  calculateEnergy(timeData) {
    let sum = 0;

    // Convert to normalized values and calculate RMS
    for (let i = 0; i < timeData.length; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sum += normalized * normalized;
    }

    return Math.sqrt(sum / timeData.length);
  }

  /**
   * Calculate zero-crossing rate
   * Counts sign changes in signal
   */
  calculateZeroCrossingRate(timeData) {
    let crossings = 0;
    let previousSign = 0;

    for (let i = 0; i < timeData.length; i++) {
      const value = (timeData[i] - 128) / 128;
      const currentSign = Math.sign(value);

      if (previousSign !== 0 && currentSign !== previousSign) {
        crossings++;
      }

      previousSign = currentSign;
    }

    return crossings / timeData.length;
  }

  /**
   * Update adaptive threshold
   * Implements dynamic threshold adjustment
   */
  updateAdaptiveThreshold(energy) {
    // Add to energy history
    this.state.energyHistory.push(energy);

    // Limit history size
    if (this.state.energyHistory.length > 100) {
      this.state.energyHistory.shift();
    }

    // Calculate statistics
    if (this.state.energyHistory.length > 10) {
      const sorted = [...this.state.energyHistory].sort((a, b) => a - b);
      const percentile20 = sorted[Math.floor(sorted.length * 0.2)];
      const percentile80 = sorted[Math.floor(sorted.length * 0.8)];

      // Set threshold between noise floor and speech level
      this.state.adaptiveThreshold = percentile20 + (percentile80 - percentile20) * 0.3;
    }
  }

  /**
   * Update detection state
   * Handles state transitions and callbacks
   */
  updateState(isSilent) {
    const now = Date.now();

    if (isSilent) {
      if (!this.state.isSilent) {
        // Transition to silence
        this.state.isSilent = true;
        this.state.silenceStartTime = now;
        this.state.consecutiveSilentFrames = 1;

        // Don't trigger callback immediately, wait for duration
      } else {
        // Continue silence
        this.state.consecutiveSilentFrames++;

        // Check if silence duration threshold met
        const silenceDuration = now - this.state.silenceStartTime;
        if (
          silenceDuration >= this.config.duration &&
          this.state.consecutiveSilentFrames * this.config.windowSize >= this.config.duration
        ) {
          // Trigger silence start callback only once
          if (this.state.lastSpeechTime !== null) {
            this.state.lastSpeechTime = null;
            if (this.callbacks.onSilenceStart) {
              this.callbacks.onSilenceStart({
                timestamp: this.state.silenceStartTime,
                duration: silenceDuration,
              });
            }
          }
        }
      }
    } else {
      if (this.state.isSilent) {
        // Transition to speech
        this.state.isSilent = false;
        this.state.lastSpeechTime = now;
        this.state.consecutiveSilentFrames = 0;

        if (this.callbacks.onSilenceEnd) {
          this.callbacks.onSilenceEnd({
            timestamp: now,
            silenceDuration: this.state.silenceStartTime ? now - this.state.silenceStartTime : 0,
          });
        }

        if (this.callbacks.onSpeechDetected) {
          this.callbacks.onSpeechDetected({
            timestamp: now,
          });
        }
      }
    }
  }

  /**
   * Update detection threshold
   */
  updateThreshold(threshold) {
    this.config.threshold = threshold;
  }

  /**
   * Update silence duration
   */
  updateDuration(duration) {
    this.config.duration = duration;
  }

  /**
   * Get current detection state
   */
  getState() {
    return {
      isSilent: this.state.isSilent,
      silenceDuration: this.state.silenceStartTime ? Date.now() - this.state.silenceStartTime : 0,
      adaptiveThreshold: this.state.adaptiveThreshold,
      consecutiveSilentFrames: this.state.consecutiveSilentFrames,
    };
  }

  /**
   * Reset detection state
   */
  reset() {
    this.state = {
      isSilent: true,
      silenceStartTime: null,
      lastSpeechTime: null,
      consecutiveSilentFrames: 0,
      energyHistory: [],
      adaptiveThreshold: this.config.threshold,
    };
  }

  /**
   * Get detection statistics
   */
  getStatistics() {
    return {
      currentThreshold: this.config.adaptiveThreshold
        ? this.state.adaptiveThreshold
        : this.config.threshold,
      energyHistoryLength: this.state.energyHistory.length,
      averageEnergy:
        this.state.energyHistory.length > 0
          ? this.state.energyHistory.reduce((a, b) => a + b) / this.state.energyHistory.length
          : 0,
      config: { ...this.config },
    };
  }
}
