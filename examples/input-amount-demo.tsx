"use client";

import { useState } from "react";

import { InputAmount } from "@/registry/new-york/input-amount";

export function InputAmountDemo() {
  const [amount, setAmount] = useState("1250000.50");
  return (
    <div className="grid max-w-sm gap-2">
      <InputAmount
        aria-label="Amount in Rupiah"
        value={amount}
        onValueChange={setAmount}
        prefix="Rp "
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
      />
      <output className="text-sm text-muted-foreground">
        Raw decimal value: {amount}
      </output>
    </div>
  );
}
