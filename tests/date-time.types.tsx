import { createRef } from "react";

import { DateTime } from "../registry/new-york/date-time";

const ref = createRef<HTMLTimeElement>();
export const DateTimeTypeConsumer = () => (
  <DateTime value={0} ref={ref} aria-label="Created at" />
);
export const DateTimeCannotOverride = () => (
  // @ts-expect-error DateTime owns the machine-readable timestamp.
  <DateTime value={0} dateTime="custom" />
);
export const DateTimeCannotTakeChildren = () => (
  // @ts-expect-error DateTime generates its localized text and does not accept children.
  <DateTime value={0}>Text</DateTime>
);
