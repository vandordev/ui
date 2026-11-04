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

test("defaultTimeValue gives start and end of day at each precision", () => {
  assert.equal(utils.defaultTimeValue("start", "minute"), "00:00");
  assert.equal(utils.defaultTimeValue("end", "minute"), "23:59");
  assert.equal(utils.defaultTimeValue("start", "second"), "00:00:00");
  assert.equal(utils.defaultTimeValue("end", "second"), "23:59:59");
});

test("resolveDateTimeRangeDraft treats one clicked day as a same-day range", () => {
  const day = new Date(2026, 2, 5);
  const same = utils.resolveDateTimeRangeDraft(
    { from: day },
    "09:00",
    "17:30",
    "minute"
  );
  assert.equal(same.start.getTime(), new Date(2026, 2, 5, 9, 0).getTime());
  assert.equal(same.end.getTime(), new Date(2026, 2, 5, 17, 30).getTime());
  assert.equal(same.orderInvalid, false);
});

test("resolveDateTimeRangeDraft flags an end before the start, even on one day", () => {
  const day = new Date(2026, 2, 5);
  const draft = utils.resolveDateTimeRangeDraft(
    { from: day, to: day },
    "17:00",
    "09:00",
    "minute"
  );
  assert.equal(draft.orderInvalid, true);
});

test("resolveDateTimeRangeDraft reports incomplete input without an order error", () => {
  const day = new Date(2026, 2, 5);
  const noDays = utils.resolveDateTimeRangeDraft(
    undefined,
    "09:00",
    "10:00",
    "minute"
  );
  assert.equal(noDays.start, undefined);
  assert.equal(noDays.end, undefined);
  assert.equal(noDays.orderInvalid, false);
  const badTime = utils.resolveDateTimeRangeDraft(
    { from: day },
    "",
    "10:00",
    "minute"
  );
  assert.equal(badTime.startTimeInvalid, true);
  assert.equal(badTime.endTimeInvalid, false);
  assert.equal(badTime.start, undefined);
  assert.equal(badTime.orderInvalid, false);
});

test("resolveDateTimeRangeDraft spans multiple days", () => {
  const draft = utils.resolveDateTimeRangeDraft(
    { from: new Date(2026, 2, 5), to: new Date(2026, 2, 7) },
    "22:00",
    "06:00",
    "minute"
  );
  assert.equal(draft.orderInvalid, false);
  assert.equal(draft.end.getTime(), new Date(2026, 2, 7, 6, 0).getTime());
});
