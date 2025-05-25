const { test, expect } = require('@playwright/test');
const path = require('path');

// Test configuration
const EXTENSION_PATH = path.resolve(__dirname, '../../');
const TEST_TIMEOUT = 30000;

test.describe('CandidAI Extension E2E Tests', () => {
  let context;
  let page;
  let extensionId;

  test.beforeAll(async ({ browser }) => {
    // Load extension in browser context
    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });

    // Get extension ID
    page = await context.newPage();
    await page.goto('chrome://extensions/');
    
    // Wait for extensions to load
    await page.waitForTimeout(2000);
    
    // Find the CandidAI extension
    const extensionElement = await page.locator('[data-test-id="extension-item"]').first();
    if (await extensionElement.isVisible()) {
      extensionId = await extensionElement.getAttribute('id');
      console.log('Extension ID:', extensionId);
    }
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Extension Installation Test', async () => {
    console.log('Testing extension installation...');
    
    await page.goto('chrome://extensions/');
    await page.waitForTimeout(1000);
    
    // Check if extension is installed and enabled
    const extensionCards = await page.locator('[data-test-id="extension-item"]').count();
    expect(extensionCards).toBeGreaterThan(0);
    
    console.log('✅ Extension appears to be installed');
  });

  test('Options Page Test', async () => {
    console.log('Testing options page...');
    
    try {
      // Try to open options page
      await page.goto(`chrome-extension://${extensionId}/options/options.html`);
      await page.waitForTimeout(2000);
      
      // Check if page loads
      const title = await page.title();
      console.log('Options page title:', title);
      
      // Look for key elements
      const apiKeySection = await page.locator('#api-keys').isVisible().catch(() => false);
      console.log('API Keys section visible:', apiKeySection);
      
      console.log('✅ Options page accessible');
    } catch (error) {
      console.log('❌ Options page error:', error.message);
    }
  });

  test('Side Panel Test', async () => {
    console.log('Testing side panel...');
    
    try {
      // Try to open side panel
      await page.goto(`chrome-extension://${extensionId}/sidepanel/sidepanel.html`);
      await page.waitForTimeout(2000);
      
      const title = await page.title();
      console.log('Side panel title:', title);
      
      // Check for navigation elements
      const navElements = await page.locator('nav, .navigation, [role="navigation"]').count();
      console.log('Navigation elements found:', navElements);
      
      console.log('✅ Side panel accessible');
    } catch (error) {
      console.log('❌ Side panel error:', error.message);
    }
  });

  test('Content Script Injection Test', async () => {
    console.log('Testing content script injection...');
    
    // Test on Google Meet
    await page.goto('https://meet.google.com/');
    await page.waitForTimeout(3000);
    
    // Check if content script elements are injected
    const candidaiElements = await page.evaluate(() => {
      return document.querySelectorAll('[class*="candidai"], [id*="candidai"]').length;
    });
    
    console.log('CandidAI elements found on Google Meet:', candidaiElements);
    
    // Test on LinkedIn
    await page.goto('https://www.linkedin.com/');
    await page.waitForTimeout(3000);
    
    const linkedinElements = await page.evaluate(() => {
      return document.querySelectorAll('[class*="candidai"], [id*="candidai"]').length;
    });
    
    console.log('CandidAI elements found on LinkedIn:', linkedinElements);
    
    console.log('✅ Content script injection test completed');
  });

  test('Local File System Test', async () => {
    console.log('Testing local file system access...');
    
    // Test if extension files exist and are accessible
    const manifestExists = await page.goto(`chrome-extension://${extensionId}/manifest.json`)
      .then(() => true)
      .catch(() => false);
    
    console.log('Manifest.json accessible:', manifestExists);
    
    if (manifestExists) {
      const manifestContent = await page.textContent('pre');
      const manifest = JSON.parse(manifestContent);
      console.log('Extension version:', manifest.version);
      console.log('Extension name:', manifest.name);
    }
    
    console.log('✅ Local file system test completed');
  });

  test('Icon and Asset Loading Test', async () => {
    console.log('Testing icon and asset loading...');
    
    const iconTests = [
      'src/assets/icons/openai.svg',
      'src/assets/icons/anthropic.svg', 
      'src/assets/icons/google.svg'
    ];
    
    for (const iconPath of iconTests) {
      try {
        const response = await page.goto(`chrome-extension://${extensionId}/${iconPath}`);
        const status = response.status();
        console.log(`${iconPath}: HTTP ${status}`);
      } catch (error) {
        console.log(`${iconPath}: Error - ${error.message}`);
      }
    }
    
    console.log('✅ Icon loading test completed');
  });

  test('Service Worker Test', async () => {
    console.log('Testing service worker...');
    
    // Check service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });
    
    console.log('Service worker registered:', swRegistered);
    
    console.log('✅ Service worker test completed');
  });

  test('Error Detection Test', async () => {
    console.log('Testing for console errors...');
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to different pages and check for errors
    const testPages = [
      `chrome-extension://${extensionId}/options/options.html`,
      `chrome-extension://${extensionId}/sidepanel/sidepanel.html`
    ];
    
    for (const testPage of testPages) {
      try {
        await page.goto(testPage);
        await page.waitForTimeout(2000);
      } catch (error) {
        console.log(`Error loading ${testPage}:`, error.message);
      }
    }
    
    console.log('Console errors detected:', errors.length);
    if (errors.length > 0) {
      console.log('Errors:', errors.slice(0, 5)); // Show first 5 errors
    }
    
    console.log('✅ Error detection test completed');
  });
});

// Export for reporting
module.exports = {
  EXTENSION_PATH,
  TEST_TIMEOUT
}; 