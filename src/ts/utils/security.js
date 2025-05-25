/**
 * Security Utilities - Security and validation helpers
 * Implements encryption, sanitization, and validation
 * Provides security best practices for extension
 */

/**
 * Security utilities for data protection
 */
export const SecurityUtils = {
  /**
   * Validate API key format
   * Implements pattern matching for various providers
   */
  validateApiKey(key, provider) {
    if (!key || typeof key !== 'string') {
      return false;
    }

    const patterns = {
      openai: /^sk-[A-Za-z0-9]{48}$/,
      anthropic: /^sk-ant-[A-Za-z0-9]{40,}$/,
      gemini: /^AIza[A-Za-z0-9_-]{35}$/,
    };

    const pattern = patterns[provider];
    return pattern ? pattern.test(key) : key.length > 20;
  },

  /**
   * Sanitize user input
   * Prevents XSS and injection attacks
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  /**
   * Escape HTML for safe display
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Generate secure random ID
   */
  generateSecureId() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Hash sensitive data
   * Uses Web Crypto API for SHA-256
   */
  async hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Validate URL safety
   */
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Rate limiting helper
   */
  createRateLimiter(maxRequests, windowMs) {
    const requests = new Map();

    return (key) => {
      const now = Date.now();
      const userRequests = requests.get(key) || [];

      // Clean old requests
      const validRequests = userRequests.filter((time) => now - time < windowMs);

      if (validRequests.length >= maxRequests) {
        return false;
      }

      validRequests.push(now);
      requests.set(key, validRequests);
      return true;
    };
  },

  /**
   * Content Security Policy helper
   */
  generateCSP() {
    return {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': [
        "'self'",
        'https://api.openai.com',
        'https://api.anthropic.com',
        'https://generativelanguage.googleapis.com',
      ],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'object-src': ["'none'"],
      'frame-src': ["'none'"],
    };
  },

  /**
   * Validate file upload
   */
  validateFileUpload(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      allowedExtensions = ['.pdf', '.docx'],
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds limit' };
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }

    // Check file extension
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: 'Invalid file extension' };
    }

    return { valid: true };
  },

  /**
   * Secure storage key generator
   */
  generateStorageKey(namespace, key) {
    return `candidai:${namespace}:${key}`;
  },

  /**
   * Input validation schemas
   */
  validators: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/.+/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    phoneNumber: /^\+?[\d\s-()]+$/,
  },

  /**
   * Validate against schema
   */
  validate(value, schema) {
    if (schema instanceof RegExp) {
      return schema.test(value);
    }

    if (typeof schema === 'function') {
      return schema(value);
    }

    return false;
  },
};

/**
 * Permission checker utility
 */
export class PermissionChecker {
  static async checkPermissions(permissions) {
    const results = {};

    for (const permission of permissions) {
      results[permission] = await chrome.permissions.contains({
        permissions: [permission],
      });
    }

    return results;
  }

  static async requestPermissions(permissions) {
    try {
      const granted = await chrome.permissions.request({
        permissions: permissions,
      });
      return granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }
}

/**
 * Secure communication helper
 */
export class SecureMessaging {
  constructor() {
    this.messageHandlers = new Map();
    this.trustedOrigins = new Set([chrome.runtime.getURL(''), 'https://candidai.com']);
  }

  validateMessage(message, sender) {
    // Validate sender
    if (!sender || !sender.id || sender.id !== chrome.runtime.id) {
      return false;
    }

    // Validate message structure
    if (!message || typeof message !== 'object') {
      return false;
    }

    // Validate command
    if (!message.command || typeof message.command !== 'string') {
      return false;
    }

    return true;
  }

  sendSecureMessage(command, payload) {
    const message = {
      command,
      payload,
      timestamp: Date.now(),
      nonce: SecurityUtils.generateSecureId(),
    };

    return chrome.runtime.sendMessage(message);
  }
}

export default SecurityUtils;
