import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";

/* eslint-disable sort-keys, complexity, no-nested-ternary, unicorn/no-nested-ternary */

const prop = (
  type: string,
  defaultValue: string,
  description: string,
  control?: PropDefinition["control"]
): PropDefinition => ({
  defaultValue,
  description,
  type,
  ...(control ? { control } : {}),
});

const text = (label: string, initialValue: string) => ({
  initialValue,
  kind: "text" as const,
  label,
});
const boolean = (label: string, initialValue = false) => ({
  initialValue,
  kind: "boolean" as const,
  label,
});
const select = (
  label: string,
  initialValue: string,
  options: readonly string[]
) => ({ initialValue, kind: "select" as const, label, options });
const p = (
  type: string,
  defaultValue: string,
  description: string,
  control?: PropDefinition["control"]
) => prop(type, defaultValue, description, control);

export const inputComponentProps: Record<
  string,
  Record<string, PropDefinition>
> = {
  calendar: {
    buttonVariant: p(
      '"ghost" | "outline" | "default" | "secondary" | "destructive" | "link"',
      '"ghost"',
      "Navigation button appearance.",
      select("Navigation buttons", "ghost", ["ghost", "outline"])
    ),
    captionLayout: p(
      '"label" | "dropdown" | "dropdown-months" | "dropdown-years"',
      '"label"',
      "Month/year caption layout.",
      select("Caption", "label", [
        "label",
        "dropdown",
        "dropdown-months",
        "dropdown-years",
      ])
    ),
    className: p(
      "string",
      "undefined",
      "Calendar root class; merged with default styling."
    ),
    disabled: p(
      "Matcher | Matcher[]",
      "undefined",
      "Calendar: dates that cannot be selected."
    ),
    endMonth: p("Date", "undefined", "Calendar: latest navigable month."),
    locale: p(
      "Locale",
      "undefined",
      "Calendar: react-day-picker locale; affects labels and formatting."
    ),
    mode: p(
      '"single" | "multiple" | "range"',
      "undefined",
      "Calendar: selection mode and corresponding selected/onSelect types.",
      select("Selection mode", "single", ["single", "multiple", "range"])
    ),
    onSelect: p(
      "DayPicker selection callback",
      "undefined",
      "Calendar: receives the selection for the chosen mode."
    ),
    motion: p(
      "boolean",
      "true",
      "Vandor month, selection, and press motion. Reduced-motion preferences take priority.",
      boolean("Motion", true)
    ),
    numberOfMonths: p(
      "number",
      "1",
      "Number of visible months; stacks on narrow screens.",
      select("Visible months", "1", ["1", "2"])
    ),
    selected: p(
      "Date | Date[] | DateRange",
      "undefined",
      "Calendar: selected date(s), matching mode."
    ),
    showOutsideDays: p(
      "boolean",
      "true",
      "Calendar: displays adjacent-month days.",
      boolean("Outside days", true)
    ),
    showWeekNumber: p(
      "boolean",
      "false",
      "Displays ISO/locale week numbers.",
      boolean("Week numbers")
    ),
    startMonth: p("Date", "undefined", "Calendar: earliest navigable month."),
    weekStartsOn: p(
      "0 | 1 | 2 | 3 | 4 | 5 | 6",
      "locale default",
      "First weekday; 0 is Sunday.",
      select("Week starts on", "0", ["0", "1", "6"])
    ),
    month: p(
      "Date",
      "undefined",
      "Controlled visible month; pair with onMonthChange."
    ),
    defaultMonth: p(
      "Date",
      "current month",
      "Initial visible month in uncontrolled usage."
    ),
    onMonthChange: p(
      "(month: Date) => void",
      "undefined",
      "Called when the visible month changes."
    ),
    classNames: p(
      "Partial<ClassNames>",
      "undefined",
      "Overrides individual DayPicker slot classes."
    ),
    components: p(
      "Partial<CustomComponents>",
      "undefined",
      "Overrides slots, replacing Vandor motion for those slots."
    ),
    required: p(
      "boolean",
      "false",
      "Prevents clearing a selection in a selection mode."
    ),
    timeZone: p(
      "string",
      "local timezone",
      "DayPicker timezone for interpreting calendar dates."
    ),
  },
  "date-picker": {
    motion: p(
      "boolean",
      "true",
      "Enables popup, calendar, and button motion; system reduced-motion takes priority.",
      boolean("Motion", true)
    ),
    className: p("string", "undefined", "DatePicker: trigger class name."),
    clearable: p(
      "boolean",
      "false",
      "DatePicker: shows a clear action for a selected value.",
      boolean("Clearable")
    ),
    dateFormat: p(
      "string",
      '"PPP"',
      "DatePicker: date-fns display format.",
      text("Date format", "PPP")
    ),
    defaultOpen: p(
      "boolean",
      "false",
      "DatePicker: initial uncontrolled popover visibility."
    ),
    defaultValue: p(
      "Date | undefined",
      "undefined",
      "DatePicker: initial uncontrolled selected day."
    ),
    disabled: p(
      "boolean",
      "false",
      "DatePicker: disables opening the trigger.",
      boolean("Disabled")
    ),
    disabledDates: p(
      "Matcher | Matcher[]",
      "undefined",
      "DatePicker: dates that cannot be selected."
    ),
    endMonth: p("Date", "undefined", "DatePicker: latest navigable month."),
    id: p(
      "string",
      "generated",
      "DatePicker: optional stable id for the label relationship."
    ),
    label: p(
      "string",
      "required",
      "DatePicker: visible accessible name.",
      text("Label", "Appointment date")
    ),
    locale: p(
      "date-fns Locale",
      "undefined",
      "DatePicker: display and calendar locale."
    ),
    onOpenChange: p(
      "(open: boolean) => void",
      "undefined",
      "DatePicker: observes popover visibility changes."
    ),
    onValueChange: p(
      "(date: Date | undefined) => void",
      "undefined",
      "DatePicker: fires immediately when selected or cleared."
    ),
    open: p(
      "boolean",
      "uncontrolled",
      "DatePicker: controlled popover visibility."
    ),
    placeholder: p(
      "string",
      '"Select a date"',
      "DatePicker: trigger text when empty.",
      text("Placeholder", "Select a date")
    ),
    readOnly: p(
      "boolean",
      "false",
      "DatePicker: opens the calendar but prevents changes.",
      boolean("Read only")
    ),
    startMonth: p("Date", "undefined", "DatePicker: earliest navigable month."),
    value: p(
      "Date | undefined",
      "uncontrolled",
      "DatePicker: controlled selected local calendar day."
    ),
  },
  "date-range-picker": {
    motion: p(
      "boolean",
      "true",
      "Enables popup, calendar, and button motion; system reduced-motion takes priority.",
      boolean("Motion", true)
    ),
    applyLabel: p("string", '"Apply"', "DateRangePicker: apply button text."),
    cancelLabel: p(
      "string",
      '"Cancel"',
      "DateRangePicker: cancel button text."
    ),
    className: p("string", "undefined", "DateRangePicker: trigger class name."),
    clearLabel: p("string", '"Clear"', "DateRangePicker: clear button text."),
    clearable: p(
      "boolean",
      "false",
      "DateRangePicker: adds a transactional Clear action.",
      boolean("Clearable")
    ),
    dateFormat: p(
      "string",
      '"PPP"',
      "DateRangePicker: date-fns display format.",
      text("Date format", "PPP")
    ),
    defaultOpen: p(
      "boolean",
      "false",
      "DateRangePicker: initial uncontrolled popover visibility."
    ),
    defaultValue: p(
      "DateRange | undefined",
      "undefined",
      "DateRangePicker: initial uncontrolled range."
    ),
    disabled: p(
      "boolean",
      "false",
      "DateRangePicker: disables opening the trigger.",
      boolean("Disabled")
    ),
    disabledDates: p(
      "readonly Date[]",
      "[]",
      "DateRangePicker: local dates excluded from selection."
    ),
    endMonth: p(
      "Date",
      "undefined",
      "DateRangePicker: latest navigable month."
    ),
    features: p(
      'readonly ("twoMonths" | "shortcuts")[]',
      "[]",
      "DateRangePicker: optional second month and shortcut list.",
      select("Feature", "shortcuts", ["none", "shortcuts", "twoMonths", "both"])
    ),
    id: p(
      "string",
      "generated",
      "DateRangePicker: optional stable id for the label relationship."
    ),
    label: p(
      "string",
      "required",
      "DateRangePicker: visible accessible name.",
      text("Label", "Reporting period")
    ),
    locale: p(
      "date-fns Locale",
      "undefined",
      "DateRangePicker: display and calendar locale."
    ),
    now: p(
      "() => Date",
      "current date",
      "DateRangePicker: clock used to resolve shortcuts."
    ),
    onOpenChange: p(
      "(open: boolean) => void",
      "undefined",
      "DateRangePicker: observes popover visibility changes."
    ),
    onValueChange: p(
      "(range: DateRange | undefined) => void",
      "undefined",
      "DateRangePicker: fires only after Apply."
    ),
    open: p(
      "boolean",
      "uncontrolled",
      "DateRangePicker: controlled popover visibility."
    ),
    placeholder: p(
      "string",
      '"Select dates"',
      "DateRangePicker: trigger text when empty.",
      text("Placeholder", "Select dates")
    ),
    readOnly: p(
      "boolean",
      "false",
      "DateRangePicker: opens the calendar but prevents changes.",
      boolean("Read only")
    ),
    shortcuts: p(
      "readonly DateShortcut[]",
      "all shortcuts",
      "DateRangePicker: which named shortcut choices are shown."
    ),
    startMonth: p(
      "Date",
      "undefined",
      "DateRangePicker: earliest navigable month."
    ),
    value: p(
      "DateRange | undefined",
      "uncontrolled",
      "DateRangePicker: committed inclusive local-day range."
    ),
    weekStartsOn: p(
      "0 | 1 | 2 | 3 | 4 | 5 | 6",
      "1",
      "DateRangePicker: first day for calendar and week shortcuts.",
      select("Week starts on", "1", ["0", "1", "6"])
    ),
  },
  input: {
    "aria-invalid": p(
      "boolean",
      "false",
      "Input: exposes invalid state to assistive technology.",
      boolean("Invalid")
    ),
    containerClassName: p(
      "string",
      "undefined",
      "Input: class applied to the label/control wrapper."
    ),
    defaultValue: p(
      "string | number",
      "undefined",
      "Input: initial uncontrolled native value."
    ),
    disabled: p(
      "boolean",
      "false",
      "Input: prevents editing and focus.",
      boolean("Disabled")
    ),
    icon: p(
      "ReactNode",
      "undefined",
      "Input: decorative inline-start adornment."
    ),
    label: p(
      "string",
      "undefined",
      "Input: visible label associated with the native field.",
      text("Label", "Full name")
    ),
    labelClassName: p(
      "string",
      "undefined",
      "Input: class applied to the label."
    ),
    labelStyle: p(
      '"floating" | "static"',
      '"floating"',
      "Input: label presentation.",
      select("Label style", "floating", ["floating", "static"])
    ),
    name: p("string", "undefined", "Input: native form field name."),
    onChange: p(
      "React.ChangeEventHandler<HTMLInputElement>",
      "undefined",
      "Input: native input change callback."
    ),
    placeholder: p(
      "string",
      "undefined",
      "Input: native placeholder.",
      text("Placeholder", "Your name")
    ),
    readOnly: p(
      "boolean",
      "false",
      "Input: prevents editing while retaining focus.",
      boolean("Read only")
    ),
    value: p(
      "string | number",
      "uncontrolled",
      "Input: controlled native value."
    ),
  },
  "input-amount": {
    allowNegative: p(
      "boolean",
      "false",
      "InputAmount: allows a leading minus sign.",
      boolean("Allow negative")
    ),
    "aria-label": p(
      "string",
      "required without label",
      "InputAmount: accessible name for the native input.",
      text("Accessible label", "Amount")
    ),
    decimalScale: p(
      "number",
      "undefined",
      "InputAmount: maximum fraction digits.",
      select("Decimal places", "2", ["0", "2", "4"])
    ),
    decimalSeparator: p(
      "string",
      '"."',
      "InputAmount: displayed decimal separator.",
      select("Decimal", ",", [".", ","])
    ),
    defaultValue: p(
      "string",
      "undefined",
      "InputAmount: initial raw decimal text."
    ),
    fixedDecimalScale: p(
      "boolean",
      "false",
      "InputAmount: pads display to decimalScale.",
      boolean("Fixed decimals")
    ),
    name: p("string", "undefined", "InputAmount: native form field name."),
    onValueChange: p(
      "(value: string) => void",
      "undefined",
      "InputAmount: receives raw decimal text on user edits."
    ),
    prefix: p(
      "string",
      '""',
      "InputAmount: text displayed before the formatted number.",
      text("Prefix", "Rp ")
    ),
    suffix: p(
      "string",
      '""',
      "InputAmount: text displayed after the formatted number.",
      text("Suffix", "")
    ),
    thousandSeparator: p(
      "string | boolean",
      "false",
      "InputAmount: optional display grouping separator.",
      select("Thousands", "space", ["none", "space"])
    ),
    value: p(
      "string",
      "uncontrolled",
      "InputAmount: controlled raw decimal text; decimal mark is always a period."
    ),
  },
  "input-group": {
    label: p(
      "string",
      "undefined",
      "InputGroupInput: visible associated label.",
      text("Label", "Website")
    ),
    labelStyle: p(
      '"floating" | "static"',
      '"floating"',
      "InputGroupInput: label presentation.",
      select("Label style", "floating", ["floating", "static"])
    ),
    align: p(
      '"inline-start" | "inline-end" | "block-start" | "block-end"',
      '"inline-start"',
      "InputGroupAddon: addon position.",
      select("Addon position", "inline-start", [
        "inline-start",
        "inline-end",
        "block-start",
        "block-end",
      ])
    ),
    children: p(
      "ReactNode",
      "required",
      "InputGroup and addon components: composed controls/content."
    ),
    className: p(
      "string",
      "undefined",
      "Group/addon/control: merged class name."
    ),
    disabled: p(
      "boolean",
      "false",
      "InputGroupInput: disables the native input.",
      boolean("Disabled")
    ),
    type: p(
      '"button" | "submit" | "reset"',
      '"button"',
      "InputGroupButton: native button type."
    ),
  },
  "input-otp": {
    "aria-label": p(
      "string",
      '"One-time code"',
      "InputOTP: accessible name for the hidden native input.",
      text("Accessible label", "Verification code")
    ),
    defaultValue: p("string", '""', "InputOTP: initial uncontrolled value."),
    disabled: p(
      "boolean",
      "false",
      "InputOTP: native disabled input behavior.",
      boolean("Disabled")
    ),
    length: p(
      "number",
      "6",
      "InputOTP: positive number of code characters.",
      select("Code length", "6", ["4", "6", "8"])
    ),
    onComplete: p(
      "(value: string) => void",
      "undefined",
      "InputOTP: fires for changed complete user input."
    ),
    onValueChange: p(
      "(value: string) => void",
      "undefined",
      "InputOTP: fires when sanitized value changes."
    ),
    type: p(
      '"numeric" | "alphanumeric"',
      '"numeric"',
      "InputOTP: accepted code alphabet.",
      select("Alphabet", "numeric", ["numeric", "alphanumeric"])
    ),
    value: p("string", "uncontrolled", "InputOTP: controlled sanitized value."),
  },
  "input-password": {
    autoComplete: p(
      '"current-password" | "new-password"',
      "native",
      "InputPassword: preserves browser password-manager hints.",
      select("Autocomplete", "current-password", [
        "current-password",
        "new-password",
      ])
    ),
    defaultValue: p(
      "string",
      "undefined",
      "InputPassword: initial uncontrolled value."
    ),
    disabled: p(
      "boolean",
      "false",
      "InputPassword: prevents editing and visibility toggle.",
      boolean("Disabled")
    ),
    label: p(
      "string",
      "undefined",
      "InputPassword: visible associated label.",
      text("Label", "Password")
    ),
    onChange: p(
      "React.ChangeEventHandler<HTMLInputElement>",
      "undefined",
      "InputPassword: native input change callback."
    ),
    placeholder: p(
      "string",
      "undefined",
      "InputPassword: native placeholder.",
      text("Placeholder", "Enter password")
    ),
    readOnly: p(
      "boolean",
      "false",
      "InputPassword: prevents editing but keeps focus and visibility controls."
    ),
    value: p(
      "string",
      "uncontrolled",
      "InputPassword: native controlled value."
    ),
  },
  "input-phone": {
    labelStyle: p(
      '"floating" | "static"',
      '"floating"',
      "InputPhone: label presentation for the number field.",
      select("Label style", "floating", ["floating", "static"])
    ),
    countrySelectLabel: p(
      "string",
      '"Country calling code"',
      "InputPhone: accessible name of country selector."
    ),
    defaultCountry: p(
      "CountryCode",
      '"ID"',
      "InputPhone: initial country calling code.",
      select("Country", "ID", ["ID", "US", "GB", "SG"])
    ),
    defaultValue: p(
      "string | undefined",
      "undefined",
      "InputPhone: initial international digits without a plus sign."
    ),
    disabled: p(
      "boolean",
      "false",
      "InputPhone: disables number and country selector.",
      boolean("Disabled")
    ),
    label: p(
      "string",
      "undefined",
      "InputPhone: visible label for the number field.",
      text("Label", "Phone number")
    ),
    locale: p(
      "string",
      '"en"',
      "InputPhone: locale for country display names.",
      select("Locale", "en", ["en", "id"])
    ),
    name: p(
      "not supported",
      "not forwarded",
      "InputPhone intentionally omits native name; serialize the normalized value in the form owner."
    ),
    onValueChange: p(
      "(value: string | undefined) => void",
      "undefined",
      "InputPhone: emits international digits without plus, or undefined."
    ),
    readOnly: p(
      "boolean",
      "false",
      "InputPhone: prevents number/country edits while preserving focus."
    ),
    value: p(
      "string | undefined",
      "uncontrolled",
      "InputPhone: international digits without a plus sign."
    ),
  },
  "input-search": {
    clearLabel: p(
      "string",
      '"Clear search"',
      "InputSearch: accessible name of the clear action."
    ),
    clearable: p(
      "boolean",
      "false",
      "InputSearch: shows a clear action for nonempty editable values.",
      boolean("Clearable", true)
    ),
    defaultValue: p(
      "string",
      "undefined",
      "InputSearch: initial uncontrolled search value."
    ),
    disabled: p(
      "boolean",
      "false",
      "InputSearch: native disabled state.",
      boolean("Disabled")
    ),
    label: p(
      "string",
      "undefined",
      "InputSearch: visible associated label.",
      text("Label", "Search")
    ),
    onChange: p(
      "React.ChangeEventHandler<HTMLInputElement>",
      "undefined",
      "InputSearch: native change callback, including clear action."
    ),
    placeholder: p(
      "string",
      "undefined",
      "InputSearch: native search placeholder.",
      text("Placeholder", "Search components")
    ),
    readOnly: p(
      "boolean",
      "false",
      "InputSearch: prevents editing and clear action."
    ),
    searchLabel: p(
      "string",
      '"Search"',
      "InputSearch: accessible name when no visible label is provided."
    ),
    value: p(
      "string",
      "uncontrolled",
      "InputSearch: controlled native search value."
    ),
  },
  "input-secret": {
    copiedLabel: p(
      "string",
      '"Secret copied."',
      "InputSecret: live announcement after successful copy."
    ),
    copyLabel: p(
      "string",
      '"Copy secret"',
      "InputSecret: accessible name of copy action."
    ),
    defaultValue: p(
      "string",
      "undefined",
      "InputSecret: initial uncontrolled value; examples must use fake values only."
    ),
    disabled: p(
      "boolean",
      "false",
      "InputSecret: disables editing and actions.",
      boolean("Disabled")
    ),
    emptyLabel: p(
      "string",
      '"Secret is empty."',
      "InputSecret: live announcement when empty."
    ),
    errorLabel: p(
      "string",
      '"Unable to copy secret."',
      "InputSecret: live announcement when copying fails."
    ),
    label: p(
      "string",
      "undefined",
      "InputSecret: visible associated label.",
      text("Label", "API secret")
    ),
    onChange: p(
      "React.ChangeEventHandler<HTMLInputElement>",
      "undefined",
      "InputSecret: native input change callback."
    ),
    readOnly: p(
      "boolean",
      "false",
      "InputSecret: prevents editing but allows show/copy actions.",
      boolean("Read only")
    ),
    unavailableLabel: p(
      "string",
      '"Clipboard is unavailable."',
      "InputSecret: live announcement when Clipboard API is unavailable."
    ),
    value: p("string", "uncontrolled", "InputSecret: native controlled value."),
  },
  popover: {
    align: p(
      '"start" | "center" | "end"',
      '"start"',
      "PopoverContent: alignment relative to trigger.",
      select("Alignment", "start", ["start", "center", "end"])
    ),
    children: p(
      "ReactNode",
      "required",
      "Popover: compose Trigger and Content; Content children are popup content."
    ),
    defaultOpen: p(
      "boolean",
      "false",
      "Popover: initial uncontrolled visibility.",
      boolean("Initially open")
    ),
    onOpenChange: p(
      "(open: boolean) => void",
      "undefined",
      "Popover: observes visibility changes."
    ),
    open: p("boolean", "uncontrolled", "Popover: controlled visibility."),
    side: p(
      '"top" | "right" | "bottom" | "left"',
      '"bottom"',
      "PopoverContent: preferred placement.",
      select("Preferred side", "bottom", ["bottom", "top", "left", "right"])
    ),
    sideOffset: p(
      "number",
      "6",
      "PopoverContent: preferred gap between popup and trigger."
    ),
  },
  textarea: {
    "aria-invalid": p(
      "boolean",
      "false",
      "TextArea: exposes invalid state to assistive technology.",
      boolean("Invalid")
    ),
    containerClassName: p(
      "string",
      "undefined",
      "TextArea: class applied to label/control wrapper."
    ),
    defaultValue: p(
      "string",
      "undefined",
      "TextArea: initial uncontrolled value."
    ),
    disabled: p(
      "boolean",
      "false",
      "TextArea: prevents editing and focus.",
      boolean("Disabled")
    ),
    label: p(
      "string",
      "undefined",
      "TextArea: visible label associated with the native field.",
      text("Label", "Message")
    ),
    labelClassName: p(
      "string",
      "undefined",
      "TextArea: class applied to label."
    ),
    name: p("string", "undefined", "TextArea: native form field name."),
    onChange: p(
      "React.ChangeEventHandler<HTMLTextAreaElement>",
      "undefined",
      "TextArea: native change callback."
    ),
    placeholder: p(
      "string",
      "undefined",
      "TextArea: native placeholder.",
      text("Placeholder", "Write a message")
    ),
    readOnly: p(
      "boolean",
      "false",
      "TextArea: prevents editing while retaining focus.",
      boolean("Read only")
    ),
    rows: p(
      "number",
      "browser default",
      "TextArea: native visible row count.",
      select("Rows", "4", ["3", "4", "6"])
    ),
    value: p("string", "uncontrolled", "TextArea: controlled native value."),
  },
};

export const getInputPlaygroundDefaults = (component: string) => {
  const definitions = inputComponentProps[component];
  if (!definitions) {
    throw new Error(`Unknown input-family component: ${component}`);
  }
  return getPlaygroundDefaults(definitions);
};

type InputPlaygroundValues = Record<string, string | boolean | number>;

const stringLiteral = (value: string) => JSON.stringify(value);
const propLine = (
  name: string,
  value: string | boolean | number | undefined
) => {
  if (value === undefined) {
    return "";
  }
  if (
    (name === "aria-invalid" || name === "motion") &&
    typeof value === "boolean"
  ) {
    return `    ${name}={${value}}`;
  }
  if (typeof value === "boolean") {
    return value ? `    ${name}` : "";
  }
  const numericProps = ["decimalScale", "weekStartsOn", "length", "rows"];
  const serialized = numericProps.includes(name)
    ? Number(value)
    : stringLiteral(String(value));
  return `    ${name}={${serialized}}`;
};
const propsBlock = (values: InputPlaygroundValues, keys: string[]) =>
  keys
    .map((key) => propLine(key, values[key]))
    .filter(Boolean)
    .join("\n");

const componentToName = (component: string) =>
  component
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("");

const resolveThousandSeparator = (value: string | boolean | number) => {
  if (value === "none") {
    return false;
  }
  if (value === "comma") {
    return ",";
  }
  if (value === "period") {
    return ".";
  }
  if (value === "space") {
    return " ";
  }
  return value;
};

const resolveRangeFeatures = (value: string | boolean | number) => {
  if (value === "both") {
    return ["twoMonths", "shortcuts"];
  }
  if (value === "none") {
    return [];
  }
  return [String(value)];
};

const getCalendarCode = (mode: string, values: InputPlaygroundValues) => {
  const options = `\n  captionLayout=${stringLiteral(String(values.captionLayout ?? "label"))}\n  buttonVariant=${stringLiteral(String(values.buttonVariant ?? "ghost"))}\n  showOutsideDays={${Boolean(values.showOutsideDays ?? true)}}\n  showWeekNumber={${Boolean(values.showWeekNumber)}}\n  numberOfMonths={${Number(values.numberOfMonths ?? 1)}}\n  weekStartsOn={${Number(values.weekStartsOn ?? 0)}}\n  motion={${Boolean(values.motion ?? true)}}`;
  if (mode === "range") {
    return `const [range, setRange] = useState<DateRange>();\n\n<Calendar mode="range" selected={range} onSelect={setRange}${options}\n/>`;
  }
  if (mode === "multiple") {
    return `const [dates, setDates] = useState<Date[]>([]);\n\n<Calendar mode="multiple" selected={dates} onSelect={(next) => setDates(next ?? [])}${options}\n/>`;
  }
  return `const [date, setDate] = useState<Date>();\n\n<Calendar mode="single" selected={date} onSelect={setDate}${options}\n/>`;
};

export const getInputPlaygroundCode = (
  component: string,
  values: InputPlaygroundValues
) => {
  const configs: Record<string, { imports: string; code: string }> = {
    calendar: {
      code: getCalendarCode(String(values.mode ?? "single"), values),
      imports:
        'import { useState } from "react";\nimport type { DateRange } from "react-day-picker";\nimport { Calendar } from "@/components/ui/calendar";',
    },
    "date-picker": {
      code: `const [date, setDate] = useState<Date>();\n\n<DatePicker\n    label={${stringLiteral(String(values.label ?? "Appointment date"))}}\n    value={date}\n    onValueChange={setDate}\n${propsBlock(values, ["placeholder", "dateFormat", "clearable", "disabled", "readOnly", "motion"])}\n/>`,
      imports:
        'import { useState } from "react";\nimport { DatePicker } from "@/components/ui/date-picker";',
    },
    "date-range-picker": {
      code: `const [range, setRange] = useState<DateRange>();\n\n<DateRangePicker\n    label={${stringLiteral(String(values.label ?? "Reporting period"))}}\n    value={range}\n    onValueChange={setRange}\n${propsBlock(values, ["placeholder", "clearable", "disabled", "readOnly", "motion"])}\n    weekStartsOn={${Number(values.weekStartsOn ?? 1)}}\n    features={${JSON.stringify(resolveRangeFeatures(values.features))}}\n/>`,
      imports:
        'import { useState } from "react";\nimport type { DateRange } from "react-day-picker";\nimport { DateRangePicker } from "@/components/ui/date-range-picker";',
    },
    input: {
      code: `<Input\n${propsBlock(values, ["label", "labelStyle", "placeholder", "disabled", "readOnly", "aria-invalid"])}\n/>`,
      imports: 'import { Input } from "@/components/ui/input";',
    },
    "input-amount": {
      code: `const [amount, setAmount] = useState("1250000.50");\n\n<InputAmount\n    aria-label={${stringLiteral(String(values["aria-label"] ?? "Amount"))}}\n    value={amount}\n    onValueChange={setAmount}\n${propsBlock({ ...values, thousandSeparator: resolveThousandSeparator(values.thousandSeparator) }, ["prefix", "suffix", "thousandSeparator", "decimalSeparator", "decimalScale", "fixedDecimalScale", "allowNegative"])}\n/>`,
      imports:
        'import { InputAmount } from "@/components/ui/input-amount";\nimport { useState } from "react";',
    },
    "input-group": {
      code: `<InputGroup>\n  <InputGroupAddon align={${stringLiteral(String(values.align ?? "inline-start"))}}>\n    <InputGroupText>https://</InputGroupText>\n  </InputGroupAddon>\n  <InputGroupInput label={${stringLiteral(String(values.label ?? "Website"))}} labelStyle={${stringLiteral(String(values.labelStyle ?? "floating"))}} placeholder="example.com"${values.disabled ? " disabled" : ""} />\n</InputGroup>`,
      imports:
        'import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";',
    },
    "input-otp": {
      code: `const [code, setCode] = useState("");\n\n<InputOTP\n    aria-label={${stringLiteral(String(values["aria-label"] ?? "Verification code"))}}\n    value={code}\n    onValueChange={setCode}\n    onComplete={(value) => setCode(value)}\n${propsBlock(values, ["length", "type", "disabled"])}\n/>`,
      imports:
        'import { useState } from "react";\nimport { InputOTP } from "@/components/ui/input-otp";',
    },
    "input-password": {
      code: `<InputPassword\n${propsBlock(values, ["label", "placeholder", "autoComplete", "disabled", "readOnly"])}\n/>`,
      imports:
        'import { InputPassword } from "@/components/ui/input-password";',
    },
    "input-phone": {
      code: `const [phone, setPhone] = useState<string>();\n\n<InputPhone\n    label={${stringLiteral(String(values.label ?? "Phone number"))}}\n    value={phone}\n    onValueChange={setPhone}\n${propsBlock(values, ["defaultCountry", "locale", "disabled", "readOnly", "labelStyle"])}\n/>\n\n<p>Normalized value (digits without +): {phone ?? "empty"}</p>`,
      imports:
        'import { useState } from "react";\nimport { InputPhone } from "@/components/ui/input-phone";',
    },
    "input-search": {
      code: `<InputSearch\n${propsBlock(values, ["label", "placeholder", "clearable", "disabled", "readOnly"])}\n    defaultValue="Calendar"\n/>`,
      imports: 'import { InputSearch } from "@/components/ui/input-search";',
    },
    "input-secret": {
      code: `<InputSecret\n${propsBlock(values, ["label", "copyLabel", "readOnly", "disabled"])}\n    defaultValue="vnd_test_example_secret"\n/>`,
      imports: 'import { InputSecret } from "@/components/ui/input-secret";',
    },
    popover: {
      code: `<Popover${values.defaultOpen ? " defaultOpen" : ""}>\n  <PopoverTrigger>Open popover</PopoverTrigger>\n  <PopoverContent side={${stringLiteral(String(values.side ?? "bottom"))}} align={${stringLiteral(String(values.align ?? "start"))}}>\n    Popover content stays aligned to its trigger.\n  </PopoverContent>\n</Popover>`,
      imports:
        'import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";',
    },
    textarea: {
      code: `<TextArea\n${propsBlock(values, ["label", "placeholder", "rows", "disabled", "readOnly", "aria-invalid"])}\n/>`,
      imports: 'import { TextArea } from "@/components/ui/textarea";',
    },
  };
  const config = configs[component];
  if (!config) {
    throw new Error(`Unknown input-family component: ${component}`);
  }
  const stateful = config.code.includes("\n\n");
  const [state, jsx] = stateful
    ? config.code.split("\n\n", 2)
    : ["", config.code];
  return `"use client";\n\n${config.imports}\n\nexport function ${componentToName(component)}Demo() {\n${stateful ? `  ${state}\n  return (\n    <>\n      ${jsx.replaceAll("\n", "\n      ")}\n    </>\n  );` : `  return (\n    ${jsx.replaceAll("\n", "\n    ")}\n  );`}\n}`;
};

export const inputPlaygroundCode = Object.fromEntries(
  Object.keys(inputComponentProps).map((component) => [
    component,
    getInputPlaygroundCode(component, getInputPlaygroundDefaults(component)),
  ])
);
