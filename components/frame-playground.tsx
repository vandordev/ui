"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  frameProps,
  getFrameCode,
  getFrameDefaults,
} from "@/lib/frame-playground";
import type { FramePlaygroundValues } from "@/lib/frame-playground";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/registry/new-york/frame";

export const FramePreview = ({ values }: { values: FramePlaygroundValues }) => (
  <Frame
    className="min-h-80 w-full max-w-md"
    variant={values.variant}
    spacing={values.spacing}
    stacked={values.stacked}
    dense={values.dense}
  >
    <FrameHeader>
      <FrameTitle>{values.title}</FrameTitle>
      {values.description ? (
        <FrameDescription>{values.description}</FrameDescription>
      ) : null}
    </FrameHeader>
    <FramePanel fit={values.fit}>
      <h4 className="text-sm font-medium">Deployment</h4>
      <p className="text-sm text-muted-foreground">Production is up to date.</p>
    </FramePanel>
    <FramePanel fit={values.fit}>
      <h4 className="text-sm font-medium">Preview</h4>
      <p className="text-sm text-muted-foreground">
        Changes are ready for review.
      </p>
    </FramePanel>
    <FrameFooter>Last synced just now</FrameFooter>
  </Frame>
);

export const FramePlayground = () => (
  <ComponentPlayground
    title="Frame"
    definitions={frameProps}
    initialValues={getFrameDefaults()}
    getCode={getFrameCode}
    renderPreview={(values) => <FramePreview values={values} />}
    hint="Stacked joins adjacent direct panels. Dense removes outer spacing, not panel padding. Fit keeps panels at their content height. Reset restores all controls; there is no transient state."
  />
);
