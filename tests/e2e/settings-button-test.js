/**
 * Settings Button Functionality Test
 * Verifies the settings button correctly opens the options page
 */

const { chromium } = require('playwright');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://127.0.0.1:3000',
  timeout: 30000
};

/**
 * Test settings button functionality
 */
async function testSettingsButton() {
  console.log('🔍 Testing Settings Button Functionality...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Track opened pages
  const openedPages = [];
  context.on('page', newPage => {
    openedPages.push(newPage);
    newPage.url() && console.log(`📄 New page opened: ${newPage.url()}`);
  });
  
  let testResults = {
    passed: 0,
    failed: 0,
    details: []
  };

  function addResult(name, status, message) {
    testResults.details.push({ name, status, message });
    if (status === 'PASS') testResults.passed++;
    else testResults.failed++;
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${name}: ${message}`);
  }

  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'log' && msg.text().includes('Settings')) {
      console.log(`[console] ${msg.text()}`);
    }
  });
  
  try {
    // Navigate to sidepanel
    console.log('📍 Navigating to sidepanel...');
    await page.goto(`${TEST_CONFIG.baseUrl}/dist/sidepanel/sidepanel.html`);
    await page.waitForTimeout(2000);
    
    // Check if settings button exists
    const settingsButton = await page.$('#settings-btn');
    if (settingsButton) {
      addResult('Settings Button Exists', 'PASS', 'Settings button found in sidepanel');
    } else {
      addResult('Settings Button Exists', 'FAIL', 'Settings button not found');
      await browser.close();
      return;
    }
    
    // Check initial state
    const initialPageCount = openedPages.length + 1; // +1 for main page
    
    // Click the settings button
    console.log('🖱️ Clicking settings button...');
    await page.click('#settings-btn');
    await page.waitForTimeout(3000);
    
    // Check if new page was opened
    const finalPageCount = openedPages.length + 1;
    
    if (finalPageCount > initialPageCount) {
      addResult('New Page Opened', 'PASS', `New page opened (${finalPageCount} total pages)`);
      
      // Check if the new page is the options page
      const newPage = openedPages[openedPages.length - 1];
      const newPageUrl = newPage.url();
      
      if (newPageUrl.includes('/options/options.html')) {
        addResult('Correct Options Page', 'PASS', `Options page opened: ${newPageUrl}`);
        
        // Wait for options page to load
        await newPage.waitForTimeout(2000);
        
        // Check if options page content is loaded
        const hasNavigationButtons = await newPage.$$eval('.ca-nav__button', buttons => buttons.length > 0);
        if (hasNavigationButtons) {
          addResult('Options Page Content', 'PASS', 'Options page loaded with navigation');
        } else {
          addResult('Options Page Content', 'FAIL', 'Options page loaded but content missing');
        }
        
      } else {
        addResult('Correct Options Page', 'FAIL', `Wrong page opened: ${newPageUrl}`);
      }
    } else {
      // Check if same page redirected
      const currentUrl = page.url();
      if (currentUrl.includes('/options/options.html')) {
        addResult('Page Redirect', 'PASS', `Page redirected to options: ${currentUrl}`);
      } else {
        addResult('Settings Button Action', 'FAIL', 'No new page opened and no redirect');
      }
    }
    
    // Test fallback functionality by simulating Chrome API unavailability
    console.log('🔄 Testing fallback functionality...');
    await page.goto(`${TEST_CONFIG.baseUrl}/dist/sidepanel/sidepanel.html`);
    await page.waitForTimeout(2000);
    
    // Inject script to disable Chrome APIs
    await page.evaluate(() => {
      if (window.chrome) {
        window.chrome.tabs = undefined;
        window.chrome.runtime = undefined;
      }
    });
    
    const beforeFallbackCount = openedPages.length + 1;
    await page.click('#settings-btn');
    await page.waitForTimeout(3000);
    
    const afterFallbackCount = openedPages.length + 1;
    
    if (afterFallbackCount > beforeFallbackCount || page.url().includes('/options/options.html')) {
      addResult('Fallback Functionality', 'PASS', 'Fallback method worked when Chrome APIs disabled');
    } else {
      addResult('Fallback Functionality', 'FAIL', 'Fallback method failed');
    }
    
  } catch (error) {
    console.error('Test execution error:', error);
    addResult('Test Execution', 'FAIL', `Error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Generate report
  const totalTests = testResults.passed + testResults.failed;
  const successRate = totalTests > 0 ? ((testResults.passed / totalTests) * 100).toFixed(1) : 0;
  
  console.log('\\n' + '='.repeat(60));
  console.log('🎉 SETTINGS BUTTON TEST COMPLETED');
  console.log('='.repeat(60));
  console.log(`📊 Results: ${testResults.passed}✅ ${testResults.failed}❌`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log('='.repeat(60));
  
  // Save detailed report
  const report = `# Settings Button Test Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${totalTests}
- **✅ Passed**: ${testResults.passed}
- **❌ Failed**: ${testResults.failed}
- **Success Rate**: ${successRate}%

## Test Results
${testResults.details.map(result => 
  `### ${result.status === 'PASS' ? '✅' : '❌'} ${result.name}\\n- **Status**: ${result.status}\\n- **Message**: ${result.message}\\n`
).join('\\n')}

---
*Test completed at ${new Date().toLocaleString()}*
`;

  fs.writeFileSync('SETTINGS_BUTTON_TEST_REPORT.md', report);
  console.log(`📄 Detailed report saved: SETTINGS_BUTTON_TEST_REPORT.md\\n`);
  
  return testResults;
}

// Run the test
testSettingsButton().catch(console.error); 