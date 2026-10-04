"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getInputPlaygroundCode,
  getInputPlaygroundDefaults,
  inputComponentProps,
} from "@/lib/input-component-props";
import { Calendar } from "@/registry/new-york/calendar";
import { DatePicker } from "@/registry/new-york/date-picker";
import { DateRangePicker } from "@/registry/new-york/date-range-picker";
import { Input } from "@/registry/new-york/input";
import { InputAmount } from "@/registry/new-york/input-amount";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/new-york/input-group";
import { InputOTP } from "@/registry/new-york/input-otp";
import { InputPassword } from "@/registry/new-york/input-password";
import { InputPhone } from "@/registry/new-york/input-phone";
import { InputSearch } from "@/registry/new-york/input-search";
import { InputSecret } from "@/registry/new-york/input-secret";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/popover";
import { TextArea } from "@/registry/new-york/textarea";

type Values = Record<string, string | boolean | number>;

const BasicInputPreview = ({
  component,
  values,
}: {
  component: string;
  values: Values;
}) => {
  const [otp, setOtp] = React.useState("");
  const [amount, setAmount] = React.useState("1250000.50");
  const label = (fallback: string) => String(values.label ?? fallback);
  const disabled = Boolean(values.disabled);
  const readOnly = Boolean(values.readOnly);

  switch (component) {
    case "input": {
      return (
        <Input
          label={label("Full name")}
          labelStyle={values.labelStyle as "floating" | "static"}
          placeholder={String(values.placeholder ?? "")}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(values["aria-invalid"])}
          className="w-72 max-w-full"
        />
      );
    }
    case "textarea": {
      return (
        <TextArea
          label={label("Message")}
          placeholder={String(values.placeholder ?? "")}
          rows={Number(values.rows)}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(values["aria-invalid"])}
          className="max-w-full"
        />
      );
    }
    case "input-password": {
      return (
        <InputPassword
          label={label("Password")}
          placeholder={String(values.placeholder ?? "")}
          autoComplete={
            String(values.autoComplete) as "current-password" | "new-password"
          }
          disabled={disabled}
          readOnly={readOnly}
          className="w-72 max-w-full"
        />
      );
    }
    case "input-search": {
      return (
        <InputSearch
          label={label("Search")}
          placeholder="Search components"
          defaultValue="Calendar"
          clearable={Boolean(values.clearable)}
          disabled={disabled}
          readOnly={readOnly}
          className="w-72 max-w-full"
        />
      );
    }
    case "input-amount": {
      const separators: Record<string, string | boolean> = {
        comma: ",",
        none: false,
        period: ".",
      };
      const thousandSeparator =
        separators[String(values.thousandSeparator)] ?? " ";
      return (
        <div className="grid w-72 max-w-full gap-2">
          <InputAmount
            aria-label={String(values["aria-label"] ?? "Amount")}
            value={amount}
            onValueChange={setAmount}
            thousandSeparator={thousandSeparator}
            decimalSeparator={String(values.decimalSeparator)}
            prefix={String(values.prefix ?? "")}
            suffix={String(values.suffix ?? "")}
            decimalScale={Number(values.decimalScale)}
            fixedDecimalScale={Boolean(values.fixedDecimalScale)}
            allowNegative={Boolean(values.allowNegative)}
          />
          <output className="text-xs text-muted-foreground">
            Raw decimal value: {amount}
          </output>
        </div>
      );
    }
    case "input-group": {
      return (
        <InputGroup className="w-80 max-w-full">
          <InputGroupAddon
            align={
              String(values.align) as
                | "inline-start"
                | "inline-end"
                | "block-start"
                | "block-end"
            }
          >
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            label={label("Website")}
            labelStyle={values.labelStyle as "floating" | "static"}
            aria-label="Website"
            placeholder="example.com"
            disabled={disabled}
          />
        </InputGroup>
      );
    }
    case "input-otp": {
      return (
        <div className="grid justify-items-center gap-2">
          <InputOTP
            aria-label={String(values["aria-label"] ?? "Verification code")}
            length={Number(values.length)}
            type={String(values.type) as "numeric" | "alphanumeric"}
            disabled={disabled}
            value={otp}
            onValueChange={setOtp}
            onComplete={(value) => setOtp(value)}
          />
          <span className="text-xs text-muted-foreground">
            {otp.length === Number(values.length)
              ? "Code complete"
              : `${otp.length}/${values.length} characters`}
          </span>
        </div>
      );
    }
    case "input-secret": {
      return (
        <InputSecret
          label={label("API secret")}
          defaultValue="vnd_test_example_secret"
          readOnly={readOnly}
          disabled={disabled}
          className="w-72 max-w-full"
        />
      );
    }
    default: {
      return null;
    }
  }
};

const AdvancedInputPreview = ({
  component,
  values,
}: {
  component: string;
  values: Values;
}) => {
  const [phone, setPhone] = React.useState<string>();
  const [date, setDate] = React.useState<Date>();
  const [range, setRange] = React.useState<DateRange>();
  const [multiple, setMultiple] = React.useState<Date[]>([]);
  const [open, setOpen] = React.useState(Boolean(values.defaultOpen));
  React.useEffect(() => {
    setOpen(Boolean(values.defaultOpen));
  }, [values.defaultOpen]);
  const label = (fallback: string) => String(values.label ?? fallback);
  const disabled = Boolean(values.disabled);
  const readOnly = Boolean(values.readOnly);

  switch (component) {
    case "input-phone": {
      return (
        <div className="grid w-80 max-w-full gap-2">
          <InputPhone
            label={label("Phone number")}
            labelStyle={values.labelStyle as "floating" | "static"}
            defaultCountry={
              String(values.defaultCountry) as "ID" | "US" | "GB" | "SG"
            }
            locale={String(values.locale)}
            disabled={disabled}
            readOnly={readOnly}
            value={phone}
            onValueChange={setPhone}
          />
          <output className="text-xs text-muted-foreground">
            Normalized value (digits without +): {phone ?? "empty"}
          </output>
        </div>
      );
    }
    case "calendar": {
      const mode = String(values.mode ?? "single");
      if (mode === "range") {
        return <Calendar mode="range" selected={range} onSelect={setRange} />;
      }
      if (mode === "multiple") {
        return (
          <Calendar
            mode="multiple"
            selected={multiple}
            onSelect={(next) => setMultiple(next ?? [])}
          />
        );
      }
      return <Calendar mode="single" selected={date} onSelect={setDate} />;
    }
    case "date-picker": {
      return (
        <DatePicker
          label={label("Appointment date")}
          placeholder={String(values.placeholder)}
          value={date}
          onValueChange={setDate}
          clearable={Boolean(values.clearable)}
          dateFormat={String(values.dateFormat)}
          disabled={disabled}
          readOnly={readOnly}
        />
      );
    }
    case "date-range-picker": {
      const feature = String(values.features ?? "shortcuts");
      const featureSets: Record<string, string[]> = {
        both: ["twoMonths", "shortcuts"],
        none: [],
      };
      const features = featureSets[feature] ?? [feature];
      return (
        <DateRangePicker
          label={label("Reporting period")}
          placeholder={String(values.placeholder)}
          value={range}
          onValueChange={setRange}
          features={features as ("twoMonths" | "shortcuts")[]}
          weekStartsOn={Number(values.weekStartsOn) as 0 | 1 | 6}
          clearable={Boolean(values.clearable)}
          disabled={disabled}
          readOnly={readOnly}
        />
      );
    }
    case "popover": {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="h-9 rounded-md border px-3 text-sm">
            {open ? "Popover open" : "Open popover"}
          </PopoverTrigger>
          <PopoverContent
            side={String(values.side) as "top" | "right" | "bottom" | "left"}
            align={String(values.align) as "start" | "center" | "end"}
          >
            Popover content stays aligned to its trigger.
          </PopoverContent>
        </Popover>
      );
    }
    default: {
      return (
        <span className="text-sm text-muted-foreground">
          No preview available.
        </span>
      );
    }
  }
};

const getHint = (component: string) => {
  if (component === "input-amount") {
    return "Edit the field to compare localized formatting with the raw decimal string emitted to your application.";
  }
  if (component === "input-phone") {
    return "The displayed national draft is normalized to international digits without a leading plus sign.";
  }
  if (component === "input-otp") {
    return "Paste is supported. Completion feedback appears when the configured number of characters is entered.";
  }
  if (component === "input-secret") {
    return "This preview uses a fake value. Clipboard feedback is announced without repeating the secret.";
  }
  if (component === "date-range-picker") {
    return "Choose dates as a draft, then Apply. Cancel, Escape, and outside dismissal discard changes.";
  }
  if (component === "calendar") {
    return "Selection mode changes the value shape. Keyboard arrows navigate dates; Page Up/Down changes months.";
  }
};

const advancedComponents = new Set([
  "input-phone",
  "calendar",
  "date-picker",
  "date-range-picker",
  "popover",
]);

export const InputFamilyPlayground = ({ component }: { component: string }) => {
  const initialValues = getInputPlaygroundDefaults(component);
  return (
    <ComponentPlayground
      title={component}
      definitions={inputComponentProps[component]}
      initialValues={initialValues}
      getCode={(values) => getInputPlaygroundCode(component, values)}
      hint={getHint(component)}
      renderPreview={(values) =>
        advancedComponents.has(component) ? (
          <AdvancedInputPreview component={component} values={values} />
        ) : (
          <BasicInputPreview component={component} values={values} />
        )
      }
    />
  );
};

export type { DateRange };
