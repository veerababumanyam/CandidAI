/**
 * CandidAI - Internationalization Utility
 * Provides functions for handling internationalization
 */

/**
 * Supported languages for the UI
 * @type {Object}
 */
export const SUPPORTED_UI_LANGUAGES = {
  'en': 'English',
  'es': 'Español (Spanish)'
};

/**
 * Supported languages for transcription
 * @type {Object}
 */
export const SUPPORTED_TRANSCRIPTION_LANGUAGES = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'es-ES': 'Español (Spain)',
  'es-MX': 'Español (Mexico)'
};

/**
 * Supported languages for LLM responses
 * @type {Object}
 */
export const SUPPORTED_RESPONSE_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'auto': 'Same as transcription'
};

/**
 * Default language settings
 * @type {Object}
 */
export const DEFAULT_LANGUAGE_SETTINGS = {
  ui: navigator.language.split('-')[0] || 'en',
  transcription: navigator.language || 'en-US',
  response: 'auto'
};

/**
 * Get a message from the i18n API
 * @param {string} messageName - The name of the message to get
 * @param {Object} substitutions - Optional substitutions for placeholders
 * @returns {string} - The localized message
 */
export function getMessage(messageName, substitutions = null) {
  try {
    return chrome.i18n.getMessage(messageName, substitutions) || messageName;
  } catch (error) {
    console.error(`Error getting message ${messageName}:`, error);
    return messageName;
  }
}

/**
 * Get the current language settings
 * @returns {Promise<Object>} - The current language settings
 */
export async function getLanguageSettings() {
  try {
    const { default: StorageUtil } = await import('./storage.js');
    const settings = await StorageUtil.get('languageSettings');
    return settings || DEFAULT_LANGUAGE_SETTINGS;
  } catch (error) {
    console.error('Error getting language settings:', error);
    return DEFAULT_LANGUAGE_SETTINGS;
  }
}

/**
 * Save language settings
 * @param {Object} settings - The language settings to save
 * @returns {Promise<boolean>} - Whether the save was successful
 */
export async function saveLanguageSettings(settings) {
  try {
    const { default: StorageUtil } = await import('./storage.js');
    await StorageUtil.set({ languageSettings: settings });
    return true;
  } catch (error) {
    console.error('Error saving language settings:', error);
    return false;
  }
}

/**
 * Apply language settings to the UI
 * @param {Object} settings - The language settings to apply
 */
export function applyLanguageToUI(settings = null) {
  // If no settings provided, use the default
  const uiLanguage = settings?.ui || DEFAULT_LANGUAGE_SETTINGS.ui;
  
  // Set the lang attribute on the html element
  document.documentElement.lang = uiLanguage;
  
  // Find all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  
  // Update each element with the localized text
  elements.forEach(element => {
    const messageName = element.getAttribute('data-i18n');
    const message = getMessage(messageName);
    
    // If the element has a placeholder attribute, update that instead
    if (element.hasAttribute('placeholder')) {
      element.placeholder = message;
    } else {
      element.textContent = message;
    }
  });
  
  // Find all elements with data-i18n-title attribute
  const titleElements = document.querySelectorAll('[data-i18n-title]');
  
  // Update each element's title with the localized text
  titleElements.forEach(element => {
    const messageName = element.getAttribute('data-i18n-title');
    element.title = getMessage(messageName);
  });
}

/**
 * Get the appropriate language for transcription
 * @returns {Promise<string>} - The language code for transcription
 */
export async function getTranscriptionLanguage() {
  const settings = await getLanguageSettings();
  return settings.transcription || DEFAULT_LANGUAGE_SETTINGS.transcription;
}

/**
 * Get the appropriate language for LLM responses
 * @returns {Promise<string>} - The language code for responses
 */
export async function getResponseLanguage() {
  const settings = await getLanguageSettings();
  
  // If set to auto, use the transcription language
  if (settings.response === 'auto') {
    const transcriptionLang = settings.transcription || DEFAULT_LANGUAGE_SETTINGS.transcription;
    // Extract the base language code (e.g., 'en-US' -> 'en')
    return transcriptionLang.split('-')[0];
  }
  
  return settings.response || DEFAULT_LANGUAGE_SETTINGS.response;
}

/**
 * Initialize the i18n utility
 */
export async function initialize() {
  try {
    // Get the current language settings
    const settings = await getLanguageSettings();
    
    // Apply the language to the UI
    applyLanguageToUI(settings);
    
    console.log('i18n utility initialized with language:', settings.ui);
    return true;
  } catch (error) {
    console.error('Error initializing i18n utility:', error);
    return false;
  }
}

export default {
  getMessage,
  getLanguageSettings,
  saveLanguageSettings,
  applyLanguageToUI,
  getTranscriptionLanguage,
  getResponseLanguage,
  initialize,
  SUPPORTED_UI_LANGUAGES,
  SUPPORTED_TRANSCRIPTION_LANGUAGES,
  SUPPORTED_RESPONSE_LANGUAGES,
  DEFAULT_LANGUAGE_SETTINGS
};
