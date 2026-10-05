"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Checkbox renders a native input inside the enclosing label. */

import { useState } from "react";

import { Button } from "@/registry/new-york/button";
import { Checkbox } from "@/registry/new-york/checkbox";

export const CheckboxForm = () => {
  const [checked, setChecked] = useState(true);
  const [result, setResult] = useState("Submit to inspect the form value.");
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setResult(
          `updates: ${new FormData(event.currentTarget).get("updates") ?? "omitted"}`
        );
      }}
      onReset={() => {
        setChecked(true);
        setResult("Submit to inspect the form value.");
      }}
    >
      <label className="flex items-center gap-3 text-sm">
        <Checkbox
          name="updates"
          value="weekly"
          checked={checked}
          onCheckedChange={setChecked}
        />
        Weekly updates
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Submit
        </Button>
        <Button type="reset" variant="outline" size="sm">
          Reset
        </Button>
      </div>
      <output className="text-xs text-muted-foreground" aria-live="polite">
        {result}
      </output>
    </form>
  );
};
