"use client";

import { Button } from "@/registry/new-york/button";
import { Dialog } from "@/registry/new-york/dialog";
import { Drawer } from "@/registry/new-york/drawer";
import { toast } from "@/registry/new-york/toast";

const notify = () =>
  toast.action("Draft ready", {
    actionLabel: "Confirm",
    actionOnClick: () => toast.success("Draft confirmed"),
    description: "This notification remains interactive above the modal.",
  });

export const ToastOverlayDemo = () => (
  <div className="flex flex-wrap justify-center gap-2">
    <Button variant="outline" onClick={notify}>
      Notify first
    </Button>
    <Dialog
      title="Toast above Dialog"
      trigger={<Button>Open Dialog</Button>}
      contentProps={{ keepMounted: true }}
    >
      <div className="p-4">
        <Button onClick={notify}>Notify inside Dialog</Button>
      </div>
    </Dialog>
    <Drawer
      title="Toast above Drawer"
      trigger={<Button>Open Drawer</Button>}
      contentProps={{ keepMounted: true }}
    >
      <div className="p-4">
        <Button onClick={notify}>Notify inside Drawer</Button>
      </div>
    </Drawer>
  </div>
);
