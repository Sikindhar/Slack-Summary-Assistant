import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditTodoDialogProps {
  todo: {
    title: string;
    description: string;
  };
  onUpdate: () => void;
  onCancel: () => void;
  onChange: (field: 'title' | 'description', value: string) => void;
}

export function EditTodoDialog({ todo, onUpdate, onCancel, onChange }: EditTodoDialogProps) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Todo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Title"
            value={todo.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
          <Input
            placeholder="Description"
            value={todo.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onUpdate}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 