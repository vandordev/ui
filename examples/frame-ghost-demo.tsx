import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/registry/new-york/frame";

export const FrameGhostDemo = () => (
  <Frame
    variant="ghost"
    className="min-h-64 w-full max-w-sm [--frame-radius:var(--radius-lg)]"
  >
    <FrameHeader>
      <FrameTitle>Release notes</FrameTitle>
      <FrameDescription>
        No outer border, custom concentric corners.
      </FrameDescription>
    </FrameHeader>
    <FramePanel fit>
      <p className="text-sm">
        This panel keeps its content height instead of filling the frame.
      </p>
    </FramePanel>
  </Frame>
);
