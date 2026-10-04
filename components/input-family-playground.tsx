"use client";

import * as React from "react";

import { Calendar } from "@/registry/new-york/calendar";
import { DatePicker } from "@/registry/new-york/date-picker";
import type { DatePickerProps } from "@/registry/new-york/date-picker";
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

export function InputFamilyPlayground({ component }: { component: string }) {
  const [phone, setPhone] = React.useState<string>();
  const [otp, setOtp] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>();
  const [open, setOpen] = React.useState(false);

  const previews: Record<string, React.ReactNode> = {
    calendar: <Calendar mode="single" selected={date} onSelect={setDate} />,
    "date-picker": (
      <DatePicker
        label="Appointment date"
        value={date}
        onValueChange={setDate}
      />
    ),
    "date-range-picker": (
      <DateRangePicker label="Reporting period" features={["shortcuts"]} />
    ),
    input: <Input label="Full name" placeholder="Your name" />,
    "input-amount": (
      <InputAmount
        aria-label="Amount in Rupiah"
        thousandSeparator="."
        decimalSeparator=","
        prefix="Rp "
        defaultValue="1250000.50"
      />
    ),
    "input-group": (
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Website" placeholder="example.com" />
      </InputGroup>
    ),
    "input-otp": (
      <InputOTP
        aria-label="Verification code"
        length={6}
        value={otp}
        onValueChange={setOtp}
      />
    ),
    "input-password": (
      <InputPassword label="Password" autoComplete="current-password" />
    ),
    "input-phone": (
      <InputPhone label="Phone number" value={phone} onValueChange={setPhone} />
    ),
    "input-search": (
      <InputSearch
        label="Search"
        placeholder="Search components"
        clearable
        defaultValue="Calendar"
      />
    ),
    "input-secret": (
      <InputSecret label="API secret" defaultValue="vnd_live_example_secret" />
    ),
    popover: (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="h-9 rounded-md border px-3 text-sm">
          {open ? "Popover open" : "Open popover"}
        </PopoverTrigger>
        <PopoverContent>
          Popover content stays aligned to its trigger.
        </PopoverContent>
      </Popover>
    ),
    textarea: <TextArea label="Message" placeholder="Write a message…" />,
  };

  return (
    <div className="flex min-h-20 w-full max-w-xl items-center justify-center p-4">
      {previews[component] ?? (
        <div className="text-sm text-muted-foreground">
          No preview available.
        </div>
      )}
    </div>
  );
}

export type { DatePickerProps };
