/**
 * SuggestionView - AI suggestion display component
 * Implements card-based UI with source attribution
 * Manages suggestion lifecycle and user interactions
 */

/**
 * SuggestionView - Displays AI-generated interview suggestions
 * Implements reactive updates with visual hierarchy
 */
export class SuggestionView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }

    // Suggestion state
    this.suggestions = [];
    this.maxSuggestions = 5;
    this.selectedIndex = -1;

    // User interaction tracking
    this.interactionHistory = [];

    // Initialize UI
    this.initialize();
  }

  /**
   * Initialize component UI
   */
  initialize() {
    this.container.innerHTML = '';
    this.container.classList.add('ca-suggestions__container');

    // Set up keyboard navigation
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  /**
   * Render suggestions with intelligent prioritization
   * Implements card-based layout with interactions
   */
  renderSuggestions(suggestions) {
    this.suggestions = suggestions.slice(0, this.maxSuggestions);
    this.container.innerHTML = '';

    if (this.suggestions.length === 0) {
      this.showEmptyState();
      return;
    }

    // Create suggestion cards
    this.suggestions.forEach((suggestion, index) => {
      const card = this.createSuggestionCard(suggestion, index);
      this.container.appendChild(card);
    });

    // Animate cards entrance
    this.animateCardsEntrance();
  }

  /**
   * Create individual suggestion card
   * Implements rich content display
   */
  createSuggestionCard(suggestion, index) {
    const card = document.createElement('div');
    card.className = 'ca-suggestion-card';
    card.dataset.suggestionId = suggestion.id;
    card.dataset.index = index;

    // Source indicator
    const sourceIndicator = document.createElement('div');
    sourceIndicator.className = 'ca-suggestion-card__source';
    sourceIndicator.innerHTML = `
      <svg class="ca-suggestion-card__source-icon" viewBox="0 0 16 16" fill="currentColor">
        ${
          suggestion.source === 'resume'
            ? '<path d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm1 2v2h6V3H5zm0 4v2h6V7H5zm0 4v2h4v-2H5z"/>'
            : '<path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 11H7v2h2v-2zm0-8H7v6h2V3z"/>'
        }
      </svg>
      <span>${suggestion.source === 'resume' ? 'From your resume' : 'AI suggestion'}</span>
    `;
    card.appendChild(sourceIndicator);

    // Main content
    const content = document.createElement('div');
    content.className = 'ca-suggestion-card__content';
    content.textContent = suggestion.content;
    card.appendChild(content);

    // Keywords
    if (suggestion.keywords && suggestion.keywords.length > 0) {
      const keywords = document.createElement('div');
      keywords.className = 'ca-suggestion-card__keywords';

      suggestion.keywords.forEach((keyword) => {
        const tag = document.createElement('span');
        tag.className = 'ca-keyword';
        tag.textContent = keyword;
        keywords.appendChild(tag);
      });

      card.appendChild(keywords);
    }

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'ca-suggestion-card__actions';

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'ca-btn ca-btn--icon ca-btn--small';
    copyBtn.title = 'Copy to clipboard';
    copyBtn.innerHTML = `
      <svg class="ca-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
    `;
    copyBtn.addEventListener('click', () => this.copySuggestion(suggestion));
    actions.appendChild(copyBtn);

    // Expand button for long content
    if (suggestion.content.length > 200) {
      const expandBtn = document.createElement('button');
      expandBtn.className = 'ca-btn ca-btn--icon ca-btn--small';
      expandBtn.title = 'Expand';
      expandBtn.innerHTML = `
        <svg class="ca-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M7 10l5 5 5-5"/>
        </svg>
      `;
      expandBtn.addEventListener('click', () => this.toggleExpand(card));
      actions.appendChild(expandBtn);
    }

    // Feedback buttons
    const feedbackGroup = document.createElement('div');
    feedbackGroup.className = 'ca-suggestion-card__feedback';

    const upvoteBtn = this.createFeedbackButton('upvote', suggestion);
    const downvoteBtn = this.createFeedbackButton('downvote', suggestion);

    feedbackGroup.appendChild(upvoteBtn);
    feedbackGroup.appendChild(downvoteBtn);
    actions.appendChild(feedbackGroup);

    card.appendChild(actions);

    // Click handler for selection
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        this.selectSuggestion(index);
      }
    });

    return card;
  }
  /**
   * Create feedback button
   * Implements user preference tracking
   */
  createFeedbackButton(type, suggestion) {
    const button = document.createElement('button');
    button.className = 'ca-btn ca-btn--icon ca-btn--small ca-feedback-btn';
    button.dataset.feedback = type;

    const icon =
      type === 'upvote'
        ? '<path d="M12 19V6m0 0l-7 7m7-7l7 7"/>'
        : '<path d="M12 5v13m0 0l-7-7m7 7l7-7"/>';

    button.innerHTML = `
      <svg class="ca-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        ${icon}
      </svg>
    `;

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleFeedback(type, suggestion);
    });

    return button;
  }

  /**
   * Copy suggestion to clipboard
   * Implements clipboard API integration
   */
  async copySuggestion(suggestion) {
    try {
      await navigator.clipboard.writeText(suggestion.content);

      // Show success feedback
      this.showToast('Copied to clipboard!', 'success');

      // Track interaction
      this.trackInteraction('copy', suggestion);
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showToast('Failed to copy', 'error');
    }
  }

  /**
   * Handle user feedback
   * Implements preference learning
   */
  handleFeedback(type, suggestion) {
    // Track feedback
    this.trackInteraction(type, suggestion);

    // Update UI
    const card = this.container.querySelector(`[data-suggestion-id="${suggestion.id}"]`);
    if (card) {
      const button = card.querySelector(`[data-feedback="${type}"]`);
      button.classList.add('ca-feedback-btn--active');

      // Disable both buttons after feedback
      card.querySelectorAll('.ca-feedback-btn').forEach((btn) => {
        btn.disabled = true;
      });
    }

    // Send feedback to service worker
    chrome.runtime.sendMessage({
      command: 'SUGGESTION_FEEDBACK',
      payload: {
        suggestionId: suggestion.id,
        feedback: type,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Toggle card expansion
   * Implements accordion behavior
   */
  toggleExpand(card) {
    card.classList.toggle('ca-suggestion-card--expanded');

    const expandBtn = card.querySelector('.ca-btn--small:nth-child(2)');
    if (expandBtn) {
      const isExpanded = card.classList.contains('ca-suggestion-card--expanded');
      expandBtn.innerHTML = `
        <svg class="ca-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="${isExpanded ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'}"/>
        </svg>
      `;
    }
  }

  /**
   * Select suggestion with keyboard
   * Implements keyboard navigation
   */
  selectSuggestion(index) {
    // Remove previous selection
    this.container.querySelectorAll('.ca-suggestion-card').forEach((card, i) => {
      card.classList.toggle('ca-suggestion-card--selected', i === index);
    });

    this.selectedIndex = index;
  }

  /**
   * Handle keyboard navigation
   * Implements accessibility features
   */
  handleKeyboardNavigation(event) {
    if (!this.suggestions.length) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
        this.selectSuggestion(this.selectedIndex);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.selectSuggestion(this.selectedIndex);
        break;

      case 'Enter':
        if (this.selectedIndex >= 0) {
          event.preventDefault();
          this.copySuggestion(this.suggestions[this.selectedIndex]);
        }
        break;

      case 'Escape':
        this.selectedIndex = -1;
        this.selectSuggestion(-1);
        break;
    }
  }

  /**
   * Show empty state
   * Implements helpful messaging
   */
  showEmptyState() {
    this.container.innerHTML = `
      <div class="ca-suggestions__empty">
        <svg class="ca-suggestions__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        <p class="ca-suggestions__empty-text">
          Suggestions will appear here when questions are detected
        </p>
      </div>
    `;
  }

  /**
   * Show error state
   * Implements error handling UI
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="ca-suggestions__error">
        <svg class="ca-suggestions__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="ca-suggestions__error-text">${message}</p>
      </div>
    `;
  }

  /**
   * Animate cards entrance
   * Implements staggered animation
   */
  animateCardsEntrance() {
    const cards = this.container.querySelectorAll('.ca-suggestion-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 100}ms`;
      card.classList.add('ca-suggestion-card--animate-in');
    });
  }

  /**
   * Track user interactions
   * Implements analytics collection
   */
  trackInteraction(action, suggestion) {
    this.interactionHistory.push({
      action,
      suggestionId: suggestion.id,
      timestamp: Date.now(),
      source: suggestion.source,
    });

    // Limit history size
    if (this.interactionHistory.length > 100) {
      this.interactionHistory = this.interactionHistory.slice(-50);
    }
  }

  /**
   * Show temporary toast notification
   * Implements feedback messaging
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `ca-toast ca-toast--${type} ca-toast--mini`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('ca-toast--fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * Clear all suggestions
   */
  clear() {
    this.suggestions = [];
    this.selectedIndex = -1;
    this.initialize();
  }

  /**
   * Get interaction analytics
   * Returns user behavior insights
   */
  getAnalytics() {
    const analytics = {
      totalInteractions: this.interactionHistory.length,
      copyCount: this.interactionHistory.filter((i) => i.action === 'copy').length,
      upvoteCount: this.interactionHistory.filter((i) => i.action === 'upvote').length,
      downvoteCount: this.interactionHistory.filter((i) => i.action === 'downvote').length,
      sourcePreference: {},
    };

    // Calculate source preference
    this.interactionHistory.forEach((interaction) => {
      if (interaction.action === 'copy' || interaction.action === 'upvote') {
        analytics.sourcePreference[interaction.source] =
          (analytics.sourcePreference[interaction.source] || 0) + 1;
      }
    });

    return analytics;
  }
}
