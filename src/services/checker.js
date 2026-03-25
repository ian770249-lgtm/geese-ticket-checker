import { chromium } from "playwright";

function parsePrice(text) {
  if (!text) return null;

  const cleaned = text.replace(/,/g, "");
  const match = cleaned.match(/£\s*(\d+(?:\.\d{1,2})?)/);

  return match ? Number(match[1]) : null;
}

export async function runCheck(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(5000);

    const bodyText = (await page.locator("body").innerText()).toLowerCase();

    const soldOutPhrases = [
      "sold out",
      "no tickets available",
      "there are currently no tickets available",
      "no tickets matched your search",
      "we couldn’t find the tickets you searched for",
    ];

    const definitelySoldOut = soldOutPhrases.some((phrase) =>
      bodyText.includes(phrase)
    );

    const offerSelectors = [
      '[data-testid="offer-card"]',
      '[data-testid*="offer"]',
      '[class*="offer-card"]',
      '[class*="OfferCard"]',
      '[class*="offer-item"]',
      '[class*="listing"]',
    ];

    let offerCount = 0;

    for (const selector of offerSelectors) {
      const count = await page.locator(selector).count().catch(() => 0);
      if (count > offerCount) offerCount = count;
    }

    const priceSelectors = [
      '[data-testid*="price"]',
      '[class*="price"]',
      'text=/£\\s*\\d+(?:\\.\\d{1,2})?/',
    ];

    let prices = [];

    for (const selector of priceSelectors) {
      try {
        const locator = page.locator(selector);
        const count = await locator.count();

        for (let i = 0; i < Math.min(count, 20); i++) {
          const text = await locator.nth(i).innerText().catch(() => null);
          const price = parsePrice(text);
          if (price != null && price >= 10) {
            prices.push(price);
          }
        }
      } catch {
        // ignore and continue
      }
    }

    prices = [...new Set(prices)].sort((a, b) => a - b);
    const cheapestPrice = prices.length ? prices[0] : null;

    const available = !definitelySoldOut && (offerCount > 0 || cheapestPrice != null);

    return {
      available,
      count: offerCount,
      price: cheapestPrice,
    };
  } catch (err) {
    console.error("Checker error:", err.message);

    return {
      available: false,
      count: 0,
      price: null,
    };
  } finally {
    await browser.close();
  }
}