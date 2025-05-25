/**
 * VisualAnalysis - Screen capture and analysis component
 * Implements desktop capture API with OCR and LLM analysis
 * Provides visual understanding for technical assessments
 */

/**
 * VisualAnalysis - Manages screen capture and visual analysis
 * Implements multimodal content processing
 */
export class VisualAnalysis {
  constructor(previewContainerId, resultsContainerId) {
    this.previewContainer = document.getElementById(previewContainerId);
    this.resultsContainer = document.getElementById(resultsContainerId);

    if (!this.previewContainer || !this.resultsContainer) {
      throw new Error('Required elements not found for VisualAnalysis');
    }

    // State management
    this.state = {
      isCapturing: false,
      currentCapture: null,
      analysisHistory: [],
    };

    // Configuration
    this.config = {
      maxImageSize: 1920,
      compressionQuality: 0.8,
      ocrEnabled: true,
      analysisPrompt:
        'Analyze this image and provide insights relevant to a job interview context.',
    };

    // Initialize
    this.initialize();
  }

  /**
   * Initialize visual analysis component
   */
  initialize() {
    // Clear containers
    this.previewContainer.innerHTML = `
      <div class="ca-visual__placeholder">
        <svg class="ca-visual__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p class="ca-visual__placeholder-text">No image captured yet</p>
      </div>
    `;

    this.resultsContainer.innerHTML = '';
  }

  /**
   * Capture screen using Chrome Desktop Capture API
   * Implements screen capture with user selection
   */
  async captureScreen() {
    if (this.state.isCapturing) {
      console.warn('Capture already in progress');
      return;
    }

    this.state.isCapturing = true;

    try {
      // Request desktop capture permission
      const streamId = await this.requestScreenCapture();

      if (!streamId) {
        throw new Error('Screen capture cancelled');
      }

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: streamId,
            maxWidth: this.config.maxImageSize,
            maxHeight: this.config.maxImageSize,
          },
        },
      });

      // Capture frame from stream
      const imageData = await this.captureFrame(stream);

      // Stop stream
      stream.getTracks().forEach((track) => track.stop());

      // Process captured image
      await this.processCapture(imageData);
    } catch (error) {
      console.error('Screen capture failed:', error);
      this.showError('Failed to capture screen: ' + error.message);
    } finally {
      this.state.isCapturing = false;
    }
  }

  /**
   * Request screen capture permission
   * Uses Chrome extension desktopCapture API
   */
  requestScreenCapture() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          command: 'REQUEST_SCREEN_CAPTURE',
        },
        (response) => {
          if (response && response.streamId) {
            resolve(response.streamId);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Capture single frame from media stream
   * Converts stream to image data
   */
  async captureFrame(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    // Wait for video to be ready
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    // Create canvas and capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Convert to blob with compression
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', this.config.compressionQuality);
    });

    // Convert to base64
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Process captured image
   * Displays preview and initiates analysis
   */
  async processCapture(imageData) {
    // Store current capture
    this.state.currentCapture = {
      imageData,
      timestamp: Date.now(),
      analysis: null,
    };

    // Display preview
    this.displayPreview(imageData);

    // Show loading state
    this.showAnalysisLoading();

    // Perform analysis
    await this.analyzeImage(imageData);
  }

  /**
   * Display image preview
   */
  displayPreview(imageData) {
    this.previewContainer.innerHTML = `
      <div class="ca-visual__image-container">
        <img src="${imageData}" alt="Screen capture" class="ca-visual__image">
        <div class="ca-visual__image-actions">
          <button class="ca-btn ca-btn--icon" onclick="this.parentElement.parentElement.querySelector('img').requestFullscreen()">
            <svg class="ca-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Analyze captured image
   * Implements OCR and LLM analysis
   */
  async analyzeImage(imageData) {
    try {
      // Send to service worker for analysis
      const response = await chrome.runtime.sendMessage({
        command: 'ANALYZE_VISUAL',
        payload: {
          imageData,
          includeOCR: this.config.ocrEnabled,
          analysisPrompt: this.config.analysisPrompt,
        },
      });

      if (response.success) {
        this.displayAnalysisResults(response.data);

        // Update capture with analysis
        this.state.currentCapture.analysis = response.data;

        // Add to history
        this.state.analysisHistory.push(this.state.currentCapture);

        // Limit history size
        if (this.state.analysisHistory.length > 10) {
          this.state.analysisHistory.shift();
        }
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      this.showError('Failed to analyze image: ' + error.message);
    }
  }

  /**
   * Display analysis results
   * Renders OCR text and insights
   */
  displayAnalysisResults(analysis) {
    let resultsHTML = '<div class="ca-visual__results-content">';

    // OCR Results
    if (analysis.ocrText) {
      resultsHTML += `
        <div class="ca-visual__ocr-section">
          <h3 class="ca-visual__section-title">Extracted Text</h3>
          <div class="ca-visual__ocr-text">
            <pre>${this.escapeHtml(analysis.ocrText)}</pre>
            <button class="ca-btn ca-btn--small ca-btn--secondary" onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent)">
              Copy Text
            </button>
          </div>
        </div>
      `;
    }

    // AI Analysis
    if (analysis.insights) {
      resultsHTML += `
        <div class="ca-visual__insights-section">
          <h3 class="ca-visual__section-title">AI Analysis</h3>
          <div class="ca-visual__insights">
            ${this.formatInsights(analysis.insights)}
          </div>
        </div>
      `;
    }

    // Code snippets (if detected)
    if (analysis.codeSnippets && analysis.codeSnippets.length > 0) {
      resultsHTML += `
        <div class="ca-visual__code-section">
          <h3 class="ca-visual__section-title">Detected Code</h3>
          ${analysis.codeSnippets
            .map(
              (snippet, _index) => `
            <div class="ca-visual__code-snippet">
              <div class="ca-visual__code-header">
                <span class="ca-visual__code-language">${snippet.language || 'Plain Text'}</span>
                <button class="ca-btn ca-btn--small" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">
                  Copy
                </button>
              </div>
              <pre class="ca-visual__code"><code>${this.escapeHtml(snippet.code)}</code></pre>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    resultsHTML += '</div>';

    this.resultsContainer.innerHTML = resultsHTML;
  }

  /**
   * Format AI insights for display
   */
  formatInsights(insights) {
    if (typeof insights === 'string') {
      return `<p>${insights.replace(/\n/g, '<br>')}</p>`;
    }

    if (Array.isArray(insights)) {
      return `
        <ul class="ca-visual__insights-list">
          ${insights.map((insight) => `<li>${this.escapeHtml(insight)}</li>`).join('')}
        </ul>
      `;
    }

    if (typeof insights === 'object') {
      return Object.entries(insights)
        .map(
          ([key, value]) => `
        <div class="ca-visual__insight-item">
          <strong>${this.escapeHtml(key)}:</strong> ${this.escapeHtml(value)}
        </div>
      `
        )
        .join('');
    }

    return '';
  }

  /**
   * Show analysis loading state
   */
  showAnalysisLoading() {
    this.resultsContainer.innerHTML = `
      <div class="ca-visual__loading">
        <div class="ca-loading-spinner"></div>
        <p class="ca-visual__loading-text">Analyzing image...</p>
      </div>
    `;
  }

  /**
   * Show error message
   */
  showError(message) {
    this.resultsContainer.innerHTML = `
      <div class="ca-visual__error">
        <svg class="ca-visual__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="ca-visual__error-text">${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  /**
   * Clear current capture
   */
  clear() {
    this.state.currentCapture = null;
    this.initialize();
  }

  /**
   * Get analysis history
   */
  getHistory() {
    return this.state.analysisHistory.slice();
  }

  /**
   * Export current analysis
   */
  exportAnalysis() {
    if (!this.state.currentCapture || !this.state.currentCapture.analysis) {
      return null;
    }

    const { analysis, timestamp } = this.state.currentCapture;

    return {
      timestamp,
      ocrText: analysis.ocrText || '',
      insights: analysis.insights || '',
      codeSnippets: analysis.codeSnippets || [],
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    Object.assign(this.config, config);
  }

  /**
   * Escape HTML for safe display
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
