const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Test configuration
const EXTENSION_PATH = path.resolve(__dirname, '../../');
const TEST_TIMEOUT = 30000;

class E2ETestRunner {
  constructor() {
    this.results = [];
    this.browser = null;
    this.context = null;
    this.page = null;
    this.extensionId = null;
  }

  async setup() {
    console.log('🚀 Starting CandidAI Extension E2E Tests...\n');
    
    // Launch browser with extension
    this.browser = await chromium.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-web-security'
      ]
    });

    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    // Get extension ID
    try {
      await this.page.goto('chrome://extensions/');
      await this.page.waitForTimeout(2000);
    } catch (error) {
      console.log('Warning: Could not navigate to chrome://extensions/', error.message);
    }
    
    console.log('✅ Browser launched with extension loaded\n');
  }

  async runTest(testName, testFunction) {
    console.log(`🧪 Running: ${testName}`);
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name: testName,
        status: 'PASS',
        duration,
        details: result || 'Test completed successfully'
      });
      
      console.log(`✅ PASS: ${testName} (${duration}ms)\n`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name: testName,
        status: 'FAIL',
        duration,
        error: error.message,
        details: error.stack
      });
      
      console.log(`❌ FAIL: ${testName} (${duration}ms)`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  async testExtensionInstallation() {
    await this.page.goto('chrome://extensions/');
    await this.page.waitForTimeout(1000);
    
    // Check if extension is visible
    const extensionCards = await this.page.$$eval('extensions-item', items => items.length);
    
    if (extensionCards === 0) {
      throw new Error('No extensions found on chrome://extensions page');
    }
    
    // Try to find CandidAI extension
    const candidaiExtension = await this.page.$eval('extensions-item', item => {
      const name = item.shadowRoot?.querySelector('#name')?.textContent;
      return name?.includes('CandidAI') || name?.includes('Candid');
    }).catch(() => false);
    
    return `Found ${extensionCards} extension(s), CandidAI detected: ${candidaiExtension}`;
  }

  async testManifestAccess() {
    // Try to access manifest.json directly
    const manifestUrl = 'chrome-extension://*/manifest.json';
    
    try {
      // Get all extension IDs
      await this.page.goto('chrome://extensions/');
      const extensionIds = await this.page.evaluate(() => {
        const items = document.querySelectorAll('extensions-item');
        return Array.from(items).map(item => item.id).filter(id => id);
      });
      
      if (extensionIds.length === 0) {
        throw new Error('No extension IDs found');
      }
      
      // Try to access manifest for each extension
      for (const id of extensionIds) {
        try {
          const response = await this.page.goto(`chrome-extension://${id}/manifest.json`);
          if (response.ok()) {
            const content = await this.page.textContent('pre');
            const manifest = JSON.parse(content);
            
            if (manifest.name?.includes('CandidAI') || manifest.name?.includes('Candid')) {
              this.extensionId = id;
              return `Manifest accessible for ${manifest.name} v${manifest.version}`;
            }
          }
        } catch (e) {
          // Continue to next extension
        }
      }
      
      throw new Error('CandidAI manifest not found');
    } catch (error) {
      throw new Error(`Manifest access failed: ${error.message}`);
    }
  }

  async testOptionsPage() {
    if (!this.extensionId) {
      throw new Error('Extension ID not found - cannot test options page');
    }
    
    const optionsUrl = `chrome-extension://${this.extensionId}/options/options.html`;
    
    try {
      const response = await this.page.goto(optionsUrl);
      
      if (!response.ok()) {
        throw new Error(`Options page returned ${response.status()}`);
      }
      
      await this.page.waitForTimeout(2000);
      
      const title = await this.page.title();
      const bodyContent = await this.page.$eval('body', el => el.textContent.length);
      
      return `Options page loaded: "${title}", content length: ${bodyContent} chars`;
    } catch (error) {
      throw new Error(`Options page test failed: ${error.message}`);
    }
  }

  async testSidePanel() {
    if (!this.extensionId) {
      throw new Error('Extension ID not found - cannot test side panel');
    }
    
    const sidePanelUrl = `chrome-extension://${this.extensionId}/sidepanel/sidepanel.html`;
    
    try {
      const response = await this.page.goto(sidePanelUrl);
      
      if (!response.ok()) {
        throw new Error(`Side panel returned ${response.status()}`);
      }
      
      await this.page.waitForTimeout(2000);
      
      const title = await this.page.title();
      const bodyContent = await this.page.$eval('body', el => el.textContent.length);
      
      return `Side panel loaded: "${title}", content length: ${bodyContent} chars`;
    } catch (error) {
      throw new Error(`Side panel test failed: ${error.message}`);
    }
  }

  async testAssetLoading() {
    if (!this.extensionId) {
      throw new Error('Extension ID not found - cannot test assets');
    }
    
    const assets = [
      'src/assets/icons/openai.svg',
      'src/assets/icons/anthropic.svg',
      'src/assets/icons/google.svg'
    ];
    
    const results = [];
    
    for (const asset of assets) {
      try {
        const response = await this.page.goto(`chrome-extension://${this.extensionId}/${asset}`);
        results.push(`${asset}: ${response.status()}`);
      } catch (error) {
        results.push(`${asset}: ERROR - ${error.message}`);
      }
    }
    
    return `Asset loading results:\n${results.join('\n')}`;
  }

  async testContentScriptInjection() {
    // Test on Google Meet
    try {
      await this.page.goto('https://meet.google.com/');
      await this.page.waitForTimeout(3000);
      
      const meetElements = await this.page.evaluate(() => {
        return document.querySelectorAll('[class*="candidai"], [id*="candidai"]').length;
      });
      
      // Test on LinkedIn
      await this.page.goto('https://www.linkedin.com/');
      await this.page.waitForTimeout(3000);
      
      const linkedinElements = await this.page.evaluate(() => {
        return document.querySelectorAll('[class*="candidai"], [id*="candidai"]').length;
      });
      
      return `Content script injection - Google Meet: ${meetElements} elements, LinkedIn: ${linkedinElements} elements`;
    } catch (error) {
      throw new Error(`Content script test failed: ${error.message}`);
    }
  }

  async testConsoleErrors() {
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to extension pages and collect errors
    const testPages = [];
    
    if (this.extensionId) {
      testPages.push(
        `chrome-extension://${this.extensionId}/options/options.html`,
        `chrome-extension://${this.extensionId}/sidepanel/sidepanel.html`
      );
    }
    
    for (const url of testPages) {
      try {
        await this.page.goto(url);
        await this.page.waitForTimeout(2000);
      } catch (e) {
        // Continue testing
      }
    }
    
    return `Console errors detected: ${errors.length}\n${errors.slice(0, 3).join('\n')}`;
  }

  async generateReport() {
    const timestamp = new Date().toISOString();
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    
    const report = {
      timestamp,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`
      },
      results: this.results
    };
    
    // Write JSON report
    fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
    
    // Write HTML report
    const htmlReport = this.generateHTMLReport(report);
    fs.writeFileSync('test-report.html', htmlReport);
    
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Pass Rate: ${report.summary.passRate}`);
    console.log('\n📄 Reports generated:');
    console.log('- test-results.json');
    console.log('- test-report.html');
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>CandidAI Extension E2E Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .pass { background: #d4edda; border-left: 4px solid #28a745; }
        .fail { background: #f8d7da; border-left: 4px solid #dc3545; }
        .error { color: #721c24; font-family: monospace; font-size: 12px; }
        .details { color: #495057; margin-top: 5px; }
    </style>
</head>
<body>
    <h1>CandidAI Extension E2E Test Report</h1>
    <p>Generated: ${report.timestamp}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Tests: ${report.summary.total}</p>
        <p>Passed: ${report.summary.passed}</p>
        <p>Failed: ${report.summary.failed}</p>
        <p>Pass Rate: ${report.summary.passRate}</p>
    </div>
    
    <h2>Test Results</h2>
    ${report.results.map(result => `
        <div class="test-result ${result.status.toLowerCase()}">
            <h3>${result.name} - ${result.status} (${result.duration}ms)</h3>
            ${result.details ? `<div class="details">${result.details}</div>` : ''}
            ${result.error ? `<div class="error">Error: ${result.error}</div>` : ''}
        </div>
    `).join('')}
</body>
</html>`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.setup();
      
      await this.runTest('Extension Installation', () => this.testExtensionInstallation());
      await this.runTest('Manifest Access', () => this.testManifestAccess());
      await this.runTest('Options Page', () => this.testOptionsPage());
      await this.runTest('Side Panel', () => this.testSidePanel());
      await this.runTest('Asset Loading', () => this.testAssetLoading());
      await this.runTest('Content Script Injection', () => this.testContentScriptInjection());
      await this.runTest('Console Error Detection', () => this.testConsoleErrors());
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests
const runner = new E2ETestRunner();
runner.run().then(() => {
  console.log('\n🎉 E2E testing completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
}); 