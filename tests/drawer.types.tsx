import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerPanel,
  useDrawer,
  useDrawerControl,
} from "../registry/new-york/drawer";

// Compile-only checks for ownership and render-function inference.
export const DrawerTypeContracts = () => {
  const control = useDrawerControl();
  const selected = useDrawer(control);
  const valid = (
    <Drawer control={control} onOpenChange={(_, details) => details.cancel()}>
      <DrawerContent>
        {({ close, isOpen }) => (
          <DrawerBody aria-busy={isOpen}>
            <button type="button" onClick={close}>
              Done
            </button>
          </DrawerBody>
        )}
      </DrawerContent>
    </Drawer>
  );
  // @ts-expect-error A controller cannot compete with a controlled open prop.
  const invalidOpen = <Drawer control={control} open />;
  // @ts-expect-error Initial state belongs to the controller-bound root.
  const invalidDefault = <Drawer control={control} defaultOpen />;
  // @ts-expect-error A raw Base UI handle cannot override the controller binding.
  const invalidHandle = <Drawer control={control} handle={null} />;
  const panel = (
    <DrawerPanel
      control={control}
      title="Settings"
      contentProps={{ finalFocus: false }}
    >
      {({ close, isOpen }) => (
        <DrawerBody aria-busy={isOpen}>
          <button type="button" onClick={close}>
            Done
          </button>
        </DrawerBody>
      )}
    </DrawerPanel>
  );
  const triggeredPanel = (
    <DrawerPanel
      title="Settings"
      defaultOpen
      trigger={<button type="button">Open</button>}
    />
  );
  // @ts-expect-error Panel preserves mutually exclusive state ownership.
  const invalidPanel = <DrawerPanel title="Settings" control={control} open />;
  // @ts-expect-error Panel requires an accessible title.
  const missingTitle = <DrawerPanel />;
  // @ts-expect-error Trigger must be an element, not bare text.
  const invalidTrigger = <DrawerPanel title="Settings" trigger="Open" />;
  // @ts-expect-error Controller state is read-only.
  selected.isOpen = false;
  return (
    <>
      {valid}
      {panel}
      {triggeredPanel}
      {invalidPanel}
      {missingTitle}
      {invalidTrigger}
      {invalidOpen}
      {invalidDefault}
      {invalidHandle}
    </>
  );
};
