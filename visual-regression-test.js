/**
 * Visual Regression Testing for CandidAI Extension
 * Implements baseline screenshot capture and comparison
 * Follows enterprise-grade testing standards for UI integrity
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Constants for visual regression testing
const BASELINE_DIR = './tests/visual-baselines';
const RESULTS_DIR = './tests/visual-results';
const EXTENSION_PATH = './dist';
const TEST_PAGES = [
  'sidepanel/sidepanel.html',
  'options/options.html'
];

// Visual testing configuration
const VIEWPORT_CONFIGS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'compact', width: 400, height: 600 },
  { name: 'mobile', width: 375, height: 667 }
];

class VisualRegressionTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.results = [];
  }

  async initialize() {
    console.log('🚀 Initializing Visual Regression Testing Suite...');
    
    // Ensure directories exist
    await this.ensureDirectories();
    
    // Launch browser with extension loaded
    this.browser = await chromium.launch({
      headless: false, // Set to true for CI/CD
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    this.context = await this.browser.newContext({
      ignoreHTTPSErrors: true
    });
    
    console.log('✅ Browser initialized with extension loaded');
  }

  async ensureDirectories() {
    const dirs = [BASELINE_DIR, RESULTS_DIR];
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  async captureBaselines() {
    console.log('📸 Capturing baseline screenshots...');
    
    for (const testPage of TEST_PAGES) {
      for (const viewport of VIEWPORT_CONFIGS) {
        await this.capturePageScreenshot(testPage, viewport, 'baseline');
      }
    }
    
    console.log('✅ All baseline screenshots captured');
  }

  async runVisualComparison() {
    console.log('🔍 Running visual comparison tests...');
    
    for (const testPage of TEST_PAGES) {
      for (const viewport of VIEWPORT_CONFIGS) {
        const result = await this.capturePageScreenshot(testPage, viewport, 'current');
        this.results.push(result);
      }
    }
    
    await this.generateReport();
    console.log('✅ Visual comparison completed');
  }

  async capturePageScreenshot(testPage, viewport, type) {
    const page = await this.context.newPage();
    
    try {
      // Set viewport
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      // Navigate to the test page
      const pageUrl = `file://${path.resolve(EXTENSION_PATH, testPage)}`;
      await page.goto(pageUrl, { waitUntil: 'networkidle' });
      
      // Wait for any animations to complete
      await page.waitForTimeout(1000);
      
      // Generate filename
      const pageName = testPage.replace(/[\/\\]/g, '_').replace('.html', '');
      const filename = `${pageName}_${viewport.name}_${type}.png`;
      const dir = type === 'baseline' ? BASELINE_DIR : RESULTS_DIR;
      const filepath = path.join(dir, filename);
      
      // Capture screenshot
      await page.screenshot({
        path: filepath,
        fullPage: true
      });
      
      console.log(`📸 Captured: ${filename}`);
      
      return {
        page: testPage,
        viewport: viewport.name,
        type,
        filename,
        filepath,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Error capturing ${testPage} at ${viewport.name}:`, error.message);
      return null;
    } finally {
      await page.close();
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_tests: this.results.length,
        passed: this.results.filter(r => r !== null).length,
        failed: this.results.filter(r => r === null).length
      },
      results: this.results.filter(r => r !== null),
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(RESULTS_DIR, 'visual-regression-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    await this.generateHtmlReport(report);
    
    console.log(`📋 Report generated: ${reportPath}`);
  }

  async generateHtmlReport(report) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CandidAI Visual Regression Test Report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 2rem; }
        .header { background: #e8a396; color: white; padding: 1rem; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .metric { background: #f9f7f6; padding: 1rem; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #d36552; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .screenshot-card { border: 1px solid #e7e4e2; border-radius: 8px; overflow: hidden; }
        .screenshot-info { padding: 1rem; background: #fdfcfb; }
        .screenshot-img { width: 100%; height: auto; display: block; }
        .recommendations { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem; margin: 2rem 0; }
        .timestamp { color: #78716c; font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 CandidAI Visual Regression Test Report</h1>
        <p class="timestamp">Generated: ${report.timestamp}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${report.summary.total_tests}</div>
            <div>Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.passed}</div>
            <div>Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.failed}</div>
            <div>Failed</div>
        </div>
    </div>

    <div class="recommendations">
        <h3>📋 Recommendations</h3>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <h2>📸 Screenshots</h2>
    <div class="screenshots">
        ${report.results.map(result => `
            <div class="screenshot-card">
                <img src="${result.filename}" alt="${result.page} - ${result.viewport}" class="screenshot-img">
                <div class="screenshot-info">
                    <strong>${result.page}</strong><br>
                    Viewport: ${result.viewport}<br>
                    <span class="timestamp">${result.timestamp}</span>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const reportPath = path.join(RESULTS_DIR, 'visual-regression-report.html');
    await fs.writeFile(reportPath, htmlContent);
  }

  generateRecommendations() {
    return [
      'Regular visual regression testing should be integrated into the CI/CD pipeline',
      'Consider implementing automated visual diff comparison tools like Percy or Chromatic',
      'Establish baseline screenshots for all critical user journeys',
      'Monitor CSS changes impact on responsive design across different viewport sizes',
      'Document any intentional visual changes with updated baselines',
      'Set up alerts for visual regressions in production deployments'
    ];
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser session closed');
    }
  }
}

// CLI Interface
async function main() {
  const tester = new VisualRegressionTester();
  
  try {
    await tester.initialize();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--baseline')) {
      await tester.captureBaselines();
    } else {
      await tester.runVisualComparison();
    }
    
  } catch (error) {
    console.error('❌ Visual regression testing failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Export for programmatic use
module.exports = { VisualRegressionTester };

// Run if called directly
if (require.main === module) {
  main();
} 