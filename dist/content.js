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
  !*** ./src/content/content.ts ***!
  \********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlatformDetector: () => (/* binding */ PlatformDetector)
/* harmony export */ });
/* harmony import */ var _ts_utils_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ts/utils/constants */ "./src/ts/utils/constants.ts");
/**
 * Content Script - Platform detection and integration layer
 * Implements Adapter pattern for multi-platform support
 * Provides seamless integration with video conferencing platforms
 * Enterprise-grade TypeScript implementation with strict typing
 */
// Temporarily comment out platform adapters for testing
// import { GoogleMeetAdapter } from '../ts/platforms/GoogleMeet';
// import { ZoomAdapter } from '../ts/platforms/Zoom';
// import { TeamsAdapter } from '../ts/platforms/MicrosoftTeams';
// import { LinkedInAdapter } from '../ts/platforms/LinkedIn';
// import { HireVueAdapter } from '../ts/platforms/HireVue';

/**
 * PlatformDetector - Implements platform detection and initialization
 * Uses Strategy pattern for platform-specific behaviors
 */
class PlatformDetector {
    adapters = new Map([
    // Temporarily disabled for testing
    // ['meet.google.com', GoogleMeetAdapter],
    // ['zoom.us', ZoomAdapter],
    // ['teams.microsoft.com', TeamsAdapter],
    // ['linkedin.com', LinkedInAdapter],
    // ['hirevue.com', HireVueAdapter],
    ]);
    currentAdapter = null;
    mutationObserver = null;
    detectionState = {
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
    async initialize() {
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
        }
        catch (error) {
            console.error('PlatformDetector initialization error:', error);
        }
    }
    /**
     * Detect current platform based on URL
     * Implements platform identification logic with type safety
     */
    detectPlatform() {
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
    async initializePlatformAdapter(platform) {
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
            this.currentAdapter.onVideoCallStateChange((inCall) => {
                this.handleVideoCallStateChange(inCall).catch((error) => {
                    console.error('Error handling video call state change:', error);
                });
            });
            console.log('Platform adapter initialized successfully:', platform);
        }
        catch (error) {
            console.error('Failed to initialize platform adapter:', error);
            this.currentAdapter = null;
        }
    }
    /**
     * Monitor DOM for platform-specific changes
     * Implements MutationObserver for reactive updates with performance optimization
     */
    observeDOMChanges() {
        // Clean up existing observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        this.mutationObserver = new MutationObserver((mutations) => {
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
            }
            catch (error) {
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
    monitorURLChanges() {
        let lastUrl = location.href;
        // Store original methods with proper typing
        const originalPushState = history.pushState.bind(history);
        const originalReplaceState = history.replaceState.bind(history);
        // Override pushState and replaceState
        history.pushState = function (data, unused, url) {
            originalPushState(data, unused, url);
            window.dispatchEvent(new Event('urlchange'));
        };
        history.replaceState = function (data, unused, url) {
            originalReplaceState(data, unused, url);
            window.dispatchEvent(new Event('urlchange'));
        };
        // Listen for URL changes
        const handleUrlChange = () => {
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
    async handleURLChange() {
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
                }
                else {
                    // Reset state if no platform detected
                    this.detectionState = {
                        platform: null,
                        isVideoCall: false,
                        metadata: {},
                    };
                }
            }
        }
        catch (error) {
            console.error('Error handling URL change:', error);
        }
    }
    /**
     * Initialize message listener for communication with extension
     * Implements typed message handling
     */
    initializeMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse).catch((error) => {
                console.error('Error handling message:', error);
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            });
            return true; // Keep message channel open for async response
        });
    }
    /**
     * Handle messages from extension with proper error handling
     */
    async handleMessage(request, sender, sendResponse) {
        const { command, payload } = request;
        try {
            switch (command) {
                case _ts_utils_constants__WEBPACK_IMPORTED_MODULE_0__.MESSAGE_COMMANDS.GET_PLATFORM_STATUS:
                    sendResponse({
                        success: true,
                        data: {
                            platform: this.detectionState.platform,
                            isVideoCall: this.detectionState.isVideoCall,
                            metadata: this.detectionState.metadata,
                        },
                    });
                    break;
                case _ts_utils_constants__WEBPACK_IMPORTED_MODULE_0__.MESSAGE_COMMANDS.EXTRACT_PAGE_CONTEXT:
                    const context = await this.extractPageContext();
                    sendResponse({ success: true, data: context });
                    break;
                case _ts_utils_constants__WEBPACK_IMPORTED_MODULE_0__.MESSAGE_COMMANDS.INJECT_UI:
                    await this.injectUI(payload?.config);
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
        }
        catch (error) {
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
    async notifyPlatformDetected() {
        try {
            await chrome.runtime.sendMessage({
                command: _ts_utils_constants__WEBPACK_IMPORTED_MODULE_0__.MESSAGE_COMMANDS.PLATFORM_DETECTED,
                payload: {
                    platform: this.detectionState.platform,
                    isVideoCall: this.detectionState.isVideoCall,
                    metadata: this.detectionState.metadata,
                    url: window.location.href,
                    timestamp: Date.now(),
                },
            });
        }
        catch (error) {
            console.error('Failed to notify platform detection:', error);
        }
    }
    /**
     * Handle video call state changes
     */
    async handleVideoCallStateChange(inCall) {
        try {
            this.detectionState.isVideoCall = inCall;
            await chrome.runtime.sendMessage({
                command: _ts_utils_constants__WEBPACK_IMPORTED_MODULE_0__.MESSAGE_COMMANDS.VIDEO_CALL_STATE_CHANGED,
                payload: {
                    inCall,
                    platform: this.detectionState.platform,
                    metadata: this.detectionState.metadata,
                    timestamp: Date.now(),
                },
            });
            console.log(`Video call state changed: ${inCall ? 'started' : 'ended'}`);
        }
        catch (error) {
            console.error('Failed to notify video call state change:', error);
        }
    }
    /**
     * Extract page context for AI processing
     */
    async extractPageContext() {
        try {
            const context = {
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
        }
        catch (error) {
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
    async injectUI(config) {
        try {
            console.log('Injecting UI with config:', config);
            // Implementation for UI injection
            // This would depend on the specific UI requirements
        }
        catch (error) {
            console.error('Failed to inject UI:', error);
            throw error;
        }
    }
    /**
     * Cleanup resources when content script is unloaded
     */
    cleanup() {
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
        }
        catch (error) {
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


})();

/******/ })()
;
//# sourceMappingURL=content.js.map