/**
 * Fetches events from Masterschool Calendar and adds them to Google Calendar.
 */
function fetchAndSyncEvents() {
  var url = "https://app.masterschool.com/api/ms-calendar-hub/get-events";
  var token = "";

  currentDate = new Date().toISOString();
  endDate = "2025-07-11T19:43:20.268Z";

  const payloadData = {
    calendarIds: [
      "97e1b934-35c6-4179-bb90-5a60c682147f", // curriculum calendar
      "e871ba70-15d2-4a8b-89f0-9c1ff26f129f", // recurring sessions calendar
    ],
    from: currentDate, // "2024-07-11T19:43:20.268Z",
    to: endDate,
  };

  // Create request headers
  var headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  // Set up the POST request options
  var options = {
    method: "POST",
    headers: headers,
    payload: JSON.stringify(payloadData),
    muteHttpExceptions: true, // Optional: suppress error responses
  };

  // Send the POST request to the API
  var response = UrlFetchApp.fetch(url, options);

  if (response.getResponseCode() == 201) {
    var eventsData = JSON.parse(response.getContentText());
    syncEventsToCalendar(eventsData);
  } else {
    Logger.log("Error fetching events: " + response.getResponseCode());
  }
}

/**
 * Adds events to the user's Google Calendar.
 * @param {Array} eventsData The event data array to be added to the calendar.
 */
function syncEventsToCalendar(eventsData) {
  var calendar = CalendarApp.getDefaultCalendar();
  var eventsCount = eventsData.length;

  var eventCounter = 0;
  eventsData.forEach(function (event) {
    // skip events with no title or start/end dates
    if (!event.id || !event.title || !event.start || !event.end) {
      return;
    }

    Logger.log("Synchronising...");

    try {
      // prepare new event attributes
      var title = event.title;
      var startTime = new Date(event.start);
      var endTime = new Date(event.end);
      var url = event.vcUrl ? event.vcUrl : "";
      var desc = `${event.description || ""}${
        event.description !== "" ? " " + url : url
      }`;

      // search for existing events with this id:
      var searchStart = new Date();
      var searchEnd = new Date(endDate);
      var events = calendar.getEvents(searchStart, searchEnd, {
        max: 1,
        search: event.id,
      });

      if (events.length > 0) {
        // If the event exists, update it
        var existingEvent = events[0];
        existingEvent
          .setTitle(title)
          .setDescription(desc) // Update description if necessary
          .setStartTime(startTime)
          .setEndTime(endTime);

        existingEvent.setTag("msEventId", event.id);
        Logger.log(
          `Updated event: ${event.id} - ${++eventCounter} out of ${eventsCount}`
        );
      } else {
        // otherwise create a new event
        var newEvent = calendar.createEvent(title, startTime, endTime, {
          description: desc,
        });

        newEvent.setTag("msEventId", event.id);
        Logger.log(
          `Created event: ${event.id} - ${++eventCounter} out of ${eventsCount}`
        );
      }
    } catch (e) {
      Logger.log(
        `Error adding event: ${e.toString()} - ${++eventCounter} out of ${eventsCount}`
      );
    }
  });
}

/**
 * Runs the html service to display the UI
 */
function doGet(request) {
  return HtmlService.createTemplateFromFile("Page").evaluate();
}

/**
 * Include html snippets (script and stylesheet) to Index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
