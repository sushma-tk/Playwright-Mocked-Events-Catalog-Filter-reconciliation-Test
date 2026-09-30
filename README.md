# EventHub Mock API Playwright Test

A Playwright test that replaces the live EventHub events data with mock data, so the checks stay stable even if the backend changes.

- Application URL: https://eventhub.rahulshettyacademy.com
- Test framework: Playwright
- Language: JavaScript


## What the Test Does

The test follows this user flow:

1. Opens the EventHub login page.
2. Logs in with valid EventHub credentials.
3. Installs Playwright API interception before opening the Events page.
4. Opens the Events page.
5. Replaces the live event catalog with four controlled mock events.
6. Confirms the **Upcoming Events** heading is visible.
7. Confirms exactly four mocked event cards/titles are displayed.
8. Confirms all mocked event titles are visible.
9. Confirms the live backend title **World Tech Summit** is not visible.
10. Confirms every event card displays the correct mocked:
   - Title
   - Price
   - Available seats
   - Title link URL
   - Book Now link URL
11. Filters the catalog using:
   - Search keyword: `Hyderabad Cloud`
   - Category: `Conference`
   - City: `Hyderabad`
12. Confirms exactly one event remains after filtering.
13. Stores the matching Hyderabad Conference mock record.
14. Clicks **Book Now** from the filtered event.
15. Confirms the event detail page URL contains the matching mocked event ID.
16. Confirms the event detail page displays the correct mocked:
   - Title
   - Price
   - Venue
   - City
   - Available seats
17. Confirms ticket quantity starts at `1`.
18. Confirms total equals the mocked price for one ticket.
19. Increases the ticket quantity to `2`.
20. Confirms total becomes mocked price × `2`.


## APIs Mocked

| Request | Purpose |
|---|---|
| `GET /api/events?page=1&limit=12` | Events list |
| `GET /api/events?search=...&category=...&city=...` | Filtered events list |
| `GET /api/events/:id` | Event detail |


## Run the Test

Run the test:

```bash
npx playwright test 
```


## Key Concepts Used

- `page.route()` to intercept API calls
- `route.fulfill()` to return mock JSON responses
- Filtering mock data using URL query parameters
- Web-first assertions using `expect()` with no hard-coded waits