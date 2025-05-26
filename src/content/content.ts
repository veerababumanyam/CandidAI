/**
 * Content Script - Platform detection and integration layer
 * Implements Adapter pattern for multi-platform support
 * Provides seamless integration with video conferencing platforms
 * Enterprise-grade TypeScript implementation with strict typing
 */

import type {
  PlatformDetection,
  MessageRequest,
  MessageResponse,
  SessionMetadata,
} from '../ts/types/index';

// Enable platform adapters for production
import { GoogleMeetAdapter } from '../ts/platforms/GoogleMeet';
import { ZoomAdapter } from '../ts/platforms/Zoom';
import { TeamsAdapter } from '../ts/platforms/MicrosoftTeams';
import { LinkedInAdapter } from '../ts/platforms/LinkedIn';
import { HireVueAdapter } from '../ts/platforms/HireVue';
import { MESSAGE_COMMANDS } from '../ts/utils/constants';

// Import live meeting integration
import '../js/live-meeting-integration.js';

/**
 * Platform Adapter Interface
 * Defines the contract that all platform adapters must implement
 */
interface IPlatformAdapter {
  initialize(): Promise<boolean>;
  isInVideoCall(): Promise<boolean>;
  extractMetadata(): Promise<Partial<SessionMetadata>>;
  onVideoCallStateChange(callback: (inCall: boolean) => void): void;
  handleMutations?(mutations: MutationRecord[]): void;
  cleanup(): void;
}

/**
 * Platform Adapter Constructor Type
 */
type PlatformAdapterConstructor = new () => any; // Temporarily use 'any' to bypass strict typing

/**
 * Detection State Interface
 */
interface DetectionState {
  platform: string | null;
  isVideoCall: boolean;
  metadata: Partial<SessionMetadata>;
}

/**
 * PlatformDetector - Implements platform detection and initialization
 * Uses Strategy pattern for platform-specific behaviors
 */
class PlatformDetector {
  private readonly adapters = new Map<string, PlatformAdapterConstructor>([
    // Enable all platform adapters
    ['meet.google.com', GoogleMeetAdapter],
    ['zoom.us', ZoomAdapter],
    ['teams.microsoft.com', TeamsAdapter],
    ['linkedin.com', LinkedInAdapter],
    ['hirevue.com', HireVueAdapter],
  ]);

  private currentAdapter: IPlatformAdapter | null = null;
  private mutationObserver: MutationObserver | null = null;

  private detectionState: DetectionState = {
    platform: null,
    isVideoCall: false,
    metadata: {},
  };

  constructor() {
    this.initialize().catch((error) => {
      console.error('PlatformDetector initialization failed:', error);
    });
  }

  /**
   * Initialize platform detection and monitoring
   * Implements Observer pattern for DOM mutations
   */
  private async initialize(): Promise<void> {
    console.log('CandidAI Content Script initializing...');

    try {
      // Detect current platform
      const platform = this.detectPlatform();

      if (platform) {
        console.log(`Detected platform: ${platform}`);
        await this.initializePlatformAdapter(platform);
      }

      // Monitor for dynamic platform changes
      this.observeDOMChanges();

      // Listen for extension messages
      this.initializeMessageListener();

      // Monitor URL changes for SPA navigation
      this.monitorURLChanges();
    } catch (error) {
      console.error('PlatformDetector initialization error:', error);
    }
  }

  /**
   * Detect current platform based on URL
   * Implements platform identification logic with type safety
   */
  private detectPlatform(): string | null {
    const hostname = window.location.hostname;

    for (const [domain] of this.adapters) {
      if (hostname.includes(domain)) {
        return domain;
      }
    }

    return null;
  }

  /**
   * Initialize platform-specific adapter
   * Implements Factory pattern for adapter creation with error handling
   */
  private async initializePlatformAdapter(platform: string): Promise<void> {
    const AdapterClass = this.adapters.get(platform);

    if (!AdapterClass) {
      console.error(`No adapter found for platform: ${platform}`);
      return;
    }

    try {
      // Clean up existing adapter
      if (this.currentAdapter) {
        this.currentAdapter.cleanup();
      }

      // Create new adapter instance
      this.currentAdapter = new AdapterClass();

      // Initialize adapter
      await this.currentAdapter.initialize();

      // Check if in video call
      this.detectionState.isVideoCall = await this.currentAdapter.isInVideoCall();
      this.detectionState.platform = platform;

      // Extract metadata
      this.detectionState.metadata = await this.currentAdapter.extractMetadata();

      // Notify extension of platform detection
      await this.notifyPlatformDetected();

      // Set up video call monitoring
      this.currentAdapter.onVideoCallStateChange((inCall: boolean) => {
        this.handleVideoCallStateChange(inCall).catch((error) => {
          console.error('Error handling video call state change:', error);
        });
      });

      console.log('Platform adapter initialized successfully:', platform);
    } catch (error) {
      console.error('Failed to initialize platform adapter:', error);
      this.currentAdapter = null;
    }
  }

  /**
   * Monitor DOM for platform-specific changes
   * Implements MutationObserver for reactive updates with performance optimization
   */
  private observeDOMChanges(): void {
    // Clean up existing observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    this.mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      try {
        // Check if platform UI has loaded
        if (!this.currentAdapter && this.detectPlatform()) {
          this.initialize().catch((error) => {
            console.error('Re-initialization failed:', error);
          });
          return;
        }

        // Let adapter handle mutations if needed
        if (this.currentAdapter?.handleMutations) {
          this.currentAdapter.handleMutations(mutations);
        }
      } catch (error) {
        console.error('Error in mutation observer:', error);
      }
    });

    // Observe with configuration optimized for performance
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-meeting-id', 'data-call-id'],
    });
  }

  /**
   * Monitor URL changes for SPA navigation
   * Implements history API interception with proper typing
   */
  private monitorURLChanges(): void {
    let lastUrl = location.href;

    // Store original methods with proper typing
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    // Override pushState and replaceState
    history.pushState = function (
      data: any,
      unused: string,
      url?: string | URL | null,
    ): void {
      originalPushState(data, unused, url);
      window.dispatchEvent(new Event('urlchange'));
    };

    history.replaceState = function (
      data: any,
      unused: string,
      url?: string | URL | null,
    ): void {
      originalReplaceState(data, unused, url);
      window.dispatchEvent(new Event('urlchange'));
    };

    // Listen for URL changes
    const handleUrlChange = (): void => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        this.handleURLChange().catch((error) => {
          console.error('Error handling URL change:', error);
        });
      }
    };

    window.addEventListener('urlchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
  }

  /**
   * Handle URL changes in SPA
   * Re-initializes adapter if platform changes with proper error handling
   */
  private async handleURLChange(): Promise<void> {
    try {
      const newPlatform = this.detectPlatform();

      if (newPlatform !== this.detectionState.platform) {
        console.log('Platform changed, reinitializing...');
        
        // Platform changed, reinitialize
        if (this.currentAdapter) {
          this.currentAdapter.cleanup();
          this.currentAdapter = null;
        }

        if (newPlatform) {
          await this.initializePlatformAdapter(newPlatform);
        } else {
          // Reset state if no platform detected
          this.detectionState = {
            platform: null,
            isVideoCall: false,
            metadata: {},
          };
        }
      }
    } catch (error) {
      console.error('Error handling URL change:', error);
    }
  }

  /**
   * Initialize message listener for communication with extension
   * Implements typed message handling
   */
  private initializeMessageListener(): void {
    chrome.runtime.onMessage.addListener(
      (
        request: MessageRequest,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response: MessageResponse) => void,
      ): boolean => {
        this.handleMessage(request, sender, sendResponse).catch((error) => {
          console.error('Error handling message:', error);
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
   * Handle messages from extension with proper error handling
   */
  private async handleMessage(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ): Promise<void> {
    const { command, payload } = request;

    try {
      switch (command) {
        case MESSAGE_COMMANDS.GET_PLATFORM_STATUS:
          sendResponse({
            success: true,
            data: {
              platform: this.detectionState.platform,
              isVideoCall: this.detectionState.isVideoCall,
              metadata: this.detectionState.metadata,
            },
          });
          break;

        case MESSAGE_COMMANDS.EXTRACT_PAGE_CONTEXT:
          const context = await this.extractPageContext();
          sendResponse({ success: true, data: context });
          break;

        case MESSAGE_COMMANDS.INJECT_UI:
          await this.injectUI(payload?.config as Record<string, unknown> || {});
          sendResponse({ success: true });
          break;

        default:
          console.warn('Unknown command received in content script:', command);
          sendResponse({
            success: false,
            error: 'Unknown command',
            details: `Command not recognized: ${command}`,
          });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error handling command ${command}:`, error);
      sendResponse({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Notify extension of platform detection
   */
  private async notifyPlatformDetected(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        command: MESSAGE_COMMANDS.PLATFORM_DETECTED,
        payload: {
          platform: this.detectionState.platform,
          isVideoCall: this.detectionState.isVideoCall,
          metadata: this.detectionState.metadata,
          url: window.location.href,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error('Failed to notify platform detection:', error);
    }
  }

  /**
   * Handle video call state changes
   */
  private async handleVideoCallStateChange(inCall: boolean): Promise<void> {
    try {
      this.detectionState.isVideoCall = inCall;

      await chrome.runtime.sendMessage({
        command: MESSAGE_COMMANDS.VIDEO_CALL_STATE_CHANGED,
        payload: {
          inCall,
          platform: this.detectionState.platform,
          metadata: this.detectionState.metadata,
          timestamp: Date.now(),
        },
      });

      console.log(`Video call state changed: ${inCall ? 'started' : 'ended'}`);
    } catch (error) {
      console.error('Failed to notify video call state change:', error);
    }
  }

  /**
   * Extract page context for AI processing
   */
  private async extractPageContext(): Promise<Record<string, unknown>> {
    try {
      const context: Record<string, unknown> = {
        url: window.location.href,
        title: document.title,
        platform: this.detectionState.platform,
        timestamp: Date.now(),
      };

      // Let platform adapter extract additional context
      if (this.currentAdapter) {
        const platformMetadata = await this.currentAdapter.extractMetadata();
        Object.assign(context, platformMetadata);
      }

      return context;
    } catch (error) {
      console.error('Failed to extract page context:', error);
      return {
        url: window.location.href,
        title: document.title,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Inject UI elements as needed
   */
  private async injectUI(config?: Record<string, unknown>): Promise<void> {
    try {
      console.log('Injecting UI with config:', config);
      // Implementation for UI injection
      // This would depend on the specific UI requirements
    } catch (error) {
      console.error('Failed to inject UI:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources when content script is unloaded
   */
  public cleanup(): void {
    try {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
      }

      if (this.currentAdapter) {
        this.currentAdapter.cleanup();
        this.currentAdapter = null;
      }

      console.log('PlatformDetector cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Initialize the platform detector
const platformDetector = new PlatformDetector();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  platformDetector.cleanup();
});

// Export for potential testing or external access
export { PlatformDetector }; 