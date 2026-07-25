import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import type { DialogRoot } from "@base-ui/react/dialog";

// only exit path is Resume or Submit — escape/outside-click are treated as an
// unsafe dismiss and auto-submit instead, so a paused exam can't be walked
// away from silently
export function PauseDialog({
  open,
  onResume,
  onSubmit,
}: {
  open: boolean;
  onResume: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean, eventDetails: DialogRoot.ChangeEventDetails) => {
        if (nextOpen) return;
        eventDetails.cancel();
        if (eventDetails.reason === "escape-key" || eventDetails.reason === "outside-press") {
          onSubmit();
        }
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Exam paused</DialogTitle>
          <DialogDescription>
            Your timer is paused. Resume to keep going, or submit now.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onResume}>
            Close
          </Button>
          <Button variant="default" onClick={onSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
