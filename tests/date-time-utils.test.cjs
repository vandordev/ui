const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, { fsCache: false });
const { formatDate, toDate } = jiti("../registry/new-york/date-time-utils.ts");

test("DateTime parser rejects date-only, local, normalized and invalid offset inputs", () => {
  for (const value of [
    "2026-02-30T08:00:00Z",
    "2026-10-24",
    "2026-10-24T08:00:00",
    "2026-10-24T08:00:00+24:00",
    "2026-10-24T08:60:00Z",
    "1900-02-29T08:00:00Z",
    "2026-00-01T08:00:00Z",
    "2026-13-01T08:00:00Z",
    "2026-10-00T08:00:00Z",
    "2026-10-24T24:00:00Z",
    "2026-10-24T08:00:60Z",
    "2026-10-24T08:00:00+07:60",
    "2026-10-24T08:00:00Z trailing",
  ]) {
    assert.equal(toDate(value), null, `Reject ${value}`);
  }
  assert.equal(
    toDate("2024-02-29T23:59:59.999999Z").toISOString(),
    "2024-02-29T23:59:59.999Z"
  );
  assert.equal(
    toDate("2026-10-24T08:00:00+07:00").toISOString(),
    "2026-10-24T01:00:00.000Z"
  );
  assert.equal(toDate("0001-01-01T00:00:00Z").getUTCFullYear(), 1);
  assert.equal(toDate("0000-01-01T00:00:00Z").getUTCFullYear(), 0);
});

test("DateTime accepts epoch milliseconds and copies valid Date values", () => {
  assert.equal(toDate(0).getTime(), 0);
  assert.equal(toDate(Infinity), null);
  assert.equal(toDate(Number.NaN), null);
  assert.equal(toDate(Number.MAX_VALUE), null);
  assert.equal(toDate(new Date(Number.NaN)), null);
  assert.equal(toDate(), null);
  assert.equal(toDate(""), null);
  const input = new Date(1234);
  const output = toDate(input);
  assert.equal(output.getTime(), input.getTime());
  assert.ok(output !== input, "Date input is copied");
});

test("DateTime does not silently discard an explicitly invalid empty timezone", () => {
  assert.throws(() => formatDate(0, { timeZone: "" }), RangeError);
  assert.throws(() => formatDate(0, { format: { timeZone: "" } }), RangeError);
  assert.throws(
    () => formatDate(0, { format: { timeZone: "UTC" }, timeZone: "" }),
    RangeError
  );
});

test("DateTime formats fallback, explicit options and timezone precedence", () => {
  assert.equal(formatDate(null), "—");
  assert.equal(formatDate(null, { fallback: "Unknown" }), "Unknown");
  assert.throws(() => formatDate(0, { timeZone: "Not/AZone" }), RangeError);
  const instant = "2026-10-24T08:00:00Z";
  const expected = new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(toDate(instant));
  assert.equal(
    formatDate(instant, {
      format: { dateStyle: "short", timeZone: "UTC" },
      timeZone: "Asia/Tokyo",
    }),
    expected
  );
});

test("DateTime default includes the calendar date and two-digit 24-hour time", () => {
  const instant = "2026-10-24T08:03:00Z";
  const expected = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(toDate(instant));
  assert.equal(formatDate(instant, { timeZone: "UTC" }), expected);
});
