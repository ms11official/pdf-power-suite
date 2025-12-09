import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Minus } from "lucide-react";

interface StrokeWidthSliderProps {
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

export function StrokeWidthSlider({ strokeWidth, onStrokeWidthChange }: StrokeWidthSliderProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 px-1">
          <Minus className="w-3 h-3 text-muted-foreground" />
          <Slider
            value={[strokeWidth]}
            onValueChange={([value]) => onStrokeWidthChange(value)}
            min={1}
            max={20}
            step={1}
            className="w-16"
          />
          <span className="text-[10px] text-muted-foreground w-5">{strokeWidth}px</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Stroke Width
      </TooltipContent>
    </Tooltip>
  );
}
