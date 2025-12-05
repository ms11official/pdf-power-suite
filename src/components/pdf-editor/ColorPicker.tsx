import { useState } from "react";
import { Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const presetColors = [
  "#000000", "#374151", "#6b7280", "#9ca3af",
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#f43f5e", "#78350f", "#ffffff",
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="toolbar-btn relative">
              <Palette className="w-3.5 h-3.5" />
              <div 
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Color</TooltipContent>
      </Tooltip>
      
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Pick a color</div>
          
          <div className="grid grid-cols-5 gap-1">
            {presetColors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={`w-7 h-7 rounded border-2 transition-all hover:scale-110 ${
                  color === c ? "border-primary ring-1 ring-primary" : "border-border"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          
          <div className="pt-2 border-t border-border">
            <label className="text-xs text-muted-foreground">Custom</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 text-xs px-2 py-1 bg-muted border border-border rounded"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
