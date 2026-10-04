import { Select } from "../registry/new-york/select";
import type { SelectProps } from "../registry/new-york/select";

const data = [
  { label: "Apple", value: "apple" },
  { items: [{ label: "Mango", value: "mango" }], label: "Tropical" },
] as const;

export const inferredSelect = (
  <Select
    data={data}
    value="mango"
    onValueChange={(value) => {
      const selected: "apple" | "mango" | null = value;
      return selected;
    }}
    triggerProps={{ "aria-describedby": "help", ref: { current: null } }}
    contentProps={{ align: "end", side: "top" }}
    renderItem={(item) => item.label}
  />
);

export const multipleSelect = (
  <Select
    data={data}
    multiple
    value={["apple"]}
    onValueChange={(value) => {
      const selected: ("apple" | "mango")[] = value;
      return selected;
    }}
  />
);

export const numericSelect = (
  <Select data={[{ label: "Zero", value: 0 }]} value={0} />
);

// @ts-expect-error The selected value must come from the data value type.
export const invalidValue = <Select data={data} value="banana" />;
export const invalidMultiple = (
  // @ts-expect-error Multiple selection requires an array.
  <Select data={data} multiple value="apple" />
);
// @ts-expect-error Data is the only label lookup source in the high-level wrapper.
export const duplicateItems = <Select data={data} items={data} />;
export const invalidChildren = (
  // @ts-expect-error Custom composition uses the Select primitives, not wrapper children.
  <Select data={data}>Custom content</Select>
);

export const exportedProps: SelectProps<"apple"> = {
  data: [{ label: "Apple", value: "apple" }],
  value: "apple",
};

export const customTrigger = (
  <Select
    data={data}
    trigger={({ value, selectedLabel, placeholder, open, disabled }) => {
      const selected: "apple" | "mango" | null = value;
      return (
        <button disabled={disabled} data-open={open} data-value={selected}>
          {selectedLabel ?? placeholder}
        </button>
      );
    }}
  />
);

export const customMultipleTrigger = (
  <Select
    data={data}
    multiple
    trigger={({ value }) => {
      const selected: ("apple" | "mango")[] = value;
      return <button>{selected.join(", ")}</button>;
    }}
  />
);

export const optionMetadata = (
  <Select
    data={[{ avatar: "/alice.png", label: "Alice", value: "alice" }]}
    renderItem={(item) => <span data-avatar={item.avatar}>{item.label}</span>}
  />
);

export const invalidTrigger = (
  // @ts-expect-error Trigger callbacks must return an element to receive native props and ref.
  <Select data={data} trigger={() => "Not an element"} />
);

export const conflictingTrigger = (
  // @ts-expect-error Use trigger instead of a competing primitive render prop.
  <Select data={data} triggerProps={{ render: <button /> }} />
);
