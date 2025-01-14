const END_DATE = "2025-07-11T19:43:20.268Z";
const SYNC_UP_TO_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
const MS_ID_TAG = "msEventId";

/**
 * Fetches events from Masterschool Calendar and adds them to Google Calendar.
 */
function fetchAndSyncEvents_(bearerToken, calendarIds) {
  const url = "https://app.masterschool.com/api/ms-calendar-hub/get-events";
  const token = bearerToken;
  const currentDate = new Date().toISOString();

  const payloadData = {
    calendarIds,
    from: currentDate,
    to: END_DATE,
  };

  // Create request headers
  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  // Set up the POST request options
  const options = {
    method: "POST",
    headers: headers,
    payload: JSON.stringify(payloadData),
    muteHttpExceptions: true, // Optional: suppress error responses
  };

  // Send the POST request to the API
  const response = UrlFetchApp.fetch(url, options);
  let results = null;

  if (response.getResponseCode() == 201) {
    const eventsData = JSON.parse(response.getContentText());
    results = syncEventsToCalendar_(eventsData);
  } else {
    Logger.log("Error fetching events: " + response.getResponseCode());
  }
  return results;
}

/**
 * Returns the events that are within specified range
 */
function filterEventsByDate_(eventsData, fromDate, toDate) {
  filteredEvents = [];

  eventsData.forEach(function (event) {
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);

    // add date in range fromDate - toDate to filteredEvents
    if (eventStartDate >= fromDate && eventEndDate <= toDate) {
      filteredEvents.push(event);
    }
  });

  return filteredEvents;
}

/**
 * Remove existing masterschool events in synchronisation range.
 */
function removePrevSyncEvents_(calendar, fromDate, toDate) {
  // search for all events in synchronisation range
  const existingEvents = calendar.getEvents(fromDate, toDate);

  // remove events containing ms id tag
  existingEvents.forEach(function (existingEvent) {
    msEventId = existingEvent.getTag(MS_ID_TAG);
    if (msEventId) {
      Utilities.sleep(100); // pause before deleting event (quotas)
      existingEvent.deleteEvent();
      Logger.log(
        `Resync: existing event: ${existingEvent.getTitle()} with ms id: ${msEventId} was deleted.`
      );
    }
  });
}

/**
 * Add new events in synchronisation range to the Calendar
 */
function addNewEvents_(calendar, events) {
  const eventsCount = events.length;

  let eventCounter = 0;
  let processed = 0;
  let skipped = 0;

  // create new events from filtered events in synchronisation range
  events.forEach(function (event) {
    try {
      // prepare new event attributes
      const title = event.title;
      const startTime = new Date(event.start);
      const endTime = new Date(event.end);

      const url = event.vcUrl ? event.vcUrl : "";
      const desc = `${event.description || ""}${
        event.description !== "" ? " " + url : url
      }`;

      Utilities.sleep(1000); // pause before creating event (quotas)

      const newEvent = calendar.createEvent(title, startTime, endTime, {
        description: desc,
      });

      // set a ms id tag to created event (distinguishing it from other events on resync)
      newEvent.setTag(MS_ID_TAG, event.id);

      Logger.log(
        `Created event: ${event.id} - ${++eventCounter} out of ${eventsCount}`
      );
      ++processed;
    } catch (e) {
      Logger.log(
        `Error adding event: ${e.toString()} - ${++eventCounter} out of ${eventsCount}. ${JSON.stringify(
          event
        )}`
      );
      ++skipped;
    }
  });

  return { eventsCount, processed, skipped };
}

/**
 * Remove previous and add new ms events in sync range to the user's Google Calendar.
 */
function syncEventsToCalendar_(eventsData) {
  const calendar = CalendarApp.getDefaultCalendar();
  const fromDate = new Date(); // today
  const toDate = new Date(fromDate.getTime() + SYNC_UP_TO_DAYS_IN_MS);

  removePrevSyncEvents_(calendar, fromDate, toDate);

  const filteredEvents = filterEventsByDate_(eventsData, fromDate, toDate);

  return addNewEvents_(calendar, filteredEvents);
}

/**
 * Runs the html service to display the UI
 */
function doGet() {
  return HtmlService.createTemplateFromFile("Page").evaluate();
}

/**
 * Extracts Bearer Token and 2 calendar IDs from form.
 * Start synchronisation process with extracted data.
 */
function startSync(formObject) {
  // extract form data
  const bearerToken = formObject["bearer-token"].trim();
  const calendarIds = formObject["calendar-ids"]
    .split("\n")
    .map((id) => id.trim())
    .filter((id) => id !== "");

  // initiate synchronisation with the authentication data and payload
  return fetchAndSyncEvents_(bearerToken, calendarIds);
}

/**
 * Include html snippets (script and stylesheet) to Index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
