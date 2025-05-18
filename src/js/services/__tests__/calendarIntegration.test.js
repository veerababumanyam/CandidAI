/**
 * Unit tests for calendarIntegration service
 */

// Mock the chrome API
global.chrome = {
  ...global.chrome,
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  },
  notifications: {
    create: jest.fn()
  }
};

// Mock Date.now() to return a fixed timestamp
const mockNow = 1625097600000; // July 1, 2021 00:00:00 UTC
global.Date.now = jest.fn(() => mockNow);

// Import the module under test
import calendarIntegration from '../calendarIntegration.js';

describe('calendarIntegration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock storage.local.get to return empty data by default
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });
    
    // Reset the calendar integration state
    calendarIntegration.events = [];
    calendarIntegration.initialized = false;
  });
  
  describe('initialize', () => {
    it('should initialize the calendar integration', async () => {
      const result = await calendarIntegration.initialize();
      
      expect(result).toBe(true);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['calendarEvents'], expect.any(Function));
    });
    
    it('should load events from storage', async () => {
      // Mock storage.local.get to return some events
      const mockEvents = [
        {
          id: 'event_1',
          title: 'Interview with Acme Inc',
          startTime: '2021-07-01T10:00:00.000Z'
        }
      ];
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        if (keys.includes('calendarEvents')) {
          callback({ calendarEvents: mockEvents });
        } else {
          callback({});
        }
      });
      
      const result = await calendarIntegration.initialize();
      
      expect(result).toBe(true);
      expect(calendarIntegration.events).toEqual(mockEvents);
    });
  });
  
  describe('addEvent', () => {
    beforeEach(async () => {
      // Initialize the calendar integration
      await calendarIntegration.initialize();
    });
    
    it('should add a new event', async () => {
      const event = {
        title: 'Interview with Acme Inc',
        company: 'Acme Inc',
        position: 'Software Engineer',
        startTime: '2021-07-01T10:00:00.000Z',
        endTime: '2021-07-01T11:00:00.000Z',
        location: 'Zoom',
        description: 'Technical interview',
        notes: 'Prepare for algorithm questions',
        notifications: true,
        preloadContext: true
      };
      
      const eventId = await calendarIntegration.addEvent(event);
      
      expect(eventId).toBeDefined();
      expect(eventId).toMatch(/^event_\\d+$/);
      
      // Check that the event was added
      const events = calendarIntegration.getAllEvents();
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe(eventId);
      expect(events[0].title).toBe(event.title);
      expect(events[0].company).toBe(event.company);
      expect(events[0].position).toBe(event.position);
      expect(events[0].startTime).toBe(event.startTime);
      expect(events[0].endTime).toBe(event.endTime);
      expect(events[0].location).toBe(event.location);
      expect(events[0].description).toBe(event.description);
      expect(events[0].notes).toBe(event.notes);
      expect(events[0].notifications).toBe(event.notifications);
      expect(events[0].preloadContext).toBe(event.preloadContext);
      expect(events[0].createdAt).toBeDefined();
      expect(events[0].updatedAt).toBeDefined();
      
      // Check that the events were saved
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });
    
    it('should add a new event with default values', async () => {
      const eventId = await calendarIntegration.addEvent({});
      
      // Check that the event was added with default values
      const events = calendarIntegration.getAllEvents();
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe(eventId);
      expect(events[0].title).toBe('Interview');
      expect(events[0].company).toBe('Unknown Company');
      expect(events[0].position).toBe('Unknown Position');
      expect(events[0].startTime).toBeDefined();
      expect(events[0].endTime).toBeDefined();
      expect(events[0].location).toBe('');
      expect(events[0].description).toBe('');
      expect(events[0].notes).toBe('');
      expect(events[0].notifications).toBe(true);
      expect(events[0].preloadContext).toBe(true);
    });
  });
  
  describe('updateEvent', () => {
    let eventId;
    
    beforeEach(async () => {
      // Initialize the calendar integration and add an event
      await calendarIntegration.initialize();
      eventId = await calendarIntegration.addEvent({
        title: 'Original Title',
        company: 'Original Company'
      });
      
      // Reset the mock to clear the call history
      chrome.storage.local.set.mockClear();
    });
    
    it('should update an existing event', async () => {
      const updates = {
        title: 'Updated Title',
        company: 'Updated Company',
        position: 'Updated Position'
      };
      
      const result = await calendarIntegration.updateEvent(eventId, updates);
      
      expect(result).toBe(true);
      
      // Check that the event was updated
      const event = calendarIntegration.getEvent(eventId);
      expect(event.title).toBe(updates.title);
      expect(event.company).toBe(updates.company);
      expect(event.position).toBe(updates.position);
      expect(event.updatedAt).toBeDefined();
      
      // Check that the events were saved
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });
    
    it('should not update id or createdAt', async () => {
      const originalEvent = calendarIntegration.getEvent(eventId);
      const originalId = originalEvent.id;
      const originalCreatedAt = originalEvent.createdAt;
      
      const updates = {
        id: 'new_id',
        createdAt: 'new_date'
      };
      
      const result = await calendarIntegration.updateEvent(eventId, updates);
      
      expect(result).toBe(true);
      
      // Check that id and createdAt were not updated
      const event = calendarIntegration.getEvent(eventId);
      expect(event.id).toBe(originalId);
      expect(event.createdAt).toBe(originalCreatedAt);
    });
    
    it('should return false for a nonexistent event ID', async () => {
      const result = await calendarIntegration.updateEvent('nonexistent_id', {});
      
      expect(result).toBe(false);
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteEvent', () => {
    let eventId;
    
    beforeEach(async () => {
      // Initialize the calendar integration and add an event
      await calendarIntegration.initialize();
      eventId = await calendarIntegration.addEvent({});
      
      // Reset the mock to clear the call history
      chrome.storage.local.set.mockClear();
    });
    
    it('should delete an existing event', async () => {
      const result = await calendarIntegration.deleteEvent(eventId);
      
      expect(result).toBe(true);
      
      // Check that the event was deleted
      const events = calendarIntegration.getAllEvents();
      expect(events).toHaveLength(0);
      
      // Check that the events were saved
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });
    
    it('should return false for a nonexistent event ID', async () => {
      const result = await calendarIntegration.deleteEvent('nonexistent_id');
      
      expect(result).toBe(false);
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });
  
  describe('getAllEvents', () => {
    beforeEach(async () => {
      // Initialize the calendar integration
      await calendarIntegration.initialize();
    });
    
    it('should return all events', async () => {
      // Add some events
      const id1 = await calendarIntegration.addEvent({ title: 'Event 1' });
      const id2 = await calendarIntegration.addEvent({ title: 'Event 2' });
      
      const events = calendarIntegration.getAllEvents();
      
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe(id1);
      expect(events[1].id).toBe(id2);
    });
    
    it('should return an empty array if there are no events', () => {
      const events = calendarIntegration.getAllEvents();
      
      expect(events).toEqual([]);
    });
  });
  
  describe('getUpcomingEvents', () => {
    beforeEach(async () => {
      // Initialize the calendar integration
      await calendarIntegration.initialize();
      
      // Add some events with different dates
      await calendarIntegration.addEvent({
        title: 'Past Event',
        startTime: '2021-06-30T10:00:00.000Z', // 1 day before mockNow
        endTime: '2021-06-30T11:00:00.000Z'
      });
      
      await calendarIntegration.addEvent({
        title: 'Today Event',
        startTime: '2021-07-01T10:00:00.000Z', // Same day as mockNow
        endTime: '2021-07-01T11:00:00.000Z'
      });
      
      await calendarIntegration.addEvent({
        title: 'Future Event',
        startTime: '2021-07-05T10:00:00.000Z', // 4 days after mockNow
        endTime: '2021-07-05T11:00:00.000Z'
      });
      
      await calendarIntegration.addEvent({
        title: 'Far Future Event',
        startTime: '2021-07-10T10:00:00.000Z', // 9 days after mockNow
        endTime: '2021-07-10T11:00:00.000Z'
      });
    });
    
    it('should return upcoming events within the specified number of days', () => {
      // Get events for the next 7 days (default)
      const events = calendarIntegration.getUpcomingEvents();
      
      expect(events).toHaveLength(2);
      expect(events[0].title).toBe('Today Event');
      expect(events[1].title).toBe('Future Event');
    });
    
    it('should return upcoming events for a custom number of days', () => {
      // Get events for the next 10 days
      const events = calendarIntegration.getUpcomingEvents(10);
      
      expect(events).toHaveLength(3);
      expect(events[0].title).toBe('Today Event');
      expect(events[1].title).toBe('Future Event');
      expect(events[2].title).toBe('Far Future Event');
    });
  });
  
  describe('getEvent', () => {
    let eventId;
    
    beforeEach(async () => {
      // Initialize the calendar integration and add an event
      await calendarIntegration.initialize();
      eventId = await calendarIntegration.addEvent({
        title: 'Test Event',
        company: 'Test Company'
      });
    });
    
    it('should return an event by ID', () => {
      const event = calendarIntegration.getEvent(eventId);
      
      expect(event).toBeDefined();
      expect(event.id).toBe(eventId);
      expect(event.title).toBe('Test Event');
      expect(event.company).toBe('Test Company');
    });
    
    it('should return null for a nonexistent event ID', () => {
      const event = calendarIntegration.getEvent('nonexistent_id');
      
      expect(event).toBeNull();
    });
  });
  
  describe('preloadEventContext', () => {
    let eventId;
    
    beforeEach(async () => {
      // Initialize the calendar integration and add an event
      await calendarIntegration.initialize();
      eventId = await calendarIntegration.addEvent({
        company: 'Acme Inc',
        position: 'Software Engineer',
        description: 'Technical interview',
        notes: 'Prepare for algorithm questions'
      });
    });
    
    it('should preload context for an upcoming event', async () => {
      const result = await calendarIntegration.preloadEventContext(eventId);
      
      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        'upcomingInterviewContext': {
          company: 'Acme Inc',
          position: 'Software Engineer',
          startTime: expect.any(String),
          description: 'Technical interview',
          notes: 'Prepare for algorithm questions'
        }
      }, expect.any(Function));
    });
    
    it('should return false for a nonexistent event ID', async () => {
      const result = await calendarIntegration.preloadEventContext('nonexistent_id');
      
      expect(result).toBe(false);
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });
});
