/* Run: node --test skipper-test/booking.test.cjs. No network or bookings. */
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const html = readFileSync(resolve(__dirname, 'index.html'), 'utf8');
const helpers = html.split('/* ---------- exact checkout helpers (also exercised by booking.test.cjs) ---------- */')[1].split('/* ---------- end exact checkout helpers ---------- */')[0];
const integration = 'var availabilitySerial' + html.split('var availabilitySerial')[1].split('/* ---------- layout ---------- */')[0];
const now = Date.parse('2027-01-01T12:00:00Z');
const q = { itemId: '593973', date: '2027-01-08', hours: null, guests: null };
const available = { id: '2106632573', startAt: '2027-01-08T13:00:00-06:00', bookable: true };
const response = (rows = [available], query = q) => ({ ...query, availabilities: rows });
function context(fetcher = async () => ({ ok: true, json: async () => response() })) {
  class Clock extends Date { static now() { return now; } }
  const c = vm.createContext({ Date: Clock, Intl, URL, AbortController, setTimeout, clearTimeout, Promise,
    location: { href: 'https://preview.example/skipper-test/' }, fetch: fetcher,
    CFG: { availabilityUrl: 'https://bridge.example/availability', availabilityTimeoutMs: 20, availabilityMaxAgeMs: 60000,
      fh: { base: 'https://fareharbor.com/embeds/book/', shortname: 'baxstarfishing', item: '309836', flow: '576827' } },
    S: { cat: 'ice', item: { id: q.itemId }, date: new Date(2027, 0, 8), step: 6, picks: Array(6).fill({}), slot: null, availabilityState: 'idle', availabilityAt: 0, availabilities: [], checkoutBusy: false },
    caption() {}, render() {}, flow: () => ['cat', 'item', 'house', 'month', 'day', 'time', 'sum'],
    pickOrb: (orb, g, a, promise) => Promise.resolve(promise), goStep() { throw new Error('Unexpected rewind'); },
    fhUrl: () => 'https://fareharbor.com/calendar-fallback/' });
  vm.runInContext(helpers + integration, c);
  return c;
}
function select(c) {
  c.S.availabilities = c.Booking.normalize(response(), q, now);
  c.S.slot = c.S.availabilities[0]; c.S.availabilityAt = now; c.S.availabilityState = 'ok';
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test('exact checkout contains the selected item and availability, never the calendar', () => {
  const c = context(); select(c);
  const url = new URL(c.checkoutUrl());
  assert.equal(url.pathname, '/embeds/book/baxstarfishing/items/593973/availability/2106632573/book/');
  assert.equal(url.searchParams.get('back'), c.location.href);
  assert.equal(c.S.slot.label, '1:00 PM');
});
test('response must match item, date, duration and group', () => {
  const c = context();
  for (const patch of [{ itemId: '422226' }, { date: '2027-01-09' }, { hours: 5 }, { guests: 3 }]) {
    assert.throws(() => c.Booking.normalize({ ...response(), ...patch }, q, now), /does not match/);
  }
});
test('invalid, unbookable, past and wrong-local-date rows cannot create checkout links', () => {
  const c = context();
  const rows = [
    { ...available, bookable: false }, { ...available, bookable: 'true' },
    { ...available, id: '../bad' }, { ...available, startAt: '2027-01-08T13:00:00' },
    { ...available, startAt: 'not-a-dateZ' }, { ...available, startAt: '2026-01-08T13:00:00-06:00' },
    { ...available, startAt: '2027-01-08T01:00:00Z' }
  ];
  assert.equal(c.Booking.normalize(response(rows), q, now).length, 0);
});
test('Central date conversion handles UTC midnight and daylight saving time', () => {
  const c = context();
  const summer = { ...q, date: '2027-07-08' };
  const slots = c.Booking.normalize(response([{ ...available, startAt: '2027-07-09T00:00:00Z' }], summer), summer, now);
  assert.equal(slots.length, 1); assert.equal(slots[0].label, '7:00 PM');
});
test('duplicate IDs are deduplicated and times are ordered', () => {
  const c = context();
  const slots = c.Booking.normalize(response([{ ...available, id: '222', startAt: '2027-01-08T16:00:00-06:00' }, available, available]), q, now);
  assert.equal(slots.length, 2); assert.equal(slots[0].id, available.id);
});
test('expired selection or changed plan cannot unlock the final URL', () => {
  const c = context(); select(c);
  c.S.availabilityAt = now - 60001; assert.equal(c.checkoutUrl(), null);
  c.S.availabilityAt = now; c.S.item.id = '422226'; assert.equal(c.checkoutUrl(), null);
  c.S.item.id = q.itemId; c.S.date = new Date(2027, 0, 9); assert.equal(c.checkoutUrl(), null);
});
test('live request sends only plan fields, omits credentials and skips cache', async () => {
  let captured; const c = context(async (url, options) => { captured = { url, options }; return { ok: true, json: async () => response() }; });
  assert.equal(await c.readAvailability(), true);
  const url = new URL(captured.url);
  assert.equal(url.searchParams.get('itemId'), q.itemId); assert.equal(url.searchParams.get('date'), q.date);
  assert.equal(captured.options.credentials, 'omit'); assert.equal(captured.options.cache, 'no-store');
  assert.equal(c.S.availabilityState, 'ok');
});
test('late response from the previous selection is discarded', async () => {
  let finish; const c = context(() => new Promise(resolve => { finish = resolve; }));
  const pending = c.readAvailability(); await tick(); c.clearAvailability(); c.S.date = new Date(2027, 0, 9);
  finish({ ok: true, json: async () => response() });
  assert.equal(await pending, false); assert.equal(c.S.availabilities.length, 0); assert.equal(c.S.slot, null);
});
test('final click refreshes availability before navigating to the exact form', async () => {
  let calls = 0; const c = context(async () => { calls++; return { ok: true, json: async () => response() }; }); select(c);
  c.openCheckout(null, null, null); await tick();
  assert.equal(calls, 1); assert.match(c.location.href, /\/availability\/2106632573\/book\//);
});
test('sold-out final click returns to times without navigating', async () => {
  const c = context(async () => ({ ok: true, json: async () => response([]) })); select(c);
  const original = c.location.href; c.openCheckout(null, null, null); await tick();
  assert.equal(c.location.href, original); assert.equal(c.S.step, 5); assert.equal(c.S.slot, null);
  assert.equal(c.S.availabilityState, 'empty');
});
test('failed refresh cannot reuse a previously selected ID', async () => {
  const c = context(async () => ({ ok: false })); select(c);
  const original = c.location.href; c.openCheckout(null, null, null); await tick();
  assert.equal(c.location.href, original); assert.equal(c.checkoutUrl(), null); assert.equal(c.S.slot, null);
});
test('unresponsive bridge times out rather than leaving checkout active', async () => {
  const c = context(() => new Promise(() => {})); select(c);
  await c.readAvailability(); assert.equal(c.S.availabilityState, 'error'); assert.equal(c.checkoutUrl(), null);
});
