import { InputSecret } from "@/registry/new-york/input-secret";

export function InputSecretDemo() {
  return (
    <InputSecret
      label="API secret"
      defaultValue="vnd_test_example_secret"
      className="max-w-sm"
    />
  );
}
