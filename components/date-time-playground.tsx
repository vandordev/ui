"use client";
import { ComponentPlayground } from "@/components/component-playground";
import {
  dateTimeProps,
  getDateTimeCode,
  getDateTimeDefaults,
  getDateTimeFormat,
} from "@/lib/date-time-playground";
import type { DateTimePlaygroundValues } from "@/lib/date-time-playground";
import { DateTime } from "@/registry/new-york/date-time";

export const DateTimePreview = ({
  values,
}: {
  values: DateTimePlaygroundValues;
}) => {
  const format = getDateTimeFormat(values.display);
  return (
    <DateTime
      className="text-sm"
      value={String(values.value)}
      locale={String(values.locale)}
      timeZone={values.timeZone || undefined}
      format={format}
      fallback={String(values.fallback)}
    />
  );
};

export const DateTimePlayground = () => (
  <ComponentPlayground<DateTimePlaygroundValues>
    title="DateTime"
    definitions={dateTimeProps}
    initialValues={getDateTimeDefaults()}
    renderPreview={(values) => <DateTimePreview values={values} />}
    getCode={getDateTimeCode}
    hint="The server and initial hydration render the fallback. The browser formats the instant after hydration."
  />
);
