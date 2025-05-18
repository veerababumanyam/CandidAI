/**
 * CandidAI - Storage Utility
 * Provides a secure and reliable interface for working with chrome.storage.local
 * Features:
 * - Promise-based API
 * - Error handling with automatic retries
 * - Data validation
 * - Storage quota management
 */

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // ms
const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024; // 5MB (Chrome extension storage limit)
const QUOTA_WARNING_THRESHOLD = 0.8; // 80% of quota

const StorageUtil = {
  // Internal state
  _initialized: false,
  _pendingOperations: [],

  /**
   * Initialize the storage utility
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  initialize: async function() {
    if (this._initialized) {
      return true;
    }

    try {
      // Check if storage is available
      await this._testStorage();

      // Check storage quota
      await this._checkQuota();

      this._initialized = true;
      console.log('Storage utility initialized');
      return true;
    } catch (error) {
      console.error('Error initializing storage utility:', error);
      return false;
    }
  },

  /**
   * Test if storage is available
   * @private
   * @returns {Promise<boolean>} - Whether storage is available
   */
  _testStorage: async function() {
    try {
      const testKey = '_storage_test_';
      const testValue = Date.now().toString();

      // Try to write to storage
      await this.set({ [testKey]: testValue });

      // Try to read from storage
      const result = await this.get(testKey);

      // Verify the value
      if (result !== testValue) {
        throw new Error('Storage test failed: value mismatch');
      }

      // Clean up
      await this.remove(testKey);

      return true;
    } catch (error) {
      console.error('Storage test failed:', error);
      throw error;
    }
  },

  /**
   * Check storage quota
   * @private
   * @returns {Promise<void>}
   */
  _checkQuota: async function() {
    try {
      const bytesInUse = await this.getBytesInUse();
      const quotaPercentage = bytesInUse / STORAGE_QUOTA_BYTES;

      if (quotaPercentage > QUOTA_WARNING_THRESHOLD) {
        console.warn(`Storage quota warning: ${Math.round(quotaPercentage * 100)}% used (${bytesInUse} bytes)`);
      }
    } catch (error) {
      console.error('Error checking storage quota:', error);
      // Non-critical error, don't throw
    }
  },

  /**
   * Retry a function with exponential backoff
   * @private
   * @param {Function} fn - Function to retry
   * @param {Array} args - Arguments to pass to the function
   * @param {number} retryCount - Current retry count
   * @returns {Promise<any>} - Promise resolving to the function result
   */
  _retry: async function(fn, args, retryCount = 0) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.warn(`Storage operation failed, retrying in ${delay}ms (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._retry(fn, args, retryCount + 1);
      } else {
        console.error('Storage operation failed after max retries:', error);
        throw error;
      }
    }
  },
  /**
   * Get a value or multiple values from storage
   * @param {string|Array<string>} keys - Key or array of keys to retrieve
   * @returns {Promise<any>} - Promise resolving to the retrieved value(s)
   */
  get: async function(keys) {
    // Initialize if needed
    if (!this._initialized) {
      await this.initialize();
    }

    // Use retry logic
    return this._retry(function(keys) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            // If a single key was requested, return just that value
            if (typeof keys === 'string') {
              resolve(result[keys]);
            } else {
              resolve(result);
            }
          }
        });
      });
    }, [keys]);
  },

  /**
   * Set a value or multiple values in storage
   * @param {Object} items - Object with key-value pairs to store
   * @returns {Promise<void>} - Promise resolving when storage is complete
   */
  set: async function(items) {
    // Initialize if needed
    if (!this._initialized) {
      await this.initialize();
    }

    // Validate items
    if (!items || typeof items !== 'object') {
      throw new Error('Invalid items: must be an object');
    }

    // Check for circular references
    try {
      JSON.stringify(items);
    } catch (error) {
      throw new Error('Invalid items: contains circular references or non-serializable values');
    }

    // Check storage quota before saving
    await this._checkQuota();

    // Use retry logic
    return this._retry(function(items) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }, [items]);
  },

  /**
   * Remove a key or multiple keys from storage
   * @param {string|Array<string>} keys - Key or array of keys to remove
   * @returns {Promise<void>} - Promise resolving when removal is complete
   */
  remove: async function(keys) {
    // Initialize if needed
    if (!this._initialized) {
      await this.initialize();
    }

    // Validate keys
    if (!keys) {
      throw new Error('Invalid keys: must be a string or array');
    }

    // Use retry logic
    return this._retry(function(keys) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove(keys, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }, [keys]);
  },

  /**
   * Clear all storage
   * @returns {Promise<void>} - Promise resolving when storage is cleared
   */
  clear: async function() {
    // Initialize if needed
    if (!this._initialized) {
      await this.initialize();
    }

    // Confirm with a warning log
    console.warn('Clearing all storage data');

    // Use retry logic
    return this._retry(function() {
      return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            console.log('All storage data cleared');
            resolve();
          }
        });
      });
    }, []);
  },

  /**
   * Get the total bytes in use
   * @returns {Promise<number>} - Promise resolving to bytes in use
   */
  getBytesInUse: async function() {
    // Initialize if needed
    if (!this._initialized) {
      await this.initialize();
    }

    // Use retry logic
    return this._retry(function() {
      return new Promise((resolve, reject) => {
        chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(bytesInUse);
          }
        });
      });
    }, []);
  },

  /**
   * Listen for changes to storage
   * @param {Function} callback - Function to call when storage changes
   * @returns {Function} - Function to remove the listener
   */
  addChangeListener: function(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    // Wrap the callback to add error handling
    const wrappedCallback = (changes, areaName) => {
      try {
        callback(changes, areaName);
      } catch (error) {
        console.error('Error in storage change listener:', error);
      }
    };

    chrome.storage.onChanged.addListener(wrappedCallback);

    // Return a function to remove the listener
    return () => chrome.storage.onChanged.removeListener(wrappedCallback);
  },

  /**
   * Export all storage data (for backup)
   * @returns {Promise<Object>} - Promise resolving to all storage data
   */
  exportData: async function() {
    // Initialize if needed
    if (!this._initialized) {
      await this.initialize();
    }

    // Get all data
    const data = await this.get(null);

    // Add metadata
    const exportData = {
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        bytesInUse: await this.getBytesInUse()
      }
    };

    return exportData;
  },

  /**
   * Import storage data (from backup)
   * @param {Object} importData - Data to import
   * @param {boolean} clearExisting - Whether to clear existing data before import
   * @returns {Promise<void>} - Promise resolving when import is complete
   */
  importData: async function(importData, clearExisting = false) {
    // Initialize if needed
    if (!this._initialized) {
      await this.initialize();
    }

    // Validate import data
    if (!importData || !importData.data || !importData.metadata) {
      throw new Error('Invalid import data');
    }

    // Clear existing data if requested
    if (clearExisting) {
      await this.clear();
    }

    // Import data
    await this.set(importData.data);

    console.log(`Imported data from ${importData.metadata.timestamp}`);
  }
};

export default StorageUtil;
