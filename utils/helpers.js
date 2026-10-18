const { expect } = require('@playwright/test');

// ---------- Credentials from .env ----------
const EMAIL = process.env.EVENTHUB_EMAIL;
const PASSWORD = process.env.EVENTHUB_PASSWORD;

// ---------------------- Price Format Function --------------------
// "1800" -> "$1,800" (same format the UI shows)
function formatPrice(price) {
  return '$' + Number(price).toLocaleString('en-US');
}

// ---------------------- Login Function --------------------
async function login(page) {
  await page.goto('/login');
  await page.getByPlaceholder('you@email.com').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Browse Events →')).toBeVisible();
}

module.exports = { formatPrice, login };