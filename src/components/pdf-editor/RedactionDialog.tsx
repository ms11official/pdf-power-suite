import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EyeOff, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RedactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (config: RedactionConfig) => void;
}

export interface RedactionConfig {
  style: 'solid' | 'pattern' | 'blur';
  color: string;
  applyPermanently: boolean;
}

export function RedactionDialog({ open, onOpenChange, onApply }: RedactionDialogProps) {
  const [config, setConfig] = useState<RedactionConfig>({
    style: 'solid',
    color: '#000000',
    applyPermanently: true,
  });

  const handleApply = () => {
    onApply(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-destructive" />
            Redaction Tool
          </DialogTitle>
          <DialogDescription>
            Permanently hide sensitive content from your PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Redaction is permanent. Once applied and saved, the original content cannot be recovered.
            </AlertDescription>
          </Alert>

          {/* Style Selection */}
          <div className="space-y-3">
            <Label>Redaction Style</Label>
            <RadioGroup
              value={config.style}
              onValueChange={(v) => setConfig({ ...config, style: v as RedactionConfig['style'] })}
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex flex-col items-center gap-2">
                <RadioGroupItem value="solid" id="solid" className="sr-only" />
                <label
                  htmlFor="solid"
                  className={`
                    w-full h-16 rounded-lg border-2 cursor-pointer flex items-center justify-center
                    ${config.style === 'solid' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <div className="w-12 h-8 bg-black rounded" />
                </label>
                <span className="text-xs">Solid</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <RadioGroupItem value="pattern" id="pattern" className="sr-only" />
                <label
                  htmlFor="pattern"
                  className={`
                    w-full h-16 rounded-lg border-2 cursor-pointer flex items-center justify-center
                    ${config.style === 'pattern' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <div 
                    className="w-12 h-8 rounded" 
                    style={{ 
                      background: 'repeating-linear-gradient(45deg, #000, #000 4px, #333 4px, #333 8px)' 
                    }} 
                  />
                </label>
                <span className="text-xs">Pattern</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <RadioGroupItem value="blur" id="blur" className="sr-only" />
                <label
                  htmlFor="blur"
                  className={`
                    w-full h-16 rounded-lg border-2 cursor-pointer flex items-center justify-center
                    ${config.style === 'blur' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <div 
                    className="w-12 h-8 rounded bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300" 
                    style={{ filter: 'blur(2px)' }}
                  />
                </label>
                <span className="text-xs">Blur Effect</span>
              </div>
            </RadioGroup>
          </div>

          {/* Color (only for solid style) */}
          {config.style === 'solid' && (
            <div className="space-y-2">
              <Label>Redaction Color</Label>
              <div className="flex gap-2">
                {['#000000', '#1a1a1a', '#333333', '#666666', '#ff0000'].map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, color })}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all
                      ${config.color === color ? 'border-primary scale-110' : 'border-transparent hover:border-primary/50'}
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">How to use:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click "Add Redaction Area" below</li>
              <li>Draw rectangles over content to hide</li>
              <li>Resize and position as needed</li>
              <li>Download to apply permanently</li>
            </ol>
          </div>

          <Button onClick={handleApply} className="w-full" variant="destructive">
            <EyeOff className="w-4 h-4 mr-2" />
            Add Redaction Area
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
