/**
 * CandidAI - Calendar Integration Service
 * Manages interview events and reminders
 */

/**
 * Calendar Integration class for managing interview events
 */
class CalendarIntegration {
  constructor() {
    this.events = [];
    this.initialized = false;
    this.notificationCheckInterval = null;
    this.notificationCheckIntervalTime = 60000; // 1 minute
  }

  /**
   * Initialize the calendar integration
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Load events from storage
      await this.loadEvents();
      
      // Start notification check interval
      this.startNotificationCheck();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing calendar integration:', error);
      return false;
    }
  }

  /**
   * Load events from storage
   * @private
   * @returns {Promise<boolean>} - Whether loading was successful
   */
  async loadEvents() {
    try {
      const result = await new Promise(resolve => {
        chrome.storage.local.get(['calendarEvents'], resolve);
      });
      
      if (result.calendarEvents && Array.isArray(result.calendarEvents)) {
        this.events = result.calendarEvents;
        console.log('Loaded calendar events from storage:', this.events.length, 'events');
      }
      
      return true;
    } catch (error) {
      console.error('Error loading calendar events from storage:', error);
      return false;
    }
  }

  /**
   * Save events to storage
   * @private
   * @returns {Promise<boolean>} - Whether saving was successful
   */
  async saveEvents() {
    try {
      await new Promise(resolve => {
        chrome.storage.local.set({ 'calendarEvents': this.events }, resolve);
      });
      
      return true;
    } catch (error) {
      console.error('Error saving calendar events to storage:', error);
      return false;
    }
  }

  /**
   * Start checking for upcoming event notifications
   * @private
   */
  startNotificationCheck() {
    // Clear any existing interval
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval);
    }
    
    // Check immediately
    this.checkForUpcomingEvents();
    
    // Set up interval for continuous checking
    this.notificationCheckInterval = setInterval(() => {
      this.checkForUpcomingEvents();
    }, this.notificationCheckIntervalTime);
  }

  /**
   * Check for upcoming events and send notifications
   * @private
   */
  async checkForUpcomingEvents() {
    const now = new Date();
    
    // Filter for events that are upcoming and have notifications enabled
    const upcomingEvents = this.events.filter(event => {
      // Skip events that have already occurred
      if (new Date(event.endTime) < now) {
        return false;
      }
      
      // Skip events that have notifications disabled
      if (!event.notifications) {
        return false;
      }
      
      // Check if the event is within the notification threshold
      const eventTime = new Date(event.startTime);
      const timeDiff = eventTime - now;
      const minutesDiff = Math.floor(timeDiff / 60000);
      
      // Notify at 24 hours, 1 hour, and 15 minutes before the event
      return (
        (minutesDiff <= 1440 && minutesDiff > 1439) || // 24 hours
        (minutesDiff <= 60 && minutesDiff > 59) ||     // 1 hour
        (minutesDiff <= 15 && minutesDiff > 14)        // 15 minutes
      );
    });
    
    // Send notifications for upcoming events
    for (const event of upcomingEvents) {
      // Skip events that have already been notified at this threshold
      if (event.lastNotificationTime) {
        const lastNotification = new Date(event.lastNotificationTime);
        const timeSinceLastNotification = now - lastNotification;
        
        // Skip if we've sent a notification in the last 30 minutes
        if (timeSinceLastNotification < 30 * 60 * 1000) {
          continue;
        }
      }
      
      // Calculate time until event
      const eventTime = new Date(event.startTime);
      const timeDiff = eventTime - now;
      const minutesDiff = Math.floor(timeDiff / 60000);
      
      // Create notification message
      let notificationMessage = '';
      
      if (minutesDiff > 60) {
        const hoursDiff = Math.floor(minutesDiff / 60);
        notificationMessage = `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} until your interview with ${event.company}`;
      } else {
        notificationMessage = `${minutesDiff} minute${minutesDiff > 1 ? 's' : ''} until your interview with ${event.company}`;
      }
      
      // Send notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/logo3.png',
        title: 'Upcoming Interview',
        message: notificationMessage,
        priority: 1,
        silent: false
      });
      
      // Update last notification time
      event.lastNotificationTime = now.toISOString();
    }
    
    // Save updated events
    if (upcomingEvents.length > 0) {
      await this.saveEvents();
    }
  }

  /**
   * Add a new event
   * @param {Object} event - The event to add
   * @returns {Promise<string>} - The ID of the added event
   */
  async addEvent(event) {
    // Generate a unique ID
    const eventId = 'event_' + Date.now();
    
    // Create the event object
    const newEvent = {
      id: eventId,
      title: event.title || 'Interview',
      company: event.company || 'Unknown Company',
      position: event.position || 'Unknown Position',
      startTime: event.startTime || new Date().toISOString(),
      endTime: event.endTime || new Date(new Date().getTime() + 3600000).toISOString(), // Default to 1 hour
      location: event.location || '',
      description: event.description || '',
      notes: event.notes || '',
      notifications: event.notifications !== undefined ? event.notifications : true,
      preloadContext: event.preloadContext !== undefined ? event.preloadContext : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to events array
    this.events.push(newEvent);
    
    // Save to storage
    await this.saveEvents();
    
    // Return the event ID
    return eventId;
  }

  /**
   * Update an existing event
   * @param {string} eventId - The ID of the event to update
   * @param {Object} updates - The updates to apply
   * @returns {Promise<boolean>} - Whether the update was successful
   */
  async updateEvent(eventId, updates) {
    // Find the event
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      console.error('Event not found:', eventId);
      return false;
    }
    
    // Update the event
    const event = this.events[eventIndex];
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        event[key] = updates[key];
      }
    });
    
    // Update the updatedAt timestamp
    event.updatedAt = new Date().toISOString();
    
    // Save to storage
    await this.saveEvents();
    
    return true;
  }

  /**
   * Delete an event
   * @param {string} eventId - The ID of the event to delete
   * @returns {Promise<boolean>} - Whether the deletion was successful
   */
  async deleteEvent(eventId) {
    // Find the event
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      console.error('Event not found:', eventId);
      return false;
    }
    
    // Remove the event
    this.events.splice(eventIndex, 1);
    
    // Save to storage
    await this.saveEvents();
    
    return true;
  }

  /**
   * Get all events
   * @returns {Array} - All events
   */
  getAllEvents() {
    return this.events;
  }

  /**
   * Get upcoming events
   * @param {number} days - Number of days to look ahead
   * @returns {Array} - Upcoming events
   */
  getUpcomingEvents(days = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.events.filter(event => {
      const eventTime = new Date(event.startTime);
      return eventTime >= now && eventTime <= futureDate;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  /**
   * Get an event by ID
   * @param {string} eventId - The ID of the event to get
   * @returns {Object|null} - The event or null if not found
   */
  getEvent(eventId) {
    return this.events.find(e => e.id === eventId) || null;
  }

  /**
   * Preload context for an upcoming event
   * @param {string} eventId - The ID of the event to preload context for
   * @returns {Promise<boolean>} - Whether preloading was successful
   */
  async preloadEventContext(eventId) {
    // Find the event
    const event = this.getEvent(eventId);
    
    if (!event) {
      console.error('Event not found:', eventId);
      return false;
    }
    
    try {
      // Store event details in context
      await new Promise(resolve => {
        chrome.storage.local.set({
          'upcomingInterviewContext': {
            company: event.company,
            position: event.position,
            startTime: event.startTime,
            description: event.description,
            notes: event.notes
          }
        }, resolve);
      });
      
      return true;
    } catch (error) {
      console.error('Error preloading event context:', error);
      return false;
    }
  }
}

// Create a singleton instance
const calendarIntegration = new CalendarIntegration();

export default calendarIntegration;
