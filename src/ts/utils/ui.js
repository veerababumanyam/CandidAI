/**
 * UIStateManager - Centralized UI state management
 * Implements reactive state patterns with persistence
 * Provides cross-component state synchronization
 */

/**
 * UIStateManager - Manages UI state across extension components
 * Implements Observer pattern for reactive updates
 */
export class UIStateManager {
  constructor() {
    // State containers
    this.state = {
      theme: 'light',
      fontSize: 'medium',
      autoScroll: true,
      sidebarCollapsed: false,
      activeTab: 'assistant',
      listeningActive: false,
      connectionStatus: 'disconnected',
      tokenUsage: 0,
      notifications: [],
    };

    // Observer registry
    this.observers = new Map();

    // State history for undo/redo
    this.stateHistory = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;

    // Debounce timers
    this.saveDebounceTimer = null;
    this.saveDebounceDelay = 1000;

    // Initialize
    this.initialize();
  }

  /**
   * Initialize state manager
   * Loads persisted state and sets up sync
   */
  async initialize() {
    // Load persisted state
    await this.loadPersistedState();

    // Set up cross-tab synchronization
    this.setupStateSync();

    // Apply initial state
    this.applyState();
  }

  /**
   * Get current state or specific property
   */
  getState(property = null) {
    if (property) {
      return this.state[property];
    }
    return { ...this.state };
  }

  /**
   * Update state with automatic persistence
   * Implements immutable state updates
   */
  setState(updates, options = {}) {
    const { silent = false, persist = true, addToHistory = true } = options;

    // Create new state
    const previousState = { ...this.state };
    const newState = { ...this.state, ...updates };

    // Validate state changes
    if (!this.validateState(newState)) {
      console.error('Invalid state update:', updates);
      return false;
    }

    // Add to history if enabled
    if (addToHistory) {
      this.addToHistory(previousState);
    }

    // Update state
    this.state = newState;

    // Notify observers unless silent
    if (!silent) {
      this.notifyObservers(updates);
    }

    // Persist state with debouncing
    if (persist) {
      this.debouncedSave();
    }

    // Apply state changes to UI
    this.applyState();

    return true;
  }

  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  subscribe(property, callback) {
    if (!this.observers.has(property)) {
      this.observers.set(property, new Set());
    }

    this.observers.get(property).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.observers.get(property);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.observers.delete(property);
        }
      }
    };
  }

  /**
   * Notify observers of state changes
   */
  notifyObservers(updates) {
    Object.keys(updates).forEach((property) => {
      const callbacks = this.observers.get(property);
      if (callbacks) {
        callbacks.forEach((callback) => {
          try {
            callback(updates[property], this.state);
          } catch (error) {
            console.error('Observer callback error:', error);
          }
        });
      }
    });

    // Notify global observers
    const globalCallbacks = this.observers.get('*');
    if (globalCallbacks) {
      globalCallbacks.forEach((callback) => {
        try {
          callback(updates, this.state);
        } catch (error) {
          console.error('Global observer callback error:', error);
        }
      });
    }
  }

  /**
   * Apply state changes to UI
   * Implements state-to-UI mapping
   */
  applyState() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', this.state.theme);

    // Apply font size
    document.documentElement.setAttribute('data-font-size', this.state.fontSize);

    // Apply other UI states
    document.body.classList.toggle('sidebar-collapsed', this.state.sidebarCollapsed);
  }

  /**
   * Validate state updates
   * Ensures state integrity
   */
  validateState(state) {
    const validations = {
      theme: ['light', 'dark', 'auto'],
      fontSize: ['small', 'medium', 'large'],
      connectionStatus: ['connected', 'connecting', 'disconnected', 'error'],
      tokenUsage: (value) => typeof value === 'number' && value >= 0,
    };

    for (const [key, validator] of Object.entries(validations)) {
      if (key in state) {
        if (Array.isArray(validator)) {
          if (!validator.includes(state[key])) {
            return false;
          }
        } else if (typeof validator === 'function') {
          if (!validator(state[key])) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Load persisted state from storage
   */
  async loadPersistedState() {
    try {
      const stored = await chrome.storage.local.get('uiState');
      if (stored.uiState) {
        this.state = { ...this.state, ...stored.uiState };
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  /**
   * Save state to storage with debouncing
   */
  debouncedSave() {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      this.saveState();
    }, this.saveDebounceDelay);
  }

  /**
   * Save current state to storage
   */
  async saveState() {
    try {
      await chrome.storage.local.set({ uiState: this.state });
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  /**
   * Set up cross-tab state synchronization
   */
  setupStateSync() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.uiState) {
        const newState = changes.uiState.newValue;
        if (newState) {
          // Update state without triggering another save
          this.setState(newState, { persist: false, silent: false });
        }
      }
    });
  }

  /**
   * Add state to history for undo/redo
   */
  addToHistory(state) {
    // Remove any states after current index
    this.stateHistory = this.stateHistory.slice(0, this.historyIndex + 1);

    // Add new state
    this.stateHistory.push(state);

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    } else {
      this.historyIndex++;
    }
  }

  /**
   * Undo state change
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const previousState = this.stateHistory[this.historyIndex];
      this.setState(previousState, { addToHistory: false });
      return true;
    }
    return false;
  }

  /**
   * Redo state change
   */
  redo() {
    if (this.historyIndex < this.stateHistory.length - 1) {
      this.historyIndex++;
      const nextState = this.stateHistory[this.historyIndex];
      this.setState(nextState, { addToHistory: false });
      return true;
    }
    return false;
  }

  /**
   * Reset state to defaults
   */
  reset() {
    const defaultState = {
      theme: 'light',
      fontSize: 'medium',
      autoScroll: true,
      sidebarCollapsed: false,
      activeTab: 'assistant',
      listeningActive: false,
      connectionStatus: 'disconnected',
      tokenUsage: 0,
      notifications: [],
    };

    this.setState(defaultState);
  }

  /**
   * Export current state
   */
  exportState() {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Import state from JSON
   */
  importState(jsonString) {
    try {
      const importedState = JSON.parse(jsonString);
      if (this.validateState(importedState)) {
        this.setState(importedState);
        return true;
      }
    } catch (error) {
      console.error('Failed to import state:', error);
    }
    return false;
  }
}
