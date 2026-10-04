import {
  Drawer,
  DrawerBody,
  useDrawer,
  useDrawerControl,
} from "../registry/new-york/drawer";

export const DrawerTypeContracts = () => {
  const control = useDrawerControl();
  const selected = useDrawer(control);
  const valid = (
    <Drawer
      control={control}
      title="Settings"
      renderHeader={({ title, description }) => (
        <>
          {description}
          {title}
        </>
      )}
      contentProps={{ finalFocus: false }}
      onOpenChange={(_, details) => details.cancel()}
    >
      {({ close, isOpen }) => (
        <DrawerBody aria-busy={isOpen}>
          <button type="button" onClick={close}>
            Done
          </button>
        </DrawerBody>
      )}
    </Drawer>
  );
  const triggered = (
    <Drawer
      title="Settings"
      defaultOpen
      trigger={<button type="button">Open</button>}
    />
  );
  // @ts-expect-error A controller cannot compete with controlled state.
  const invalidOpen = <Drawer title="Settings" control={control} open />;
  const invalidDefault = (
    // @ts-expect-error Initial state belongs to the controller-bound root.
    <Drawer title="Settings" control={control} defaultOpen />
  );
  const invalidHandle = (
    // @ts-expect-error A raw handle cannot override the controller binding.
    <Drawer title="Settings" control={control} handle={null} />
  );
  // @ts-expect-error Drawer requires an accessible title.
  const missingTitle = <Drawer />;
  // @ts-expect-error Trigger must be an element, not bare text.
  const invalidTrigger = <Drawer title="Settings" trigger="Open" />;
  const conflictingChildren = (
    // @ts-expect-error Children belong to Drawer, not contentProps.
    <Drawer title="Settings" contentProps={{ children: "Wrong" }} />
  );
  // @ts-expect-error Controller state is read-only.
  selected.isOpen = false;
  return (
    <>
      {valid}
      {triggered}
      {invalidOpen}
      {invalidDefault}
      {invalidHandle}
      {missingTitle}
      {invalidTrigger}
      {conflictingChildren}
    </>
  );
};
