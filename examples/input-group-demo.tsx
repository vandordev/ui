import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/new-york/input-group";

export const InputGroupDemo = () => (
  <InputGroup className="max-w-sm">
    <InputGroupAddon>
      <InputGroupText>https://</InputGroupText>
    </InputGroupAddon>
    <InputGroupInput label="Website domain" placeholder="example.com" />
  </InputGroup>
);
