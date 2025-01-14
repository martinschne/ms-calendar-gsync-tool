# MS Calendar GSync Tool

Is an web application based on Google Apps Script that is allowing students to synchronise Masterschool Calendar events with their private Google Calendar. It is targeted towards students of Masterschool.

If you need assistance, let me know.

### How to use it?

### Prerequisites

- Google Chrome
- Masterschool account
- Google Account
- Link to this web application (ask me for it)

#### Here are the steps for first time use:

1. Open <strong>Google Chrome</strong> browser.
2. Go to the <em>Masterschool's</em> page.
3. Open <strong>Chrome DevTools</strong>:

   - GNU/Linux, Windows: <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>I</kbd>
   - MacOS: <kbd>⌥ Option</kbd> + <kbd>⌘ Command</kbd> + <kbd>I</kbd>

4. In <strong>Chrome DevTools</strong> click on the <em>Network</em> tab in top bar.
5. On the Masterschool page click on the <em>Calendar</em> menu item from the side bar.
6. Observe the lower left section and look for <em>events-get</em>. Click on it to open its details.
7. From the lower right section select <em>Header</em> from the top bar.
8. Scroll down in the <em>Headers</em> section to find <em>Authorization:</em> entry.
9. Open any text editor on your computer.
10. Copy the long sequence of gibberish right under the <em>Bearer</em> string in next to the <em>Authorization:</em> entry and paste it in the text editor.

    - **_NOTE:_** You must not copy the <em>Bearer</em> string, only the long character sequence bellow it. Be careful when copying also for next step, ensure you have really copied the entire sequence.

11. In the same lower right section select <em>Payload</em> from the top bar right next to the <em>Headers</em> menu item. Copy the strings from calendarIds, without the quotes one by one and paste them into your text editor.

    - **_NOTE:_** It makes sense to separate your bearer token (first string you copied from <em>Headers</em>) from your calendar ids (sequences you copied in this steps). Separate bearer token from calendar ids by a new line in your text file. Also put your calendar ids each on its own line.

12. Save the file with your copied character sequences somewhere where you can later find it.
13. Login to your Google account on a separate tab in Google Chrome. (You can skip this step if you are already logged in, e.g. in browser)
14. Open the link that I shared with you.
15. When running for the first time you would need to allow this app to access your Google Calendar. That would maybe require you to log to your Google account with your credentials. I hope you trust me, but you can ask me for the source code or the demonstration of the functionality if not.
16. Now when you see the form on the web application, copy the first character sequence in your text editor carefully into first form field labeled as <em>Bearer token:</em>. Then select all the smaller character sequences (calendar ids, each on new line) in the text editor and paste them to the second form field with label <em>All Calendar IDs (each on new line):</em>.
17. Follow the instructions in the web application and check your Google Calendar after the procedure finished to see if events were succesfully synchronised.
18. Optional step: Bookmark the URL of this web application for easy access to repeating synchronisation in the future.

#### Repeating synchronisation

After you have done the previous steps and successfuly synchronised events to your Google Calendar I advise you to:

- Repeat synchronisation periodically to keep the events synchronised (minimally one time per week, ideally on Sunday)
- For repeating the synchronisation you don't have to do nothing else then open the link to this web application again and press the <em>Submit</em> button again. Bearer token and the calendar ids were saved during your first run. Just be careful not to accidentaly change them, otherwise you'd need to reenter them again.

### Troubleshooting

If an error message is shown to you after submitting the form, you can try the following strategies:

- Follow steps for the first run again and be extra careful when copying the sequences. (manual errors are tedious but happen frequently) Unfortunately it is out of my capabilities to automate this process, yet.
- If you are sure you entered correct sequences, you might just have exceeded the quotas for running the script that Google set for the users. Try another day and blame them, not me.

### Tip:

Chrome without Google: [Ungoogled Chromium](https://github.com/ungoogled-software/ungoogled-chromium)
