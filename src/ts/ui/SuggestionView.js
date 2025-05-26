/**
 * SuggestionView - Real-time AI suggestions display component
 * Provides contextual suggestions with confidence scoring and interaction tracking
 */

export class SuggestionView {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.suggestions = [];
    this.maxSuggestions = 10;
    this.usedSuggestions = new Set();
    
    this.initialize();
  }

  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`SuggestionView: Container ${this.containerId} not found`);
      return;
    }
    
    this.createUI();
    this.setupEventListeners();
  }

  createUI() {
    this.container.innerHTML = `
      <div class="suggestions-header">
        <div class="suggestions-status">
          <span class="status-indicator status-ready"></span>
          <span class="status-text">Ready for suggestions</span>
        </div>
        <div class="suggestions-controls">
          <button class="refresh-suggestions" title="Refresh suggestions">🔄</button>
          <button class="clear-suggestions" title="Clear suggestions">🗑️</button>
        </div>
      </div>
      <div class="suggestions-content" id="${this.containerId}-content">
        <div class="no-suggestions">
          <div class="no-suggestions-icon">💡</div>
          <p>No suggestions yet. AI will provide contextual suggestions based on the conversation.</p>
        </div>
      </div>
      <div class="suggestions-footer">
        <span class="suggestions-count">0 suggestions</span>
        <span class="suggestions-used">Used: 0</span>
      </div>
    `;

    this.contentContainer = this.container.querySelector('.suggestions-content');
    this.statusIndicator = this.container.querySelector('.status-indicator');
    this.statusText = this.container.querySelector('.status-text');
    this.suggestionsCount = this.container.querySelector('.suggestions-count');
    this.suggestionsUsed = this.container.querySelector('.suggestions-used');
  }

  setupEventListeners() {
    const refreshBtn = this.container.querySelector('.refresh-suggestions');
    const clearBtn = this.container.querySelector('.clear-suggestions');

    refreshBtn?.addEventListener('click', () => {
      this.refreshSuggestions();
    });

    clearBtn?.addEventListener('click', () => {
      this.clearSuggestions();
    });
  }

  displaySuggestions(suggestions) {
    if (!Array.isArray(suggestions)) return;
    
    this.suggestions = suggestions;
    this.renderSuggestions();
  }

  renderSuggestions() {
    if (!this.contentContainer) return;

    if (this.suggestions.length === 0) {
      this.contentContainer.innerHTML = `
        <div class="no-suggestions">
          <div class="no-suggestions-icon">💡</div>
          <p>No suggestions yet. AI will provide contextual suggestions based on the conversation.</p>
        </div>
      `;
      return;
    }

    const html = this.suggestions.map(suggestion => `
      <div class="suggestion-item">
        <div class="suggestion-content">${suggestion.content || suggestion.text || ''}</div>
        <div class="suggestion-meta">
          <span class="suggestion-confidence">${Math.round((suggestion.confidence || 0.8) * 100)}%</span>
        </div>
      </div>
    `).join('');

    this.contentContainer.innerHTML = html;
  }

  getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  }

  updateStats() {
    if (!this.suggestionsCount || !this.suggestionsUsed) return;

    this.suggestionsCount.textContent = `${this.suggestions.length} suggestions`;
    this.suggestionsUsed.textContent = `Used: ${this.usedSuggestions.size}`;
  }

  setStatus(status, text) {
    if (!this.statusIndicator || !this.statusText) return;

    this.statusIndicator.className = `status-indicator status-${status}`;
    this.statusText.textContent = text;
  }

  async copySuggestion(suggestionId) {
    const suggestion = this.suggestions.find(s => s.id === suggestionId || `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` === suggestionId);
    if (!suggestion) return;

    const content = suggestion.content || suggestion.text || '';
    
    try {
      await navigator.clipboard.writeText(content);
      
      // Visual feedback
      const suggestionElement = this.container.querySelector(`[data-id="${suggestionId}"]`);
      if (suggestionElement) {
        suggestionElement.classList.add('suggestion-copied');
        setTimeout(() => {
          suggestionElement.classList.remove('suggestion-copied');
        }, 2000);
      }
      
      this.setStatus('success', 'Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy suggestion:', error);
      this.setStatus('error', 'Failed to copy');
    }
  }

  markAsUsed(suggestionId) {
    this.usedSuggestions.add(suggestionId);
    
    // Update UI
    const suggestionElement = this.container.querySelector(`[data-id="${suggestionId}"]`);
    if (suggestionElement) {
      suggestionElement.classList.add('suggestion-used');
    }
    
    this.updateStats();
    this.setStatus('success', 'Marked as used');
  }

  refreshSuggestions() {
    // Emit event for parent to generate new suggestions
    this.container.dispatchEvent(new CustomEvent('refresh-suggestions', {
      bubbles: true,
      detail: { timestamp: Date.now() }
    }));
    
    this.setStatus('loading', 'Refreshing suggestions...');
  }

  clearSuggestions() {
    this.suggestions = [];
    this.usedSuggestions.clear();
    this.renderSuggestions();
    this.updateStats();
    this.setStatus('ready', 'Cleared');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  getSuggestions() {
    return [...this.suggestions];
  }

  getUsedSuggestions() {
    return Array.from(this.usedSuggestions);
  }

  exportSuggestions() {
    const exportData = {
      suggestions: this.suggestions,
      usedSuggestions: Array.from(this.usedSuggestions),
      exportedAt: new Date().toISOString(),
      totalCount: this.suggestions.length,
      usedCount: this.usedSuggestions.size
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `suggestions-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.suggestions = [];
    this.usedSuggestions.clear();
  }
}

// Set up click delegation for suggestion actions
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('copy-suggestion')) {
    const suggestionId = event.target.getAttribute('data-id');
    const container = event.target.closest('.suggestions-content');
    if (container && suggestionId) {
      // Find the SuggestionView instance and call copySuggestion
      const containerId = container.id.replace('-content', '');
      const suggestionView = window.candidaiSuggestionViews?.[containerId];
      if (suggestionView) {
        suggestionView.copySuggestion(suggestionId);
      }
    }
  }

  if (event.target.classList.contains('use-suggestion')) {
    const suggestionId = event.target.getAttribute('data-id');
    const container = event.target.closest('.suggestions-content');
    if (container && suggestionId) {
      const containerId = container.id.replace('-content', '');
      const suggestionView = window.candidaiSuggestionViews?.[containerId];
      if (suggestionView) {
        suggestionView.markAsUsed(suggestionId);
      }
    }
  }
});

// Global registry for SuggestionView instances
if (!window.candidaiSuggestionViews) {
  window.candidaiSuggestionViews = {};
}
