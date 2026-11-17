# Skipper visual house selection

The preview keeps Skipper's desktop fan anchored at the bottom right and the mobile fan centered at the bottom. Houses now have real photos and a Quick View before date selection. The homepage beneath Skipper presents the year-round business and links to the existing service and house pages.

## Current status — November 17, 2026

The Blue Diamond rename from Handoff #749 updates the house label, Quick View title, home card and photo alt text. No inventory, pricing, calendar logic or checkout behavior changed. The photo feature remains on this review branch; the rename does not merge the larger preview into main.

Implemented in `index.html` on `codex/skipper-house-quick-view`. This is an unindexed design preview, not a Wix homepage publication. The production boat page, Pricing Engine, FareHarbor configuration and existing knowledge updater are unchanged.

- Four overnight choices, as Brady requested: The Lodge (593973), The Range Runner (422226), The Hearth (681248), and Blue Diamond (681247). The two 24-foot choices are omitted from this customer UI; no inventory was deleted.
- Wooden and aluminum day houses also have photo previews. The wooden house uses its verified interior photograph; no exterior or AI-generated house details are invented.
- Quick View has the title above the carousel, a short description, verified feature chips, “Book this house,” and “Check out full description.” Booking advances to dates; it does not create a reservation.
- A selected house can be reopened during date selection without losing the plan. Full description links open in a new tab.
- Desktop chat sits inside the fan above a horizontal row of previous selections, following Brady's concept. Chat answers remain disconnected and are labeled as a preview. Mobile retains its top selection line.
- House photos have more space between them. CDN-sized images avoid loading full-resolution originals for thumbnails.
- Existing pricing functions, feed handling, desktop date wheel and mobile date rail are preserved. A time-selection step is enabled only when the availability bridge is configured. Group choices remain 1–2, 3, 4, 5; larger-group workflow remains a separate existing requirement.

## FareHarbor checkout: UI implemented; live connection PROVISIONAL

Brady requires the last click to open the final booking form for the selected product, date **and time**. The frontend now supports live time choices and the exact availability route:

`https://fareharbor.com/embeds/book/{company}/items/{item_id}/availability/{availability_id}/book/`

The final “Book it” click fetches availability again and opens that form only when the selected ID and start time still match the selected plan. Changed item/date/duration/group clears the previous time. Failed refreshes and removed/sold-out times return to time selection. Central time is used for day matching and labels; no ID is inferred from a timestamp. A pricing feed cannot unlock checkout.

**Still required:** connect `CFG.availabilityUrl` to an approved server-side FareHarbor availability bridge. It is intentionally blank in the shipped preview. Without that connection the existing flow stays labeled “See live times” and opens the calendar; it does not pretend to preserve an exact date/time. No backend, API keys or live FareHarbor writes were added. The account's AI connection remains with Claude.

### Availability bridge contract

The frontend makes an uncached GET with `itemId`, `date` (`YYYY-MM-DD`, America/Chicago), and, for open-water trips, `hours` and `guests`. The approved bridge must validate the requested product, retrieve current online-bookable FareHarbor availability and resolve the requested duration/group. Return only the minimal public availability data below; credentials and customer booking records stay server-side.

```json
{
  "itemId": "593973",
  "date": "2027-01-08",
  "hours": null,
  "guests": null,
  "availabilities": [
    { "id": "ACTUAL_FAREHARBOR_ID", "startAt": "2027-01-08T13:00:00-06:00", "bookable": true }
  ]
}
```

Use actual numeric IDs, offset-qualified start times, exact echoed query fields and an empty array when there are no openings. Do not echo a requested duration/group without validating it against FareHarbor. Return an error if the combination cannot be resolved. The frontend rejects mismatched responses, invalid or past starts, unbookable entries and dates that differ after Central-time conversion. Responses are held in memory, not persisted; final checkout always refreshes. The booking form remains authoritative for quantities, duration/customer-type selections and final charges. Automatic preselection of those checkout fields is not implemented or verified.

A local mock verifies the UI contract; it is not a live availability source. In the desktop browser test, selecting 1:00 PM and clicking “Book it” opened the real FareHarbor form for The Lodge on Friday, January 8, 2027 at 1:00 PM. No booking fields were entered. The phone time screen rendered, but the browser automation could not activate its button reliably; phone time interaction remains PROVISIONAL. `node --test skipper-test/booking.test.cjs` covers exact routing, selection changes, Central/DST dates, request races, timeout, sold-out refresh and failed refresh. No test submits a booking.

Read-only live evidence: The Lodge availability 2106632573 displayed January 8, 2027 at 1:00 PM. This sample verifies the URL format, **not a production mapping**. A December 2026 calendar URL automatically displayed January 2027 because no December availability was offered; month links do not meet the exact-date requirement.

Official references:

- [FareHarbor booking integration guidance](https://developer.fareharbor.com/api/external/v1/guides-and-faqs)
- [FareHarbor availability API](https://developer.fareharbor.com/api/external/v1/home)
- [Advanced Lightframe usage](https://pages.fareharbor.com/website/integrations/lightframe/lightframe-api/)

## Year-round homepage and search handoff

The preview's native HTML includes the year-round introduction, four equal service blocks, four house links, and links to date night, fish house services, consultations and day-house details. Skipper supplements those pages; customers can reach details without entering Skipper or FareHarbor.

Prepared production metadata:

- Title: **Detroit Lakes Fishing, Pontoons & Ice Houses | Baxstar**
- Description: **Plan your Detroit Lakes getaway with Baxstar: guided fishing trips, pontoon rentals, guided ice fishing and overnight Ice Castle or day house rentals.**
- H1: **Good days on the water. All year long.**
- Intro: **Guided fishing trips, pontoon rentals and ice house rentals in Detroit Lakes. Pick your kind of lake day. We’ll help with the rest.**

Keep the homepage year-round. Seasonal promotions can change below this introduction without replacing the year-round title, service navigation or internal links. Pontoons link to Baxstar Outdoors and retain that brand's identity. Keep `/icefishing` as the winter overview, `/ice-castle-rentals` as the comparison page, and each current house URL as its full description. Blue Diamond (681247) is open for 2026–27 per owner ruling #725, with 78 availabilities recorded for December 18, 2026 through March 7, 2027. It is not rented out; the live FareHarbor calendar remains authoritative for bookability. Per #747–#749, its customer label is exactly “Blue Diamond” with no size; size may remain in descriptive specifications. Keep its existing page URL.

When applying this to Wix, place the essential service text and internal links in the indexable page body and set the actual page metadata. This test URL intentionally remains `noindex, nofollow`; publishing this preview alone does not fix the Wix homepage's SEO. Preserve established URLs and do not invent review counts, availability, prices, sleep capacities or structured-data claims. Structured data must describe the visible content. No special AI file or schema is needed; [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features) emphasizes accessible content and the existing search fundamentals.

## House content sources

The titles use Brady's current FareHarbor screenshot and explicit four-house selection. Photographs, size and non-price feature summaries come from the corresponding public house pages. The Hearth mapping to the 17′ Hybrid is supported by Brady's supplied FareHarbor screenshot. Blue Diamond has 8 fishing holes per the November 15 owner ruling; no hole count or sleep capacity is published in its Quick View.

| House | Full description and photo source |
| --- | --- |
| The Lodge | https://www.baxstarfishing.com/21-ice-castle-rental |
| The Range Runner | https://www.baxstarfishing.com/ice-castle-range-runner |
| The Hearth | https://www.baxstarfishing.com/17-hybrid-ii-ice-castle-detroit-lakes |
| Blue Diamond | https://www.baxstarfishing.com/17-ice-castle-luxury-rv-edition-rental |
| Wooden and aluminum day houses | https://www.baxstarfishing.com/icefishing/ice-house-rentals |

## Verification

- JavaScript parses; repository Baxstar Lint passes locally with zero failures or warnings. All 12 checkout contract tests pass.
- Price/feed and date-wheel/date-rail function blocks match the baseline byte for byte.
- All 24 unique public house-page and gallery-image URLs returned HTTP 200.
- Exact four overnight IDs and single-person group increments checked from configuration.
- Desktop and 390 × 844 browser-frame checks cover house selection, carousel, description URL and continuation to dates. Physical iPhone behavior, production Wix embedding, live availability selection and complete checkout remain **PROVISIONAL**.

Serve the repository root locally and open `/skipper-test/`. No build step or package installation is required.
