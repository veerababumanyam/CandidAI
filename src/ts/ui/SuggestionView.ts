/**
 * SuggestionView - Real-time AI suggestions display component
 * Provides contextual suggestions with confidence scoring and interaction tracking
 */

interface SuggestionEntry {
  id: string;
  content: string;
  confidence: number;
  relevantDocuments: string[];
  timestamp: Date;
  used: boolean;
  feedback?: 'positive' | 'negative' | 'neutral';
}

export class SuggestionView {
  private container: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private suggestions: SuggestionEntry[] = [];
  private readonly maxSuggestions: number = 10;
  private usedSuggestions: Set<string> = new Set();

  constructor(private readonly containerId: string) {
    this.initialize();
  }

  private initialize(): void {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`SuggestionView: Container ${this.containerId} not found`);
      return;
    }
    
    this.createUI();
    this.setupEventListeners();
  }

  private createUI(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="suggestions-header">
        <div class="suggestions-status">
          <span class="status-indicator status-ready"></span>
          <span class="status-text">AI Suggestions</span>
        </div>
        <div class="suggestions-controls">
          <button class="refresh-suggestions" title="Refresh suggestions">🔄</button>
          <button class="clear-suggestions" title="Clear suggestions">🗑️</button>
        </div>
      </div>
      <div class="suggestions-content" id="${this.containerId}-content">
        <div class="no-suggestions">No suggestions yet.</div>
      </div>
      <div class="suggestions-footer">
        <span class="suggestion-count">0 suggestions</span>
        <span class="used-count">0 used</span>
      </div>
    `;

    this.contentContainer = this.container.querySelector('.suggestions-content');
  }

  private setupEventListeners(): void {
    if (!this.container) return;

    const refreshBtn = this.container.querySelector('.refresh-suggestions') as HTMLButtonElement;
    const clearBtn = this.container.querySelector('.clear-suggestions') as HTMLButtonElement;

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshSuggestions();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearSuggestions();
      });
    }
  }

  /**
   * Display new suggestions
   */
  displaySuggestions(suggestions: any[]): void {
    if (!Array.isArray(suggestions)) return;
    
    this.suggestions = suggestions.map(s => ({
      id: s.id || `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: s.content || s.text || '',
      confidence: s.confidence || 0.5,
      relevantDocuments: s.relevantDocuments || [],
      timestamp: new Date(),
      used: false
    }));
    
    this.renderSuggestions();
    this.updateStats();
  }

  private renderSuggestions(): void {
    if (!this.contentContainer) return;

    if (this.suggestions.length === 0) {
      this.contentContainer.innerHTML = `
        <div class="no-suggestions">No suggestions available. Start speaking to get AI assistance.</div>
      `;
      return;
    }

    const suggestionsHTML = this.suggestions.map(suggestion => this.createSuggestionHTML(suggestion)).join('');
    this.contentContainer.innerHTML = suggestionsHTML;

    // Add click listeners for suggestion actions
    this.setupSuggestionListeners();
  }

  private createSuggestionHTML(suggestion: SuggestionEntry): string {
    const confidenceStr = Math.round(suggestion.confidence * 100);
    const confidenceClass = this.getConfidenceClass(suggestion.confidence);
    const timeStr = suggestion.timestamp.toLocaleTimeString();
    
    return `
      <div class="suggestion-item ${suggestion.used ? 'suggestion-used' : ''}" data-id="${suggestion.id}">
        <div class="suggestion-header">
          <span class="suggestion-confidence ${confidenceClass}">${confidenceStr}%</span>
          <span class="suggestion-time">${timeStr}</span>
          <div class="suggestion-actions">
            <button class="use-suggestion" title="Use this suggestion" data-id="${suggestion.id}">✓</button>
            <button class="copy-suggestion" title="Copy to clipboard" data-id="${suggestion.id}">📋</button>
          </div>
        </div>
        <div class="suggestion-content">${this.escapeHtml(suggestion.content)}</div>
        ${suggestion.relevantDocuments.length > 0 ? `
          <div class="suggestion-documents">
            <span class="documents-label">Based on:</span>
            ${suggestion.relevantDocuments.map(doc => `<span class="document-tag">${doc}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  private setupSuggestionListeners(): void {
    if (!this.contentContainer) return;

    // Use suggestion buttons
    this.contentContainer.querySelectorAll('.use-suggestion').forEach(btn => {
      (btn as HTMLButtonElement).addEventListener('click', (e) => {
        const suggestionId = (e.target as HTMLElement).getAttribute('data-id');
        if (suggestionId) {
          this.useSuggestion(suggestionId);
        }
      });
    });

    // Copy suggestion buttons  
    this.contentContainer.querySelectorAll('.copy-suggestion').forEach(btn => {
      (btn as HTMLButtonElement).addEventListener('click', (e) => {
        const suggestionId = (e.target as HTMLElement).getAttribute('data-id');
        if (suggestionId) {
          this.copySuggestion(suggestionId);
        }
      });
    });
  }

  private getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  }

  private useSuggestion(suggestionId: string): void {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    suggestion.used = true;
    this.usedSuggestions.add(suggestionId);
    
    // Update UI
    this.renderSuggestions();
    this.updateStats();

    // Dispatch custom event for external listeners
    this.container?.dispatchEvent(new CustomEvent('suggestionUsed', {
      detail: { suggestion }
    }));
  }

  private copySuggestion(suggestionId: string): void {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    navigator.clipboard.writeText(suggestion.content).then(() => {
      // Show brief visual feedback
      const btn = this.container?.querySelector(`[data-id="${suggestionId}"].copy-suggestion`) as HTMLElement;
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 1000);
      }
    }).catch(err => {
      console.error('Failed to copy suggestion:', err);
    });
  }

  private updateStats(): void {
    const countElement = this.container?.querySelector('.suggestion-count');
    const usedElement = this.container?.querySelector('.used-count');
    
    if (countElement) {
      countElement.textContent = `${this.suggestions.length} suggestions`;
    }
    
    if (usedElement) {
      const usedCount = this.suggestions.filter(s => s.used).length;
      usedElement.textContent = `${usedCount} used`;
    }
  }

  private refreshSuggestions(): void {
    // Dispatch event to request new suggestions
    this.container?.dispatchEvent(new CustomEvent('refreshRequested'));
  }

  public clearSuggestions(): void {
    this.suggestions = [];
    this.usedSuggestions.clear();
    this.renderSuggestions();
    this.updateStats();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public getSuggestions(): SuggestionEntry[] {
    return [...this.suggestions];
  }

  public getUsedSuggestions(): SuggestionEntry[] {
    return this.suggestions.filter(s => s.used);
  }

  public destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.suggestions = [];
    this.usedSuggestions.clear();
  }
} 