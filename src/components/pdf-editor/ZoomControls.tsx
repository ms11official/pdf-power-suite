import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  FolderOpen, 
  Save, 
  Printer,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToPage: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

export function ZoomControls({ 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onFitToPage,
  onOpenFile,
  onSave,
  onPrint,
  onDownload
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
      </div>
      
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onDownload} size="sm" className="gap-1 text-xs h-6 px-2">
              <Download className="w-3 h-3" />
              Download
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Download PDF</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
