import { InputPassword } from "@/registry/new-york/input-password";

export function InputPasswordDemo() {
  return (
    <div className="grid max-w-sm gap-4">
      <InputPassword label="Current password" autoComplete="current-password" />
      <InputPassword label="New password" autoComplete="new-password" />
    </div>
  );
}
