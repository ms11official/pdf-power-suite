import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Unlock, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PDFUnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: (url: string, name: string) => void;
}

export function PDFUnlockDialog({
  open,
  onOpenChange,
  onUnlock,
}: PDFUnlockDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUnlock = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!password) {
      toast.error("Please enter the password");
      return;
    }

    setIsProcessing(true);

    try {
      // Convert file to base64
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
      const pdfBase64 = btoa(binary);

      // Call edge function to decrypt
      const { data, error } = await supabase.functions.invoke("decrypt-pdf", {
        body: {
          pdfBase64,
          password,
        },
      });

      if (error) {
        console.error("Decryption error:", error);
        if (error.message?.includes("401") || error.message?.includes("password")) {
          toast.error("Incorrect password");
        } else {
          toast.error("Failed to unlock PDF");
        }
        return;
      }

      if (!data.success) {
        toast.error(data.error || "Failed to unlock PDF");
        return;
      }

      // Convert decrypted base64 back to blob
      const decryptedBytes = Uint8Array.from(atob(data.decryptedPdfBase64), (c) =>
        c.charCodeAt(0)
      );
      const blob = new Blob([decryptedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const unlockedFileName = selectedFile.name.replace(".pdf", "_unlocked.pdf");
      
      toast.success("PDF unlocked successfully!");
      onUnlock(url, unlockedFileName);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error unlocking PDF:", error);
      toast.error("Failed to unlock PDF. The password may be incorrect.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPassword("");
    setSelectedFile(null);
    setShowPassword(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="w-5 h-5" />
            Unlock PDF
          </DialogTitle>
          <DialogDescription>
            Remove password protection from an encrypted PDF document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Protected PDF</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <Unlock className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a password-protected PDF
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="unlock-password">Password</Label>
            <div className="relative">
              <Input
                id="unlock-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PDF password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: This will create a new unlocked copy of the PDF without removing
            the original protection.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={!selectedFile || !password || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unlocking...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Unlock PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
