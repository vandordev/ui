import { InputSearch } from "@/registry/new-york/input-search";

export function InputSearchDemo() {
  return (
    <InputSearch
      label="Search components"
      placeholder="Try ‘calendar’"
      clearable
      defaultValue="input"
      className="max-w-sm"
    />
  );
}
