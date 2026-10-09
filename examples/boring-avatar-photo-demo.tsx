"use client";

import { useState } from "react";

import { BoringAvatar } from "@/registry/new-york/boring-avatar";
import { Button } from "@/registry/new-york/button";

const photo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23d9e4d5'/%3E%3Ccircle cx='50' cy='50' r='25' fill='%23596d51'/%3E%3C/svg%3E";
const sources = {
  failed: "data:image/png;base64,invalid",
  generated: undefined,
  photo,
};

export const BoringAvatarPhotoDemo = () => {
  const [mode, setMode] = useState<keyof typeof sources>("generated");
  return (
    <div className="flex flex-col items-center gap-4">
      <BoringAvatar name="vandor" alt="Vandor" src={sources[mode]} size={80} />
      <div
        className="flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Photo scenario"
      >
        {(["generated", "photo", "failed"] as const).map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
          >
            {
              { failed: "Failed photo", generated: "No photo", photo: "Photo" }[
                value
              ]
            }
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground" role="status">
        {mode === "photo"
          ? "Photo replaces the generated avatar once loaded."
          : "The generated avatar is the fallback."}
      </p>
    </div>
  );
};
