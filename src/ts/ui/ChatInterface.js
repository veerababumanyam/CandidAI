/**
 * ChatInterface - Interactive AI chat component
 * Implements real-time messaging with context awareness
 * Manages conversation flow and user interactions
 */

/**
 * ChatInterface - Provides conversational AI assistance
 * Implements message threading with reactive updates
 */
export class ChatInterface {
  constructor(messagesContainerId, formId) {
    this.messagesContainer = document.getElementById(messagesContainerId);
    this.form = document.getElementById(formId);

    if (!this.messagesContainer || !this.form) {
      throw new Error('Required elements not found for ChatInterface');
    }

    // Chat state
    this.messages = [];
    this.isProcessing = false;
    this.conversationId = crypto.randomUUID();

    // UI elements
    this.input = this.form.querySelector('#chat-input');
    this.submitButton = this.form.querySelector('button[type="submit"]');

    // Initialize
    this.initialize();
  }

  /**
   * Initialize chat interface
   * Sets up event handlers and initial state
   */
  initialize() {
    // Form submission handler
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    // Input handlers
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.input.addEventListener('input', this.handleInput.bind(this));

    // Welcome message
    this.addMessage({
      role: 'assistant',
      content: "Hi! I'm here to help you during your interview. Feel free to ask me anything!",
      timestamp: Date.now(),
    });

    // Focus input
    this.input.focus();
  }

  /**
   * Handle form submission
   * Processes user messages
   */
  async handleSubmit(event) {
    event.preventDefault();

    const message = this.input.value.trim();
    if (!message || this.isProcessing) {
      return;
    }

    // Add user message
    this.addMessage({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    // Clear input
    this.input.value = '';
    this.updateSubmitButton();

    // Process message
    await this.processUserMessage(message);
  }

  /**
   * Process user message and get AI response
   * Implements context-aware conversation
   */
  async processUserMessage(message) {
    this.setProcessingState(true);

    // Add thinking indicator
    const thinkingId = this.addThinkingIndicator();

    try {
      // Send to service worker for processing
      const response = await chrome.runtime.sendMessage({
        command: 'PROCESS_CHAT_MESSAGE',
        payload: {
          message,
          conversationId: this.conversationId,
          context: this.getConversationContext(),
        },
      });

      if (response.success) {
        // Remove thinking indicator
        this.removeMessage(thinkingId);

        // Add AI response
        this.addMessage({
          role: 'assistant',
          content: response.data.content,
          timestamp: Date.now(),
          metadata: response.data.metadata,
        });
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat processing error:', error);

      // Remove thinking indicator
      this.removeMessage(thinkingId);

      // Show error message
      this.addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
        isError: true,
      });
    } finally {
      this.setProcessingState(false);
    }
  }
  /**
   * Add message to chat
   * Implements message rendering with animations
   */
  addMessage(messageData) {
    const messageId = crypto.randomUUID();
    const message = { id: messageId, ...messageData };

    this.messages.push(message);

    // Create message element
    const messageElement = this.createMessageElement(message);
    this.messagesContainer.appendChild(messageElement);

    // Animate entrance
    requestAnimationFrame(() => {
      messageElement.classList.add('ca-message--visible');
    });

    // Auto-scroll to bottom
    this.scrollToBottom();

    return messageId;
  }

  /**
   * Create message element
   * Implements rich message formatting
   */
  createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ca-message ca-message--${message.role}`;
    messageDiv.dataset.messageId = message.id;

    if (message.isError) {
      messageDiv.classList.add('ca-message--error');
    }

    // Message bubble
    const bubble = document.createElement('div');
    bubble.className = 'ca-message__bubble';

    // Avatar for assistant messages
    if (message.role === 'assistant') {
      const avatar = document.createElement('div');
      avatar.className = 'ca-message__avatar';
      avatar.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      `;
      messageDiv.appendChild(avatar);
    }

    // Message content with markdown support
    const content = document.createElement('div');
    content.className = 'ca-message__content';
    content.innerHTML = this.formatMessageContent(message.content);
    bubble.appendChild(content);

    // Timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'ca-message__timestamp';
    timestamp.textContent = this.formatTimestamp(message.timestamp);
    bubble.appendChild(timestamp);

    // Actions for assistant messages
    if (message.role === 'assistant' && !message.isError) {
      const actions = document.createElement('div');
      actions.className = 'ca-message__actions';

      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'ca-message__action';
      copyBtn.title = 'Copy message';
      copyBtn.innerHTML = `
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 1h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/>
        </svg>
      `;
      copyBtn.addEventListener('click', () => this.copyMessage(message));
      actions.appendChild(copyBtn);

      bubble.appendChild(actions);
    }

    messageDiv.appendChild(bubble);

    return messageDiv;
  }

  /**
   * Format message content with basic markdown
   * Implements simple markdown parsing
   */
  formatMessageContent(content) {
    // Escape HTML
    let formatted = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Basic markdown formatting
    formatted = formatted
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return formatted;
  }

  /**
   * Add thinking indicator
   * Shows AI is processing
   */
  addThinkingIndicator() {
    const thinkingMessage = {
      role: 'assistant',
      content: '<div class="ca-thinking-indicator"><span></span><span></span><span></span></div>',
      timestamp: Date.now(),
      isThinking: true,
    };

    return this.addMessage(thinkingMessage);
  }

  /**
   * Remove message by ID
   */
  removeMessage(messageId) {
    const element = this.messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
    if (element) {
      element.classList.add('ca-message--fade-out');
      setTimeout(() => element.remove(), 300);
    }

    this.messages = this.messages.filter((m) => m.id !== messageId);
  }

  /**
   * Copy message content
   */
  async copyMessage(message) {
    try {
      await navigator.clipboard.writeText(message.content);
      this.showToast('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showToast('Failed to copy', 'error');
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeydown(event) {
    // Submit on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.form.dispatchEvent(new Event('submit'));
    }
  }

  /**
   * Handle input changes
   */
  handleInput() {
    this.updateSubmitButton();
    this.adjustInputHeight();
  }

  /**
   * Update submit button state
   */
  updateSubmitButton() {
    const hasContent = this.input.value.trim().length > 0;
    this.submitButton.disabled = !hasContent || this.isProcessing;
  }

  /**
   * Adjust input height for multiline
   */
  adjustInputHeight() {
    this.input.style.height = 'auto';
    this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
  }

  /**
   * Set processing state
   */
  setProcessingState(processing) {
    this.isProcessing = processing;
    this.input.disabled = processing;
    this.updateSubmitButton();

    if (processing) {
      this.form.classList.add('ca-chat__form--processing');
    } else {
      this.form.classList.remove('ca-chat__form--processing');
    }
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Get conversation context
   */
  getConversationContext() {
    return {
      messages: this.messages.slice(-10), // Last 10 messages
      conversationId: this.conversationId,
      timestamp: Date.now(),
    };
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `ca-toast ca-toast--${type} ca-toast--chat`;
    toast.textContent = message;

    this.messagesContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('ca-toast--fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * Clear chat history
   */
  clear() {
    this.messages = [];
    this.messagesContainer.innerHTML = '';
    this.conversationId = crypto.randomUUID();
    this.initialize();
  }

  /**
   * Export chat history
   */
  exportChat() {
    return this.messages
      .map((msg) => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const role = msg.role === 'user' ? 'You' : 'CandidAI';
        return `[${timestamp}] ${role}: ${msg.content}`;
      })
      .join('\n\n');
  }
}
