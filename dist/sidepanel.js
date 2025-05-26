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
/*!************************************!*\
  !*** ./src/sidepanel/sidepanel.ts ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ts_utils_messaging__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ts/utils/messaging */ "./src/ts/utils/messaging.ts");
/**
 * CandidAI Side Panel - Primary UI Orchestration Layer
 * Implements reactive state management with event-driven architecture
 * Leverages Observer, Command, and Mediator patterns for decoupled communication
 */

// =============================================================================
// SIDE PANEL CONTROLLER
// =============================================================================
/**
 * Primary Side Panel Controller - Implements Facade Pattern
 * Orchestrates complex subsystem interactions through unified interface
 */
class SidePanelController {
    messageBroker;
    components;
    sessionState;
    port = null;
    constructor() {
        // Initialize core service dependencies
        this.messageBroker = new _ts_utils_messaging__WEBPACK_IMPORTED_MODULE_0__.MessageBroker();
        // Initialize UI component placeholders
        this.components = {};
        // Session state container with reactive properties
        this.sessionState = {
            isListening: false,
            activeTab: 'assistant',
            sessionId: null,
            platform: null,
            tokenUsage: 0,
        };
        // Initialize component lifecycle
        this.initializeEventListeners();
        this.establishServiceWorkerConnection();
        this.restoreUIState();
    }
    /**
     * Initialize comprehensive event listener matrix
     * Implements event delegation pattern for performance optimization
     */
    initializeEventListeners() {
        // Tab navigation event handling
        document.querySelectorAll('.ca-tabs__tab').forEach((tab) => {
            tab.addEventListener('click', this.handleTabSwitch.bind(this));
        });
        // Listening toggle control with state persistence
        const listeningToggle = document.getElementById('listening-toggle');
        if (listeningToggle) {
            listeningToggle.addEventListener('click', this.toggleListening.bind(this));
        }
        // Settings navigation handler
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openQuickSettings();
            });
        }
        // Visual capture trigger
        const captureBtn = document.getElementById('capture-screen');
        if (captureBtn) {
            captureBtn.addEventListener('click', this.handleScreenCapture.bind(this));
        }
        // Global keyboard event handlers for accessibility
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }
    /**
     * Establish bidirectional communication channel with service worker
     * Implements persistent connection pattern with automatic reconnection
     */
    establishServiceWorkerConnection() {
        try {
            // Create persistent port connection
            this.port = chrome.runtime.connect({ name: 'sidepanel' });
            // Message handler with typed command routing
            this.port.onMessage.addListener((message) => {
                const { command, payload } = message;
                switch (command) {
                    case 'TRANSCRIPTION_UPDATE':
                        this.handleTranscriptionUpdate(payload);
                        break;
                    case 'SUGGESTION_GENERATED':
                        this.handleSuggestionUpdate(payload);
                        break;
                    case 'CONTEXT_UPDATED':
                        this.updateContextIndicators(payload);
                        break;
                    case 'SESSION_STATE_CHANGE':
                        this.handleSessionStateChange(payload);
                        break;
                    case 'ERROR_NOTIFICATION':
                        this.handleErrorNotification(payload);
                        break;
                }
            });
            // Reconnection handler for resilient communication
            this.port.onDisconnect.addListener(() => {
                console.warn('Service worker connection lost, attempting reconnection...');
                setTimeout(() => this.establishServiceWorkerConnection(), 1000);
            });
        }
        catch (error) {
            console.error('Failed to establish service worker connection:', error);
        }
    }
    /**
     * Handle tab switching with state persistence
     */
    handleTabSwitch(event) {
        const target = event.currentTarget;
        const tabTarget = target.dataset.tabTarget;
        if (!tabTarget)
            return;
        // Deactivate all tabs and panels
        document.querySelectorAll('.ca-tabs__tab').forEach((tab) => {
            tab.classList.remove('ca-tabs__tab--active');
            tab.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.ca-panel').forEach((panel) => {
            panel.classList.remove('ca-panel--active');
            panel.hidden = true;
        });
        // Activate target tab and panel
        target.classList.add('ca-tabs__tab--active');
        target.setAttribute('aria-selected', 'true');
        const targetPanel = document.getElementById(`panel-${tabTarget}`);
        if (targetPanel) {
            targetPanel.classList.add('ca-panel--active');
            targetPanel.hidden = false;
        }
        // Update session state
        this.sessionState.activeTab = tabTarget;
    }
    /**
     * Toggle listening state with comprehensive state management
     */
    async toggleListening() {
        const button = document.getElementById('listening-toggle');
        if (!button)
            return;
        try {
            if (!this.sessionState.isListening) {
                // Initialize interview session
                const response = await this.messageBroker.sendMessage({
                    command: 'INIT_INTERVIEW_SESSION',
                    payload: {
                        platform: await this.detectPlatform(),
                        timestamp: Date.now(),
                    },
                });
                if (response.success && response.data) {
                    this.sessionState.isListening = true;
                    this.sessionState.sessionId = response.data.id;
                    button.classList.add('ca-btn--active');
                    this.updateStatus('Listening...', 'success');
                }
            }
            else {
                // Terminate interview session
                await this.messageBroker.sendMessage({
                    command: 'TERMINATE_SESSION',
                    payload: {
                        sessionId: this.sessionState.sessionId,
                    },
                });
                this.sessionState.isListening = false;
                this.sessionState.sessionId = null;
                button.classList.remove('ca-btn--active');
                this.updateStatus('Ready', 'idle');
            }
        }
        catch (error) {
            console.error('Error toggling listening state:', error);
            this.updateStatus('Error', 'error');
        }
    }
    /**
     * Detect current platform
     */
    async detectPlatform() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];
            if (!activeTab?.url)
                return 'unknown';
            if (activeTab.url.includes('meet.google.com'))
                return 'google_meet';
            if (activeTab.url.includes('zoom.us'))
                return 'zoom';
            if (activeTab.url.includes('teams.microsoft.com'))
                return 'teams';
            if (activeTab.url.includes('linkedin.com'))
                return 'linkedin';
            if (activeTab.url.includes('hirevue.com'))
                return 'hirevue';
            return 'unknown';
        }
        catch (error) {
            console.error('Error detecting platform:', error);
            return 'unknown';
        }
    }
    /**
     * Handle transcription updates
     */
    handleTranscriptionUpdate(payload) {
        // Update transcription view
        const transcriptionContainer = document.getElementById('transcription-container');
        if (transcriptionContainer && payload.text) {
            const transcriptElement = document.createElement('div');
            transcriptElement.className = 'ca-transcript-entry';
            transcriptElement.textContent = payload.text;
            transcriptionContainer.appendChild(transcriptElement);
        }
    }
    /**
     * Handle suggestion updates
     */
    handleSuggestionUpdate(payload) {
        const suggestionsContainer = document.getElementById('suggestions-container');
        if (suggestionsContainer && payload.suggestions) {
            suggestionsContainer.innerHTML = '';
            payload.suggestions.forEach((suggestion) => {
                const suggestionElement = document.createElement('div');
                suggestionElement.className = 'ca-suggestion-card';
                suggestionElement.textContent = suggestion.text;
                suggestionsContainer.appendChild(suggestionElement);
            });
        }
    }
    /**
     * Handle screen capture
     */
    async handleScreenCapture() {
        try {
            const response = await this.messageBroker.sendMessage({
                command: 'CAPTURE_VISUAL',
                payload: { timestamp: Date.now() },
            });
            if (response.success) {
                this.updateStatus('Screen captured', 'success');
            }
            else {
                this.updateStatus('Capture failed', 'error');
            }
        }
        catch (error) {
            console.error('Screen capture error:', error);
            this.updateStatus('Capture error', 'error');
        }
    }
    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(event) {
        // Implementation for keyboard shortcuts
        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            this.toggleListening();
        }
    }
    /**
     * Update status display
     */
    updateStatus(message, type = 'idle') {
        console.log(`Status: ${message} (${type})`);
        // Update UI status indicator
    }
    /**
     * Quick settings handlers - Opens options page in new browser tab
     */
    openQuickSettings() {
        try {
            // Check if we're in an extension context
            if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
                // Extension context: use Chrome APIs
                chrome.tabs.create({
                    url: chrome.runtime.getURL('options/options.html'),
                    active: true
                });
                console.log('Settings page opened in new tab via Chrome API');
            }
            else {
                // Testing/development context: use fallback
                this.openSettingsFallback();
            }
        }
        catch (error) {
            console.error('Error opening settings page via Chrome API:', error);
            // Fallback for any Chrome API failures
            this.openSettingsFallback();
        }
    }
    /**
     * Fallback method to open settings page
     */
    openSettingsFallback() {
        try {
            // Determine the base URL for the options page
            let optionsUrl;
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                // Extension context with runtime API available
                optionsUrl = chrome.runtime.getURL('options/options.html');
            }
            else {
                // Development/testing context: construct URL based on current location
                const currentUrl = window.location.href;
                if (currentUrl.includes('127.0.0.1') || currentUrl.includes('localhost')) {
                    // Local development server
                    const baseUrl = currentUrl.split('/dist/')[0];
                    optionsUrl = `${baseUrl}/dist/options/options.html`;
                }
                else {
                    // Relative path fallback
                    optionsUrl = '../options/options.html';
                }
            }
            // Open in new window/tab
            const settingsWindow = window.open(optionsUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            if (settingsWindow) {
                settingsWindow.focus();
                console.log('Settings page opened in new window:', optionsUrl);
            }
            else {
                // If popup blocked, try to navigate in same window
                console.log('Popup blocked, redirecting in same window');
                window.location.href = optionsUrl;
            }
        }
        catch (error) {
            console.error('Fallback settings opening failed:', error);
            // Last resort: show user message
            alert('Please open the options page manually: dist/options/options.html');
        }
    }
    /**
     * Handle session state changes
     */
    handleSessionStateChange(payload) {
        Object.assign(this.sessionState, payload);
    }
    /**
     * Handle error notifications
     */
    handleErrorNotification(payload) {
        console.error('Error notification:', payload);
        this.updateStatus('Error occurred', 'error');
    }
    /**
     * Update context indicators
     */
    updateContextIndicators(payload) {
        // Update UI context indicators
        console.log('Context updated:', payload);
    }
    /**
     * Restore UI state
     */
    async restoreUIState() {
        try {
            // Restore previous session state if available
            const savedState = await chrome.storage.local.get('uiState');
            if (savedState.uiState) {
                Object.assign(this.sessionState, savedState.uiState);
            }
        }
        catch (error) {
            console.error('Error restoring UI state:', error);
        }
    }
    /**
     * Initialize the side panel
     */
    initialize() {
        console.log('CandidAI Side Panel initialized');
        this.updateStatus('Ready', 'idle');
    }
}
// =============================================================================
// INITIALIZATION
// =============================================================================
// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const controller = new SidePanelController();
        controller.initialize();
    });
}
else {
    const controller = new SidePanelController();
    controller.initialize();
}

})();

/******/ })()
;
//# sourceMappingURL=sidepanel.js.map