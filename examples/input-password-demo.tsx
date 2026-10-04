import { InputPassword } from "@/registry/new-york/input-password";

export const InputPasswordDemo = () => (
  <div className="grid max-w-sm gap-4">
    <InputPassword label="Current password" autoComplete="current-password" />
    <InputPassword label="New password" autoComplete="new-password" />
  </div>
);
