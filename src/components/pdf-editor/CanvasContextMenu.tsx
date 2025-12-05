import { useEffect, useRef } from "react";
import { 
  Copy, 
  Clipboard, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  FlipVertical2,
  RotateCw
} from "lucide-react";

interface ContextMenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  divider?: boolean;
}

const menuItems: ContextMenuItem[] = [
  { id: "copy", icon: Copy, label: "Copy", shortcut: "Ctrl+C" },
  { id: "paste", icon: Clipboard, label: "Paste", shortcut: "Ctrl+V" },
  { id: "delete", icon: Trash2, label: "Delete", shortcut: "Del", divider: true },
  { id: "bring-front", icon: ArrowUp, label: "Bring to Front" },
  { id: "send-back", icon: ArrowDown, label: "Send to Back", divider: true },
  { id: "flip-horizontal", icon: FlipVertical2, label: "Flip Horizontal" },
  { id: "rotate", icon: RotateCw, label: "Rotate 90°" },
];

interface CanvasContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onAction: (actionId: string) => void;
  hasSelection: boolean;
}

export function CanvasContextMenu({ 
  x, 
  y, 
  visible, 
  onClose, 
  onAction,
  hasSelection 
}: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, idx) => (
        <div key={item.id}>
          <button
            onClick={() => {
              onAction(item.id);
              onClose();
            }}
            disabled={!hasSelection && item.id !== "paste"}
            className="w-full px-3 py-1.5 text-xs flex items-center justify-between hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="flex items-center gap-2">
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </span>
            {item.shortcut && (
              <span className="text-muted-foreground text-[10px]">{item.shortcut}</span>
            )}
          </button>
          {item.divider && idx < menuItems.length - 1 && (
            <div className="my-1 border-t border-border" />
          )}
        </div>
      ))}
    </div>
  );
}
