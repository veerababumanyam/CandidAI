/**
 * Unit tests for visualAnalyzer service
 */

// Mock the chrome API
global.chrome = {
  ...global.chrome,
  permissions: {
    contains: jest.fn(),
    request: jest.fn()
  },
  runtime: {
    sendMessage: jest.fn()
  }
};

// Mock the llmOrchestrator
jest.mock('../llmOrchestrator.js', () => ({
  __esModule: true,
  default: {
    generateResponse: jest.fn().mockResolvedValue({
      text: 'Analysis of the image content',
      provider: 'openai',
      model: 'gpt-4'
    })
  }
}));

// Mock Tesseract.js
jest.mock('https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js', () => ({
  __esModule: true,
  createWorker: jest.fn().mockResolvedValue({
    recognize: jest.fn().mockResolvedValue({
      data: {
        text: 'Extracted text from image'
      }
    })
  })
}), { virtual: true });

// Import the module under test
import visualAnalyzer from '../visualAnalyzer.js';

describe('visualAnalyzer', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset the visual analyzer state
    visualAnalyzer.isCapturing = false;
    visualAnalyzer.captureInterval = null;
    visualAnalyzer.lastCapturedImage = null;
    visualAnalyzer.lastExtractedText = '';
    visualAnalyzer.lastAnalysis = null;
    visualAnalyzer.ocrWorker = null;
    visualAnalyzer.initialized = false;
    
    // Mock permissions.contains to return true by default
    chrome.permissions.contains.mockResolvedValue(true);
    
    // Mock permissions.request to return true by default
    chrome.permissions.request.mockResolvedValue(true);
    
    // Mock navigator.mediaDevices.getDisplayMedia
    global.navigator.mediaDevices.getDisplayMedia.mockResolvedValue({
      getTracks: () => [{
        stop: jest.fn()
      }]
    });
  });
  
  describe('initialize', () => {
    it('should initialize the visual analyzer', async () => {
      const result = await visualAnalyzer.initialize();
      
      expect(result).toBe(true);
      expect(chrome.permissions.contains).toHaveBeenCalledWith({
        permissions: ['desktopCapture']
      });
      expect(visualAnalyzer.initialized).toBe(true);
    });
    
    it('should return false if desktop capture permission is not granted', async () => {
      // Mock permissions.contains to return false
      chrome.permissions.contains.mockResolvedValue(false);
      
      const result = await visualAnalyzer.initialize();
      
      expect(result).toBe(false);
      expect(visualAnalyzer.initialized).toBe(false);
    });
  });
  
  describe('requestCapturePermission', () => {
    it('should request desktop capture permission', async () => {
      const result = await visualAnalyzer.requestCapturePermission();
      
      expect(result).toBe(true);
      expect(chrome.permissions.request).toHaveBeenCalledWith({
        permissions: ['desktopCapture']
      });
    });
    
    it('should return false if permission is denied', async () => {
      // Mock permissions.request to return false
      chrome.permissions.request.mockResolvedValue(false);
      
      const result = await visualAnalyzer.requestCapturePermission();
      
      expect(result).toBe(false);
    });
  });
  
  describe('startCapture', () => {
    beforeEach(async () => {
      // Initialize the visual analyzer
      await visualAnalyzer.initialize();
      
      // Mock captureScreen
      visualAnalyzer.captureScreen = jest.fn().mockResolvedValue('data:image/jpeg;base64,abc123');
    });
    
    it('should start screen capture', async () => {
      const result = await visualAnalyzer.startCapture();
      
      expect(result).toBe(true);
      expect(visualAnalyzer.isCapturing).toBe(true);
      expect(visualAnalyzer.captureScreen).toHaveBeenCalled();
      expect(visualAnalyzer.captureInterval).toBeDefined();
    });
    
    it('should request permission if not already granted', async () => {
      // Mock permissions.contains to return false
      chrome.permissions.contains.mockResolvedValue(false);
      
      const result = await visualAnalyzer.startCapture();
      
      expect(result).toBe(true);
      expect(chrome.permissions.request).toHaveBeenCalled();
      expect(visualAnalyzer.isCapturing).toBe(true);
    });
    
    it('should return false if permission is denied', async () => {
      // Mock permissions.contains to return false
      chrome.permissions.contains.mockResolvedValue(false);
      
      // Mock permissions.request to return false
      chrome.permissions.request.mockResolvedValue(false);
      
      const result = await visualAnalyzer.startCapture();
      
      expect(result).toBe(false);
      expect(visualAnalyzer.isCapturing).toBe(false);
    });
  });
  
  describe('stopCapture', () => {
    beforeEach(async () => {
      // Initialize and start capture
      await visualAnalyzer.initialize();
      visualAnalyzer.captureScreen = jest.fn().mockResolvedValue('data:image/jpeg;base64,abc123');
      await visualAnalyzer.startCapture();
      
      // Mock clearInterval
      global.clearInterval = jest.fn();
    });
    
    it('should stop screen capture', () => {
      const result = visualAnalyzer.stopCapture();
      
      expect(result).toBe(true);
      expect(visualAnalyzer.isCapturing).toBe(false);
      expect(clearInterval).toHaveBeenCalledWith(visualAnalyzer.captureInterval);
      expect(visualAnalyzer.captureInterval).toBeNull();
    });
  });
  
  describe('analyzeImage', () => {
    beforeEach(async () => {
      // Initialize the visual analyzer
      await visualAnalyzer.initialize();
      
      // Mock extractTextFromImage
      visualAnalyzer.extractTextFromImage = jest.fn().mockResolvedValue('Extracted text');
      
      // Mock analyzeExtractedText
      visualAnalyzer.analyzeExtractedText = jest.fn().mockResolvedValue({
        text: 'Analysis of the extracted text',
        timestamp: '2021-07-01T00:00:00.000Z',
        extractedText: 'Extracted text'
      });
    });
    
    it('should analyze an image', async () => {
      const imageData = 'data:image/jpeg;base64,abc123';
      
      const result = await visualAnalyzer.analyzeImage(imageData);
      
      expect(result).toEqual({
        text: 'Analysis of the extracted text',
        timestamp: '2021-07-01T00:00:00.000Z',
        extractedText: 'Extracted text'
      });
      expect(visualAnalyzer.lastCapturedImage).toBe(imageData);
      expect(visualAnalyzer.extractTextFromImage).toHaveBeenCalledWith(imageData);
      expect(visualAnalyzer.analyzeExtractedText).toHaveBeenCalledWith('Extracted text');
    });
  });
  
  describe('getLastCapturedImage', () => {
    it('should return the last captured image', () => {
      const imageData = 'data:image/jpeg;base64,abc123';
      visualAnalyzer.lastCapturedImage = imageData;
      
      const result = visualAnalyzer.getLastCapturedImage();
      
      expect(result).toBe(imageData);
    });
    
    it('should return null if no image has been captured', () => {
      const result = visualAnalyzer.getLastCapturedImage();
      
      expect(result).toBeNull();
    });
  });
  
  describe('getLastExtractedText', () => {
    it('should return the last extracted text', () => {
      const text = 'Extracted text';
      visualAnalyzer.lastExtractedText = text;
      
      const result = visualAnalyzer.getLastExtractedText();
      
      expect(result).toBe(text);
    });
    
    it('should return an empty string if no text has been extracted', () => {
      const result = visualAnalyzer.getLastExtractedText();
      
      expect(result).toBe('');
    });
  });
  
  describe('getLastAnalysis', () => {
    it('should return the last analysis', () => {
      const analysis = {
        text: 'Analysis of the extracted text',
        timestamp: '2021-07-01T00:00:00.000Z',
        extractedText: 'Extracted text'
      };
      visualAnalyzer.lastAnalysis = analysis;
      
      const result = visualAnalyzer.getLastAnalysis();
      
      expect(result).toEqual(analysis);
    });
    
    it('should return null if no analysis has been performed', () => {
      const result = visualAnalyzer.getLastAnalysis();
      
      expect(result).toBeNull();
    });
  });
});
