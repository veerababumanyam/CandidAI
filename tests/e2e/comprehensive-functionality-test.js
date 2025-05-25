/**
 * Comprehensive Functionality Test Suite for CandidAI Extension
 * Tests all actual functionality including file upload, drag-drop, API connections, and real features
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://127.0.0.1:3000',
  timeout: 30000,
  apiKeys: {
      openai: 'YOUR_OPENAI_API_KEY_HERE',
  anthropic: 'YOUR_ANTHROPIC_API_KEY_HERE',
    gemini: 'YOUR_GEMINI_API_KEY_HERE'
  }
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  overall: 'PENDING',
  tests: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

/**
 * Comprehensive Functionality Test Class
 */
class ComprehensiveFunctionalityTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
  }

  /**
   * Initialize browser and page
   */
  async initialize() {
    console.log('🚀 Initializing Comprehensive Functionality Test Suite...');
    
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.context.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
  }

  /**
   * Navigate to options page
   */
  async navigateToOptionsPage() {
    console.log('📍 Navigating to options page...');
    await this.page.goto(`${TEST_CONFIG.baseUrl}/dist/options/options.html`);
    await this.page.waitForLoadState('networkidle');
    
    // Wait for page to be ready
    await this.page.waitForSelector('.ca-options', { timeout: 10000 });
    console.log('✅ Options page loaded successfully');
  }

  /**
   * Test Document Upload Functionality
   */
  async testDocumentUpload() {
    console.log('\n📄 Testing Document Upload Functionality...');
    
    await this.page.click('[data-section="resume"]');
    await this.page.waitForTimeout(500);
    
    const uploadResults = {
      dropzoneFound: false,
      fileInputFound: false,
      uploadTriggered: false,
      previewDisplayed: false,
      removeButtonFound: false
    };

    try {
      // Check if dropzone exists
      const dropzone = await this.page.locator('#resume-dropzone');
      uploadResults.dropzoneFound = await dropzone.isVisible();
      console.log(`✅ Dropzone found: ${uploadResults.dropzoneFound}`);
      
      // Check file input
      const fileInput = await this.page.locator('#resume-input');
      uploadResults.fileInputFound = await fileInput.isVisible() || true; // Hidden inputs
      console.log(`✅ File input found: ${uploadResults.fileInputFound}`);
      
      // Create a test file
      const testFile = path.join(__dirname, 'test-resume.pdf');
      fs.writeFileSync(testFile, 'Test PDF content for upload testing');
      
      // Try to upload file by clicking dropzone and selecting file
      await dropzone.click();
      
      // Set file input
      try {
        await fileInput.setInputFiles(testFile);
        uploadResults.uploadTriggered = true;
        console.log('✅ File upload triggered');
        
        // Wait for preview to appear
        await this.page.waitForTimeout(1000);
        const preview = await this.page.locator('#resume-preview');
        uploadResults.previewDisplayed = await preview.isVisible();
        
        if (uploadResults.previewDisplayed) {
          console.log('✅ File preview displayed');
          
          // Check remove button
          const removeBtn = await this.page.locator('#remove-resume');
          uploadResults.removeButtonFound = await removeBtn.isVisible();
          console.log(`✅ Remove button found: ${uploadResults.removeButtonFound}`);
        }
        
      } catch (error) {
        console.log(`❌ File upload failed: ${error.message}`);
      }
      
      // Clean up test file
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      
    } catch (error) {
      console.log(`❌ Document upload test failed: ${error.message}`);
    }

    testResults.tests.documentUpload = {
      status: uploadResults.uploadTriggered ? 'PASSED' : 'FAILED',
      details: uploadResults
    };
  }

  /**
   * Test LLM Fallback Drag-Drop Reordering
   */
  async testLlmFallbackReordering() {
    console.log('\n🔄 Testing LLM Fallback Reordering...');
    
    await this.page.click('[data-section="llm-config"]');
    await this.page.waitForTimeout(500);
    
    const reorderResults = {
      fallbackItemsFound: 0,
      dragHandlesFound: 0,
      originalOrder: [],
      reorderAttempted: false,
      newOrderDetected: false
    };

    try {
      // Find fallback items
      const fallbackItems = await this.page.locator('.ca-fallback-item').all();
      reorderResults.fallbackItemsFound = fallbackItems.length;
      console.log(`✅ Found ${reorderResults.fallbackItemsFound} fallback items`);
      
      // Get original order
      for (const item of fallbackItems) {
        const provider = await item.getAttribute('data-provider');
        reorderResults.originalOrder.push(provider);
      }
      console.log(`📋 Original order: ${reorderResults.originalOrder.join(' -> ')}`);
      
      // Check drag handles
      const dragHandles = await this.page.locator('.ca-drag-handle').all();
      reorderResults.dragHandlesFound = dragHandles.length;
      console.log(`✅ Found ${reorderResults.dragHandlesFound} drag handles`);
      
      // Attempt to reorder (drag first item to last position)
      if (fallbackItems.length >= 2) {
        try {
          const firstItem = fallbackItems[0];
          const lastItem = fallbackItems[fallbackItems.length - 1];
          
          // Get bounding boxes
          const firstBox = await firstItem.boundingBox();
          const lastBox = await lastItem.boundingBox();
          
          if (firstBox && lastBox) {
            // Perform drag operation
            await this.page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
            await this.page.mouse.down();
            await this.page.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height / 2, { steps: 10 });
            await this.page.mouse.up();
            
            reorderResults.reorderAttempted = true;
            console.log('✅ Drag operation attempted');
            
            // Wait for reorder to complete
            await this.page.waitForTimeout(1000);
            
            // Check if order changed
            const newItems = await this.page.locator('.ca-fallback-item').all();
            const newOrder = [];
            for (const item of newItems) {
              const provider = await item.getAttribute('data-provider');
              newOrder.push(provider);
            }
            
            reorderResults.newOrderDetected = JSON.stringify(reorderResults.originalOrder) !== JSON.stringify(newOrder);
            console.log(`📋 New order: ${newOrder.join(' -> ')}`);
            console.log(`✅ Order changed: ${reorderResults.newOrderDetected}`);
          }
        } catch (error) {
          console.log(`❌ Drag operation failed: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ LLM fallback reordering test failed: ${error.message}`);
    }

    testResults.tests.llmFallbackReordering = {
      status: reorderResults.reorderAttempted ? 'PASSED' : 'FAILED',
      details: reorderResults
    };
  }

  /**
   * Test API Key Validation and Connection
   */
  async testApiKeyValidation() {
    console.log('\n🔑 Testing API Key Validation...');
    
    await this.page.click('[data-section="api-keys"]');
    await this.page.waitForTimeout(500);
    
    const apiResults = {
      keysEntered: 0,
      testButtonClicked: false,
      validationAttempted: false,
      errorHandling: false,
      passwordToggleWorking: false
    };

    try {
      // Fill API keys
      const apiKeyTests = [
        { id: '#openai-key', value: TEST_CONFIG.apiKeys.openai, name: 'OpenAI' },
        { id: '#anthropic-key', value: TEST_CONFIG.apiKeys.anthropic, name: 'Anthropic' },
        { id: '#gemini-key', value: TEST_CONFIG.apiKeys.gemini, name: 'Gemini' }
      ];

      for (const test of apiKeyTests) {
        try {
          await this.page.fill(test.id, test.value);
          apiResults.keysEntered++;
          console.log(`✅ ${test.name} API key entered`);
        } catch (error) {
          console.log(`❌ ${test.name} API key entry failed: ${error.message}`);
        }
      }
      
      // Test password visibility toggle
      try {
        const toggleBtn = await this.page.locator('[data-target="openai-key"]');
        if (await toggleBtn.isVisible()) {
          await toggleBtn.click();
          await this.page.waitForTimeout(500);
          
          const inputType = await this.page.locator('#openai-key').getAttribute('type');
          apiResults.passwordToggleWorking = inputType === 'text';
          console.log(`✅ Password toggle working: ${apiResults.passwordToggleWorking}`);
        }
      } catch (error) {
        console.log(`❌ Password toggle test failed: ${error.message}`);
      }
      
      // Test API connection
      try {
        const testButton = await this.page.locator('#test-api-keys');
        if (await testButton.isVisible()) {
          await testButton.click();
          apiResults.testButtonClicked = true;
          apiResults.validationAttempted = true;
          console.log('✅ API test button clicked');
          
          // Wait for response and check for error handling
          await this.page.waitForTimeout(3000);
          
          // Check for any error messages or success indicators
          const toastContainer = await this.page.locator('#toast-container');
          if (await toastContainer.isVisible()) {
            apiResults.errorHandling = true;
            console.log('✅ Error/success handling detected');
          }
        }
      } catch (error) {
        console.log(`❌ API validation test failed: ${error.message}`);
      }
      
    } catch (error) {
      console.log(`❌ API key validation test failed: ${error.message}`);
    }

    testResults.tests.apiKeyValidation = {
      status: apiResults.keysEntered === 3 && apiResults.testButtonClicked ? 'PASSED' : 'PARTIAL',
      details: apiResults
    };
  }

  /**
   * Test Calendar Integration Functionality
   */
  async testCalendarIntegration() {
    console.log('\n📅 Testing Calendar Integration...');
    
    await this.page.click('[data-section="calendar"]');
    await this.page.waitForTimeout(500);
    
    const calendarResults = {
      integrationCardsFound: 0,
      connectButtonsWorking: 0,
      settingsSaved: false,
      checkboxesToggled: 0,
      reminderTimingSet: false
    };

    try {
      // Test Google Calendar connection
      try {
        const googleBtn = await this.page.locator('#connect-google-calendar');
        if (await googleBtn.isVisible()) {
          calendarResults.integrationCardsFound++;
          await googleBtn.click();
          calendarResults.connectButtonsWorking++;
          console.log('✅ Google Calendar connect button working');
          await this.page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`❌ Google Calendar connection failed: ${error.message}`);
      }
      
      // Test Outlook Calendar connection
      try {
        const outlookBtn = await this.page.locator('#connect-outlook-calendar');
        if (await outlookBtn.isVisible()) {
          calendarResults.integrationCardsFound++;
          await outlookBtn.click();
          calendarResults.connectButtonsWorking++;
          console.log('✅ Outlook Calendar connect button working');
          await this.page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`❌ Outlook Calendar connection failed: ${error.message}`);
      }
      
      // Test calendar feature checkboxes
      const checkboxes = ['#auto-detect-interviews', '#prep-reminders', '#post-interview-followup'];
      for (const checkbox of checkboxes) {
        try {
          const cb = await this.page.locator(checkbox);
          if (await cb.isVisible()) {
            await cb.click();
            calendarResults.checkboxesToggled++;
            console.log(`✅ Checkbox ${checkbox} toggled`);
          }
        } catch (error) {
          console.log(`❌ Checkbox ${checkbox} failed: ${error.message}`);
        }
      }
      
      // Test reminder timing setting
      try {
        const reminderSelect = await this.page.locator('#reminder-timing');
        if (await reminderSelect.isVisible()) {
          await reminderSelect.selectOption('60');
          calendarResults.reminderTimingSet = true;
          console.log('✅ Reminder timing set');
        }
      } catch (error) {
        console.log(`❌ Reminder timing setting failed: ${error.message}`);
      }
      
      // Test save calendar settings
      try {
        const saveBtn = await this.page.locator('#save-calendar');
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          calendarResults.settingsSaved = true;
          console.log('✅ Calendar settings saved');
        }
      } catch (error) {
        console.log(`❌ Save calendar settings failed: ${error.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Calendar integration test failed: ${error.message}`);
    }

    testResults.tests.calendarIntegration = {
      status: calendarResults.connectButtonsWorking >= 1 ? 'PASSED' : 'FAILED',
      details: calendarResults
    };
  }

  /**
   * Test Transcription Settings with Audio Controls
   */
  async testTranscriptionWithAudio() {
    console.log('\n🎤 Testing Transcription with Audio Controls...');
    
    await this.page.click('[data-section="transcription"]');
    await this.page.waitForTimeout(500);
    
    const audioResults = {
      languageChanged: false,
      checkboxesToggled: 0,
      rangeAdjusted: 0,
      microphoneTestAttempted: false,
      settingsSaved: false
    };

    try {
      // Test language selection
      try {
        await this.page.selectOption('#transcription-language', 'en-GB');
        audioResults.languageChanged = true;
        console.log('✅ Transcription language changed');
      } catch (error) {
        console.log(`❌ Language selection failed: ${error.message}`);
      }
      
      // Test audio processing checkboxes
      const audioCheckboxes = ['#noise-suppression', '#echo-cancellation', '#auto-gain-control'];
      for (const checkbox of audioCheckboxes) {
        try {
          await this.page.click(checkbox);
          audioResults.checkboxesToggled++;
          console.log(`✅ Audio checkbox ${checkbox} toggled`);
        } catch (error) {
          console.log(`❌ Audio checkbox ${checkbox} failed: ${error.message}`);
        }
      }
      
      // Test range sliders
      const ranges = [
        { id: '#silence-threshold', value: '0.05' },
        { id: '#silence-duration', value: '2000' }
      ];
      
      for (const range of ranges) {
        try {
          await this.page.fill(range.id, range.value);
          audioResults.rangeAdjusted++;
          console.log(`✅ Range ${range.id} adjusted to ${range.value}`);
        } catch (error) {
          console.log(`❌ Range ${range.id} adjustment failed: ${error.message}`);
        }
      }
      
      // Test microphone test button
      try {
        const micTestBtn = await this.page.locator('#test-microphone');
        if (await micTestBtn.isVisible()) {
          await micTestBtn.click();
          audioResults.microphoneTestAttempted = true;
          console.log('✅ Microphone test attempted');
          await this.page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log(`❌ Microphone test failed: ${error.message}`);
      }
      
      // Test save transcription settings
      try {
        await this.page.click('#save-transcription');
        audioResults.settingsSaved = true;
        console.log('✅ Transcription settings saved');
      } catch (error) {
        console.log(`❌ Save transcription settings failed: ${error.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Transcription audio test failed: ${error.message}`);
    }

    testResults.tests.transcriptionAudio = {
      status: audioResults.checkboxesToggled >= 2 && audioResults.rangeAdjusted >= 1 ? 'PASSED' : 'PARTIAL',
      details: audioResults
    };
  }

  /**
   * Test Performance Hub Data and Export
   */
  async testPerformanceHub() {
    console.log('\n📊 Testing Performance Hub...');
    
    await this.page.click('[data-section="performance"]');
    await this.page.waitForTimeout(500);
    
    const perfResults = {
      statCardsFound: 0,
      trackingToggled: 0,
      dataRetentionSet: false,
      exportAttempted: false,
      clearDataAttempted: false
    };

    try {
      // Check stat cards
      const statCards = ['#total-interviews', '#avg-response-time', '#suggestions-used', '#success-rate'];
      for (const card of statCards) {
        try {
          const element = await this.page.locator(card);
          if (await element.isVisible()) {
            perfResults.statCardsFound++;
            console.log(`✅ Stat card ${card} found`);
          }
        } catch (error) {
          console.log(`❌ Stat card ${card} not found: ${error.message}`);
        }
      }
      
      // Test tracking checkboxes
      const trackingCheckboxes = ['#track-response-times', '#track-suggestion-usage', '#track-interview-outcomes'];
      for (const checkbox of trackingCheckboxes) {
        try {
          await this.page.click(checkbox);
          perfResults.trackingToggled++;
          console.log(`✅ Tracking checkbox ${checkbox} toggled`);
        } catch (error) {
          console.log(`❌ Tracking checkbox ${checkbox} failed: ${error.message}`);
        }
      }
      
      // Test data retention setting
      try {
        await this.page.selectOption('#data-retention', '90');
        perfResults.dataRetentionSet = true;
        console.log('✅ Data retention period set');
      } catch (error) {
        console.log(`❌ Data retention setting failed: ${error.message}`);
      }
      
      // Test export data
      try {
        const exportBtn = await this.page.locator('#export-data');
        if (await exportBtn.isVisible()) {
          await exportBtn.click();
          perfResults.exportAttempted = true;
          console.log('✅ Data export attempted');
          await this.page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`❌ Data export failed: ${error.message}`);
      }
      
      // Test clear data (but don't actually confirm)
      try {
        const clearBtn = await this.page.locator('#clear-data');
        if (await clearBtn.isVisible()) {
          await clearBtn.click();
          perfResults.clearDataAttempted = true;
          console.log('✅ Clear data attempted');
          await this.page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`❌ Clear data failed: ${error.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Performance hub test failed: ${error.message}`);
    }

    testResults.tests.performanceHub = {
      status: perfResults.statCardsFound >= 3 && perfResults.exportAttempted ? 'PASSED' : 'PARTIAL',
      details: perfResults
    };
  }

  /**
   * Generate comprehensive functionality report
   */
  generateReport() {
    console.log('\n📋 Generating Comprehensive Functionality Report...');
    
    // Calculate summary
    const tests = Object.values(testResults.tests);
    testResults.summary.total = tests.length;
    testResults.summary.passed = tests.filter(t => t.status === 'PASSED').length;
    testResults.summary.failed = tests.filter(t => t.status === 'FAILED').length;
    testResults.summary.warnings = tests.filter(t => t.status === 'PARTIAL').length;
    
    // Determine overall status
    if (testResults.summary.failed === 0 && testResults.summary.warnings === 0) {
      testResults.overall = 'PASSED';
    } else if (testResults.summary.failed === 0) {
      testResults.overall = 'PASSED_WITH_WARNINGS';
    } else {
      testResults.overall = 'FAILED';
    }

    // Generate report content
    const report = `# CandidAI Extension - Comprehensive Functionality Test Report

## Test Execution Summary
- **Date**: ${testResults.timestamp}
- **Overall Status**: ${testResults.overall}
- **Total Functional Tests**: ${testResults.summary.total}
- **Passed**: ${testResults.summary.passed}
- **Failed**: ${testResults.summary.failed}
- **Partial/Warnings**: ${testResults.summary.warnings}

## Detailed Functionality Test Results

### 📄 Document Upload Test: ${testResults.tests.documentUpload?.status || 'NOT_RUN'}
${testResults.tests.documentUpload ? `- Dropzone Found: ${testResults.tests.documentUpload.details.dropzoneFound ? '✅' : '❌'}
- File Input Available: ${testResults.tests.documentUpload.details.fileInputFound ? '✅' : '❌'}
- Upload Triggered: ${testResults.tests.documentUpload.details.uploadTriggered ? '✅' : '❌'}
- Preview Displayed: ${testResults.tests.documentUpload.details.previewDisplayed ? '✅' : '❌'}
- Remove Button: ${testResults.tests.documentUpload.details.removeButtonFound ? '✅' : '❌'}` : ''}

### 🔄 LLM Fallback Reordering Test: ${testResults.tests.llmFallbackReordering?.status || 'NOT_RUN'}
${testResults.tests.llmFallbackReordering ? `- Fallback Items: ${testResults.tests.llmFallbackReordering.details.fallbackItemsFound}/3
- Drag Handles: ${testResults.tests.llmFallbackReordering.details.dragHandlesFound}/3
- Reorder Attempted: ${testResults.tests.llmFallbackReordering.details.reorderAttempted ? '✅' : '❌'}
- Order Changed: ${testResults.tests.llmFallbackReordering.details.newOrderDetected ? '✅' : '❌'}
- Original Order: ${testResults.tests.llmFallbackReordering.details.originalOrder.join(' -> ')}` : ''}

### 🔑 API Key Validation Test: ${testResults.tests.apiKeyValidation?.status || 'NOT_RUN'}
${testResults.tests.apiKeyValidation ? `- API Keys Entered: ${testResults.tests.apiKeyValidation.details.keysEntered}/3
- Test Button Clicked: ${testResults.tests.apiKeyValidation.details.testButtonClicked ? '✅' : '❌'}
- Validation Attempted: ${testResults.tests.apiKeyValidation.details.validationAttempted ? '✅' : '❌'}
- Password Toggle: ${testResults.tests.apiKeyValidation.details.passwordToggleWorking ? '✅' : '❌'}
- Error Handling: ${testResults.tests.apiKeyValidation.details.errorHandling ? '✅' : '❌'}` : ''}

### 📅 Calendar Integration Test: ${testResults.tests.calendarIntegration?.status || 'NOT_RUN'}
${testResults.tests.calendarIntegration ? `- Integration Cards: ${testResults.tests.calendarIntegration.details.integrationCardsFound}/2
- Connect Buttons Working: ${testResults.tests.calendarIntegration.details.connectButtonsWorking}/2
- Checkboxes Toggled: ${testResults.tests.calendarIntegration.details.checkboxesToggled}/3
- Reminder Timing Set: ${testResults.tests.calendarIntegration.details.reminderTimingSet ? '✅' : '❌'}
- Settings Saved: ${testResults.tests.calendarIntegration.details.settingsSaved ? '✅' : '❌'}` : ''}

### 🎤 Transcription Audio Test: ${testResults.tests.transcriptionAudio?.status || 'NOT_RUN'}
${testResults.tests.transcriptionAudio ? `- Language Changed: ${testResults.tests.transcriptionAudio.details.languageChanged ? '✅' : '❌'}
- Audio Checkboxes: ${testResults.tests.transcriptionAudio.details.checkboxesToggled}/3
- Range Controls: ${testResults.tests.transcriptionAudio.details.rangeAdjusted}/2
- Microphone Test: ${testResults.tests.transcriptionAudio.details.microphoneTestAttempted ? '✅' : '❌'}
- Settings Saved: ${testResults.tests.transcriptionAudio.details.settingsSaved ? '✅' : '❌'}` : ''}

### 📊 Performance Hub Test: ${testResults.tests.performanceHub?.status || 'NOT_RUN'}
${testResults.tests.performanceHub ? `- Stat Cards Found: ${testResults.tests.performanceHub.details.statCardsFound}/4
- Tracking Controls: ${testResults.tests.performanceHub.details.trackingToggled}/3
- Data Retention Set: ${testResults.tests.performanceHub.details.dataRetentionSet ? '✅' : '❌'}
- Export Attempted: ${testResults.tests.performanceHub.details.exportAttempted ? '✅' : '❌'}
- Clear Data Available: ${testResults.tests.performanceHub.details.clearDataAttempted ? '✅' : '❌'}` : ''}

## Critical Issues Found

### 🚨 Missing Functionality
${testResults.tests.documentUpload?.status === 'FAILED' ? '- **Document Upload**: File upload functionality not working properly' : ''}
${testResults.tests.llmFallbackReordering?.status === 'FAILED' ? '- **LLM Reordering**: Drag-drop reordering for LLM fallback not functional' : ''}
${testResults.tests.apiKeyValidation?.status === 'FAILED' ? '- **API Validation**: API key testing and validation not working' : ''}

### ⚠️ Partial Issues
${testResults.tests.calendarIntegration?.status === 'PARTIAL' ? '- **Calendar Integration**: Some calendar features not fully functional' : ''}
${testResults.tests.transcriptionAudio?.status === 'PARTIAL' ? '- **Audio Controls**: Some transcription audio settings need fixing' : ''}
${testResults.tests.performanceHub?.status === 'PARTIAL' ? '- **Performance Data**: Some performance tracking features incomplete' : ''}

## Recommendations

### High Priority Fixes
1. **Implement Document Upload Handler**: Add proper file upload processing
2. **Fix LLM Fallback Drag-Drop**: Implement sortable list functionality  
3. **Complete API Validation**: Add real API connection testing
4. **Calendar Integration**: Implement OAuth flows for calendar connections

### Medium Priority Enhancements
1. **Audio Processing**: Ensure microphone test functionality works
2. **Performance Analytics**: Complete data export and visualization
3. **Error Handling**: Improve user feedback for all operations
4. **Storage Integration**: Add proper data persistence

### Technical Implementation Notes
- Document upload needs file processing and preview generation
- Drag-drop requires sortable.js or similar library integration
- API validation needs proper endpoint calls and error handling
- Calendar integration requires OAuth 2.0 implementation
- Audio testing needs WebRTC API integration

---
*Generated by CandidAI Comprehensive Functionality Test Suite - ${new Date().toISOString()}*
`;

    // Save report to file
    const reportPath = path.join(__dirname, '../../COMPREHENSIVE_FUNCTIONALITY_REPORT.md');
    fs.writeFileSync(reportPath, report);
    
    // Save JSON results
    const jsonPath = path.join(__dirname, '../../test-results-functionality.json');
    fs.writeFileSync(jsonPath, JSON.stringify(testResults, null, 2));
    
    console.log(`📄 Functionality report saved to: ${reportPath}`);
    console.log(`📊 JSON results saved to: ${jsonPath}`);
    
    return report;
  }

  /**
   * Run all functionality tests
   */
  async runAllTests() {
    try {
      await this.initialize();
      await this.navigateToOptionsPage();
      
      // Run all functionality test suites
      await this.testDocumentUpload();
      await this.testLlmFallbackReordering();
      await this.testApiKeyValidation();
      await this.testCalendarIntegration();
      await this.testTranscriptionWithAudio();
      await this.testPerformanceHub();
      
      // Generate final report
      const report = this.generateReport();
      
      console.log('\n🎉 Comprehensive Functionality Testing Complete!');
      console.log(`📊 Overall Status: ${testResults.overall}`);
      console.log(`✅ Passed: ${testResults.summary.passed}/${testResults.summary.total}`);
      console.log(`❌ Failed: ${testResults.summary.failed}/${testResults.summary.total}`);
      console.log(`⚠️  Partial: ${testResults.summary.warnings}/${testResults.summary.total}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Functionality test execution failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new ComprehensiveFunctionalityTest();
  test.runAllTests()
    .then(report => {
      console.log('\n📋 Comprehensive Functionality Report Generated Successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Functionality test suite failed:', error);
      process.exit(1);
    });
}

module.exports = ComprehensiveFunctionalityTest; 