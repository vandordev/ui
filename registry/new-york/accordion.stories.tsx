import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

interface Args {
  disabled: boolean;
  multiple: boolean;
  iconStyle: "chevron" | "plus-minus" | "plus-rotate" | "none";
}

const meta = {
  argTypes: {
    disabled: { control: "boolean" },
    iconStyle: {
      control: "select",
      options: ["chevron", "plus-minus", "plus-rotate", "none"],
    },
    multiple: { control: "boolean" },
  },
  args: { disabled: false, iconStyle: "chevron", multiple: false },
  parameters: { layout: "centered" },
  render: ({ disabled, iconStyle, multiple }) => (
    <Accordion
      disabled={disabled}
      multiple={multiple}
      className="w-80 max-w-full"
      defaultValue={["details"]}
    >
      {[
        {
          content: "Reference: DEMO-1042",
          title: "Technical details",
          value: "details",
        },
        {
          content: "Check your connection and try again.",
          title: "Recovery options",
          value: "recovery",
        },
      ].map(({ value, title, content }) => (
        <AccordionItem value={value} key={value}>
          <AccordionTrigger
            icon={
              {
                chevron: <ChevronDownIcon />,
                none: null,
                "plus-minus": <PlusIcon />,
                "plus-rotate": <PlusIcon />,
              }[iconStyle]
            }
            expandedIcon={
              iconStyle === "plus-minus" ? <MinusIcon /> : undefined
            }
            iconRotation={iconStyle === "plus-rotate" ? 45 : 180}
          >
            {title}
          </AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  title: "Vandor UI/Accordion",
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const PlusMinus: Story = { args: { iconStyle: "plus-minus" } };
export const RotatingPlus: Story = { args: { iconStyle: "plus-rotate" } };
export const WithoutIcon: Story = { args: { iconStyle: "none" } };
export const Disabled: Story = { args: { disabled: true } };
export const Multiple: Story = { args: { multiple: true } };
