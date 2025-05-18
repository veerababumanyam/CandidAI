/**
 * CandidAI - Platform Integration Content Script
 * Initializes platform-specific scrapers and sends data to the background script
 */

import platformScraperManager from './platform-specific-scrapers.js';

/**
 * Initialize the platform integration
 */
async function initializePlatformIntegration() {
  console.log('Initializing CandidAI platform integration...');
  
  try {
    // Initialize the platform scraper manager
    const initialized = await platformScraperManager.initialize();
    
    if (initialized) {
      // Start scraping
      await platformScraperManager.startScraping();
      
      // Send initial data to background script
      const initialData = platformScraperManager.getLastScrapedData();
      if (initialData) {
        chrome.runtime.sendMessage({
          action: 'platformDataScraped',
          data: initialData
        });
      }
      
      // Set up message listener for commands from background script
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'getPlatformData') {
          const data = platformScraperManager.getLastScrapedData();
          sendResponse({ success: true, data });
          return true; // Keep the message channel open for async response
        } else if (message.action === 'startPlatformScraping') {
          platformScraperManager.startScraping()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Keep the message channel open for async response
        } else if (message.action === 'stopPlatformScraping') {
          platformScraperManager.stopScraping();
          sendResponse({ success: true });
          return true; // Keep the message channel open for async response
        }
      });
    } else {
      console.log('No matching platform scraper found for this page');
    }
  } catch (error) {
    console.error('Error initializing platform integration:', error);
  }
}

// Initialize when the content script loads
initializePlatformIntegration();

// Re-initialize when the page changes (for single-page applications)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log('URL changed, re-initializing platform integration...');
    initializePlatformIntegration();
  }
}).observe(document, { subtree: true, childList: true });
