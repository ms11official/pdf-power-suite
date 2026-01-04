import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets } from "lucide-react";

interface WatermarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (config: WatermarkConfig) => void;
}

export interface WatermarkConfig {
  text: string;
  opacity: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal';
  rotation: number;
  fontSize: number;
  color: string;
}

const positions = [
  { value: 'center', label: 'Center' },
  { value: 'diagonal', label: 'Diagonal (Center)' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

export function WatermarkDialog({ open, onOpenChange, onApply }: WatermarkDialogProps) {
  const [config, setConfig] = useState<WatermarkConfig>({
    text: 'CONFIDENTIAL',
    opacity: 30,
    position: 'diagonal',
    rotation: -30,
    fontSize: 48,
    color: '#888888',
  });

  const handleApply = () => {
    onApply(config);
    onOpenChange(false);
  };

  const previewStyle: React.CSSProperties = {
    position: 'absolute',
    fontSize: `${config.fontSize / 3}px`,
    color: config.color,
    opacity: config.opacity / 100,
    transform: `rotate(${config.rotation}deg)`,
    whiteSpace: 'nowrap',
    fontWeight: 'bold',
    pointerEvents: 'none',
    ...(config.position === 'center' || config.position === 'diagonal' ? {
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
    } : config.position === 'top-left' ? {
      top: '10%',
      left: '10%',
    } : config.position === 'top-right' ? {
      top: '10%',
      right: '10%',
    } : config.position === 'bottom-left' ? {
      bottom: '10%',
      left: '10%',
    } : {
      bottom: '10%',
      right: '10%',
    }),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            Add Watermark
          </DialogTitle>
          <DialogDescription>
            Customize your watermark appearance and position
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="relative bg-muted rounded-lg h-32 overflow-hidden border">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              PDF Preview
            </div>
            <div style={previewStyle}>{config.text}</div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <Label>Watermark Text</Label>
            <Input
              value={config.text}
              onChange={(e) => setConfig({ ...config, text: e.target.value })}
              placeholder="Enter watermark text"
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label>Position</Label>
            <Select 
              value={config.position} 
              onValueChange={(v) => setConfig({ ...config, position: v as WatermarkConfig['position'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positions.map(pos => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Opacity</Label>
              <span className="text-sm text-muted-foreground">{config.opacity}%</span>
            </div>
            <Slider
              value={[config.opacity]}
              onValueChange={([v]) => setConfig({ ...config, opacity: v })}
              min={5}
              max={100}
              step={5}
            />
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Rotation</Label>
              <span className="text-sm text-muted-foreground">{config.rotation}°</span>
            </div>
            <Slider
              value={[config.rotation]}
              onValueChange={([v]) => setConfig({ ...config, rotation: v })}
              min={-90}
              max={90}
              step={5}
            />
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{config.fontSize}px</span>
            </div>
            <Slider
              value={[config.fontSize]}
              onValueChange={([v]) => setConfig({ ...config, fontSize: v })}
              min={12}
              max={120}
              step={4}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.color}
                onChange={(e) => setConfig({ ...config, color: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={config.color}
                onChange={(e) => setConfig({ ...config, color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <Button onClick={handleApply} className="w-full">
            Apply Watermark
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
