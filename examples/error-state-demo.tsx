"use client";

import { CircleAlertIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/new-york/button";
import {
  ErrorState,
  ErrorStateActions,
  ErrorStateContent,
  ErrorStateDescription,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "@/registry/new-york/error-state";

export const ErrorStateDemo = () => {
  const [failed, setFailed] = useState(true);
  if (!failed) {
    return (
      <div className="flex flex-col items-center gap-3 text-sm">
        <p role="status">Project preview is ready.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFailed(true)}
        >
          Show error again
        </Button>
      </div>
    );
  }
  return (
    <ErrorState>
      <ErrorStateMedia>
        <CircleAlertIcon aria-hidden="true" />
      </ErrorStateMedia>
      <ErrorStateContent>
        <ErrorStateHeader>
          <ErrorStateTitle>Unable to load projects</ErrorStateTitle>
          <ErrorStateDescription>
            Check your connection and try again.
          </ErrorStateDescription>
        </ErrorStateHeader>
        <ErrorStateActions>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFailed(false)}
          >
            Try again
          </Button>
        </ErrorStateActions>
      </ErrorStateContent>
    </ErrorState>
  );
};
