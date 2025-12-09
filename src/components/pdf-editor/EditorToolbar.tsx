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
  Redo,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { ColorPicker } from "./ColorPicker";
import { FontControls } from "./FontControls";
import { StrokeWidthSlider } from "./StrokeWidthSlider";

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
  activeColor: string;
  fontSize: number;
  fontFamily: string;
  strokeWidth: number;
  onToolClick: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onStrokeWidthChange: (width: number) => void;
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
  activeColor,
  fontSize,
  fontFamily,
  strokeWidth,
  onToolClick,
  onUndo,
  onRedo,
  onDownload,
  onColorChange,
  onFontSizeChange,
  onFontFamilyChange,
  onStrokeWidthChange,
  canUndo,
  canRedo
}: EditorToolbarProps) {
  return (
    <div className="h-10 bg-toolbar border-b border-border px-2 flex items-center justify-between gap-1 overflow-x-auto">
      {/* History */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
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
      
      <Separator orientation="vertical" className="h-5 mx-1 flex-shrink-0" />
      
      {/* Primary Tools */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-5 mx-1 flex-shrink-0" />
      
      {/* Color Picker */}
      <ColorPicker color={activeColor} onChange={onColorChange} />
      
      {/* Stroke Width Slider */}
      <StrokeWidthSlider strokeWidth={strokeWidth} onStrokeWidthChange={onStrokeWidthChange} />
      
      <Separator orientation="vertical" className="h-5 mx-1 flex-shrink-0" />
      
      {/* Font Controls */}
      <FontControls
        fontSize={fontSize}
        fontFamily={fontFamily}
        onFontSizeChange={onFontSizeChange}
        onFontFamilyChange={onFontFamilyChange}
      />
      
      <Separator orientation="vertical" className="h-5 mx-1 flex-shrink-0" />
      
      {/* Format Tools */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {formatTools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-5 mx-1 flex-shrink-0" />
      
      {/* Align Tools */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {alignTools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-5 mx-1 flex-shrink-0" />
      
      {/* Action Tools */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {actionTools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Download Button */}
      <button
        onClick={onDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download</span>
      </button>
    </div>
  );
}
