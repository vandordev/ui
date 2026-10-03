import {
  Drawer,
  DrawerBody,
  DrawerContent,
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
  // @ts-expect-error Controller state is read-only.
  selected.isOpen = false;
  return (
    <>
      {valid}
      {invalidOpen}
      {invalidDefault}
      {invalidHandle}
    </>
  );
};
