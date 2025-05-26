/**
 * TranscriptionView - Real-time transcription display component
 * Provides live transcription with speaker detection and confidence indicators
 */

interface TranscriptEntry {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  speaker: string;
  isInterim: boolean;
}

interface TranscriptResult {
  text: string;
  confidence?: number;
  timestamp?: number;
  speaker?: string;
  isFinal?: boolean;
}

export class TranscriptionView {
  private container: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private statusIndicator: HTMLElement | null = null;
  private statusText: HTMLElement | null = null;
  private transcriptCount: HTMLElement | null = null;
  private confidenceAvg: HTMLElement | null = null;
  private transcripts: TranscriptEntry[] = [];
  private readonly maxTranscripts: number = 50;
  private isAutoScroll: boolean = true;

  constructor(private readonly containerId: string) {
    this.initialize();
  }

  private initialize(): void {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`TranscriptionView: Container ${this.containerId} not found`);
      return;
    }
    
    this.createUI();
    this.setupEventListeners();
  }

  private createUI(): void {
    if (!this.container) return;

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

  private setupEventListeners(): void {
    if (!this.container) return;

    const toggleScrollBtn = this.container.querySelector('.toggle-scroll') as HTMLButtonElement;
    const clearBtn = this.container.querySelector('.clear-transcripts') as HTMLButtonElement;

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

  /**
   * Add new transcript entry
   */
  addTranscript(result: TranscriptResult): void {
    if (!result || !result.text) return;
    
    const transcript: TranscriptEntry = {
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
    this.updateStats();
    
    if (this.isAutoScroll) {
      this.scrollToBottom();
    }
  }

  private renderTranscripts(): void {
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

  private createTranscriptHTML(transcript: TranscriptEntry): string {
    const timeStr = transcript.timestamp.toLocaleTimeString();
    const confidenceStr = Math.round(transcript.confidence * 100);
    const confidenceClass = this.getConfidenceClass(transcript.confidence);
    
    return `
      <div class="transcript-item ${transcript.isInterim ? 'transcript-interim' : 'transcript-final'}" data-id="${transcript.id}">
        <div class="transcript-meta">
          <span class="transcript-time">${timeStr}</span>
          <span class="transcript-speaker">${transcript.speaker}</span>
          <span class="transcript-confidence ${confidenceClass}">${confidenceStr}%</span>
        </div>
        <div class="transcript-text">${this.escapeHtml(transcript.text)}</div>
      </div>
    `;
  }

  private getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  }

  private updateStats(): void {
    if (!this.transcriptCount || !this.confidenceAvg) return;

    this.transcriptCount.textContent = `${this.transcripts.length} transcripts`;

    if (this.transcripts.length > 0) {
      const avgConfidence = this.transcripts.reduce((sum, t) => sum + t.confidence, 0) / this.transcripts.length;
      this.confidenceAvg.textContent = `Avg: ${Math.round(avgConfidence * 100)}%`;
    } else {
      this.confidenceAvg.textContent = 'Avg: 0%';
    }
  }

  public setStatus(status: string, text: string): void {
    if (!this.statusIndicator || !this.statusText) return;

    this.statusIndicator.className = `status-indicator status-${status}`;
    this.statusText.textContent = text;
  }

  public clearTranscripts(): void {
    this.transcripts = [];
    this.renderTranscripts();
    this.updateStats();
    this.setStatus('ready', 'Cleared');
  }

  private scrollToBottom(): void {
    if (this.contentContainer) {
      this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public getTranscripts(): TranscriptEntry[] {
    return [...this.transcripts];
  }

  public exportTranscripts(): void {
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

  public destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.transcripts = [];
  }
} 