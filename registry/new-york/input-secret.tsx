import { Copy, Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import { Input } from "./input";
import type { InputProps } from "./input";

export type InputSecretProps = Omit<InputProps, "icon" | "type"> & {
  copyLabel?: string;
  copiedLabel?: string;
  emptyLabel?: string;
  unavailableLabel?: string;
  errorLabel?: string;
};

export function InputSecret({
  className,
  copyLabel = "Copy secret",
  copiedLabel = "Secret copied.",
  emptyLabel = "Secret is empty.",
  unavailableLabel = "Clipboard is unavailable.",
  errorLabel = "Unable to copy secret.",
  disabled,
  readOnly,
  onChange,
  ...props
}: InputSecretProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [status, setStatus] = React.useState("");

  async function copySecret() {
    const secret = inputRef.current?.value;
    if (!secret) {
      setStatus(emptyLabel);
      return;
    }
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        setStatus(unavailableLabel);
        return;
      }
      await navigator.clipboard.writeText(secret);
      setStatus(copiedLabel);
    } catch {
      setStatus(errorLabel);
    }
  }

  return (
    <div data-slot="secret-input" className="relative min-w-0">
      <Input
        {...props}
        ref={inputRef}
        type={visible ? "text" : "password"}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(event) => {
          setStatus("");
          onChange?.(event);
        }}
        className={["pr-20", className].filter(Boolean).join(" ")}
      />
      <div className="absolute top-1/2 right-1 z-10 flex -translate-y-1/2 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label={visible ? "Hide secret" : "Show secret"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label={copyLabel}
          onClick={copySecret}
        >
          <Copy aria-hidden="true" />
        </Button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
