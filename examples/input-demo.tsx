import { Input } from "@/registry/new-york/input";

export const InputDemo = () => (
  <div className="grid max-w-sm gap-4">
    <Input label="Your name" placeholder="Ada Lovelace" />
    <Input label="Work email" labelStyle="static" type="email" required />
  </div>
);
