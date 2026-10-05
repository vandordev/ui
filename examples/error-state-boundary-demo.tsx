"use client";

import { CircleAlertIcon } from "lucide-react";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

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

const ProjectPreview = ({
  fail,
  onFail,
}: {
  fail: boolean;
  onFail: () => void;
}) => {
  if (fail) {
    throw new Error("Intentional demo failure");
  }
  return (
    <div className="flex flex-col items-center gap-3 text-sm">
      <p role="status">Project preview is ready.</p>
      <Button type="button" variant="outline" size="sm" onClick={onFail}>
        Simulate render error
      </Button>
    </div>
  );
};

export const ErrorStateBoundaryDemo = () => {
  const [fail, setFail] = useState(false);
  return (
    <ErrorBoundary
      onReset={() => setFail(false)}
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorState>
          <ErrorStateMedia>
            <CircleAlertIcon aria-hidden="true" />
          </ErrorStateMedia>
          <ErrorStateContent>
            <ErrorStateHeader>
              <ErrorStateTitle>Unable to display this preview</ErrorStateTitle>
              <ErrorStateDescription>
                Try again to reset the preview. The rest of the page is still
                available.
              </ErrorStateDescription>
            </ErrorStateHeader>
            <ErrorStateActions>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetErrorBoundary}
              >
                Try again
              </Button>
            </ErrorStateActions>
          </ErrorStateContent>
        </ErrorState>
      )}
    >
      <ProjectPreview fail={fail} onFail={() => setFail(true)} />
    </ErrorBoundary>
  );
};
