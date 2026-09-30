const { test, expect } = require('@playwright/test');

// -------------------- Mock events Data -----------------------
const mockEvents = [
  {
    id: 1001,
    title: 'Hyderabad Cloud Engineering Conference',
    description:
      'A two-day conference for cloud engineers, platform teams, DevOps practitioners, and technology leaders.',
    category: 'Conference',
    venue: 'HITEC Convention Centre',
    city: 'Hyderabad',
    eventDate: '2026-11-15T09:00:00.000Z',
    price: '1800',
    totalSeats: 600,
    availableSeats: 154,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    isStatic: true,
    userId: null,
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },
  {
    id: 1002,
    title: 'Delhi Heritage Festival',
    description:
      'A cultural festival with food, crafts, folk music, dance performances, and heritage walks.',
    category: 'Festival',
    venue: 'India Gate Lawns',
    city: 'Delhi',
    eventDate: '2026-12-05T16:00:00.000Z',
    price: '450',
    totalSeats: 4000,
    availableSeats: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800',
    isStatic: true,
    userId: null,
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },
  {
    id: 1003,
    title: 'Mumbai Harbour Music Concert',
    description: 'An evening of live music featuring popular artists, coastal food stalls, and a waterfront stage.',
    category: 'Concert',
    venue: 'Jio World Garden',
    city: 'Mumbai',
    eventDate: '2026-10-28T18:30:00.000Z',
    price: '2200',
    totalSeats: 2500,
    availableSeats: 730,
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    isStatic: true,
    userId: null,
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },
  {
    id: 1004,
    title: 'Bangalore Data Visualization Workshop',
    description: 'A hands-on workshop on storytelling with data, dashboard design, and practical visualization techniques.',
    category: 'Workshop',
    venue: 'Indiranagar Innovation Hub',
    city: 'Bangalore',
    eventDate: '2026-11-22T10:00:00.000Z',
    price: '950',
    totalSeats: 80,
    availableSeats: 28,
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
    isStatic: true,
    userId: null,
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },
];

// ---------- Data ----------
const BASE_URL = "https://eventhub.rahulshettyacademy.com";
const EMAIL = "*********@gmail.com";
const PASSWORD = "*****@12";

// ---------------------- Price Format Function --------------------
// "1800" -> "$1,800" (same format the UI shows)
function formatPrice(price) {
  return '$' + Number(price).toLocaleString('en-US');
}

// ---------------------- Login Function --------------------
async function login(page) {
  await page.goto(BASE_URL + "/login");
  await page.getByPlaceholder("you@email.com").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Browse Events →")).toBeVisible();
}


// ----------------------- Mock API helper function -----------------
async function installEventApiMocks(page) {
  // Detail endpoint:
  // GET /api/events/1001
  await page.route('**/api/events/*', async (route) => {
    const url = new URL(route.request().url());
    const eventId = Number(url.pathname.split('/').pop());

    const event = mockEvents.find((item) => item.id === eventId);

    if (!event) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: `Mock event ${eventId} was not found`,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: event,
      }),
    });
  });

  // Catalog endpoint:
  // GET /api/events?page=1&limit=12
  // GET /api/events?search=hyderabad&category=Conference&city=Hyderabad&page=1&limit=12
  await page.route('**/api/events?**', async (route) => {
    const url = new URL(route.request().url());

    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const category = (url.searchParams.get('category') || '').trim();
    const city = (url.searchParams.get('city') || '').trim();

    const filteredEvents = mockEvents.filter((event) => {
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        event.venue.toLowerCase().includes(search) ||
        event.city.toLowerCase().includes(search);
      const matchesCategory = !category || event.category === category;
      const matchesCity = !city || event.city === city;

      return matchesSearch && matchesCategory && matchesCity;
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: filteredEvents,
        pagination: {
          total: filteredEvents.length,
          page: Number(url.searchParams.get('page') || 1),
          limit: Number(url.searchParams.get('limit') || 12),
          totalPages: 1,
        },
      }),
    });
  });
}


// ------------------- Test --------------------
test('mock Events catalog, filters, event detail, and ticket totals', async ({
  page,
}) => {
  // Login
  await login(page);

  // intercepting API calls before navigating to Events.
  await installEventApiMocks(page);

  // Open Events. The page will now receive mock data.
  await page.getByRole('link', { name: 'Events', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Upcoming Events', exact: true }),).toBeVisible();

  // Confirm only four mocked events are present.
  const cardTitles = page.locator('#event-card').locator('a h3');
  await expect(cardTitles).toHaveCount(4);

  // Confirm a known live event is absent.
  await expect(page.getByText('World Tech Summit', { exact: true }),).not.toBeVisible();

  // Confirm every mock title is displayed each title link goes to the correct mocked event id.
  // Also confirm each card shows the mock price, seats, and Book Now link.
  for (const event of mockEvents) {
  const titleLink = page.getByRole('link', {name: event.title,exact: true,});
  await expect(titleLink).toBeVisible();
  await expect(titleLink).toHaveAttribute('href',new RegExp(`/events/${event.id}$`));

  const card = page.locator('#event-card').filter({ hasText: event.title });
  await expect(card).toContainText(formatPrice(event.price));
  await expect(card).toContainText(`${event.availableSeats} seats available`);
  await expect(card.getByRole('link', { name: 'Book Now' })).toHaveAttribute('href', `/events/${event.id}`);
}

  // Select the Hyderabad Conference mock event.
  const expectedEvent = mockEvents.find((event) =>
      event.category === 'Conference' &&
      event.city === 'Hyderabad',
  );

  //  Apply the three filters.
  await page.getByPlaceholder(/search events, venues/i).fill('Hyderabad Cloud');
  await page.locator('select').nth(0).selectOption('Conference');
  await page.locator('select').nth(1).selectOption('Hyderabad');

  // Confirm exactly one event title/card remains after filtering.
  await expect(cardTitles).toHaveCount(1);

  // Confirm the one remaining card is the expected mock event.
  const filteredTitleLink = page.getByRole('link', {name: expectedEvent.title,exact: true,});
  await expect(filteredTitleLink).toBeVisible();

  // Store this event for detail-page checks.
  const storedMockRecord = expectedEvent;

  // Navigate to the event detail page.
  const bookNowLink = page.getByRole('link', {name: 'Book Now',exact: true});
  await expect(bookNowLink).toHaveAttribute('href',`/events/${storedMockRecord.id}`,);
  await bookNowLink.click();

  // Confirm the correct detail URL.
  await expect(page).toHaveURL(new RegExp(`/events/${storedMockRecord.id}$`),);

  // Confirm detail page values match the stored mock record.
  await expect(page.getByRole('heading', {name: storedMockRecord.title,exact: true,}),).toBeVisible();
  await expect(page.getByText(formatPrice(storedMockRecord.price),{ exact: true }).last()).toBeVisible();
  await expect(page.getByText(storedMockRecord.venue, { exact: true })).toBeVisible();
  await expect(page.getByText(storedMockRecord.city, { exact: true })).toBeVisible();
  await expect(page.getByText(`${storedMockRecord.availableSeats} / ${storedMockRecord.totalSeats} seats`,{ exact: true })).toBeVisible();

  // Verify ticket quantity starts with 1.
  const ticketCount = page.locator('#ticket-count');
  await expect(ticketCount).toHaveText('1');

  // Confirm one ticket total equals the mock event price.
  const oneTicketTotal = formatPrice(storedMockRecord.price);
  await expect(page.getByText(oneTicketTotal, { exact: true }).last(),).toBeVisible();

  //  Click + and confirm quantity becomes 2.
  await page.getByRole('button', { name: '+' }).click();
  await expect(ticketCount).toHaveText('2');

  // Confirm total equals mock price × 2.
  const twoTicketTotal = formatPrice(Number(storedMockRecord.price) * 2);
  await expect(page.getByText(twoTicketTotal, { exact: true }).last(),).toBeVisible();
});