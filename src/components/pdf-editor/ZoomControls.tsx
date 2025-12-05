import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  FolderOpen, 
  Save, 
  Printer,
  Undo,
  Redo,
  HelpCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToPage: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onPrint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedTool: string;
  fileName: string | null;
  currentPage: number;
  totalPages: number;
  onShowShortcuts: () => void;
}

export function ZoomControls({ 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onFitToPage,
  onOpenFile,
  onSave,
  onPrint,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedTool,
  fileName,
  currentPage,
  totalPages,
  onShowShortcuts
}: ZoomControlsProps) {
  return (
    <div className="h-9 bg-toolbar border-t border-border px-2 flex items-center justify-between">
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onOpenFile} className="toolbar-btn">
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Open File</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onSave} className="toolbar-btn">
              <Save className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Save</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onPrint} className="toolbar-btn">
              <Printer className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Print</TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={onUndo} 
              disabled={!canUndo}
              className={cn("toolbar-btn", !canUndo && "opacity-40 cursor-not-allowed")}
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Undo</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={onRedo} 
              disabled={!canRedo}
              className={cn("toolbar-btn", !canRedo && "opacity-40 cursor-not-allowed")}
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Redo</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onZoomOut} className="toolbar-btn">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Zoom Out</TooltipContent>
        </Tooltip>
        
        <span className="text-xs font-medium text-foreground min-w-[40px] text-center">
          {zoom}%
        </span>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onZoomIn} className="toolbar-btn">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Zoom In</TooltipContent>
        </Tooltip>
        
        <Separator orientation="vertical" className="h-4 mx-1" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onFitToPage} className="toolbar-btn">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Fit to Page</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Selected Tool indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md">
          <span className="text-xs font-medium text-primary capitalize">{selectedTool}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {fileName && (
          <>
            <span className="truncate max-w-[120px]">{fileName}</span>
            <span>/</span>
          </>
        )}
        <span className="font-medium text-foreground">
          Page {currentPage} of {totalPages || 0}
        </span>
        
        <Separator orientation="vertical" className="h-4 mx-1" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onShowShortcuts} className="toolbar-btn">
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Keyboard Shortcuts (?)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
