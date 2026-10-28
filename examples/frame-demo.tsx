import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/registry/new-york/frame";

export const FrameDemo = () => (
  <Frame className="w-full max-w-sm">
    <FrameHeader>
      <FrameTitle>Workspace</FrameTitle>
      <FrameDescription>Your deployment environments.</FrameDescription>
    </FrameHeader>
    <FramePanel>
      <h4 className="text-sm font-medium">Production</h4>
      <p className="text-sm text-muted-foreground">All systems operational.</p>
    </FramePanel>
    <FramePanel>
      <h4 className="text-sm font-medium">Preview</h4>
      <p className="text-sm text-muted-foreground">Ready for review.</p>
    </FramePanel>
    <FrameFooter>Updated just now</FrameFooter>
  </Frame>
);
