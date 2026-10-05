"use client";

import { CircleAlertIcon } from "lucide-react";

import { ComponentPlayground } from "@/components/component-playground";
import {
  errorStateProps,
  getErrorStateCode,
  getErrorStateDefaults,
  getErrorStatePreviewProps,
} from "@/lib/error-state-playground";
import type { ErrorStatePlaygroundValues } from "@/lib/error-state-playground";
import { Button } from "@/registry/new-york/button";
import {
  ErrorState,
  ErrorStateActions,
  ErrorStateContent,
  ErrorStateDescription,
  ErrorStateDetails,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "@/registry/new-york/error-state";

export const ErrorStatePreview = ({
  values,
}: {
  values: ErrorStatePlaygroundValues;
}) => (
  <ErrorState {...getErrorStatePreviewProps(values)}>
    {values.showMedia && (
      <ErrorStateMedia>
        <CircleAlertIcon aria-hidden="true" />
      </ErrorStateMedia>
    )}
    <ErrorStateContent>
      <ErrorStateHeader>
        <ErrorStateTitle>{values.title}</ErrorStateTitle>
        <ErrorStateDescription>{values.description}</ErrorStateDescription>
      </ErrorStateHeader>
      {values.showAction && (
        <ErrorStateActions>
          <Button type="button" variant="outline" size="sm">
            Try again
          </Button>
        </ErrorStateActions>
      )}
      {values.showDetails && (
        <ErrorStateDetails>Reference: DEMO-1042</ErrorStateDetails>
      )}
    </ErrorStateContent>
  </ErrorState>
);

export const ErrorStatePlayground = () => (
  <ComponentPlayground
    title="Error State"
    definitions={errorStateProps}
    initialValues={getErrorStateDefaults()}
    getCode={getErrorStateCode}
    hint="Retry is a visual-only demo. Details use an animated Plus/Minus Accordion with a safe example reference. Choose a solid or dashed border. Reset restores settings and closes the disclosure. Button is installed separately."
    renderPreview={(values) => <ErrorStatePreview values={values} />}
  />
);
