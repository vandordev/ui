import { createRef } from "react";

import { PageHeader } from "@/registry/new-york/page-header";

const headerRef = createRef<HTMLElement>();

export const NativeHeader = () => (
  <PageHeader
    title="Settings"
    description={<p>Workspace configuration.</p>}
    breadcrumb={<nav aria-label="Breadcrumb">Workspace</nav>}
    status={0}
    actions={<button type="button">Save</button>}
    id="settings-header"
    ref={headerRef}
    onClick={(event) => event.currentTarget.getAttribute("id")}
  />
);

// @ts-expect-error A primary page title is required.
export const MissingTitle = <PageHeader />;

export const UnsupportedChildren = (
  // @ts-expect-error Named slots replace native children.
  <PageHeader title="Settings">Content</PageHeader>
);

// @ts-expect-error The title is heading text, not arbitrary rich content.
export const RichTitle = <PageHeader title={<span>Settings</span>} />;
