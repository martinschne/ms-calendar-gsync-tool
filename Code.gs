const END_DATE = "2025-07-11T19:43:20.268Z";

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
    var eventsData = JSON.parse(response.getContentText());
    results = syncEventsToCalendar_(eventsData);
  } else {
    Logger.log("Error fetching events: " + response.getResponseCode());
  }
  return results;
}

/**
 * Adds events to the user's Google Calendar.
 * @param {Array} eventsData The event data array to be added to the calendar.
 */
function syncEventsToCalendar_(eventsData) {
  const calendar = CalendarApp.getDefaultCalendar();
  const eventsCount = eventsData.length;

  let eventCounter = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;

  eventsData.forEach(function (event) {
    // skip events with no title or start/end dates
    if (!event.id || !event.title || !event.start || !event.end) {
      return;
    }

    try {
      // prepare new event attributes
      const title = event.title;
      const startTime = new Date(event.start);
      const endSearchTime = new Date(
        startTime.getTime() + 14 * 24 * 60 * 60 * 1000
      ); // 14 days

      const endTime = new Date(event.end);
      const url = event.vcUrl ? event.vcUrl : "";
      const desc = `${event.description || ""}${
        event.description !== "" ? " " + url : url
      }`;

      // search for existing events within same timeframe
      const events = calendar.getEvents(startTime, endSearchTime);
      let existingEvent = null;

      // Loop through found events to check for a matching 'msEventId'
      events.forEach(function (evt) {
        if (evt.getTag("msEventId") === event.id) {
          existingEvent = evt;
        }
      });

      if (existingEvent) {
        // If the event exists, extract its details
        const existingEventTitle = existingEvent.getTitle();
        const existingEventDesc = existingEvent.getDescription();

        // update existing event details only when they differ
        if (existingEventTitle !== title) {
          existingEvent.setTitle(title);
        }

        if (existingEventDesc !== desc) {
          existingEvent.setDescription(desc);
        }

        Logger.log(
          `Updated event: ${event.id} - ${++eventCounter} out of ${eventsCount}`
        );
        ++updated;
      } else {
        Utilities.sleep(1000); // pause for a while before creating new events

        const newEvent = calendar.createEvent(title, startTime, endTime, {
          description: desc,
        });
        newEvent.setTag("msEventId", event.id);

        Logger.log(
          `Created event: ${event.id} - ${++eventCounter} out of ${eventsCount}`
        );
        ++created;
      }
    } catch (e) {
      Logger.log(
        `Error adding event: ${e.toString()} - ${++eventCounter} out of ${eventsCount}. ${JSON.stringify(
          event
        )}`
      );
      ++skipped;
    }
  });

  return { eventsCount, created, updated, skipped };
}

/**
 * Runs the html service to display the UI
 */
function doGet(request) {
  return HtmlService.createTemplateFromFile("Page").evaluate();
}

/**
 * Extracts Bearer Token and 2 calendar IDs from form.
 * Start synchronisation process with extracted data.
 */
function startSync(formObject) {
  // extract form data
  var bearerToken = formObject["bearer-token"].trim();
  var commonCalendarId = formObject["common-calendar-id"].trim();
  var oneOnOneCalendarId = formObject["one-on-one-calendar-id"].trim();

  // initiate synchronisation with the authentication data and payload
  return fetchAndSyncEvents_(bearerToken, [
    commonCalendarId,
    oneOnOneCalendarId,
  ]);
}

/**
 * Include html snippets (script and stylesheet) to Index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
