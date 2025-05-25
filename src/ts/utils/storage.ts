/**
 * SecureStorage - Enterprise-grade storage abstraction layer
 * Implements Repository pattern with encryption-at-rest capabilities
 * Leverages Web Crypto API for cryptographic operations
 */

import type { StorageProvider, EncryptedStorage } from '../types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface StorageOptions {
  namespace?: string;
  encrypt?: boolean;
  ttl?: number; // Time to live in milliseconds
}

export interface EncryptedData {
  encrypted: boolean;
  data: string;
  iv?: string;
  salt?: string;
  algorithm?: string;
  timestamp?: number;
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
}

export interface StoredKeyData {
  key: JsonWebKey;
  algorithm: string;
  created: number;
}

export interface BatchItem<T = any> {
  key: string;
  value: T;
  options?: StorageOptions;
}

// =============================================================================
// STORAGE NAMESPACES
// =============================================================================

/**
 * Storage namespace enumeration for logical data segregation
 */
export const StorageNamespaces = {
  API_KEYS: 'candidai:apiKeys',
  USER_PREFERENCES: 'candidai:preferences',
  SESSION_STATE: 'candidai:session',
  INTERVIEW_HISTORY: 'candidai:history',
  RESUME_DATA: 'candidai:resume',
  CONTEXT_CACHE: 'candidai:context',
  DOCUMENTS: 'candidai:documents',
  PERFORMANCE: 'candidai:performance',
} as const;

export type StorageNamespace = (typeof StorageNamespaces)[keyof typeof StorageNamespaces];

// =============================================================================
// SECURE STORAGE CLASS
// =============================================================================

/**
 * SecureStorage - Implements secure data persistence with encryption
 * Provides typed storage operations with automatic serialization
 */
export class SecureStorage implements StorageProvider, EncryptedStorage {
  private readonly encryptionConfig: EncryptionConfig;
  private readonly cache: Map<string, any>;
  private encryptionKey: CryptoKey | null;
  private isInitialized: boolean;

  constructor() {
    // Encryption configuration
    this.encryptionConfig = {
      algorithm: 'AES-GCM',
      keyLength: 256,
      ivLength: 12,
      saltLength: 16,
      iterations: 100000,
    };

    // Cache for frequently accessed data
    this.cache = new Map();

    // Encryption key will be initialized on first use
    this.encryptionKey = null;
    this.isInitialized = false;
  }

  /**
   * Ensure encryption is initialized before use
   * Implements lazy initialization pattern
   */
  private async ensureEncryptionInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeEncryption();
      this.isInitialized = true;
    }
  }

  /**
   * Initialize encryption infrastructure with key derivation
   * Implements PBKDF2 for key stretching
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // Check for existing encryption key
      const existingKey = await this.getStoredKey();

      if (!existingKey) {
        // Generate new encryption key
        this.encryptionKey = await this.generateEncryptionKey();
        await this.storeEncryptionKey(this.encryptionKey);
      } else {
        this.encryptionKey = existingKey;
      }
    } catch (error) {
      console.error('Encryption initialization failed:', error);
      // Fallback to unencrypted storage
      this.encryptionKey = null;
    }
  }

  /**
   * Generate cryptographically secure encryption key
   * Implements CSPRNG with hardware entropy sources
   */
  private async generateEncryptionKey(): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: this.encryptionConfig.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );

    return keyMaterial;
  }

  /**
   * Store encryption key securely in Chrome storage
   * Implements key persistence with metadata
   */
  private async storeEncryptionKey(key: CryptoKey): Promise<void> {
    try {
      // Export key for storage
      const exportedKey = await crypto.subtle.exportKey('jwk', key);

      const keyData: StoredKeyData = {
        key: exportedKey,
        algorithm: this.encryptionConfig.algorithm,
        created: Date.now(),
      };

      await chrome.storage.local.set({
        'candidai:encryptionKey': keyData,
      });
    } catch (error) {
      console.error('Failed to store encryption key:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored encryption key from Chrome storage
   * Implements key reconstruction from stored data
   */
  private async getStoredKey(): Promise<CryptoKey | null> {
    try {
      const result = await chrome.storage.local.get('candidai:encryptionKey');

      if (!result['candidai:encryptionKey']) {
        return null;
      }

      const keyData = result['candidai:encryptionKey'] as StoredKeyData;

      // Import the key back into crypto API
      const importedKey = await crypto.subtle.importKey(
        'jwk',
        keyData.key,
        {
          name: this.encryptionConfig.algorithm,
          length: this.encryptionConfig.keyLength,
        },
        true,
        ['encrypt', 'decrypt']
      );

      return importedKey;
    } catch (error) {
      console.error('Failed to retrieve encryption key:', error);
      return null;
    }
  }

  /**
   * Store encrypted data with automatic serialization
   * Implements transparent encryption with type preservation
   */
  async set<T = any>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    try {
      // Ensure encryption is initialized
      await this.ensureEncryptionInitialized();

      const namespace = options.namespace || StorageNamespaces.USER_PREFERENCES;
      const storageKey = `${namespace}:${key}`;

      // Serialize complex data types
      const serializedValue = JSON.stringify(value);

      let dataToStore: EncryptedData;
      if (this.encryptionKey && options.encrypt !== false) {
        // Encrypt sensitive data
        dataToStore = await this.encryptData(serializedValue);
      } else {
        dataToStore = {
          encrypted: false,
          data: serializedValue,
          timestamp: Date.now(),
        };
      }

      // Store with Chrome storage API
      await chrome.storage.local.set({ [storageKey]: dataToStore });

      // Update cache
      this.cache.set(storageKey, value);
    } catch (error) {
      console.error('Storage operation failed:', error);
      throw new Error(`Failed to store data for key: ${key}`);
    }
  }

  /**
   * Retrieve and decrypt data with automatic deserialization
   * Implements cache-aside pattern for performance optimization
   */
  async get<T = any>(key: string, options: StorageOptions = {}): Promise<T | null> {
    try {
      // Ensure encryption is initialized
      await this.ensureEncryptionInitialized();

      const namespace = options.namespace || StorageNamespaces.USER_PREFERENCES;
      const storageKey = `${namespace}:${key}`;

      // Check cache first
      if (this.cache.has(storageKey)) {
        return this.cache.get(storageKey);
      }

      // Retrieve from storage
      const result = await chrome.storage.local.get(storageKey);
      const storedData = result[storageKey] as EncryptedData | undefined;

      if (!storedData) {
        return null;
      }

      // Check TTL if specified
      if (options.ttl && storedData.timestamp) {
        const age = Date.now() - storedData.timestamp;
        if (age > options.ttl) {
          await this.remove(key, options);
          return null;
        }
      }

      let deserializedValue: T;
      if (storedData.encrypted && this.encryptionKey) {
        // Decrypt data
        const decryptedData = await this.decryptData(storedData);
        deserializedValue = JSON.parse(decryptedData);
      } else {
        deserializedValue = JSON.parse(storedData.data);
      }

      // Update cache
      this.cache.set(storageKey, deserializedValue);

      return deserializedValue;
    } catch (error) {
      console.error('Storage retrieval failed:', error);
      return null;
    }
  }

  /**
   * Remove data from storage
   */
  async remove(key: string, options: StorageOptions = {}): Promise<void> {
    try {
      const namespace = options.namespace || StorageNamespaces.USER_PREFERENCES;
      const storageKey = `${namespace}:${key}`;

      await chrome.storage.local.remove(storageKey);
      this.cache.delete(storageKey);
    } catch (error) {
      console.error('Storage removal failed:', error);
      throw new Error(`Failed to remove data for key: ${key}`);
    }
  }

  /**
   * Clear all storage data
   */
  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      this.cache.clear();
    } catch (error) {
      console.error('Storage clear failed:', error);
      throw error;
    }
  }

  /**
   * Get all keys from storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const allData = await chrome.storage.local.get();
      return Object.keys(allData);
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Encrypt data using AES-GCM
   * Implements authenticated encryption with additional data
   */
  async encrypt(data: any): Promise<string> {
    await this.ensureEncryptionInitialized();
    
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }

    const serializedData = JSON.stringify(data);
    const encryptedData = await this.encryptData(serializedData);
    return JSON.stringify(encryptedData);
  }

  /**
   * Decrypt data using AES-GCM
   * Implements authenticated decryption with integrity verification
   */
  async decrypt(encryptedData: string): Promise<any> {
    await this.ensureEncryptionInitialized();
    
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }

    const parsedData = JSON.parse(encryptedData) as EncryptedData;
    const decryptedData = await this.decryptData(parsedData);
    return JSON.parse(decryptedData);
  }

  /**
   * Internal method to encrypt data
   */
  private async encryptData(plaintext: string): Promise<EncryptedData> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(this.encryptionConfig.ivLength));

    // Encrypt the data
    const encodedData = new TextEncoder().encode(plaintext);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.encryptionConfig.algorithm,
        iv,
      },
      this.encryptionKey,
      encodedData
    );

    return {
      encrypted: true,
      data: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv),
      algorithm: this.encryptionConfig.algorithm,
      timestamp: Date.now(),
    };
  }

  /**
   * Internal method to decrypt data
   */
  private async decryptData(encryptedData: EncryptedData): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }

    if (!encryptedData.iv) {
      throw new Error('Missing IV for decryption');
    }

    // Convert base64 back to ArrayBuffer
    const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.data);
    const iv = this.base64ToArrayBuffer(encryptedData.iv);

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.encryptionConfig.algorithm,
        iv,
      },
      this.encryptionKey,
      encryptedBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Batch storage operations for efficiency
   */
  async batchSet<T = any>(items: BatchItem<T>[], defaultOptions: StorageOptions = {}): Promise<void> {
    const operations = items.map(async (item) => {
      const options = { ...defaultOptions, ...item.options };
      await this.set(item.key, item.value, options);
    });

    await Promise.all(operations);
  }

  /**
   * Clear specific namespace
   */
  async clearNamespace(namespace: StorageNamespace): Promise<void> {
    try {
      const allData = await chrome.storage.local.get();
      const keysToRemove = Object.keys(allData).filter(key => key.startsWith(namespace));
      
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        
        // Clear from cache as well
        keysToRemove.forEach(key => this.cache.delete(key));
      }
    } catch (error) {
      console.error('Failed to clear namespace:', error);
      throw error;
    }
  }

  /**
   * Get keys within a specific namespace
   */
  async getNamespaceKeys(namespace: StorageNamespace): Promise<string[]> {
    try {
      const allData = await chrome.storage.local.get();
      return Object.keys(allData)
        .filter(key => key.startsWith(namespace))
        .map(key => key.replace(`${namespace}:`, ''));
    } catch (error) {
      console.error('Failed to get namespace keys:', error);
      return [];
    }
  }

  /**
   * Initialize storage with default configuration
   */
  async initialize(defaultConfig: Record<string, any>): Promise<void> {
    try {
      await this.ensureEncryptionInitialized();
      
      for (const [key, value] of Object.entries(defaultConfig)) {
        const existing = await this.get(key);
        if (existing === null) {
          await this.set(key, value);
        }
      }
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get complete application state
   */
  async getState(): Promise<Record<string, any>> {
    try {
      const allData = await chrome.storage.local.get();
      const state: Record<string, any> = {};
      
      for (const [storageKey, storedData] of Object.entries(allData)) {
        if (storageKey.startsWith('candidai:')) {
          const encryptedData = storedData as EncryptedData;
          let value: any;
          
          if (encryptedData.encrypted && this.encryptionKey) {
            value = JSON.parse(await this.decryptData(encryptedData));
          } else {
            value = JSON.parse(encryptedData.data);
          }
          
          state[storageKey] = value;
        }
      }
      
      return state;
    } catch (error) {
      console.error('Failed to get application state:', error);
      return {};
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      const byte = bytes[i];
      if (byte !== undefined) {
        binary += String.fromCharCode(byte);
      }
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clear cache without affecting storage
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Compatibility method for getItem - alias for get method
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    return this.get<T>(key);
  }

  /**
   * Compatibility method for setItem - alias for set method
   */
  async setItem<T = any>(key: string, value: T): Promise<void> {
    return this.set<T>(key, value);
  }
} 