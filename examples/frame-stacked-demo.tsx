import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/registry/new-york/frame";

export const FrameStackedDemo = () => (
  <Frame stacked dense spacing="sm" className="w-full max-w-sm">
    <FrameHeader>
      <FrameTitle>Recent activity</FrameTitle>
      <FrameDescription>Connected panels with compact chrome.</FrameDescription>
    </FrameHeader>
    <FramePanel>
      <p className="text-sm">Deployment completed</p>
    </FramePanel>
    <FramePanel>
      <p className="text-sm">Health checks passed</p>
    </FramePanel>
    <FramePanel>
      <p className="text-sm">Preview published</p>
    </FramePanel>
    <FrameFooter>Showing the latest three events</FrameFooter>
  </Frame>
);
