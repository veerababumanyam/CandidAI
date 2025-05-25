/**
 * TranscriptionView - Real-time transcription display component
 * Implements reactive UI updates with virtual scrolling
 * Manages transcription entries with performance optimization
 */

/**
 * TranscriptionView - Displays real-time interview transcriptions
 * Implements Observer pattern for reactive updates
 */
export class TranscriptionView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }

    // Transcription state
    this.entries = [];
    this.maxEntries = 100; // Limit for performance
    this.autoScroll = true;

    // Initialize UI
    this.initialize();
  }

  /**
   * Initialize component UI
   */
  initialize() {
    // Clear any existing content
    this.container.innerHTML = '';

    // Set up scroll listener for auto-scroll detection
    this.container.addEventListener('scroll', () => {
      const isAtBottom =
        this.container.scrollHeight - this.container.scrollTop === this.container.clientHeight;
      this.autoScroll = isAtBottom;
    });
  }

  /**
   * Add new transcription entry
   * Implements efficient DOM updates
   */
  addEntry(entry) {
    const { text, speaker, confidence, isQuestion, timestamp } = entry;

    // Create entry element
    const entryElement = document.createElement('div');
    entryElement.className = 'ca-transcription__entry';

    if (isQuestion) {
      entryElement.classList.add('ca-transcription__entry--question');
    }

    // Add speaker label if available
    if (speaker) {
      const speakerLabel = document.createElement('span');
      speakerLabel.className = 'ca-transcription__speaker';
      speakerLabel.textContent = speaker + ':';
      entryElement.appendChild(speakerLabel);
    }

    // Add transcription text
    const textElement = document.createElement('span');
    textElement.className = 'ca-transcription__text';
    textElement.textContent = text;
    entryElement.appendChild(textElement);

    // Add confidence indicator if low
    if (confidence < 0.7) {
      const confidenceIndicator = document.createElement('span');
      confidenceIndicator.className = 'ca-transcription__confidence';
      confidenceIndicator.textContent = '?';
      confidenceIndicator.title = `Confidence: ${Math.round(confidence * 100)}%`;
      entryElement.appendChild(confidenceIndicator);
    }

    // Add timestamp
    const timestampElement = document.createElement('span');
    timestampElement.className = 'ca-transcription__timestamp';
    timestampElement.textContent = this.formatTimestamp(timestamp);
    entryElement.appendChild(timestampElement);

    // Remove placeholder if exists
    const placeholder = this.container.querySelector('.ca-transcription__placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    // Add to container
    this.container.appendChild(entryElement);

    // Maintain entry limit
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.container.firstChild.remove();
      this.entries.shift();
    }

    // Auto-scroll if enabled
    if (this.autoScroll) {
      entryElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  /**
   * Get recent questions for context
   */
  getRecentQuestions(count = 5) {
    return this.entries
      .filter((entry) => entry.isQuestion)
      .slice(-count)
      .map((entry) => entry.text);
  }

  /**
   * Clear all transcriptions
   */
  clear() {
    this.entries = [];
    this.initialize();
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Update display settings
   */
  updateSettings(settings) {
    if (settings.autoScroll !== undefined) {
      this.autoScroll = settings.autoScroll;
    }

    if (settings.fontSize) {
      this.container.style.fontSize = settings.fontSize;
    }
  }

  /**
   * Export transcription history
   */
  exportTranscription() {
    return this.entries
      .map((entry) => {
        const timestamp = this.formatTimestamp(entry.timestamp);
        const speaker = entry.speaker || 'Unknown';
        return `[${timestamp}] ${speaker}: ${entry.text}`;
      })
      .join('\n');
  }
}
