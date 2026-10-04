"use client";

import { useState } from "react";

import { InputOTP } from "@/registry/new-york/input-otp";

export function InputOTPDemo() {
  const [code, setCode] = useState("");
  return (
    <div className="grid justify-items-center gap-2">
      <InputOTP
        aria-label="Verification code"
        length={6}
        value={code}
        onValueChange={setCode}
        onComplete={(value) => console.info("Code ready", value.length)}
      />
      <span className="text-sm text-muted-foreground">
        {code.length}/6 characters
      </span>
    </div>
  );
}
