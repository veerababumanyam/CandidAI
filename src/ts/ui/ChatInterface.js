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
  constructor(containerId) {
    this.containerId = containerId;
    this.messages = [];
    this.initialize();
  }

  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`ChatInterface: Container ${this.containerId} not found`);
      return;
    }
    this.createUI();
    this.setupEventListeners();
  }

  createUI() {
    this.container.innerHTML = `
      <div class="chat-messages" id="${this.containerId}-messages"></div>
      <div class="chat-input-container">
        <input type="text" class="chat-input" placeholder="Ask AI for help..." />
        <button class="chat-send">Send</button>
      </div>
    `;

    this.messagesContainer = this.container.querySelector('.chat-messages');
    this.inputField = this.container.querySelector('.chat-input');
    this.sendButton = this.container.querySelector('.chat-send');
  }

  setupEventListeners() {
    this.sendButton?.addEventListener('click', () => this.sendMessage());
    
    this.inputField?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  async sendMessage() {
    const input = this.container.querySelector('.chat-input');
    if (input instanceof HTMLInputElement && input.value.trim()) {
      const message = input.value.trim();
      input.value = '';
      
      this.addMessage('user', message);
      await this.processMessage(message);
    }
  }

  async processMessage(message) {
    // Add thinking indicator
    const thinkingId = this.addMessage('ai', 'Thinking...', true);

    try {
      // Send to AI
      const response = await chrome.runtime.sendMessage({
        command: 'CHAT_WITH_AI',
        payload: { message, history: this.messages }
      });

      // Remove thinking indicator
      this.removeMessage(thinkingId);

      if (response?.success && response.data?.content) {
        this.addMessage('ai', response.data.content);
      } else {
        this.addMessage('ai', 'Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      this.removeMessage(thinkingId);
      this.addMessage('ai', 'Sorry, I encountered an error. Please try again.');
      console.error('Chat error:', error);
    }
  }

  addMessage(type, content, isTemporary = false) {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const message = {
      id: messageId,
      type,
      content,
      timestamp: new Date(),
      isTemporary
    };

    if (!isTemporary) {
      this.messages.push(message);
    }

    if (this.messagesContainer) {
      const messageElement = document.createElement('div');
      messageElement.className = `chat-message chat-message--${type}`;
      messageElement.id = messageId;
      messageElement.innerHTML = `
        <div class="chat-message-content">${this.escapeHtml(content)}</div>
        <div class="chat-message-time">${message.timestamp.toLocaleTimeString()}</div>
      `;

      this.messagesContainer.appendChild(messageElement);
      this.scrollToBottom();
    }

    return messageId;
  }

  removeMessage(messageId) {
    const element = document.getElementById(messageId);
    if (element) {
      element.remove();
    }
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  clear() {
    this.messages = [];
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
  }
}
