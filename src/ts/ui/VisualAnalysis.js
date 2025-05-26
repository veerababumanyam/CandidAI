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
  constructor(previewId, resultsId) {
    this.previewId = previewId;
    this.resultsId = resultsId;
    this.screenshots = [];
    this.initialize();
  }

  initialize() {
    this.previewContainer = document.getElementById(this.previewId);
    this.resultsContainer = document.getElementById(this.resultsId);
    
    if (!this.previewContainer || !this.resultsContainer) {
      console.warn('VisualAnalysis: Required containers not found');
      return;
    }
    
    this.createUI();
  }

  createUI() {
    if (this.previewContainer) {
      this.previewContainer.innerHTML = `
        <div class="screenshot-controls">
          <button class="capture-btn">📸 Capture Screen</button>
          <span class="capture-status">Ready</span>
        </div>
        <div class="screenshot-preview-area"></div>
      `;
      
      const captureBtn = this.previewContainer.querySelector('.capture-btn');
      captureBtn?.addEventListener('click', () => this.captureScreen());
    }

    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = `
        <div class="analysis-results-content">
          <div class="no-analysis">No analysis results yet.</div>
        </div>
      `;
    }
  }

  async captureScreen() {
    const statusElement = this.previewContainer?.querySelector('.capture-status');
    
    try {
      if (statusElement) statusElement.textContent = 'Capturing...';

      // Request screen capture through background script
      const response = await chrome.runtime.sendMessage({
        command: 'REQUEST_SCREEN_CAPTURE'
      });

      if (response?.streamId) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          }
        });

        const imageData = await this.captureFrame(stream);
        stream.getTracks().forEach(track => track.stop());

        this.displayPreview(imageData);
        await this.analyzeImage(imageData);

        if (statusElement) statusElement.textContent = 'Analysis complete';
      }
    } catch (error) {
      console.error('Screen capture failed:', error);
      if (statusElement) statusElement.textContent = 'Capture failed';
    }
  }

  async captureFrame(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    await new Promise(resolve => video.onloadedmetadata = resolve);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    });
  }

  displayPreview(imageData) {
    const previewArea = this.previewContainer?.querySelector('.screenshot-preview-area');
    if (previewArea) {
      previewArea.innerHTML = `
        <img src="${imageData}" class="screenshot-preview" alt="Screen capture" />
      `;
    }
  }

  async analyzeImage(imageData) {
    const resultsContent = this.resultsContainer?.querySelector('.analysis-results-content');
    if (!resultsContent) return;

    try {
      resultsContent.innerHTML = '<div class="analysis-loading">Analyzing image...</div>';

      // Send to LLM for analysis
      const response = await chrome.runtime.sendMessage({
        command: 'ANALYZE_IMAGE',
        payload: { imageData }
      });

      if (response?.success && response.data) {
        this.displayAnalysisResults(response.data);
      } else {
        resultsContent.innerHTML = '<div class="analysis-error">Analysis failed</div>';
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      resultsContent.innerHTML = '<div class="analysis-error">Analysis failed</div>';
    }
  }

  displayAnalysisResults(analysis) {
    const resultsContent = this.resultsContainer?.querySelector('.analysis-results-content');
    if (!resultsContent) return;

    resultsContent.innerHTML = `
      <div class="analysis-insights">
        ${analysis.insights?.map(insight => `
          <div class="analysis-insight">
            <strong>${insight.title || 'Insight'}:</strong>
            <p>${insight.description || insight}</p>
          </div>
        `).join('') || '<p>No specific insights available</p>'}
      </div>
      
      ${analysis.suggestions?.length ? `
        <div class="analysis-suggestions">
          <h4>Suggestions:</h4>
          ${analysis.suggestions.map(suggestion => `
            <div class="analysis-suggestion">${suggestion}</div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }
}
