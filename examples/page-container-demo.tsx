import { PageContainer } from "@/registry/new-york/page-container";

export const PageContainerDemo = () => (
  <PageContainer>
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-medium">Workspace</h3>
      <p className="text-sm text-muted-foreground">
        Centered content with responsive page gutters.
      </p>
    </div>
  </PageContainer>
);
