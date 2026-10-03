export type PlaygroundValues = Record<string, string | boolean | number>;

export type ControlDefinition =
  | { kind: "text"; initialValue: string; label: string }
  | {
      kind: "select";
      initialValue: string;
      label: string;
      options: readonly string[];
    }
  | { kind: "boolean"; initialValue: boolean; label: string }
  | {
      kind: "range";
      initialValue: number;
      label: string;
      min: number;
      max: number;
      step: number;
      enabledBy?: string;
    };

export interface PropDefinition {
  type: string;
  description: string;
  defaultValue: string;
  control?: ControlDefinition;
}

type Defaults<T extends Record<string, PropDefinition>> = {
  [K in keyof T as T[K] extends { control: ControlDefinition }
    ? K
    : never]: T[K] extends { control: { initialValue: infer V } } ? V : never;
};

export const getPlaygroundDefaults = <T extends Record<string, PropDefinition>>(
  props: T
): Defaults<T> =>
  Object.fromEntries(
    Object.entries(props)
      .filter(([, definition]) => definition.control)
      .map(([name, definition]) => [name, definition.control?.initialValue])
  ) as Defaults<T>;
