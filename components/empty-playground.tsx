"use client";

import { FolderIcon } from "lucide-react";
import Link from "next/link";

import { ComponentPlayground } from "@/components/component-playground";
import {
  emptyProps,
  getEmptyCode,
  getEmptyDefaults,
  getEmptyPreviewProps,
} from "@/lib/empty-playground";
import type { EmptyPlaygroundValues } from "@/lib/empty-playground";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/new-york/empty";

export const EmptyPreview = ({ values }: { values: EmptyPlaygroundValues }) => {
  const props = getEmptyPreviewProps(values);
  return (
    <Empty {...props.root}>
      <EmptyHeader>
        {values.showMedia && (
          <EmptyMedia {...props.media}>
            <FolderIcon aria-hidden="true" />
          </EmptyMedia>
        )}
        <EmptyTitle>{values.title}</EmptyTitle>
        <EmptyDescription>{values.description}</EmptyDescription>
      </EmptyHeader>
      {values.showAction && (
        <EmptyContent>
          <Link
            href="/docs/components"
            className="rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
          >
            Explore components
          </Link>
        </EmptyContent>
      )}
    </Empty>
  );
};

export const EmptyPlayground = () => (
  <ComponentPlayground
    title="Empty"
    definitions={emptyProps}
    initialValues={getEmptyDefaults()}
    getCode={getEmptyCode}
    hint="Media, action, and outline controls compose children and classes, not extra Empty props. Reset restores all settings. Replace the demo link destination in your app."
    renderPreview={(values) => <EmptyPreview values={values} />}
  />
);
