import { SelectInput } from "../registry/new-york/select";
import type { SelectInputProps } from "../registry/new-york/select";

const data = [
  { label: "Apple", value: "apple" },
  { items: [{ label: "Mango", value: "mango" }], label: "Tropical" },
] as const;

export const inferredSelect = (
  <SelectInput
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
  <SelectInput
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
  <SelectInput data={[{ label: "Zero", value: 0 }]} value={0} />
);

// @ts-expect-error The selected value must come from the data value type.
export const invalidValue = <SelectInput data={data} value="banana" />;
export const invalidMultiple = (
  // @ts-expect-error Multiple selection requires an array.
  <SelectInput data={data} multiple value="apple" />
);
// @ts-expect-error Data is the only label lookup source in the high-level wrapper.
export const duplicateItems = <SelectInput data={data} items={data} />;
export const invalidChildren = (
  // @ts-expect-error Custom composition uses the Select primitives, not wrapper children.
  <SelectInput data={data}>Custom content</SelectInput>
);

export const exportedProps: SelectInputProps<"apple"> = {
  data: [{ label: "Apple", value: "apple" }],
  value: "apple",
};
