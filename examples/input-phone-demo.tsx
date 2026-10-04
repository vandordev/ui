"use client";

import { useState } from "react";

import { InputPhone } from "@/registry/new-york/input-phone";

export function InputPhoneDemo() {
  const [phone, setPhone] = useState<string>();
  return (
    <div className="grid max-w-sm gap-2">
      <InputPhone
        label="Phone number"
        defaultCountry="ID"
        value={phone}
        onValueChange={setPhone}
      />
      <output className="text-sm text-muted-foreground">
        International digits (without +): {phone ?? "empty"}
      </output>
    </div>
  );
}
