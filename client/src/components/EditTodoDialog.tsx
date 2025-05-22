import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function EditTodoDialog({
  isOpen,
  onClose,
  onSave,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: EditTodoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] min-h-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Todo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <label htmlFor="title" className="text-lg font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter todo title"
              className="h-12 text-lg p-4"
            />
          </div>
          <div className="grid gap-3">
            <label htmlFor="description" className="text-lg font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter todo description"
              className="min-h-[200px] w-full rounded-md border border-input bg-background px-4 py-3 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>
        <DialogFooter className="gap-4">
          <Button variant="outline" onClick={onClose} className="h-12 px-8 text-lg">
            Cancel
          </Button>
          <Button onClick={onSave} className="h-12 px-8 text-lg">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 