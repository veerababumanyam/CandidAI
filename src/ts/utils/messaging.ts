/**
 * Message Broker - Enterprise-grade messaging system
 * Implements type-safe communication between extension components
 * Provides error handling, retry logic, and performance monitoring
 */

import type { MessageRequest, MessageResponse, ChromeSender } from '../types/index';
import { MESSAGE_COMMANDS, MESSAGE_TARGETS } from './constants';

/**
 * Message Handler Interface
 */
export interface MessageHandler {
  command: string;
  handler: (
    request: MessageRequest,
    sender: ChromeSender,
    sendResponse: (response: MessageResponse) => void,
  ) => void | Promise<void>;
}

/**
 * Message Broker Configuration
 */
export interface MessageBrokerConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
}

/**
 * Default configuration for message broker
 */
const DEFAULT_CONFIG: MessageBrokerConfig = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  enableLogging: true,
};

/**
 * MessageBroker - Centralized message handling system
 * Implements enterprise patterns for reliable communication
 */
export class MessageBroker {
  private readonly config: MessageBrokerConfig;
  private readonly handlers = new Map<string, MessageHandler['handler']>();
  private readonly pendingRequests = new Map<string, {
    resolve: (value: MessageResponse) => void;
    reject: (reason: Error) => void;
    timeout: number;
  }>();

  constructor(config: Partial<MessageBrokerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeMessageListener();
  }

  /**
   * Initialize the message listener for incoming messages
   */
  private initializeMessageListener(): void {
    chrome.runtime.onMessage.addListener(
      (
        request: MessageRequest,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response: MessageResponse) => void,
      ): boolean => {
        this.handleIncomingMessage(request, sender, sendResponse).catch((error) => {
          console.error('Error handling incoming message:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });

        return true; // Keep message channel open for async response
      },
    );
  }

  /**
   * Handle incoming messages with proper error boundaries
   */
  private async handleIncomingMessage(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ): Promise<void> {
    const { command } = request;

    if (this.config.enableLogging) {
      console.log(`[MessageBroker] Received command: ${command}`, request);
    }

    const handler = this.handlers.get(command);
    if (!handler) {
      sendResponse({
        success: false,
        error: 'Unknown command',
        details: `No handler registered for command: ${command}`,
      });
      return;
    }

    try {
      await handler(request, sender as ChromeSender, sendResponse);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in handler for command ${command}:`, error);
      sendResponse({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Register a message handler for a specific command
   */
  public registerHandler(command: string, handler: MessageHandler['handler']): void {
    if (this.handlers.has(command)) {
      console.warn(`[MessageBroker] Overwriting existing handler for command: ${command}`);
    }

    this.handlers.set(command, handler);

    if (this.config.enableLogging) {
      console.log(`[MessageBroker] Registered handler for command: ${command}`);
    }
  }

  /**
   * Unregister a message handler
   */
  public unregisterHandler(command: string): boolean {
    const removed = this.handlers.delete(command);

    if (this.config.enableLogging && removed) {
      console.log(`[MessageBroker] Unregistered handler for command: ${command}`);
    }

    return removed;
  }

  /**
   * Send a message with retry logic and timeout handling
   */
  public async sendMessage(
    request: MessageRequest,
    tabId?: number,
  ): Promise<MessageResponse> {
    const requestId = this.generateRequestId();
    const requestWithId = { ...request, requestId, timestamp: Date.now() };

    if (this.config.enableLogging) {
      console.log(`[MessageBroker] Sending message:`, requestWithId);
    }

    return this.sendMessageWithRetry(requestWithId, tabId, 0);
  }

  /**
   * Send message with retry logic
   */
  private async sendMessageWithRetry(
    request: MessageRequest,
    tabId: number | undefined,
    attempt: number,
  ): Promise<MessageResponse> {
    try {
      return await this.sendSingleMessage(request, tabId);
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        if (this.config.enableLogging) {
          console.warn(
            `[MessageBroker] Retry attempt ${attempt + 1} for message:`,
            request.command,
          );
        }

        await this.delay(this.config.retryDelay * (attempt + 1));
        return this.sendMessageWithRetry(request, tabId, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Send a single message with timeout handling
   */
  private async sendSingleMessage(
    request: MessageRequest,
    tabId?: number,
  ): Promise<MessageResponse> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Message timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      const responseHandler = (response: MessageResponse): void => {
        clearTimeout(timeout);

        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!response) {
          reject(new Error('No response received'));
          return;
        }

        resolve(response);
      };

      try {
        if (tabId) {
          chrome.tabs.sendMessage(tabId, request, responseHandler);
        } else {
          chrome.runtime.sendMessage(request, responseHandler);
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Send a message to a specific tab
   */
  public async sendMessageToTab(
    tabId: number,
    request: MessageRequest,
  ): Promise<MessageResponse> {
    return this.sendMessage(request, tabId);
  }

  /**
   * Send a message to the service worker
   */
  public async sendMessageToServiceWorker(
    request: MessageRequest,
  ): Promise<MessageResponse> {
    return this.sendMessage({ ...request, target: MESSAGE_TARGETS.SERVICE_WORKER });
  }

  /**
   * Send a message to content script
   */
  public async sendMessageToContentScript(
    tabId: number,
    request: MessageRequest,
  ): Promise<MessageResponse> {
    return this.sendMessageToTab(tabId, {
      ...request,
      target: MESSAGE_TARGETS.CONTENT_SCRIPT,
    });
  }

  /**
   * Broadcast a message to all tabs
   */
  public async broadcastMessage(request: MessageRequest): Promise<MessageResponse[]> {
    try {
      const tabs = await chrome.tabs.query({});
      const promises = tabs
        .filter((tab) => tab.id !== undefined)
        .map((tab) => this.sendMessageToTab(tab.id!, request).catch(() => null));

      const results = await Promise.all(promises);
      return results.filter((result): result is MessageResponse => result !== null);
    } catch (error) {
      console.error('Error broadcasting message:', error);
      return [];
    }
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get registered handlers (for debugging)
   */
  public getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all handlers
   */
  public clearHandlers(): void {
    this.handlers.clear();

    if (this.config.enableLogging) {
      console.log('[MessageBroker] All handlers cleared');
    }
  }

  /**
   * Get broker statistics
   */
  public getStats(): {
    handlersCount: number;
    pendingRequestsCount: number;
  } {
    return {
      handlersCount: this.handlers.size,
      pendingRequestsCount: this.pendingRequests.size,
    };
  }
}
