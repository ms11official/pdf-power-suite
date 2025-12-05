import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { category: "File", items: [
    { keys: ["Ctrl", "O"], description: "Open file" },
    { keys: ["Ctrl", "S"], description: "Save" },
    { keys: ["Ctrl", "P"], description: "Print" },
    { keys: ["Ctrl", "D"], description: "Download" },
  ]},
  { category: "Edit", items: [
    { keys: ["Ctrl", "Z"], description: "Undo" },
    { keys: ["Ctrl", "Y"], description: "Redo" },
    { keys: ["Delete"], description: "Delete selected" },
    { keys: ["Esc"], description: "Deselect / Select mode" },
  ]},
  { category: "Tools", items: [
    { keys: ["T"], description: "Text tool" },
    { keys: ["H"], description: "Highlight tool" },
  ]},
  { category: "Zoom", items: [
    { keys: ["+"], description: "Zoom in" },
    { keys: ["-"], description: "Zoom out" },
  ]},
  { category: "Navigation", items: [
    { keys: ["Ctrl", "←"], description: "Previous page" },
    { keys: ["Ctrl", "→"], description: "Next page" },
  ]},
  { category: "Help", items: [
    { keys: ["?"], description: "Show shortcuts" },
  ]},
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 mt-2">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-primary mb-2">{section.category}</h3>
              <div className="space-y-1.5">
                {section.items.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
