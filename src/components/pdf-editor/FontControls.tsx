import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const fonts = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier" },
  { value: "Comic Sans MS", label: "Comic Sans" },
  { value: "Impact", label: "Impact" },
];

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

interface FontControlsProps {
  fontSize: number;
  fontFamily: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
}

export function FontControls({
  fontSize,
  fontFamily,
  onFontSizeChange,
  onFontFamilyChange,
}: FontControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Select value={fontFamily} onValueChange={onFontFamilyChange}>
              <SelectTrigger className="h-7 w-[90px] text-xs bg-background border-border">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {fonts.map((font) => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: font.value }}
                    className="text-xs"
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Font Family</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Select value={fontSize.toString()} onValueChange={(v) => onFontSizeChange(Number(v))}>
              <SelectTrigger className="h-7 w-[60px] text-xs bg-background border-border">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()} className="text-xs">
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Font Size</TooltipContent>
      </Tooltip>
    </div>
  );
}
