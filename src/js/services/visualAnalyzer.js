/**
 * CandidAI - Visual Analyzer Service
 * Provides screen capture, OCR, and LLM analysis for visual content
 */

import { default as llmOrchestrator } from './llmOrchestrator.js';

/**
 * Visual Analyzer class for analyzing visual content
 */
class VisualAnalyzer {
  constructor() {
    this.isCapturing = false;
    this.captureInterval = null;
    this.captureIntervalTime = 5000; // 5 seconds
    this.lastCapturedImage = null;
    this.lastExtractedText = '';
    this.lastAnalysis = null;
    this.ocrWorker = null;
    this.initialized = false;
  }

  /**
   * Initialize the visual analyzer
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Check if we have the necessary permissions
      const permissions = await chrome.permissions.contains({
        permissions: ['desktopCapture']
      });

      if (!permissions) {
        console.warn('Desktop capture permission not granted');
        return false;
      }

      // Initialize Tesseract.js for OCR
      await this.initializeOCR();

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing visual analyzer:', error);
      return false;
    }
  }

  /**
   * Initialize OCR with Tesseract.js
   * @private
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initializeOCR() {
    try {
      // We'll use the Tesseract.js worker from a CDN
      // In a real extension, you'd bundle this with your code
      const { createWorker } = await import('https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js');
      
      this.ocrWorker = await createWorker('eng');
      
      return true;
    } catch (error) {
      console.error('Error initializing OCR:', error);
      return false;
    }
  }

  /**
   * Request desktop capture permission
   * @returns {Promise<boolean>} - Whether permission was granted
   */
  async requestCapturePermission() {
    try {
      const granted = await chrome.permissions.request({
        permissions: ['desktopCapture']
      });
      
      return granted;
    } catch (error) {
      console.error('Error requesting capture permission:', error);
      return false;
    }
  }

  /**
   * Start continuous screen capture
   * @returns {Promise<boolean>} - Whether starting was successful
   */
  async startCapture() {
    if (this.isCapturing) {
      return true;
    }

    try {
      // Ensure we're initialized
      if (!this.initialized) {
        await this.initialize();
      }

      // Check if we have the necessary permissions
      const permissions = await chrome.permissions.contains({
        permissions: ['desktopCapture']
      });

      if (!permissions) {
        const granted = await this.requestCapturePermission();
        if (!granted) {
          throw new Error('Desktop capture permission not granted');
        }
      }

      // Start capture
      this.isCapturing = true;
      
      // Perform initial capture
      await this.captureScreen();
      
      // Set up interval for continuous capture
      this.captureInterval = setInterval(async () => {
        await this.captureScreen();
      }, this.captureIntervalTime);
      
      return true;
    } catch (error) {
      console.error('Error starting screen capture:', error);
      this.isCapturing = false;
      return false;
    }
  }

  /**
   * Stop continuous screen capture
   * @returns {boolean} - Whether stopping was successful
   */
  stopCapture() {
    if (!this.isCapturing) {
      return true;
    }

    try {
      // Clear capture interval
      if (this.captureInterval) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
      }
      
      this.isCapturing = false;
      return true;
    } catch (error) {
      console.error('Error stopping screen capture:', error);
      return false;
    }
  }

  /**
   * Capture the current screen
   * @private
   * @returns {Promise<string|null>} - Base64 encoded image or null if failed
   */
  async captureScreen() {
    try {
      // Get desktop media stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'never'
        },
        audio: false
      });
      
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Wait for video to load
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      // Play video (required to capture frame)
      await video.play();
      
      // Create canvas to draw video frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Store the captured image
      this.lastCapturedImage = imageData;
      
      // Extract text from the image
      await this.extractTextFromImage(imageData);
      
      return imageData;
    } catch (error) {
      console.error('Error capturing screen:', error);
      return null;
    }
  }

  /**
   * Extract text from an image using OCR
   * @private
   * @param {string} imageData - Base64 encoded image
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromImage(imageData) {
    if (!this.ocrWorker) {
      await this.initializeOCR();
    }

    try {
      // Perform OCR on the image
      const result = await this.ocrWorker.recognize(imageData);
      
      // Get the extracted text
      const text = result.data.text;
      
      // Store the extracted text
      this.lastExtractedText = text;
      
      // Analyze the extracted text
      await this.analyzeExtractedText(text);
      
      return text;
    } catch (error) {
      console.error('Error extracting text from image:', error);
      return '';
    }
  }

  /**
   * Analyze extracted text using LLM
   * @private
   * @param {string} text - Extracted text
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeExtractedText(text) {
    if (!text || text.trim().length === 0) {
      return null;
    }

    try {
      // Create a prompt for the LLM
      const prompt = `
        I'm going to provide you with text extracted from a screenshot of an interview assessment or coding challenge.
        Please analyze this text and provide:
        1. What type of content this appears to be (e.g., coding challenge, technical assessment, interview question)
        2. A summary of the main task or question
        3. Key information that would be helpful for answering
        4. Any time constraints or special instructions mentioned
        5. Suggested approach for tackling this challenge

        Here is the extracted text:
        ${text}
      `;
      
      // Generate analysis using LLM
      const response = await llmOrchestrator.generateResponse(prompt, {
        temperature: 0.3,
        maxTokens: 500
      });
      
      // Parse the analysis
      const analysis = {
        text: response.text,
        timestamp: new Date().toISOString(),
        extractedText: text
      };
      
      // Store the analysis
      this.lastAnalysis = analysis;
      
      // Notify that we have a new analysis
      chrome.runtime.sendMessage({
        action: 'visualAnalysisComplete',
        analysis
      }).catch(() => {
        // Side panel might not be open, ignore error
      });
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing extracted text:', error);
      return null;
    }
  }

  /**
   * Manually analyze a specific image
   * @param {string} imageData - Base64 encoded image
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeImage(imageData) {
    try {
      // Store the image
      this.lastCapturedImage = imageData;
      
      // Extract and analyze text
      const text = await this.extractTextFromImage(imageData);
      
      return this.lastAnalysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return null;
    }
  }

  /**
   * Get the last captured image
   * @returns {string|null} - Base64 encoded image or null if none
   */
  getLastCapturedImage() {
    return this.lastCapturedImage;
  }

  /**
   * Get the last extracted text
   * @returns {string} - Extracted text
   */
  getLastExtractedText() {
    return this.lastExtractedText;
  }

  /**
   * Get the last analysis
   * @returns {Object|null} - Analysis results or null if none
   */
  getLastAnalysis() {
    return this.lastAnalysis;
  }
}

// Create a singleton instance
const visualAnalyzer = new VisualAnalyzer();

export default visualAnalyzer;
