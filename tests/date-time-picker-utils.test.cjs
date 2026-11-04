const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");

const utils = createJiti(__filename, { fsCache: false })(
  "../registry/new-york/date-time-picker-utils.ts"
);

test("parseTimeValue accepts HH:mm and HH:mm:ss and rejects everything else", () => {
  assert.deepEqual(utils.parseTimeValue("09:05"), {
    hours: 9,
    minutes: 5,
    seconds: 0,
  });
  assert.deepEqual(utils.parseTimeValue("23:59:58"), {
    hours: 23,
    minutes: 59,
    seconds: 58,
  });
  for (const invalid of ["", "9:05", "24:00", "12:60", "12:00:60", "12:00:1"]) {
    assert.equal(utils.parseTimeValue(invalid), undefined, invalid);
  }
});

test("formatTimeValue follows precision", () => {
  const date = new Date(2026, 2, 5, 7, 8, 9, 10);
  assert.equal(utils.formatTimeValue(date, "minute"), "07:08");
  assert.equal(utils.formatTimeValue(date, "second"), "07:08:09");
});

test("normalizeDateTime drops milliseconds, and seconds for minute precision", () => {
  const date = new Date(2026, 2, 5, 7, 8, 9, 10);
  assert.equal(
    utils.normalizeDateTime(date, "minute").getTime(),
    new Date(2026, 2, 5, 7, 8, 0, 0).getTime()
  );
  assert.equal(
    utils.normalizeDateTime(date, "second").getTime(),
    new Date(2026, 2, 5, 7, 8, 9, 0).getTime()
  );
  assert.equal(date.getMilliseconds(), 10, "input is not mutated");
});

test("mergeDateAndTime keeps the calendar day and applies the local time", () => {
  const merged = utils.mergeDateAndTime(
    new Date(2026, 11, 31, 18, 45, 30, 500),
    { hours: 1, minutes: 2, seconds: 3 },
    "second"
  );
  assert.equal(merged.getTime(), new Date(2026, 11, 31, 1, 2, 3, 0).getTime());
  const minute = utils.mergeDateAndTime(
    new Date(2026, 0, 1),
    { hours: 1, minutes: 2, seconds: 3 },
    "minute"
  );
  assert.equal(minute.getSeconds(), 0);
});

test("isDateTimeRangeValid needs both ends and from not after to, same day included", () => {
  const morning = new Date(2026, 2, 5, 9, 0);
  const noon = new Date(2026, 2, 5, 12, 0);
  assert.equal(utils.isDateTimeRangeValid(morning, noon), true);
  assert.equal(utils.isDateTimeRangeValid(morning, morning), true);
  assert.equal(utils.isDateTimeRangeValid(noon, morning), false);
  assert.equal(utils.isDateTimeRangeValid(morning), false);
  assert.equal(utils.isDateTimeRangeValid(undefined, noon), false);
});
