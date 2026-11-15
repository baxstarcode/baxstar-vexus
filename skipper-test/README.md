# Skipper visual house selection

The preview keeps Skipper's desktop fan anchored at the bottom right and the mobile fan centered at the bottom. Houses now have real photos and a Quick View before date selection. The homepage beneath Skipper presents the year-round business and links to the existing service and house pages.

## Current status — November 15, 2026

Implemented in `index.html` on `codex/skipper-house-quick-view`. This is an unindexed design preview, not a Wix homepage publication. The production boat page, Pricing Engine, FareHarbor configuration and existing knowledge updater are unchanged.

- Four overnight choices, as Brady requested: The Lodge (593973), The Range Runner (422226), The Hearth (681248), and 17′ Luxury RV Edition (681247). The two 24-foot choices are omitted from this customer UI; no inventory was deleted.
- Wooden and aluminum day houses also have photo previews. The wooden house uses its verified interior photograph; no exterior or AI-generated house details are invented.
- Quick View has the title above the carousel, a short description, verified feature chips, “Book this house,” and “Check out full description.” Booking advances to dates; it does not create a reservation.
- A selected house can be reopened during date selection without losing the plan. Full description links open in a new tab.
- Desktop chat sits inside the fan above a horizontal row of previous selections, following Brady's concept. Chat answers remain disconnected and are labeled as a preview. Mobile retains its top selection line.
- House photos have more space between them. CDN-sized images avoid loading full-resolution originals for thumbnails.
- Existing pricing functions, feed handling, desktop date wheel, mobile date rail and product flow are preserved. Group choices remain 1–2, 3, 4, 5; larger-group workflow remains a separate existing requirement.

## FareHarbor checkout: PROVISIONAL, not finished

Brady requires the last click to open the final booking form for the selected product, date **and time**. The current prototype has no live availability feed and no time-selection step. Its existing calendar URL carries only an item and month. The final circle therefore says “See live times,” not “Book it.” It must not be represented as an exact-date checkout connection.

Verified against FareHarbor's public documentation and a read-only live form:

`https://fareharbor.com/embeds/book/{company}/items/{item_id}/availability/{availability_id}/book/`

An availability ID identifies the real date and time. A live availability integration must supply it, present the offered times, clear the selection when the item/date changes, and open that exact URL. Do not infer IDs from timestamps, hardcode a sample ID, or treat the pricing feed as availability. No availability backend or credentials were added in this UI change.

Read-only check: The Lodge availability 2106632573 displayed January 8, 2027 at 1:00 PM in its booking form. This is evidence of the URL format, **not a production mapping**. A December 2026 calendar link automatically displayed January 2027 because no December availability was offered, demonstrating why month links do not meet Brady's requirement. No quantities, customer information or payments were submitted.

Official references:

- [FareHarbor booking integration guidance](https://developer.fareharbor.com/api/external/v1/guides-and-faqs)
- [Advanced Lightframe usage](https://pages.fareharbor.com/website/integrations/lightframe/lightframe-api/)

## Year-round homepage and search handoff

The preview's native HTML includes the year-round introduction, four equal service blocks, four house links, and links to date night, fish house services, consultations and day-house details. Skipper supplements those pages; customers can reach details without entering Skipper or FareHarbor.

Prepared production metadata:

- Title: **Detroit Lakes Fishing, Pontoons & Ice Houses | Baxstar**
- Description: **Plan your Detroit Lakes getaway with Baxstar: guided fishing trips, pontoon rentals, guided ice fishing and overnight Ice Castle or day house rentals.**
- H1: **Good days on the water. All year long.**
- Intro: **Guided fishing trips, pontoon rentals and ice house rentals in Detroit Lakes. Pick your kind of lake day. We’ll help with the rest.**

Keep the homepage year-round. Seasonal promotions can change below this introduction without replacing the year-round title, service navigation or internal links. Pontoons link to Baxstar Outdoors and retain that brand's identity. Keep `/icefishing` as the winter overview, `/ice-castle-rentals` as the comparison page, and each current house URL as its full description. Keep the rented-out Luxury house listed; lack of dates is not a retirement or redirect instruction. House size belongs in headings and descriptions; model names alone are not the search strategy.

When applying this to Wix, place the essential service text and internal links in the indexable page body and set the actual page metadata. This test URL intentionally remains `noindex, nofollow`; publishing this preview alone does not fix the Wix homepage's SEO. Preserve established URLs and do not invent review counts, availability, prices, sleep capacities or structured-data claims. Structured data must describe the visible content. No special AI file or schema is needed; [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features) emphasizes accessible content and the existing search fundamentals.

## House content sources

The titles use Brady's current FareHarbor screenshot and explicit four-house selection. Photographs, size and non-price feature summaries come from the corresponding public house pages. The Hearth mapping to the 17′ Hybrid is supported by Brady's supplied FareHarbor screenshot. The Luxury page has inconsistent hole counts; no hole count or sleep capacity is published in its Quick View.

| House | Full description and photo source |
| --- | --- |
| The Lodge | https://www.baxstarfishing.com/21-ice-castle-rental |
| The Range Runner | https://www.baxstarfishing.com/ice-castle-range-runner |
| The Hearth | https://www.baxstarfishing.com/17-hybrid-ii-ice-castle-detroit-lakes |
| 17′ Luxury RV Edition | https://www.baxstarfishing.com/17-ice-castle-luxury-rv-edition-rental |
| Wooden and aluminum day houses | https://www.baxstarfishing.com/icefishing/ice-house-rentals |

## Verification

- JavaScript parses; repository Baxstar Lint passes locally with zero failures or warnings.
- Price/feed and date-wheel/date-rail function blocks match the baseline byte for byte.
- All 24 unique public house-page and gallery-image URLs returned HTTP 200.
- Exact four overnight IDs and single-person group increments checked from configuration.
- Desktop and 390 × 844 browser-frame checks cover house selection, carousel, description URL and continuation to dates. Physical iPhone behavior, production Wix embedding, live availability selection and complete checkout remain **PROVISIONAL**.

Serve the repository root locally and open `/skipper-test/`. No build step or package installation is required.
