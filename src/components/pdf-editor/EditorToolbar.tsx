import { 
  MousePointer2, 
  Type, 
  Highlighter, 
  MessageSquare,
  Image,
  Shapes,
  PenLine,
  Eraser,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Trash2,
  Undo,
  Redo
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ToolbarItem {
  id: string;
  icon: React.ElementType;
  label: string;
  group?: string;
}

const tools: ToolbarItem[] = [
  { id: "select", icon: MousePointer2, label: "Select", group: "primary" },
  { id: "text", icon: Type, label: "Add Text", group: "primary" },
  { id: "highlight", icon: Highlighter, label: "Highlight", group: "primary" },
  { id: "comment", icon: MessageSquare, label: "Comment", group: "primary" },
  { id: "image", icon: Image, label: "Add Image", group: "primary" },
  { id: "shapes", icon: Shapes, label: "Shapes", group: "primary" },
  { id: "draw", icon: PenLine, label: "Draw", group: "primary" },
  { id: "eraser", icon: Eraser, label: "Eraser", group: "primary" },
];

const formatTools: ToolbarItem[] = [
  { id: "bold", icon: Bold, label: "Bold" },
  { id: "italic", icon: Italic, label: "Italic" },
  { id: "underline", icon: Underline, label: "Underline" },
];

const alignTools: ToolbarItem[] = [
  { id: "align-left", icon: AlignLeft, label: "Align Left" },
  { id: "align-center", icon: AlignCenter, label: "Align Center" },
  { id: "align-right", icon: AlignRight, label: "Align Right" },
  { id: "align-justify", icon: AlignJustify, label: "Justify" },
];

const actionTools: ToolbarItem[] = [
  { id: "link", icon: Link, label: "Add Link" },
  { id: "delete", icon: Trash2, label: "Delete" },
];

interface EditorToolbarProps {
  activeTool: string;
  onToolClick: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function ToolButton({ 
  tool, 
  isActive, 
  onClick 
}: { 
  tool: ToolbarItem; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "toolbar-btn",
            isActive && "toolbar-btn-active"
          )}
        >
          <tool.icon className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p>{tool.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar({ 
  activeTool, 
  onToolClick,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: EditorToolbarProps) {
  return (
    <div className="h-10 bg-toolbar border-b border-border px-2 flex items-center gap-1">
      {/* History */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={onUndo}
              disabled={!canUndo}
              className="toolbar-btn disabled:opacity-40"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Undo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={onRedo}
              disabled={!canRedo}
              className="toolbar-btn disabled:opacity-40"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Redo</TooltipContent>
        </Tooltip>
      </div>
      
      <Separator orientation="vertical" className="h-5 mx-1" />
      
      {/* Primary Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-5 mx-1" />
      
      {/* Format Tools */}
      <div className="flex items-center gap-0.5">
        {formatTools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-5 mx-1" />
      
      {/* Align Tools */}
      <div className="flex items-center gap-0.5">
        {alignTools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-5 mx-1" />
      
      {/* Action Tools */}
      <div className="flex items-center gap-0.5">
        {actionTools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
    </div>
  );
}
