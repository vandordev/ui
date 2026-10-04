import type { PropDefinition } from "@/lib/playground";

const p = (
  type: string,
  defaultValue: string,
  description: string
): PropDefinition => ({
  defaultValue,
  description,
  type,
});

export const inputComponentProps: Record<
  string,
  Record<string, PropDefinition>
> = {
  calendar: {
    disabled: p(
      "Matcher | Matcher[]",
      "undefined",
      "Calendar: prevents selecting matching dates."
    ),
    endMonth: p("Date", "undefined", "Calendar: latest navigable month."),
    locale: p(
      "DayPickerLocale",
      "English",
      "Calendar: translated date labels and formatting."
    ),
    mode: p(
      '"single" | "multiple" | "range"',
      '"single"',
      "Calendar: typed date selection mode."
    ),
    startMonth: p("Date", "undefined", "Calendar: earliest navigable month."),
  },
  "date-picker": {
    clearable: p(
      "boolean",
      "false",
      "DatePicker: enables an explicit clear action."
    ),
    dateFormat: p("string", '"PPP"', "DatePicker: date-fns display format."),
    disabledDates: p(
      "Matcher | Matcher[]",
      "undefined",
      "DatePicker: prevents selecting matching dates."
    ),
    onValueChange: p(
      "(date: Date | undefined) => void",
      "undefined",
      "DatePicker: receives committed selection."
    ),
    value: p(
      "Date | undefined",
      "uncontrolled",
      "DatePicker: selected local calendar day."
    ),
  },
  "date-range-picker": {
    clearable: p(
      "boolean",
      "false",
      "DateRangePicker: adds a transactional clear draft."
    ),
    features: p(
      '("twoMonths" | "shortcuts")[]',
      "[]",
      "DateRangePicker: optional calendar layout and shortcut features."
    ),
    shortcuts: p(
      "DateShortcut[]",
      "all shortcuts",
      "DateRangePicker: available shortcut choices."
    ),
    value: p(
      "DateRange | undefined",
      "uncontrolled",
      "DateRangePicker: committed inclusive local-day range."
    ),
    weekStartsOn: p(
      "0 | 1 | 2 | 3 | 4 | 5 | 6",
      "1",
      "DateRangePicker: first day of the week."
    ),
  },
  input: {
    "aria-invalid": p(
      "boolean",
      "false",
      "Input: exposes invalid state to assistive technology."
    ),
    disabled: p("boolean", "false", "Input: prevents editing and focus."),
    icon: p("ReactNode", "undefined", "Input: decorative inline-start icon."),
    label: p("string", "undefined", "Input: visible accessible label."),
    labelStyle: p(
      '"floating" | "static"',
      '"floating"',
      "Input: label presentation when a label is provided."
    ),
    readOnly: p(
      "boolean",
      "false",
      "Input: prevents editing while retaining focus."
    ),
  },
  "input-amount": {
    allowNegative: p(
      "boolean",
      "false",
      "InputAmount: permits a leading minus sign."
    ),
    decimalScale: p(
      "number",
      "undefined",
      "InputAmount: maximum fraction digits."
    ),
    decimalSeparator: p(
      "string",
      '"."',
      "InputAmount: displayed decimal separator."
    ),
    fixedDecimalScale: p(
      "boolean",
      "false",
      "InputAmount: pads display to decimalScale without numeric conversion."
    ),
    thousandSeparator: p(
      "string | boolean",
      "false",
      "InputAmount: optional grouping separator."
    ),
    value: p(
      "string",
      "undefined",
      "InputAmount: controlled raw decimal text; separator is always a period."
    ),
  },
  "input-group": {
    align: p(
      '"inline-start" | "inline-end" | "block-start" | "block-end"',
      '"inline-start"',
      "InputGroupAddon: addon alignment."
    ),
    type: p(
      '"button" | "submit" | "reset"',
      '"button"',
      "InputGroupButton: native button type."
    ),
  },
  "input-otp": {
    length: p("number", "6", "InputOTP: positive number of code characters."),
    onComplete: p(
      "(value: string) => void",
      "undefined",
      "InputOTP: fires for a changed complete user-entered value."
    ),
    type: p(
      '"numeric" | "alphanumeric"',
      '"numeric"',
      "InputOTP: accepted code alphabet."
    ),
  },
  "input-password": {
    autoComplete: p(
      '"current-password" | "new-password"',
      "browser default",
      "InputPassword: preserve password-manager hints."
    ),
    disabled: p(
      "boolean",
      "false",
      "InputPassword: prevents editing and visibility toggle."
    ),
    label: p("string", "undefined", "InputPassword: visible associated label."),
  },
  "input-phone": {
    defaultCountry: p(
      "CountryCode",
      '"ID"',
      "InputPhone: initial country calling code."
    ),
    locale: p(
      "string",
      '"en"',
      "InputPhone: locale for country display names."
    ),
    onValueChange: p(
      "(value: string | undefined) => void",
      "undefined",
      "InputPhone: receives digits without plus, or undefined."
    ),
    value: p(
      "string | undefined",
      "undefined",
      "InputPhone: international digits without a plus sign."
    ),
  },
  "input-search": {
    clearLabel: p(
      "string",
      '"Clear search"',
      "InputSearch: accessible name for clear action."
    ),
    clearable: p(
      "boolean",
      "false",
      "InputSearch: shows a clear button for nonempty values."
    ),
    label: p("string", "undefined", "InputSearch: visible associated label."),
  },
  "input-secret": {
    copyLabel: p(
      "string",
      '"Copy secret"',
      "InputSecret: accessible copy-action name."
    ),
    label: p("string", "undefined", "InputSecret: visible associated label."),
    readOnly: p(
      "boolean",
      "false",
      "InputSecret: prevents editing but allows showing and copying."
    ),
  },
  popover: {
    align: p(
      '"start" | "center" | "end"',
      '"start"',
      "PopoverContent: alignment relative to trigger."
    ),
    onOpenChange: p(
      "(open: boolean) => void",
      "undefined",
      "Popover: observes open-state changes."
    ),
    open: p("boolean", "uncontrolled", "Popover: controlled open state."),
    side: p(
      '"top" | "right" | "bottom" | "left"',
      '"bottom"',
      "PopoverContent: preferred placement."
    ),
  },
  textarea: {
    label: p("string", "undefined", "TextArea: visible associated label."),
    resize: p(
      "CSS resize",
      "vertical",
      "TextArea: native user resizing is retained."
    ),
    rows: p("number", "browser default", "TextArea: native visible row count."),
  },
};

export const inputPlaygroundCode: Record<string, string> = {
  calendar: `import { Calendar } from "@/components/ui/calendar";\n\n<Calendar mode="single" selected={date} onSelect={setDate} />`,
  "date-picker": `import { DatePicker } from "@/components/ui/date-picker";\n\n<DatePicker label="Appointment date" value={date} onValueChange={setDate} />`,
  "date-range-picker": `import { DateRangePicker } from "@/components/ui/date-range-picker";\n\n<DateRangePicker label="Reporting period" features={["shortcuts"]} />`,
  input: `import { Input } from "@/components/ui/input";\n\n<Input label="Full name" placeholder="Your name" />`,
  "input-amount": `import { InputAmount } from "@/components/ui/input-amount";\n\n<InputAmount aria-label="Amount" prefix="Rp " thousandSeparator="." decimalSeparator="," />`,
  "input-group": `import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";\n\n<InputGroup><InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon><InputGroupInput aria-label="Website" placeholder="example.com" /></InputGroup>`,
  "input-otp": `import { InputOTP } from "@/components/ui/input-otp";\n\n<InputOTP aria-label="Verification code" length={6} onComplete={verifyCode} />`,
  "input-password": `import { InputPassword } from "@/components/ui/input-password";\n\n<InputPassword label="Password" autoComplete="current-password" />`,
  "input-phone": `import { InputPhone } from "@/components/ui/input-phone";\n\n<InputPhone label="Phone number" defaultCountry="ID" onValueChange={console.log} />`,
  "input-search": `import { InputSearch } from "@/components/ui/input-search";\n\n<InputSearch label="Search" placeholder="Search components" clearable />`,
  "input-secret": `import { InputSecret } from "@/components/ui/input-secret";\n\n<InputSecret label="API secret" defaultValue="vnd_live_example" />`,
  popover: `import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";\n\n<Popover><PopoverTrigger>Open popover</PopoverTrigger><PopoverContent>Popover content</PopoverContent></Popover>`,
  textarea: `import { TextArea } from "@/components/ui/textarea";\n\n<TextArea label="Message" placeholder="Write a message" />`,
};
