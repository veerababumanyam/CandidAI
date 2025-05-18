/**
 * CandidAI - Platform-Specific Scrapers
 * Provides specialized scrapers for different job platforms
 */

/**
 * Base scraper class that all platform-specific scrapers extend
 */
class BaseScraper {
  constructor() {
    this.platformName = 'generic';
    this.platformType = 'unknown';
    this.isActive = false;
    this.lastScrapedData = null;
    this.scrapingInterval = null;
    this.scrapingIntervalTime = 5000; // 5 seconds
  }

  /**
   * Check if the current page matches this platform
   * @returns {boolean} - Whether this is the correct platform
   */
  matchesCurrentPage() {
    return false; // Base implementation always returns false
  }

  /**
   * Initialize the scraper
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    this.isActive = this.matchesCurrentPage();
    
    if (this.isActive) {
      console.log(`Initialized ${this.platformName} scraper`);
      return true;
    }
    
    return false;
  }

  /**
   * Start continuous scraping
   * @returns {Promise<void>}
   */
  async startScraping() {
    if (!this.isActive) {
      await this.initialize();
    }
    
    if (this.isActive) {
      // Clear any existing interval
      this.stopScraping();
      
      // Perform initial scrape
      await this.scrape();
      
      // Set up interval for continuous scraping
      this.scrapingInterval = setInterval(async () => {
        await this.scrape();
      }, this.scrapingIntervalTime);
      
      console.log(`Started continuous scraping for ${this.platformName}`);
    }
  }

  /**
   * Stop continuous scraping
   */
  stopScraping() {
    if (this.scrapingInterval) {
      clearInterval(this.scrapingInterval);
      this.scrapingInterval = null;
      console.log(`Stopped continuous scraping for ${this.platformName}`);
    }
  }

  /**
   * Scrape data from the current page
   * @returns {Promise<Object>} - The scraped data
   */
  async scrape() {
    // Base implementation does nothing
    return {};
  }

  /**
   * Get the last scraped data
   * @returns {Object} - The last scraped data
   */
  getLastScrapedData() {
    return this.lastScrapedData;
  }
}

/**
 * LinkedIn Jobs scraper
 */
class LinkedInJobsScraper extends BaseScraper {
  constructor() {
    super();
    this.platformName = 'LinkedIn Jobs';
    this.platformType = 'job-listing';
  }

  /**
   * Check if the current page is a LinkedIn job listing
   * @returns {boolean} - Whether this is a LinkedIn job listing
   */
  matchesCurrentPage() {
    return window.location.href.includes('linkedin.com/jobs/view/') ||
           window.location.href.includes('linkedin.com/jobs/search/') ||
           document.querySelector('.jobs-search__job-details--container') !== null;
  }

  /**
   * Scrape job data from LinkedIn
   * @returns {Promise<Object>} - The scraped job data
   */
  async scrape() {
    if (!this.isActive) {
      return {};
    }

    try {
      // Job title
      const jobTitleElement = document.querySelector('.jobs-unified-top-card__job-title') || 
                             document.querySelector('.job-details-jobs-unified-top-card__job-title');
      const jobTitle = jobTitleElement ? jobTitleElement.textContent.trim() : '';

      // Company name
      const companyElement = document.querySelector('.jobs-unified-top-card__company-name') || 
                            document.querySelector('.job-details-jobs-unified-top-card__company-name');
      const company = companyElement ? companyElement.textContent.trim() : '';

      // Location
      const locationElement = document.querySelector('.jobs-unified-top-card__bullet') || 
                             document.querySelector('.job-details-jobs-unified-top-card__bullet');
      const location = locationElement ? locationElement.textContent.trim() : '';

      // Job description
      const descriptionElement = document.querySelector('.jobs-description-content__text') || 
                                document.querySelector('.job-details-jobs-unified-top-card__description-text');
      const description = descriptionElement ? descriptionElement.textContent.trim() : '';

      // Job details (experience, employment type, etc.)
      const criteriaElements = document.querySelectorAll('.jobs-unified-top-card__job-insight') || 
                              document.querySelectorAll('.job-details-jobs-unified-top-card__job-insight');
      const criteria = Array.from(criteriaElements).map(el => el.textContent.trim());

      // Skills
      const skillElements = document.querySelectorAll('.job-details-skill-match-status-list li') || 
                           document.querySelectorAll('.jobs-skill-match-status-list li');
      const skills = Array.from(skillElements).map(el => el.textContent.trim());

      // Assemble the data
      const scrapedData = {
        platform: this.platformName,
        type: this.platformType,
        jobTitle,
        company,
        location,
        description,
        criteria,
        skills,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      // Update last scraped data
      this.lastScrapedData = scrapedData;

      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'platformDataScraped',
        data: scrapedData
      });

      return scrapedData;
    } catch (error) {
      console.error('Error scraping LinkedIn job data:', error);
      return {};
    }
  }
}

/**
 * LinkedIn Recruiter scraper
 */
class LinkedInRecruiterScraper extends BaseScraper {
  constructor() {
    super();
    this.platformName = 'LinkedIn Recruiter';
    this.platformType = 'recruiter-platform';
  }

  /**
   * Check if the current page is LinkedIn Recruiter
   * @returns {boolean} - Whether this is LinkedIn Recruiter
   */
  matchesCurrentPage() {
    return window.location.href.includes('linkedin.com/talent/') ||
           window.location.href.includes('linkedin.com/recruiter/');
  }

  /**
   * Scrape data from LinkedIn Recruiter
   * @returns {Promise<Object>} - The scraped data
   */
  async scrape() {
    if (!this.isActive) {
      return {};
    }

    try {
      // Candidate name
      const nameElement = document.querySelector('.profile-info-card__name');
      const candidateName = nameElement ? nameElement.textContent.trim() : '';

      // Current title
      const titleElement = document.querySelector('.profile-info-card__headline');
      const currentTitle = titleElement ? titleElement.textContent.trim() : '';

      // Current company
      const companyElement = document.querySelector('.profile-info-card__company-link');
      const currentCompany = companyElement ? companyElement.textContent.trim() : '';

      // Job details (if viewing a specific job)
      const jobTitleElement = document.querySelector('.jobs-details__main-title');
      const jobTitle = jobTitleElement ? jobTitleElement.textContent.trim() : '';

      // Assemble the data
      const scrapedData = {
        platform: this.platformName,
        type: this.platformType,
        candidateName,
        currentTitle,
        currentCompany,
        jobTitle,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      // Update last scraped data
      this.lastScrapedData = scrapedData;

      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'platformDataScraped',
        data: scrapedData
      });

      return scrapedData;
    } catch (error) {
      console.error('Error scraping LinkedIn Recruiter data:', error);
      return {};
    }
  }
}

/**
 * HireVue scraper
 */
class HireVueScraper extends BaseScraper {
  constructor() {
    super();
    this.platformName = 'HireVue';
    this.platformType = 'video-interview';
  }

  /**
   * Check if the current page is HireVue
   * @returns {boolean} - Whether this is HireVue
   */
  matchesCurrentPage() {
    return window.location.href.includes('hirevue.com/interviews/') ||
           document.querySelector('.hirevue-app') !== null;
  }

  /**
   * Scrape data from HireVue
   * @returns {Promise<Object>} - The scraped data
   */
  async scrape() {
    if (!this.isActive) {
      return {};
    }

    try {
      // Interview title
      const titleElement = document.querySelector('.interview-title') || 
                          document.querySelector('.interview-header__title');
      const interviewTitle = titleElement ? titleElement.textContent.trim() : '';

      // Company name
      const companyElement = document.querySelector('.company-name') || 
                            document.querySelector('.interview-header__company');
      const company = companyElement ? companyElement.textContent.trim() : '';

      // Current question (if in an interview)
      const questionElement = document.querySelector('.question-text') || 
                             document.querySelector('.interview-question__text');
      const currentQuestion = questionElement ? questionElement.textContent.trim() : '';

      // Time remaining (if in an interview)
      const timeElement = document.querySelector('.time-remaining') || 
                         document.querySelector('.interview-timer');
      const timeRemaining = timeElement ? timeElement.textContent.trim() : '';

      // Assemble the data
      const scrapedData = {
        platform: this.platformName,
        type: this.platformType,
        interviewTitle,
        company,
        currentQuestion,
        timeRemaining,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      // Update last scraped data
      this.lastScrapedData = scrapedData;

      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'platformDataScraped',
        data: scrapedData
      });

      return scrapedData;
    } catch (error) {
      console.error('Error scraping HireVue data:', error);
      return {};
    }
  }
}

/**
 * Platform scraper manager
 * Manages all platform-specific scrapers
 */
class PlatformScraperManager {
  constructor() {
    this.scrapers = [
      new LinkedInJobsScraper(),
      new LinkedInRecruiterScraper(),
      new HireVueScraper()
    ];
    this.activeScraper = null;
  }

  /**
   * Initialize the manager
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    // Try to find a matching scraper for the current page
    for (const scraper of this.scrapers) {
      const isMatch = await scraper.initialize();
      if (isMatch) {
        this.activeScraper = scraper;
        console.log(`Active scraper: ${scraper.platformName}`);
        return true;
      }
    }
    
    console.log('No matching scraper found for the current page');
    return false;
  }

  /**
   * Start scraping with the active scraper
   * @returns {Promise<void>}
   */
  async startScraping() {
    if (this.activeScraper) {
      await this.activeScraper.startScraping();
    } else {
      await this.initialize();
      if (this.activeScraper) {
        await this.activeScraper.startScraping();
      }
    }
  }

  /**
   * Stop scraping with the active scraper
   */
  stopScraping() {
    if (this.activeScraper) {
      this.activeScraper.stopScraping();
    }
  }

  /**
   * Get the active scraper
   * @returns {BaseScraper|null} - The active scraper
   */
  getActiveScraper() {
    return this.activeScraper;
  }

  /**
   * Get the last scraped data from the active scraper
   * @returns {Object|null} - The last scraped data
   */
  getLastScrapedData() {
    return this.activeScraper ? this.activeScraper.getLastScrapedData() : null;
  }
}

// Create and export the manager
const platformScraperManager = new PlatformScraperManager();

export default platformScraperManager;
