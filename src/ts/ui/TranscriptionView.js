/**
 * TranscriptionView - Real-time transcription display component
 * Provides live transcription with speaker detection and confidence indicators
 */

export class TranscriptionView {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.transcripts = [];
    this.maxTranscripts = 50; // Keep last 50 transcripts
    this.isAutoScroll = true;
    
    this.initialize();
  }

  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`TranscriptionView: Container ${this.containerId} not found`);
      return;
    }
    
    this.createUI();
    this.setupEventListeners();
  }

  createUI() {
    this.container.innerHTML = `
      <div class="transcription-header">
        <div class="transcription-status">
          <span class="status-indicator status-ready"></span>
          <span class="status-text">Ready</span>
        </div>
        <div class="transcription-controls">
          <button class="toggle-scroll" title="Toggle auto-scroll">📜</button>
          <button class="clear-transcripts" title="Clear transcripts">🗑️</button>
        </div>
      </div>
      <div class="transcription-content" id="${this.containerId}-content">
        <div class="no-transcripts">No transcripts yet. Start speaking to see real-time transcription.</div>
      </div>
      <div class="transcription-footer">
        <span class="transcript-count">0 transcripts</span>
        <span class="confidence-avg">Avg: 0%</span>
      </div>
    `;

    this.contentContainer = this.container.querySelector('.transcription-content');
    this.statusIndicator = this.container.querySelector('.status-indicator');
    this.statusText = this.container.querySelector('.status-text');
    this.transcriptCount = this.container.querySelector('.transcript-count');
    this.confidenceAvg = this.container.querySelector('.confidence-avg');
  }

  setupEventListeners() {
    const toggleScrollBtn = this.container.querySelector('.toggle-scroll');
    const clearBtn = this.container.querySelector('.clear-transcripts');

    if (toggleScrollBtn) {
      toggleScrollBtn.addEventListener('click', () => {
        this.isAutoScroll = !this.isAutoScroll;
        toggleScrollBtn.style.opacity = this.isAutoScroll ? '1' : '0.5';
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearTranscripts();
      });
    }
  }

  addTranscript(result) {
    if (!result || !result.text) return;
    
    const transcript = {
      id: `transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: result.text,
      confidence: result.confidence || 0,
      timestamp: new Date(result.timestamp || Date.now()),
      speaker: result.speaker || 'Unknown',
      isInterim: !result.isFinal
    };
    
    this.transcripts.push(transcript);
    
    // Remove oldest if exceeding max
    if (this.transcripts.length > this.maxTranscripts) {
      this.transcripts.shift();
    }
    
    this.renderTranscripts();
    
    if (this.isAutoScroll) {
      this.scrollToBottom();
    }
  }

  renderTranscripts() {
    if (!this.contentContainer) return;

    if (this.transcripts.length === 0) {
      this.contentContainer.innerHTML = `
        <div class="no-transcripts">No transcripts yet. Start speaking to see real-time transcription.</div>
      `;
      return;
    }

    const transcriptHTML = this.transcripts.map(transcript => this.createTranscriptHTML(transcript)).join('');
    this.contentContainer.innerHTML = transcriptHTML;
  }

  createTranscriptHTML(transcript) {
    const timeStr = transcript.timestamp.toLocaleTimeString();
    const confidenceStr = Math.round(transcript.confidence * 100);
    const confidenceClass = this.getConfidenceClass(transcript.confidence);
    
    return `
      <div class="transcript-item ${transcript.isFinal ? 'transcript-final' : 'transcript-interim'}" data-id="${transcript.id}">
        <div class="transcript-meta">
          <span class="transcript-time">${timeStr}</span>
          <span class="transcript-speaker">${transcript.speaker}</span>
          <span class="transcript-confidence ${confidenceClass}">${confidenceStr}%</span>
        </div>
        <div class="transcript-text">${this.escapeHtml(transcript.text)}</div>
      </div>
    `;
  }

  getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  }

  updateStats() {
    if (!this.transcriptCount || !this.confidenceAvg) return;

    this.transcriptCount.textContent = `${this.transcripts.length} transcripts`;

    if (this.transcripts.length > 0) {
      const avgConfidence = this.transcripts.reduce((sum, t) => sum + t.confidence, 0) / this.transcripts.length;
      this.confidenceAvg.textContent = `Avg: ${Math.round(avgConfidence * 100)}%`;
    } else {
      this.confidenceAvg.textContent = 'Avg: 0%';
    }
  }

  setStatus(status, text) {
    if (!this.statusIndicator || !this.statusText) return;

    this.statusIndicator.className = `status-indicator status-${status}`;
    this.statusText.textContent = text;
  }

  clearTranscripts() {
    this.transcripts = [];
    this.renderTranscripts();
    this.updateStats();
    this.setStatus('ready', 'Cleared');
  }

  scrollToBottom() {
    if (this.contentContainer) {
      this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  getTranscripts() {
    return [...this.transcripts];
  }

  exportTranscripts() {
    const exportData = {
      transcripts: this.transcripts,
      exportedAt: new Date().toISOString(),
      totalCount: this.transcripts.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcripts-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.transcripts = [];
  }
}
