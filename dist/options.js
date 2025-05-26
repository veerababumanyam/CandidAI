/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/utils/constants.ts":
/*!***********************************!*\
  !*** ./src/ts/utils/constants.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AUDIO_CONFIG: () => (/* binding */ AUDIO_CONFIG),
/* harmony export */   CALL_TYPES: () => (/* binding */ CALL_TYPES),
/* harmony export */   CALL_TYPE_CONFIGS: () => (/* binding */ CALL_TYPE_CONFIGS),
/* harmony export */   DEFAULT_APP_CONFIG: () => (/* binding */ DEFAULT_APP_CONFIG),
/* harmony export */   DOCUMENT_PROCESSING_CONFIG: () => (/* binding */ DOCUMENT_PROCESSING_CONFIG),
/* harmony export */   DOCUMENT_TYPES: () => (/* binding */ DOCUMENT_TYPES),
/* harmony export */   ERROR_CODES: () => (/* binding */ ERROR_CODES),
/* harmony export */   LLM_PROVIDERS: () => (/* binding */ LLM_PROVIDERS),
/* harmony export */   MAX_DOCUMENTS: () => (/* binding */ MAX_DOCUMENTS),
/* harmony export */   MAX_DOCUMENT_SIZE: () => (/* binding */ MAX_DOCUMENT_SIZE),
/* harmony export */   MESSAGE_COMMANDS: () => (/* binding */ MESSAGE_COMMANDS),
/* harmony export */   MESSAGE_TARGETS: () => (/* binding */ MESSAGE_TARGETS),
/* harmony export */   OFFSCREEN_DOCUMENT_PATH: () => (/* binding */ OFFSCREEN_DOCUMENT_PATH),
/* harmony export */   OFFSCREEN_JUSTIFICATION: () => (/* binding */ OFFSCREEN_JUSTIFICATION),
/* harmony export */   OFFSCREEN_REASONS: () => (/* binding */ OFFSCREEN_REASONS),
/* harmony export */   PERFORMANCE_THRESHOLDS: () => (/* binding */ PERFORMANCE_THRESHOLDS),
/* harmony export */   PORT_COMMANDS: () => (/* binding */ PORT_COMMANDS),
/* harmony export */   PRIORITY_LEVELS: () => (/* binding */ PRIORITY_LEVELS),
/* harmony export */   SECURITY_CONSTANTS: () => (/* binding */ SECURITY_CONSTANTS),
/* harmony export */   STORAGE_KEYS: () => (/* binding */ STORAGE_KEYS),
/* harmony export */   SUPPORTED_DOCUMENT_FORMATS: () => (/* binding */ SUPPORTED_DOCUMENT_FORMATS),
/* harmony export */   SUPPORTED_PLATFORMS: () => (/* binding */ SUPPORTED_PLATFORMS),
/* harmony export */   TONE_CONFIGS: () => (/* binding */ TONE_CONFIGS),
/* harmony export */   TONE_TYPES: () => (/* binding */ TONE_TYPES),
/* harmony export */   UI_CONSTANTS: () => (/* binding */ UI_CONSTANTS)
/* harmony export */ });
/**
 * CandidAI Chrome Extension - Constants
 * Centralized configuration and constants for enterprise-grade development
 * Implements type-safe constants with proper categorization
 */
// =============================================================================
// MESSAGE COMMANDS
// =============================================================================
const MESSAGE_COMMANDS = {
    // Session Management
    INIT_INTERVIEW_SESSION: 'init_interview_session',
    END_INTERVIEW_SESSION: 'end_interview_session',
    UPDATE_CONTEXT: 'update_context',
    GET_APP_STATE: 'get_app_state',
    // Transcription
    START_TRANSCRIPTION: 'start_transcription',
    STOP_TRANSCRIPTION: 'stop_transcription',
    PROCESS_TRANSCRIPTION: 'process_transcription',
    // Audio Processing
    START_AUDIO_CAPTURE: 'start_audio_capture',
    STOP_AUDIO_CAPTURE: 'stop_audio_capture',
    AUDIO_DATA: 'audio_data',
    // Platform Detection
    PLATFORM_DETECTED: 'platform_detected',
    GET_PLATFORM_STATUS: 'get_platform_status',
    VIDEO_CALL_STATE_CHANGED: 'video_call_state_changed',
    // Content Script
    EXTRACT_PAGE_CONTEXT: 'extract_page_context',
    INJECT_UI: 'inject_ui',
    // Visual Analysis
    CAPTURE_VISUAL: 'capture_visual',
    ANALYZE_VISUAL: 'analyze_visual',
    // Document Management
    UPLOAD_DOCUMENT: 'upload_document',
    PROCESS_DOCUMENT: 'process_document',
    GET_DOCUMENTS: 'get_documents',
    // AI Responses
    GET_SUGGESTION: 'get_suggestion',
    GENERATE_RESPONSE: 'generate_response',
    // Testing
    TEST_LLM_CONNECTION: 'test_llm_connection',
    TEST_PLATFORM_DETECTION: 'test_platform_detection',
    PING: 'ping',
};
// =============================================================================
// MESSAGE TARGETS
// =============================================================================
const MESSAGE_TARGETS = {
    SERVICE_WORKER: 'service_worker',
    CONTENT_SCRIPT: 'content_script',
    SIDE_PANEL: 'side_panel',
    OPTIONS_PAGE: 'options_page',
    OFFSCREEN: 'offscreen',
};
// =============================================================================
// PORT COMMANDS
// =============================================================================
const PORT_COMMANDS = {
    SERVICE_WORKER_READY: 'service_worker_ready',
    SIDE_PANEL_READY: 'side_panel_ready',
    CONNECTION_ESTABLISHED: 'connection_established',
    HEARTBEAT: 'heartbeat',
};
// =============================================================================
// STORAGE KEYS
// =============================================================================
const STORAGE_KEYS = {
    APP_CONFIG: 'app_config',
    USER_PREFERENCES: 'user_preferences',
    SESSION_DATA: 'session_data',
    ACTIVE_INTERVIEW: 'active_interview',
    DOCUMENT_CACHE: 'document_cache',
    PERFORMANCE_METRICS: 'performance_metrics',
    ERROR_LOGS: 'error_logs',
    AUDIT_TRAIL: 'audit_trail',
};
// =============================================================================
// OFFSCREEN DOCUMENT CONFIGURATION
// =============================================================================
const OFFSCREEN_DOCUMENT_PATH = 'offscreen/offscreen.html';
const OFFSCREEN_REASONS = (typeof chrome !== 'undefined' && chrome.offscreen) ? [
    chrome.offscreen.Reason.USER_MEDIA,
    chrome.offscreen.Reason.AUDIO_PLAYBACK,
] : ['USER_MEDIA', 'AUDIO_PLAYBACK'];
const OFFSCREEN_JUSTIFICATION = 'Recording audio for AI-powered meeting assistance and transcription';
// =============================================================================
// PLATFORM CONFIGURATIONS
// =============================================================================
const SUPPORTED_PLATFORMS = {
    GOOGLE_MEET: {
        name: 'Google Meet',
        domain: 'meet.google.com',
        selectors: {
            videoContainer: '[data-allocation-index]',
            participantsList: '[data-participant-id]',
            chatButton: '[data-tooltip*="chat"]',
            micButton: '[data-tooltip*="microphone"]',
            cameraButton: '[data-tooltip*="camera"]',
        },
    },
    ZOOM: {
        name: 'Zoom',
        domain: 'zoom.us',
        selectors: {
            videoContainer: '.video-container',
            participantsList: '.participants-list',
            chatButton: '.chat-button',
            micButton: '.audio-button',
            cameraButton: '.video-button',
        },
    },
    MICROSOFT_TEAMS: {
        name: 'Microsoft Teams',
        domain: 'teams.microsoft.com',
        selectors: {
            videoContainer: '[data-tid="video-container"]',
            participantsList: '[data-tid="participants-list"]',
            chatButton: '[data-tid="chat-button"]',
            micButton: '[data-tid="microphone-button"]',
            cameraButton: '[data-tid="camera-button"]',
        },
    },
    LINKEDIN: {
        name: 'LinkedIn',
        domain: 'linkedin.com',
        selectors: {
            interviewContainer: '.interview-container',
            questionText: '.question-text',
            answerInput: '.answer-input',
            submitButton: '.submit-button',
        },
    },
    HIREVUE: {
        name: 'HireVue',
        domain: 'hirevue.com',
        selectors: {
            questionContainer: '.question-container',
            videoPlayer: '.video-player',
            recordButton: '.record-button',
            submitButton: '.submit-button',
        },
    },
};
// =============================================================================
// LLM PROVIDER CONFIGURATIONS
// =============================================================================
const LLM_PROVIDERS = {
    OPENAI: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        maxTokens: 4096,
        rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 90000,
            dailyLimit: 1000000,
        },
    },
    ANTHROPIC: {
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        maxTokens: 4096,
        rateLimits: {
            requestsPerMinute: 50,
            tokensPerMinute: 40000,
            dailyLimit: 500000,
        },
    },
    GOOGLE: {
        name: 'Google',
        baseUrl: 'https://generativelanguage.googleapis.com/v1',
        models: ['gemini-pro', 'gemini-pro-vision'],
        maxTokens: 2048,
        rateLimits: {
            requestsPerMinute: 60,
            tokensPerMinute: 32000,
            dailyLimit: 1000000,
        },
    },
};
// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================
const DEFAULT_APP_CONFIG = {
    version: '1.0.0',
    environment: 'production',
    features: {
        enableTranscription: true,
        enableAIResponses: true,
        enableDocumentAnalysis: true,
        enableVisualAnalysis: true,
        enablePerformanceTracking: true,
        enableDebugMode: false,
    },
    llmProviders: [
        {
            name: 'OpenAI',
            apiKey: '',
            baseUrl: LLM_PROVIDERS.OPENAI.baseUrl,
            model: 'gpt-4',
            maxTokens: 2048,
            temperature: 0.7,
            isEnabled: false,
            priority: 1,
            rateLimits: LLM_PROVIDERS.OPENAI.rateLimits,
        },
        {
            name: 'Anthropic',
            apiKey: '',
            baseUrl: LLM_PROVIDERS.ANTHROPIC.baseUrl,
            model: 'claude-3-sonnet',
            maxTokens: 2048,
            temperature: 0.7,
            isEnabled: false,
            priority: 2,
            rateLimits: LLM_PROVIDERS.ANTHROPIC.rateLimits,
        },
    ],
    ui: {
        theme: 'auto',
        language: 'en',
        fontSize: 'medium',
        animations: true,
        notifications: true,
    },
    security: {
        encryptStorage: true,
        validateInputs: true,
        rateLimiting: true,
        auditLogging: true,
        csrfProtection: true,
    },
    performance: {
        enableMetrics: true,
        sampleRate: 0.1,
        maxHistorySize: 1000,
        alertThresholds: {
            responseTime: 5000,
            errorRate: 0.05,
            memoryUsage: 100 * 1024 * 1024, // 100MB
        },
    },
};
// =============================================================================
// AUDIO CONFIGURATION
// =============================================================================
const AUDIO_CONFIG = {
    SAMPLE_RATE: 16000,
    CHANNELS: 1,
    BIT_DEPTH: 16,
    BUFFER_SIZE: 4096,
    SILENCE_THRESHOLD: 0.01,
    SILENCE_DURATION: 1000, // ms
    MAX_RECORDING_DURATION: 300000, // 5 minutes
};
// =============================================================================
// UI CONSTANTS
// =============================================================================
const UI_CONSTANTS = {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOAST_DURATION: 5000,
    MAX_SUGGESTIONS: 5,
    MAX_CONVERSATION_HISTORY: 100,
    SCROLL_THRESHOLD: 100,
};
// =============================================================================
// ERROR CODES
// =============================================================================
const ERROR_CODES = {
    // General
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    // Authentication
    API_KEY_MISSING: 'API_KEY_MISSING',
    API_KEY_INVALID: 'API_KEY_INVALID',
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    // Network
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    // Audio
    AUDIO_PERMISSION_DENIED: 'AUDIO_PERMISSION_DENIED',
    AUDIO_DEVICE_ERROR: 'AUDIO_DEVICE_ERROR',
    TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
    // Platform
    PLATFORM_NOT_SUPPORTED: 'PLATFORM_NOT_SUPPORTED',
    PLATFORM_DETECTION_FAILED: 'PLATFORM_DETECTION_FAILED',
    // Document
    DOCUMENT_UPLOAD_FAILED: 'DOCUMENT_UPLOAD_FAILED',
    DOCUMENT_PROCESSING_FAILED: 'DOCUMENT_PROCESSING_FAILED',
    DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',
    // Storage
    STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
    STORAGE_ACCESS_DENIED: 'STORAGE_ACCESS_DENIED',
};
// =============================================================================
// PERFORMANCE THRESHOLDS
// =============================================================================
const PERFORMANCE_THRESHOLDS = {
    RESPONSE_TIME_WARNING: 2000, // ms
    RESPONSE_TIME_ERROR: 5000, // ms
    MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
    MEMORY_ERROR: 100 * 1024 * 1024, // 100MB
    ERROR_RATE_WARNING: 0.02, // 2%
    ERROR_RATE_ERROR: 0.05, // 5%
};
// =============================================================================
// SECURITY CONSTANTS
// =============================================================================
const SECURITY_CONSTANTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['pdf', 'docx', 'txt', 'md'],
    MAX_API_KEY_LENGTH: 256,
    MIN_PASSWORD_LENGTH: 8,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    ENCRYPTION_ALGORITHM: 'AES-GCM',
};
// =============================================================================
// UI CONFIGURATION CONSTANTS
// =============================================================================
const CALL_TYPES = {
    INTERVIEW: 'interview',
    MEETING: 'meeting',
    PRESENTATION: 'presentation',
    TRAINING: 'training',
};
const TONE_TYPES = {
    PROFESSIONAL: 'professional',
    CASUAL: 'casual',
    FORMAL: 'formal',
    FRIENDLY: 'friendly',
};
const CALL_TYPE_CONFIGS = {
    [CALL_TYPES.INTERVIEW]: {
        name: 'Interview',
        description: 'One-on-one interview session',
        suggestedTone: TONE_TYPES.PROFESSIONAL,
        features: ['transcription', 'suggestions', 'document_analysis'],
    },
    [CALL_TYPES.MEETING]: {
        name: 'Meeting',
        description: 'Team meeting or group discussion',
        suggestedTone: TONE_TYPES.PROFESSIONAL,
        features: ['transcription', 'action_items', 'summary'],
    },
    [CALL_TYPES.PRESENTATION]: {
        name: 'Presentation',
        description: 'Presentation or demo session',
        suggestedTone: TONE_TYPES.FORMAL,
        features: ['visual_analysis', 'audience_feedback'],
    },
    [CALL_TYPES.TRAINING]: {
        name: 'Training',
        description: 'Training or educational session',
        suggestedTone: TONE_TYPES.FRIENDLY,
        features: ['knowledge_base', 'q_and_a'],
    },
};
const TONE_CONFIGS = {
    [TONE_TYPES.PROFESSIONAL]: {
        name: 'Professional',
        description: 'Formal business communication',
        style: 'structured',
        vocabulary: 'business',
    },
    [TONE_TYPES.CASUAL]: {
        name: 'Casual',
        description: 'Relaxed conversational style',
        style: 'informal',
        vocabulary: 'everyday',
    },
    [TONE_TYPES.FORMAL]: {
        name: 'Formal',
        description: 'Academic or official communication',
        style: 'precise',
        vocabulary: 'formal',
    },
    [TONE_TYPES.FRIENDLY]: {
        name: 'Friendly',
        description: 'Warm and approachable communication',
        style: 'conversational',
        vocabulary: 'accessible',
    },
};
// =============================================================================
// DOCUMENT MANAGEMENT CONSTANTS
// =============================================================================
const MAX_DOCUMENTS = 10;
const SUPPORTED_DOCUMENT_FORMATS = [
    'pdf',
    'docx',
    'txt',
    'md',
    'doc',
    'rtf',
];
// =============================================================================
// DOCUMENT PROCESSING CONSTANTS
// =============================================================================
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const DOCUMENT_TYPES = {
    RESUME: 'resume',
    JOB_DESCRIPTION: 'job_description',
    COVER_LETTER: 'cover_letter',
    PORTFOLIO: 'portfolio',
    REFERENCE: 'reference',
    OTHER: 'other',
};
const PRIORITY_LEVELS = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
    CRITICAL: 5,
};
const DOCUMENT_PROCESSING_CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown',
        'application/rtf',
    ],
    PROCESSING_TIMEOUT: 30000, // 30 seconds
};


/***/ }),

/***/ "./src/ts/utils/messaging.ts":
/*!***********************************!*\
  !*** ./src/ts/utils/messaging.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MessageBroker: () => (/* binding */ MessageBroker)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/ts/utils/constants.ts");
/**
 * Message Broker - Enterprise-grade messaging system
 * Implements type-safe communication between extension components
 * Provides error handling, retry logic, and performance monitoring
 */

/**
 * Default configuration for message broker
 */
const DEFAULT_CONFIG = {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    enableLogging: true,
};
/**
 * MessageBroker - Centralized message handling system
 * Implements enterprise patterns for reliable communication
 */
class MessageBroker {
    config;
    handlers = new Map();
    pendingRequests = new Map();
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.initializeMessageListener();
    }
    /**
     * Initialize the message listener for incoming messages
     */
    initializeMessageListener() {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.handleIncomingMessage(request, sender, sendResponse).catch((error) => {
                    console.error('Error handling incoming message:', error);
                    sendResponse({
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                });
                return true; // Keep message channel open for async response
            });
        }
        else {
            console.warn('Chrome extension APIs not available in this environment');
        }
    }
    /**
     * Handle incoming messages with proper error boundaries
     */
    async handleIncomingMessage(request, sender, sendResponse) {
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
            await handler(request, sender, sendResponse);
        }
        catch (error) {
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
    registerHandler(command, handler) {
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
    unregisterHandler(command) {
        const removed = this.handlers.delete(command);
        if (this.config.enableLogging && removed) {
            console.log(`[MessageBroker] Unregistered handler for command: ${command}`);
        }
        return removed;
    }
    /**
     * Send a message with retry logic and timeout handling
     */
    async sendMessage(request, tabId) {
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
    async sendMessageWithRetry(request, tabId, attempt) {
        try {
            return await this.sendSingleMessage(request, tabId);
        }
        catch (error) {
            if (attempt < this.config.retryAttempts) {
                if (this.config.enableLogging) {
                    console.warn(`[MessageBroker] Retry attempt ${attempt + 1} for message:`, request.command);
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
    async sendSingleMessage(request, tabId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Message timeout after ${this.config.timeout}ms`));
            }, this.config.timeout);
            const responseHandler = (response) => {
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
                if (typeof chrome === 'undefined' || !chrome.runtime) {
                    clearTimeout(timeout);
                    reject(new Error('Chrome extension APIs not available'));
                    return;
                }
                if (tabId) {
                    chrome.tabs.sendMessage(tabId, request, responseHandler);
                }
                else {
                    chrome.runtime.sendMessage(request, responseHandler);
                }
            }
            catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    /**
     * Send a message to a specific tab
     */
    async sendMessageToTab(tabId, request) {
        return this.sendMessage(request, tabId);
    }
    /**
     * Send a command with payload - convenience method
     */
    async sendCommand(command, payload) {
        const request = {
            command,
            data: payload,
            timestamp: Date.now()
        };
        return this.sendMessage(request);
    }
    /**
     * Send a message to the service worker
     */
    async sendMessageToServiceWorker(request) {
        return this.sendMessage({ ...request, target: _constants__WEBPACK_IMPORTED_MODULE_0__.MESSAGE_TARGETS.SERVICE_WORKER });
    }
    /**
     * Send a message to content script
     */
    async sendMessageToContentScript(tabId, request) {
        return this.sendMessageToTab(tabId, {
            ...request,
            target: _constants__WEBPACK_IMPORTED_MODULE_0__.MESSAGE_TARGETS.CONTENT_SCRIPT,
        });
    }
    /**
     * Broadcast a message to all tabs
     */
    async broadcastMessage(request) {
        try {
            const tabs = await chrome.tabs.query({});
            const promises = tabs
                .filter((tab) => tab.id !== undefined)
                .map((tab) => this.sendMessageToTab(tab.id, request).catch(() => null));
            const results = await Promise.all(promises);
            return results.filter((result) => result !== null);
        }
        catch (error) {
            console.error('Error broadcasting message:', error);
            return [];
        }
    }
    /**
     * Generate a unique request ID
     */
    generateRequestId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Delay utility for retry logic
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Get registered handlers (for debugging)
     */
    getRegisteredHandlers() {
        return Array.from(this.handlers.keys());
    }
    /**
     * Clear all handlers
     */
    clearHandlers() {
        this.handlers.clear();
        if (this.config.enableLogging) {
            console.log('[MessageBroker] All handlers cleared');
        }
    }
    /**
     * Get broker statistics
     */
    getStats() {
        return {
            handlersCount: this.handlers.size,
            pendingRequestsCount: this.pendingRequests.size,
        };
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************************!*\
  !*** ./src/options/options.ts ***!
  \********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ts_utils_messaging__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ts/utils/messaging */ "./src/ts/utils/messaging.ts");
/**
 * CandidAI Options Page - Configuration Management Interface
 * Implements comprehensive settings management with enterprise patterns
 */

// =============================================================================
// OPTIONS CONTROLLER
// =============================================================================
/**
 * Options Page Controller - Manages extension configuration
 */
class OptionsController {
    messageBroker;
    state;
    constructor() {
        this.messageBroker = new _ts_utils_messaging__WEBPACK_IMPORTED_MODULE_0__.MessageBroker();
        this.state = {
            isDirty: false,
            isLoading: false,
            currentProvider: 'openai',
            apiKeys: {},
            configuration: {},
        };
        this.initializeEventListeners();
        this.loadConfiguration();
    }
    /**
     * Initialize event listeners for the options page
     */
    initializeEventListeners() {
        // Initialize navigation
        this.initializeNavigation();
        // API Key save buttons
        const saveApiKeysBtn = document.getElementById('save-api-keys');
        if (saveApiKeysBtn) {
            saveApiKeysBtn.addEventListener('click', this.saveApiKeys.bind(this));
        }
        // Test connection button
        const testConnectionBtn = document.getElementById('test-api-keys');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', this.testAPIConnections.bind(this));
        }
        // Save context button
        const saveContextBtn = document.getElementById('save-context');
        if (saveContextBtn) {
            saveContextBtn.addEventListener('click', this.saveContext.bind(this));
        }
        // Save LLM configuration
        const saveLlmConfigBtn = document.getElementById('save-llm-config');
        if (saveLlmConfigBtn) {
            saveLlmConfigBtn.addEventListener('click', this.saveLlmConfiguration.bind(this));
        }
        // Save transcription settings
        const saveTranscriptionBtn = document.getElementById('save-transcription');
        if (saveTranscriptionBtn) {
            saveTranscriptionBtn.addEventListener('click', this.saveTranscriptionSettings.bind(this));
        }
        // Save response style
        const saveResponseStyleBtn = document.getElementById('save-response-style');
        if (saveResponseStyleBtn) {
            saveResponseStyleBtn.addEventListener('click', this.saveResponseStyle.bind(this));
        }
        // Save language settings
        const saveLanguageBtn = document.getElementById('save-language');
        if (saveLanguageBtn) {
            saveLanguageBtn.addEventListener('click', this.saveLanguageSettings.bind(this));
        }
        // Test microphone button
        const testMicBtn = document.getElementById('test-microphone');
        if (testMicBtn) {
            testMicBtn.addEventListener('click', this.testMicrophone.bind(this));
        }
        // Preview style button
        const previewStyleBtn = document.getElementById('preview-style');
        if (previewStyleBtn) {
            previewStyleBtn.addEventListener('click', this.previewResponseStyle.bind(this));
        }
        // Export data button
        const exportDataBtn = document.getElementById('export-data');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', this.exportData.bind(this));
        }
        // Clear data button
        const clearDataBtn = document.getElementById('clear-data');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', this.clearAllData.bind(this));
        }
        // Calendar connect buttons
        document.querySelectorAll('[id$="-calendar-connect"]').forEach(btn => {
            btn.addEventListener('click', this.connectCalendar.bind(this));
        });
        // Initialize document upload handlers
        this.initializeDocumentUpload();
        // Initialize LLM reordering functionality
        this.initializeLLMReordering();
    }
    /**
     * Initialize navigation system for section switching
     */
    initializeNavigation() {
        // Get all navigation buttons
        const navButtons = document.querySelectorAll('.ca-nav__button');
        // Add click listeners to navigation buttons
        navButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const targetSection = button.getAttribute('data-section');
                if (targetSection) {
                    this.switchToSection(targetSection);
                }
            });
        });
        // Initialize with API Keys section active by default
        this.switchToSection('api-keys');
    }
    /**
     * Switch to a specific section
     */
    switchToSection(targetSectionName) {
        console.log(`🔄 Switching to section: ${targetSectionName}`);
        // Remove active class from all navigation buttons
        const allButtons = document.querySelectorAll('.ca-nav__button');
        console.log(`📍 Found ${allButtons.length} navigation buttons`);
        allButtons.forEach(btn => {
            btn.classList.remove('ca-nav__button--active');
        });
        // Add active class to target button
        const activeButton = document.querySelector(`[data-section="${targetSectionName}"]`);
        if (activeButton) {
            activeButton.classList.add('ca-nav__button--active');
            console.log(`✅ Activated button for: ${targetSectionName}`);
        }
        else {
            console.error(`❌ Button not found for section: ${targetSectionName}`);
        }
        // Hide all sections
        const allSections = document.querySelectorAll('.ca-section');
        console.log(`📍 Found ${allSections.length} sections`);
        allSections.forEach(section => {
            section.classList.remove('ca-section--active');
            section.style.display = 'none';
        });
        // Show target section
        const targetSection = document.querySelector(`#section-${targetSectionName}`);
        if (targetSection) {
            targetSection.classList.add('ca-section--active');
            targetSection.style.display = 'block';
            console.log(`✅ Showed section: section-${targetSectionName}`);
        }
        else {
            console.error(`❌ Section not found: section-${targetSectionName}`);
            // List all available sections for debugging
            const availableSections = document.querySelectorAll('[id^="section-"]');
            console.log('Available sections:', Array.from(availableSections).map(s => s.id));
        }
    }
    /**
     * Load current configuration from storage
     */
    async loadConfiguration() {
        try {
            this.state.isLoading = true;
            this.updateLoadingState(true);
            const config = await chrome.storage.sync.get();
            this.state.configuration = config;
            // Populate form fields
            this.populateApiKeys(config.apiKeys || {});
            this.populateLlmConfig(config.llmConfig || {});
            this.populateTranscriptionSettings(config.transcription || {});
            this.populateResponseStyle(config.responseStyle || {});
            this.populateLanguageSettings(config.language || {});
        }
        catch (error) {
            console.error('Error loading configuration:', error);
            this.showNotification('Failed to load configuration', 'error');
        }
        finally {
            this.state.isLoading = false;
            this.updateLoadingState(false);
        }
    }
    /**
     * Save API keys
     */
    async saveApiKeys() {
        try {
            const apiKeys = this.collectApiKeys();
            await chrome.storage.sync.set({ apiKeys });
            this.state.apiKeys = apiKeys;
            this.showNotification('API keys saved successfully', 'success');
        }
        catch (error) {
            console.error('Error saving API keys:', error);
            this.showNotification('Failed to save API keys', 'error');
        }
    }
    /**
     * Test API connection
     */
    async testConnection() {
        try {
            this.updateLoadingState(true);
            const response = await this.messageBroker.sendMessage({
                command: 'TEST_LLM_CONNECTION',
                payload: {
                    provider: this.state.currentProvider,
                    apiKeys: this.state.apiKeys,
                },
            });
            if (response.success) {
                this.showNotification('Connection successful!', 'success');
            }
            else {
                this.showNotification('Connection failed: ' + response.error, 'error');
            }
        }
        catch (error) {
            console.error('Error testing connection:', error);
            this.showNotification('Connection test failed', 'error');
        }
        finally {
            this.updateLoadingState(false);
        }
    }
    /**
     * Save context settings
     */
    async saveContext() {
        try {
            const contextData = this.collectContextData();
            await chrome.storage.sync.set({ context: contextData });
            this.showNotification('Context saved successfully', 'success');
        }
        catch (error) {
            console.error('Error saving context:', error);
            this.showNotification('Failed to save context', 'error');
        }
    }
    /**
     * Save LLM configuration
     */
    async saveLlmConfiguration() {
        try {
            const llmConfig = this.collectLlmConfig();
            await chrome.storage.sync.set({ llmConfig });
            this.showNotification('LLM configuration saved', 'success');
        }
        catch (error) {
            console.error('Error saving LLM config:', error);
            this.showNotification('Failed to save LLM configuration', 'error');
        }
    }
    /**
     * Save transcription settings
     */
    async saveTranscriptionSettings() {
        try {
            const transcriptionSettings = this.collectTranscriptionSettings();
            await chrome.storage.sync.set({ transcription: transcriptionSettings });
            this.showNotification('Transcription settings saved', 'success');
        }
        catch (error) {
            console.error('Error saving transcription settings:', error);
            this.showNotification('Failed to save transcription settings', 'error');
        }
    }
    /**
     * Save response style settings
     */
    async saveResponseStyle() {
        try {
            const responseStyle = this.collectResponseStyle();
            await chrome.storage.sync.set({ responseStyle });
            this.showNotification('Response style saved', 'success');
        }
        catch (error) {
            console.error('Error saving response style:', error);
            this.showNotification('Failed to save response style', 'error');
        }
    }
    /**
     * Save language settings
     */
    async saveLanguageSettings() {
        try {
            const languageSettings = this.collectLanguageSettings();
            await chrome.storage.sync.set({ language: languageSettings });
            this.showNotification('Language settings saved', 'success');
        }
        catch (error) {
            console.error('Error saving language settings:', error);
            this.showNotification('Failed to save language settings', 'error');
        }
    }
    /**
     * Test microphone access
     */
    async testMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.showNotification('Microphone access granted', 'success');
        }
        catch (error) {
            console.error('Microphone test failed:', error);
            this.showNotification('Microphone access denied', 'error');
        }
    }
    /**
     * Preview response style
     */
    previewResponseStyle() {
        const style = this.collectResponseStyle();
        const preview = this.generateStylePreview(style);
        const previewElement = document.getElementById('style-preview');
        if (previewElement) {
            previewElement.innerHTML = preview;
        }
    }
    /**
     * Export user data
     */
    async exportData() {
        try {
            const data = await chrome.storage.sync.get();
            const dataBlob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `candidai-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('Data exported successfully', 'success');
        }
        catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Failed to export data', 'error');
        }
    }
    /**
     * Clear all user data
     */
    async clearAllData() {
        if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            return;
        }
        try {
            await chrome.storage.sync.clear();
            await chrome.storage.local.clear();
            this.showNotification('All data cleared', 'success');
            location.reload();
        }
        catch (error) {
            console.error('Error clearing data:', error);
            this.showNotification('Failed to clear data', 'error');
        }
    }
    /**
     * Connect calendar
     */
    connectCalendar(event) {
        const target = event.target;
        const calendarType = target.id.replace('-calendar-connect', '');
        console.log(`Connecting ${calendarType} calendar`);
        this.showNotification(`${calendarType} calendar connection initiated`, 'info');
    }
    /**
     * Initialize document upload handlers
     */
    initializeDocumentUpload() {
        const dropzone = document.getElementById('resume-dropzone');
        const fileInput = document.getElementById('resume-input');
        const preview = document.getElementById('resume-preview');
        if (!dropzone || !fileInput || !preview)
            return;
        // Drag and drop handlers
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('ca-dropzone--dragover');
        });
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('ca-dropzone--dragover');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('ca-dropzone--dragover');
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
        // Click to upload
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });
        // File input change
        fileInput.addEventListener('change', (e) => {
            const target = e.target;
            if (target.files && target.files.length > 0) {
                this.handleFileUpload(target.files[0]);
            }
        });
        // Remove file button
        const removeBtn = document.getElementById('remove-resume');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeUploadedFile();
            });
        }
    }
    /**
     * Handle file upload
     */
    handleFileUpload(file) {
        console.log('📄 File uploaded:', file.name, file.size);
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('Please upload a PDF or DOCX file', 'error');
            return;
        }
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('File size must be less than 10MB', 'error');
            return;
        }
        // Show preview
        this.showFilePreview(file);
        // Process file (placeholder for actual processing)
        this.processDocument(file);
    }
    /**
     * Show file preview
     */
    showFilePreview(file) {
        const preview = document.getElementById('resume-preview');
        const nameElement = preview?.querySelector('.ca-file-preview__name');
        const sizeElement = preview?.querySelector('.ca-file-preview__size');
        if (preview && nameElement && sizeElement) {
            nameElement.textContent = file.name;
            sizeElement.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
            preview.style.display = 'flex';
            // Hide dropzone
            const dropzone = document.getElementById('resume-dropzone');
            if (dropzone) {
                dropzone.style.display = 'none';
            }
        }
    }
    /**
     * Remove uploaded file
     */
    removeUploadedFile() {
        const preview = document.getElementById('resume-preview');
        const dropzone = document.getElementById('resume-dropzone');
        const fileInput = document.getElementById('resume-input');
        if (preview)
            preview.style.display = 'none';
        if (dropzone)
            dropzone.style.display = 'flex';
        if (fileInput)
            fileInput.value = '';
        console.log('📄 File removed');
    }
    /**
     * Process document (placeholder)
     */
    async processDocument(file) {
        try {
            // This would normally send to service worker for processing
            console.log('📄 Processing document:', file.name);
            this.showToast('Document uploaded successfully!', 'success');
        }
        catch (error) {
            console.error('Document processing error:', error);
            this.showToast('Failed to process document', 'error');
        }
    }
    /**
     * Initialize LLM fallback reordering
     */
    initializeLLMReordering() {
        console.log('🔄 Initializing LLM fallback reordering...');
        // Show loading status
        this.updateSortableStatus('loading');
        // Add SortableJS dynamically if not present
        if (typeof window.Sortable === 'undefined') {
            console.log('📦 Loading SortableJS library...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js';
            script.onload = () => {
                console.log('✅ SortableJS loaded successfully');
                this.setupSortable();
            };
            script.onerror = () => {
                console.error('❌ Failed to load SortableJS');
                this.updateSortableStatus('error');
                this.showToast('Failed to load drag & drop functionality', 'error');
            };
            document.head.appendChild(script);
        }
        else {
            console.log('✅ SortableJS already available');
            this.setupSortable();
        }
    }
    /**
     * Update sortable status indicator
     */
    updateSortableStatus(status) {
        const statusContainer = document.getElementById('sortable-status');
        if (!statusContainer)
            return;
        const loadingText = statusContainer.querySelector('.ca-loading-text');
        const readyText = statusContainer.querySelector('.ca-ready-text');
        if (loadingText && readyText) {
            switch (status) {
                case 'loading':
                    loadingText.style.display = 'inline';
                    readyText.style.display = 'none';
                    break;
                case 'ready':
                    loadingText.style.display = 'none';
                    readyText.style.display = 'inline';
                    break;
                case 'error':
                    loadingText.textContent = '❌ Drag & drop failed to load';
                    loadingText.style.color = 'var(--ca-red-600)';
                    readyText.style.display = 'none';
                    break;
            }
        }
    }
    /**
     * Setup sortable functionality with enhanced options
     */
    setupSortable() {
        const fallbackContainer = document.getElementById('fallback-order');
        if (!fallbackContainer || typeof window.Sortable === 'undefined') {
            console.error('❌ Cannot setup sortable: container or library missing');
            this.updateSortableStatus('error');
            return;
        }
        try {
            new window.Sortable(fallbackContainer, {
                animation: 200,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                handle: '.ca-drag-handle',
                scroll: true,
                scrollSensitivity: 100,
                scrollSpeed: 10,
                onStart: (evt) => {
                    console.log('🎯 Drag started from position:', evt.oldIndex);
                    fallbackContainer.classList.add('sortable-drag-active');
                    this.showToast('Drag to reorder LLM providers', 'info');
                },
                onEnd: (evt) => {
                    console.log('🔄 LLM order changed:', evt.oldIndex, '->', evt.newIndex);
                    fallbackContainer.classList.remove('sortable-drag-active');
                    if (evt.oldIndex !== evt.newIndex) {
                        this.updatePriorityIndicators();
                        this.saveLLMFallbackOrder();
                        this.showToast('LLM fallback order updated successfully!', 'success');
                    }
                },
                onMove: (evt) => {
                    // Provide visual feedback during drag
                    return true;
                }
            });
            console.log('✅ LLM fallback reordering initialized successfully');
            this.updateSortableStatus('ready');
            this.updatePriorityIndicators(); // Initialize priority numbers
        }
        catch (error) {
            console.error('❌ Failed to initialize sortable:', error);
            this.updateSortableStatus('error');
            this.showToast('Failed to initialize drag & drop functionality', 'error');
        }
    }
    /**
     * Update priority indicators based on current order
     */
    updatePriorityIndicators() {
        const items = document.querySelectorAll('.ca-fallback-item');
        items.forEach((item, index) => {
            const priorityIndicator = item.querySelector('.ca-priority-indicator');
            if (priorityIndicator) {
                priorityIndicator.textContent = (index + 1).toString();
                // Add animation effect
                priorityIndicator.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    priorityIndicator.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }
    /**
     * Save LLM fallback order with enhanced validation
     */
    saveLLMFallbackOrder() {
        try {
            const items = document.querySelectorAll('.ca-fallback-item');
            const newOrder = Array.from(items).map(item => item.dataset.provider).filter(Boolean);
            if (newOrder.length === 0) {
                console.error('❌ No valid providers found in fallback order');
                this.showToast('Error: No valid providers found', 'error');
                return;
            }
            console.log('💾 Saving LLM fallback order:', newOrder);
            // Save to storage with error handling
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ llmFallbackOrder: newOrder }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome storage error:', chrome.runtime.lastError);
                        this.showToast('Failed to save configuration', 'error');
                    }
                    else {
                        console.log('✅ LLM fallback order saved to Chrome storage');
                    }
                });
            }
            else {
                localStorage.setItem('llmFallbackOrder', JSON.stringify(newOrder));
                console.log('✅ LLM fallback order saved to localStorage');
            }
            // Update any dependent UI elements
            this.updateProviderOrderDisplay(newOrder);
        }
        catch (error) {
            console.error('❌ Error saving LLM fallback order:', error);
            this.showToast('Failed to save fallback order', 'error');
        }
    }
    /**
     * Update provider order display in other parts of the UI
     */
    updateProviderOrderDisplay(order) {
        // This method can be used to update other UI elements that show the provider order
        console.log('🔄 Provider order updated:', order.map((p, i) => `${i + 1}. ${p}`).join(', '));
    }
    /**
     * Test API connections with real validation
     */
    async testAPIConnections() {
        const keys = this.getAPIKeys();
        const results = { openai: false, anthropic: false, gemini: false };
        const detailedResults = {};
        this.showToast('Testing API connections...', 'info');
        try {
            // Test OpenAI
            if (keys.openai) {
                try {
                    results.openai = await this.testOpenAIConnection(keys.openai);
                    detailedResults.openai = { success: results.openai };
                    if (!results.openai) {
                        detailedResults.openai.error = 'Invalid API key or connection failed';
                    }
                }
                catch (error) {
                    results.openai = false;
                    detailedResults.openai = {
                        success: false,
                        error: error instanceof Error ? error.message : 'Connection failed'
                    };
                }
            }
            // Test Anthropic
            if (keys.anthropic) {
                try {
                    results.anthropic = await this.testAnthropicConnection(keys.anthropic);
                    detailedResults.anthropic = { success: results.anthropic };
                    if (!results.anthropic) {
                        detailedResults.anthropic.error = 'Invalid API key or connection failed';
                    }
                }
                catch (error) {
                    results.anthropic = false;
                    detailedResults.anthropic = {
                        success: false,
                        error: error instanceof Error ? error.message : 'Connection failed'
                    };
                }
            }
            // Test Gemini
            if (keys.gemini) {
                try {
                    results.gemini = await this.testGeminiConnection(keys.gemini);
                    detailedResults.gemini = { success: results.gemini };
                    if (!results.gemini) {
                        detailedResults.gemini.error = 'Invalid API key or connection failed';
                    }
                }
                catch (error) {
                    results.gemini = false;
                    detailedResults.gemini = {
                        success: false,
                        error: error instanceof Error ? error.message : 'Connection failed'
                    };
                }
            }
            // Show detailed results
            const successCount = Object.values(results).filter(Boolean).length;
            const totalTests = Object.values(keys).filter(Boolean).length;
            if (totalTests === 0) {
                this.showToast('⚠️ No API keys found to test. Please enter your API keys first.', 'warning');
                return;
            }
            // Create detailed feedback message
            const providerNames = { openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Google Gemini' };
            const successfulProviders = [];
            const failedProviders = [];
            for (const [provider, result] of Object.entries(detailedResults)) {
                if (result.success) {
                    successfulProviders.push(providerNames[provider]);
                }
                else {
                    failedProviders.push(`${providerNames[provider]}: ${result.error || 'Unknown error'}`);
                }
            }
            if (successCount === totalTests) {
                // All tests passed
                this.showToast(`✅ All API connections successful!\n${successfulProviders.join(', ')} are working properly.`, 'success');
            }
            else if (successCount > 0) {
                // Some passed, some failed
                let message = `⚠️ ${successCount}/${totalTests} API connections successful\n\n`;
                if (successfulProviders.length > 0) {
                    message += `✅ Working: ${successfulProviders.join(', ')}\n`;
                }
                if (failedProviders.length > 0) {
                    message += `❌ Failed: \n${failedProviders.map(f => `• ${f}`).join('\n')}`;
                }
                this.showToast(message, 'warning');
            }
            else {
                // All tests failed
                const message = `❌ All API connections failed:\n${failedProviders.map(f => `• ${f}`).join('\n')}\n\nPlease check your API keys and try again.`;
                this.showToast(message, 'error');
            }
            console.log('🔑 Detailed API Test Results:', detailedResults);
        }
        catch (error) {
            console.error('API testing error:', error);
            this.showToast('❌ API testing failed. Check console for details.', 'error');
        }
    }
    /**
     * Test OpenAI connection
     */
    async testOpenAIConnection(apiKey) {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (response.ok) {
                return true;
            }
            else if (response.status === 401) {
                throw new Error('Invalid OpenAI API key');
            }
            else if (response.status === 429) {
                throw new Error('OpenAI API rate limit exceeded');
            }
            else if (response.status >= 500) {
                throw new Error('OpenAI server error');
            }
            else {
                throw new Error(`OpenAI API error (${response.status})`);
            }
        }
        catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network connection failed - check your internet connection');
            }
            throw error;
        }
    }
    /**
     * Test Anthropic connection
     */
    async testAnthropicConnection(apiKey) {
        try {
            // Anthropic requires a POST request to /v1/messages with a minimal valid payload
            // Also requires the special CORS header for browser-based requests
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1,
                    messages: [{ role: 'user', content: 'Hi' }]
                })
            });
            // For Anthropic, we check for specific status codes:
            // - 200: Success (API key valid and request successful)
            // - 400: Bad request but API key is valid (expected for minimal requests)
            // - 401: Invalid API key (this is what we want to catch)
            // - 403: Forbidden (API key valid but lacks permissions)
            // - 429: Rate limited (API key valid but rate limited)
            // - 5xx: Server error (API key likely valid, server issue)
            if (response.status >= 200 && response.status < 300) {
                // Success response - API key is definitely valid
                return true;
            }
            else if (response.status === 400) {
                // Bad request - usually means API key is valid but request format issue
                // For our minimal test, this often happens and indicates the key works
                return true;
            }
            else if (response.status === 401) {
                // Unauthorized - invalid API key
                throw new Error('Invalid Anthropic API key');
            }
            else if (response.status === 403) {
                // Forbidden - API key valid but lacks permissions
                throw new Error('Anthropic API key lacks required permissions');
            }
            else if (response.status === 429) {
                // Rate limited - API key is valid but rate limited
                throw new Error('Anthropic API rate limit exceeded');
            }
            else if (response.status >= 500) {
                // Server error - API key likely valid, server issue
                throw new Error('Anthropic server error');
            }
            else {
                // Other error codes
                throw new Error(`Anthropic API error (${response.status})`);
            }
        }
        catch (error) {
            // Handle network errors specifically
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network connection failed - check your internet connection');
            }
            // If it's already our custom error, re-throw it
            if (error instanceof Error) {
                throw error;
            }
            // Fallback for unknown errors
            throw new Error('Unknown error occurred while testing Anthropic API');
        }
    }
    /**
     * Test Gemini connection
     */
    async testGeminiConnection(apiKey) {
        try {
            // Validate API key format
            if (!apiKey.startsWith('AIza')) {
                throw new Error('Invalid Google Gemini API key format - should start with "AIza"');
            }
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (response.ok) {
                // Verify we actually get model data
                const data = await response.json();
                if (data.models && data.models.length > 0) {
                    return true;
                }
                else {
                    throw new Error('No models available with this Google Gemini API key');
                }
            }
            else if (response.status === 400) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.error?.message || 'Invalid request format';
                throw new Error(`Google Gemini API error: ${errorMessage}`);
            }
            else if (response.status === 403) {
                throw new Error('Google Gemini API access forbidden - check your API key permissions and billing');
            }
            else if (response.status === 429) {
                throw new Error('Google Gemini API rate limit exceeded');
            }
            else if (response.status >= 500) {
                throw new Error('Google Gemini server error');
            }
            else {
                throw new Error(`Google Gemini API error (${response.status})`);
            }
        }
        catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network connection failed - check your internet connection');
            }
            throw error;
        }
    }
    /**
     * Get API keys from form
     */
    getAPIKeys() {
        const openaiInput = document.getElementById('openai-key');
        const anthropicInput = document.getElementById('anthropic-key');
        const geminiInput = document.getElementById('gemini-key');
        return {
            openai: openaiInput?.value || '',
            anthropic: anthropicInput?.value || '',
            gemini: geminiInput?.value || ''
        };
    }
    // =============================================================================
    // HELPER METHODS
    // =============================================================================
    collectApiKeys() {
        const apiKeys = {};
        const openaiKey = document.getElementById('openai-key')?.value;
        const anthropicKey = document.getElementById('anthropic-key')?.value;
        const geminiKey = document.getElementById('gemini-key')?.value;
        if (openaiKey)
            apiKeys.openai = openaiKey;
        if (anthropicKey)
            apiKeys.anthropic = anthropicKey;
        if (geminiKey)
            apiKeys.gemini = geminiKey;
        return apiKeys;
    }
    collectContextData() {
        const jobDescription = document.getElementById('job-description')?.value;
        return {
            jobDescription: jobDescription || '',
            uploadedAt: new Date().toISOString(),
        };
    }
    collectLlmConfig() {
        const preferredProvider = document.getElementById('preferred-provider')?.value;
        return {
            preferredProvider: preferredProvider || 'openai',
            updatedAt: new Date().toISOString(),
        };
    }
    collectTranscriptionSettings() {
        const language = document.getElementById('transcription-language')?.value;
        const threshold = document.getElementById('silence-threshold')?.value;
        const duration = document.getElementById('silence-duration')?.value;
        return {
            language: language || 'en-US',
            silenceThreshold: parseFloat(threshold) || 0.01,
            silenceDuration: parseInt(duration) || 1500,
        };
    }
    collectResponseStyle() {
        const tone = document.getElementById('response-tone')?.value;
        const length = document.getElementById('response-length')?.value;
        const formality = document.getElementById('formality-level')?.value;
        return {
            tone: tone || 'professional',
            length: length || 'medium',
            formality: parseInt(formality) || 7,
        };
    }
    collectLanguageSettings() {
        const interfaceLanguage = document.getElementById('ui-language')?.value;
        const aiLanguage = document.getElementById('response-language')?.value;
        const dateFormat = document.getElementById('date-format')?.value;
        const timeFormat = document.getElementById('time-format')?.value;
        return {
            interface: interfaceLanguage || 'English',
            aiResponse: aiLanguage || 'English',
            dateFormat: dateFormat || 'MM/DD/YYYY',
            timeFormat: timeFormat || '12-hour',
        };
    }
    populateApiKeys(apiKeys) {
        const openaiInput = document.getElementById('openai-key');
        const anthropicInput = document.getElementById('anthropic-key');
        const geminiInput = document.getElementById('gemini-key');
        if (openaiInput && apiKeys.openai)
            openaiInput.value = apiKeys.openai;
        if (anthropicInput && apiKeys.anthropic)
            anthropicInput.value = apiKeys.anthropic;
        if (geminiInput && apiKeys.gemini)
            geminiInput.value = apiKeys.gemini;
    }
    populateLlmConfig(config) {
        const providerSelect = document.getElementById('preferred-provider');
        if (providerSelect && config.preferredProvider) {
            providerSelect.value = config.preferredProvider;
        }
    }
    populateTranscriptionSettings(settings) {
        const languageSelect = document.getElementById('transcription-language');
        const thresholdInput = document.getElementById('silence-threshold');
        const durationInput = document.getElementById('silence-duration');
        if (languageSelect && settings.language)
            languageSelect.value = settings.language;
        if (thresholdInput && settings.silenceThreshold)
            thresholdInput.value = settings.silenceThreshold.toString();
        if (durationInput && settings.silenceDuration)
            durationInput.value = settings.silenceDuration.toString();
    }
    populateResponseStyle(style) {
        const toneSelect = document.getElementById('response-tone');
        const lengthSelect = document.getElementById('response-length');
        const formalityInput = document.getElementById('formality-level');
        if (toneSelect && style.tone)
            toneSelect.value = style.tone;
        if (lengthSelect && style.length)
            lengthSelect.value = style.length;
        if (formalityInput && style.formality)
            formalityInput.value = style.formality.toString();
    }
    populateLanguageSettings(settings) {
        const interfaceSelect = document.getElementById('ui-language');
        const aiSelect = document.getElementById('response-language');
        const dateSelect = document.getElementById('date-format');
        const timeSelect = document.getElementById('time-format');
        if (interfaceSelect && settings.interface)
            interfaceSelect.value = settings.interface;
        if (aiSelect && settings.aiResponse)
            aiSelect.value = settings.aiResponse;
        if (dateSelect && settings.dateFormat)
            dateSelect.value = settings.dateFormat;
        if (timeSelect && settings.timeFormat)
            timeSelect.value = settings.timeFormat;
    }
    generateStylePreview(style) {
        return `
      <div class="preview-card">
        <h4>Preview Response</h4>
        <p>This is how your AI responses will look with the selected style settings.</p>
        <p><strong>Tone:</strong> ${style.tone || 'professional'}</p>
        <p><strong>Length:</strong> ${style.length || 'medium'}</p>
        <p><strong>Formality:</strong> ${style.formality || 7}/10</p>
      </div>
    `;
    }
    updateLoadingState(isLoading) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = isLoading;
        });
    }
    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        // Add to page
        document.body.appendChild(notification);
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    showToast(message, type = 'info') {
        console.log(`🍞 TOAST ${type.toUpperCase()}: ${message}`);
        // Convert newlines to HTML breaks for better display
        const formattedMessage = message.replace(/\n/g, '<br>');
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
      <div class="toast__content">
        <div class="toast__message">${formattedMessage}</div>
        <button class="toast__close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
        // Add styles if not present
        if (!document.querySelector('#toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          min-width: 350px;
          max-width: 500px;
          animation: slideIn 0.3s ease;
        }
        .toast--success { border-left: 4px solid #10b981; }
        .toast--error { border-left: 4px solid #ef4444; }
        .toast--warning { border-left: 4px solid #f59e0b; }
        .toast--info { border-left: 4px solid #3b82f6; }
        .toast__content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px;
        }
        .toast__message { 
          flex: 1; 
          font-size: 14px; 
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        .toast__close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
          margin-left: 12px;
          align-self: flex-start;
          margin-top: -2px;
        }
        .toast__close:hover {
          color: #333;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
            document.head.appendChild(styles);
        }
        // Add to page
        document.body.appendChild(toast);
        // Remove after 8 seconds for longer messages, 5 seconds for shorter ones
        const duration = message.length > 100 ? 8000 : 5000;
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }
    /**
     * Initialize the options page
     */
    initialize() {
        console.log('CandidAI Options page initialized');
    }
}
// =============================================================================
// INITIALIZATION
// =============================================================================
// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const controller = new OptionsController();
        controller.initialize();
    });
}
else {
    const controller = new OptionsController();
    controller.initialize();
}

})();

/******/ })()
;
//# sourceMappingURL=options.js.map