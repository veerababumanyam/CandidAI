/**
 * CandidAI - Calendar Controller
 * Manages the calendar UI and interactions
 */

import calendarIntegration from '../js/services/calendarIntegration.js';

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements - Navigation
  const backToOptionsButton = document.getElementById('backToOptions');
  
  // DOM Elements - Calendar
  const prevMonthButton = document.getElementById('prevMonthButton');
  const nextMonthButton = document.getElementById('nextMonthButton');
  const currentMonthYearElement = document.getElementById('currentMonthYear');
  const calendarGrid = document.querySelector('.calendar-grid');
  
  // DOM Elements - Events List
  const upcomingEventsList = document.getElementById('upcomingEventsList');
  const emptyEventsState = document.getElementById('emptyEventsState');
  const addEventButton = document.getElementById('addEventButton');
  
  // DOM Elements - Event Form Modal
  const eventFormModal = document.getElementById('eventFormModal');
  const modalTitle = document.getElementById('modalTitle');
  const closeModal = document.getElementById('closeModal');
  const eventForm = document.getElementById('eventForm');
  const eventId = document.getElementById('eventId');
  const eventTitle = document.getElementById('eventTitle');
  const eventCompany = document.getElementById('eventCompany');
  const eventPosition = document.getElementById('eventPosition');
  const eventStartDate = document.getElementById('eventStartDate');
  const eventStartTime = document.getElementById('eventStartTime');
  const eventEndTime = document.getElementById('eventEndTime');
  const eventLocation = document.getElementById('eventLocation');
  const eventDescription = document.getElementById('eventDescription');
  const eventNotes = document.getElementById('eventNotes');
  const eventNotifications = document.getElementById('eventNotifications');
  const eventPreloadContext = document.getElementById('eventPreloadContext');
  const cancelEventButton = document.getElementById('cancelEventButton');
  const saveEventButton = document.getElementById('saveEventButton');
  
  // DOM Elements - Event Details Modal
  const eventDetailsModal = document.getElementById('eventDetailsModal');
  const detailsModalTitle = document.getElementById('detailsModalTitle');
  const closeDetailsModal = document.getElementById('closeDetailsModal');
  const detailCompany = document.getElementById('detailCompany');
  const detailPosition = document.getElementById('detailPosition');
  const detailDate = document.getElementById('detailDate');
  const detailTime = document.getElementById('detailTime');
  const detailLocation = document.getElementById('detailLocation');
  const detailDescription = document.getElementById('detailDescription');
  const detailNotes = document.getElementById('detailNotes');
  const detailNotifications = document.getElementById('detailNotifications');
  const detailPreloadContext = document.getElementById('detailPreloadContext');
  const editEventButton = document.getElementById('editEventButton');
  const deleteEventButton = document.getElementById('deleteEventButton');
  
  // DOM Elements - Footer
  const helpLink = document.getElementById('helpLink');
  const feedbackLink = document.getElementById('feedbackLink');
  
  // Current state
  let currentDate = new Date();
  let currentViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  let currentDetailEventId = null;
  
  // Initialize the calendar integration
  await calendarIntegration.initialize();
  
  // Initialize UI
  initializeUI();
  
  // Event Listeners - Navigation
  backToOptionsButton.addEventListener('click', () => {
    window.location.href = 'options.html';
  });
  
  // Event Listeners - Calendar
  prevMonthButton.addEventListener('click', () => {
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    renderCalendar();
  });
  
  nextMonthButton.addEventListener('click', () => {
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    renderCalendar();
  });
  
  // Event Listeners - Events
  addEventButton.addEventListener('click', () => {
    openAddEventModal();
  });
  
  // Event Listeners - Event Form Modal
  closeModal.addEventListener('click', () => {
    closeEventModal();
  });
  
  cancelEventButton.addEventListener('click', () => {
    closeEventModal();
  });
  
  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEvent();
  });
  
  // Event Listeners - Event Details Modal
  closeDetailsModal.addEventListener('click', () => {
    closeEventDetailsModal();
  });
  
  editEventButton.addEventListener('click', () => {
    if (currentDetailEventId) {
      closeEventDetailsModal();
      openEditEventModal(currentDetailEventId);
    }
  });
  
  deleteEventButton.addEventListener('click', () => {
    if (currentDetailEventId) {
      deleteEvent(currentDetailEventId);
    }
  });
  
  // Event Listeners - Footer
  helpLink.addEventListener('click', openHelpPage);
  feedbackLink.addEventListener('click', openFeedbackForm);
  
  /**
   * Initialize the UI
   */
  function initializeUI() {
    // Set default date for event form
    const today = new Date();
    const formattedDate = formatDateForInput(today);
    eventStartDate.value = formattedDate;
    
    // Set default times
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour after start
    
    eventStartTime.value = formatTimeForInput(startTime);
    eventEndTime.value = formatTimeForInput(endTime);
    
    // Render calendar
    renderCalendar();
    
    // Render upcoming events
    renderUpcomingEvents();
  }
  
  /**
   * Render the calendar for the current view date
   */
  function renderCalendar() {
    // Update month/year display
    currentMonthYearElement.textContent = formatMonthYear(currentViewDate);
    
    // Clear existing calendar days (except headers)
    const existingDays = calendarGrid.querySelectorAll('.calendar-day');
    existingDays.forEach(day => day.remove());
    
    // Get all events
    const events = calendarIntegration.getAllEvents();
    
    // Get first day of month and total days
    const firstDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
    const lastDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Add days from previous month to fill first row
    const prevMonthLastDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const dayNumber = prevMonthLastDay - firstDayOfWeek + i + 1;
      const dayDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, dayNumber);
      
      // Get events for this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDate() === dayNumber && 
               eventDate.getMonth() === dayDate.getMonth() && 
               eventDate.getFullYear() === dayDate.getFullYear();
      });
      
      addCalendarDay(dayNumber, true, dayEvents, dayDate);
    }
    
    // Add days for current month
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), i);
      
      // Get events for this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDate() === i && 
               eventDate.getMonth() === currentViewDate.getMonth() && 
               eventDate.getFullYear() === currentViewDate.getFullYear();
      });
      
      // Check if this is today
      const isToday = dayDate.getDate() === currentDate.getDate() && 
                      dayDate.getMonth() === currentDate.getMonth() && 
                      dayDate.getFullYear() === currentDate.getFullYear();
      
      addCalendarDay(i, false, dayEvents, dayDate, isToday);
    }
    
    // Add days from next month to complete the grid
    const totalCells = Math.ceil((firstDayOfWeek + totalDays) / 7) * 7;
    const nextMonthDays = totalCells - (firstDayOfWeek + totalDays);
    
    for (let i = 1; i <= nextMonthDays; i++) {
      const dayDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, i);
      
      // Get events for this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDate() === i && 
               eventDate.getMonth() === dayDate.getMonth() && 
               eventDate.getFullYear() === dayDate.getFullYear();
      });
      
      addCalendarDay(i, true, dayEvents, dayDate);
    }
  }
  
  /**
   * Add a day to the calendar grid
   * @param {number} dayNumber - The day number
   * @param {boolean} isOtherMonth - Whether this day is from another month
   * @param {Array} events - Events for this day
   * @param {Date} date - The date object for this day
   * @param {boolean} isToday - Whether this day is today
   */
  function addCalendarDay(dayNumber, isOtherMonth, events, date, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
      dayElement.classList.add('other-month');
    }
    
    if (isToday) {
      dayElement.classList.add('today');
    }
    
    // Add day number
    const dayNumberElement = document.createElement('div');
    dayNumberElement.className = 'calendar-day-number';
    dayNumberElement.textContent = dayNumber;
    dayElement.appendChild(dayNumberElement);
    
    // Add events
    if (events.length > 0) {
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'calendar-day-events';
      
      // Limit to 3 events per day in the calendar view
      const displayEvents = events.slice(0, 3);
      
      displayEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'calendar-event-indicator';
        eventElement.textContent = event.company;
        eventElement.addEventListener('click', (e) => {
          e.stopPropagation();
          openEventDetailsModal(event.id);
        });
        eventsContainer.appendChild(eventElement);
      });
      
      // Add "more" indicator if there are more events
      if (events.length > 3) {
        const moreElement = document.createElement('div');
        moreElement.className = 'calendar-event-indicator more';
        moreElement.textContent = `+${events.length - 3} more`;
        eventsContainer.appendChild(moreElement);
      }
      
      dayElement.appendChild(eventsContainer);
    }
    
    // Add click event to add an event on this day
    dayElement.addEventListener('click', () => {
      openAddEventModal(date);
    });
    
    calendarGrid.appendChild(dayElement);
  }
  
  /**
   * Render the upcoming events list
   */
  function renderUpcomingEvents() {
    // Get upcoming events for the next 30 days
    const events = calendarIntegration.getUpcomingEvents(30);
    
    // Clear existing events
    while (upcomingEventsList.firstChild) {
      if (upcomingEventsList.firstChild === emptyEventsState) {
        break;
      }
      upcomingEventsList.removeChild(upcomingEventsList.firstChild);
    }
    
    // Show empty state if no events
    if (events.length === 0) {
      emptyEventsState.style.display = 'flex';
      return;
    }
    
    // Hide empty state
    emptyEventsState.style.display = 'none';
    
    // Add events to the list
    events.forEach(event => {
      const eventCard = createEventCard(event);
      upcomingEventsList.appendChild(eventCard);
    });
  }
  
  /**
   * Create an event card element
   * @param {Object} event - The event data
   * @returns {HTMLElement} - The event card element
   */
  function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.addEventListener('click', () => {
      openEventDetailsModal(event.id);
    });
    
    const header = document.createElement('div');
    header.className = 'event-card-header';
    
    const title = document.createElement('h3');
    title.className = 'event-card-title';
    title.textContent = event.title;
    
    const date = document.createElement('div');
    date.className = 'event-card-date';
    date.textContent = formatDate(new Date(event.startTime));
    
    header.appendChild(title);
    header.appendChild(date);
    
    const company = document.createElement('div');
    company.className = 'event-card-company';
    company.textContent = event.company;
    
    const details = document.createElement('div');
    details.className = 'event-card-details';
    
    // Add time
    const timeDetail = document.createElement('div');
    timeDetail.className = 'event-card-detail';
    timeDetail.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      ${formatTime(new Date(event.startTime))} - ${formatTime(new Date(event.endTime))}
    `;
    
    // Add position
    const positionDetail = document.createElement('div');
    positionDetail.className = 'event-card-detail';
    positionDetail.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 7h-3a2 2 0 0 1-2-2V2"></path>
        <path d="M16 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"></path>
      </svg>
      ${event.position}
    `;
    
    details.appendChild(timeDetail);
    details.appendChild(positionDetail);
    
    card.appendChild(header);
    card.appendChild(company);
    card.appendChild(details);
    
    return card;
  }
  
  /**
   * Open the add event modal
   * @param {Date} date - Optional date to pre-fill
   */
  function openAddEventModal(date) {
    // Reset form
    eventForm.reset();
    eventId.value = '';
    modalTitle.textContent = 'Add Interview';
    
    // Set default date and times
    if (date) {
      eventStartDate.value = formatDateForInput(date);
    } else {
      const today = new Date();
      eventStartDate.value = formatDateForInput(today);
    }
    
    // Set default times (9 AM to 10 AM)
    const defaultDate = date || new Date();
    const startTime = new Date(defaultDate);
    startTime.setHours(9, 0, 0);
    const endTime = new Date(defaultDate);
    endTime.setHours(10, 0, 0);
    
    eventStartTime.value = formatTimeForInput(startTime);
    eventEndTime.value = formatTimeForInput(endTime);
    
    // Show modal
    eventFormModal.style.display = 'block';
  }
  
  /**
   * Open the edit event modal
   * @param {string} eventId - The ID of the event to edit
   */
  function openEditEventModal(eventId) {
    // Get event data
    const event = calendarIntegration.getEvent(eventId);
    
    if (!event) {
      console.error('Event not found:', eventId);
      return;
    }
    
    // Set form title
    modalTitle.textContent = 'Edit Interview';
    
    // Fill form with event data
    document.getElementById('eventId').value = event.id;
    eventTitle.value = event.title;
    eventCompany.value = event.company;
    eventPosition.value = event.position;
    
    // Set date and times
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    eventStartDate.value = formatDateForInput(startDate);
    eventStartTime.value = formatTimeForInput(startDate);
    eventEndTime.value = formatTimeForInput(endDate);
    
    eventLocation.value = event.location || '';
    eventDescription.value = event.description || '';
    eventNotes.value = event.notes || '';
    eventNotifications.checked = event.notifications !== false;
    eventPreloadContext.checked = event.preloadContext !== false;
    
    // Show modal
    eventFormModal.style.display = 'block';
  }
  
  /**
   * Close the event modal
   */
  function closeEventModal() {
    eventFormModal.style.display = 'none';
  }
  
  /**
   * Save the event from the form
   */
  async function saveEvent() {
    // Get form data
    const formData = {
      title: eventTitle.value,
      company: eventCompany.value,
      position: eventPosition.value,
      location: eventLocation.value,
      description: eventDescription.value,
      notes: eventNotes.value,
      notifications: eventNotifications.checked,
      preloadContext: eventPreloadContext.checked
    };
    
    // Create date objects for start and end times
    const startDate = new Date(eventStartDate.value);
    const [startHours, startMinutes] = eventStartTime.value.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0);
    
    const endDate = new Date(eventStartDate.value);
    const [endHours, endMinutes] = eventEndTime.value.split(':').map(Number);
    endDate.setHours(endHours, endMinutes, 0);
    
    // Add times to form data
    formData.startTime = startDate.toISOString();
    formData.endTime = endDate.toISOString();
    
    try {
      // Check if this is an edit or a new event
      const eventIdValue = document.getElementById('eventId').value;
      
      if (eventIdValue) {
        // Update existing event
        await calendarIntegration.updateEvent(eventIdValue, formData);
      } else {
        // Add new event
        await calendarIntegration.addEvent(formData);
      }
      
      // Close modal
      closeEventModal();
      
      // Refresh UI
      renderCalendar();
      renderUpcomingEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + error.message);
    }
  }
  
  /**
   * Open the event details modal
   * @param {string} eventId - The ID of the event to show
   */
  function openEventDetailsModal(eventId) {
    // Get event data
    const event = calendarIntegration.getEvent(eventId);
    
    if (!event) {
      console.error('Event not found:', eventId);
      return;
    }
    
    // Store current event ID
    currentDetailEventId = eventId;
    
    // Set modal title
    detailsModalTitle.textContent = event.title;
    
    // Fill details
    detailCompany.textContent = event.company;
    detailPosition.textContent = event.position;
    
    // Format date and time
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    detailDate.textContent = formatDate(startDate);
    detailTime.textContent = `${formatTime(startDate)} - ${formatTime(endDate)}`;
    
    detailLocation.textContent = event.location || 'Not specified';
    detailDescription.textContent = event.description || 'No description provided';
    detailNotes.textContent = event.notes || 'No notes added';
    
    detailNotifications.textContent = event.notifications !== false ? 'Enabled' : 'Disabled';
    detailPreloadContext.textContent = event.preloadContext !== false ? 'Enabled' : 'Disabled';
    
    // Show modal
    eventDetailsModal.style.display = 'block';
  }
  
  /**
   * Close the event details modal
   */
  function closeEventDetailsModal() {
    eventDetailsModal.style.display = 'none';
    currentDetailEventId = null;
  }
  
  /**
   * Delete an event
   * @param {string} eventId - The ID of the event to delete
   */
  async function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
      try {
        // Delete the event
        await calendarIntegration.deleteEvent(eventId);
        
        // Close modal
        closeEventDetailsModal();
        
        // Refresh UI
        renderCalendar();
        renderUpcomingEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event: ' + error.message);
      }
    }
  }
  
  /**
   * Format a date for display
   * @param {Date} date - The date to format
   * @returns {string} - Formatted date string
   */
  function formatDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  /**
   * Format a time for display
   * @param {Date} date - The date containing the time to format
   * @returns {string} - Formatted time string
   */
  function formatTime(date) {
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', options);
  }
  
  /**
   * Format a date for input fields
   * @param {Date} date - The date to format
   * @returns {string} - Formatted date string (YYYY-MM-DD)
   */
  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Format a time for input fields
   * @param {Date} date - The date containing the time to format
   * @returns {string} - Formatted time string (HH:MM)
   */
  function formatTimeForInput(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  /**
   * Format month and year for display
   * @param {Date} date - The date to format
   * @returns {string} - Formatted month and year string
   */
  function formatMonthYear(date) {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  /**
   * Open the help page
   */
  function openHelpPage() {
    chrome.tabs.create({ url: 'https://candidai.io/help' });
  }
  
  /**
   * Open the feedback form
   */
  function openFeedbackForm() {
    chrome.tabs.create({ url: 'https://candidai.io/feedback' });
  }
});
