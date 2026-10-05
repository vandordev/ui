"use client";

import { useState } from "react";

import { Dropdown } from "@/registry/new-york/dropdown";

export const DropdownAsyncDemo = () => {
  const [fail, setFail] = useState(false);
  const [status, setStatus] = useState("No request sent.");
  return (
    <div className="flex flex-col items-center gap-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={fail}
          onChange={(event) => setFail(event.target.checked)}
        />
        Simulate request failure
      </label>
      <Dropdown
        trigger={
          <button
            type="button"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            Account actions
          </button>
        }
        items={[
          {
            id: "profile",
            label: "View profile",
            onSelect: () => setStatus("Profile selected."),
          },
          {
            id: "logout",
            label: "Logout (simulation)",
            variant: "destructive",
            closeOnSelect: "success",
            onSelect: async () => {
              setStatus("Sending simulated request…");
              // eslint-disable-next-line promise/avoid-new
              await new Promise<void>((resolve) => setTimeout(resolve, 800));
              if (fail) {
                throw new Error("Simulated request failed. Try again.");
              }
              setStatus("Simulated logout succeeded. No session was changed.");
            },
            onSelectError: (error) =>
              setStatus(
                error instanceof Error ? error.message : "Request failed."
              ),
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
};
