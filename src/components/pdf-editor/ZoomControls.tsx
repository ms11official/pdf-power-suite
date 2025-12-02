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
    <div className="h-12 bg-toolbar border-t border-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onOpenFile} className="toolbar-btn">
              <FolderOpen className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Open File</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onSave} className="toolbar-btn">
              <Save className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onPrint} className="toolbar-btn">
              <Printer className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Print</TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onZoomOut} className="toolbar-btn">
              <ZoomOut className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>
        
        <span className="text-sm font-medium text-foreground min-w-[60px] text-center">
          {zoom}%
        </span>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onZoomIn} className="toolbar-btn">
              <ZoomIn className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onFitToPage} className="toolbar-btn">
              <Maximize2 className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Fit to Page</TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onDownload} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download PDF</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
