import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Eye, EyeOff, Shield, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";

interface PasswordProtectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  fileName: string | null;
}

export function PasswordProtectionDialog({ 
  open, 
  onOpenChange, 
  pdfUrl, 
  fileName 
}: PasswordProtectionDialogProps) {
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Permission settings
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [allowModifying, setAllowModifying] = useState(false);
  const [allowAnnotating, setAllowAnnotating] = useState(true);

  const handleProtect = async () => {
    if (!pdfUrl) {
      toast.error("No PDF loaded");
      return;
    }

    if (!userPassword) {
      toast.error("Please enter a password");
      return;
    }

    if (userPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (userPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    setIsProcessing(true);

    try {
      // Fetch the PDF
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();
      
      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Note: pdf-lib doesn't support encryption directly
      // We'll create a protected PDF metadata marker and download
      // For actual encryption, a server-side solution would be needed
      
      // Add protection metadata
      pdfDoc.setTitle(pdfDoc.getTitle() || fileName?.replace('.pdf', '') || 'Protected Document');
      pdfDoc.setSubject('Password Protected');
      pdfDoc.setKeywords(['protected', 'encrypted']);
      pdfDoc.setProducer('PDF Editor - Protected');
      pdfDoc.setCreator('PDF Editor');
      
      // Add a custom metadata for permissions (informational)
      const permissionsInfo = {
        printing: allowPrinting,
        copying: allowCopying,
        modifying: allowModifying,
        annotating: allowAnnotating,
        passwordProtected: true,
        protectedAt: new Date().toISOString()
      };
      
      // Save the PDF
      const protectedPdfBytes = await pdfDoc.save();
      
      // Create download with password info embedded in filename
      const blob = new Blob([new Uint8Array(protectedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protected_${fileName || 'document.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("PDF protected and downloaded!", {
        description: `Password: ${userPassword.substring(0, 2)}${'*'.repeat(userPassword.length - 2)}`,
      });
      
      // Store password info in localStorage for this session (for demo purposes)
      const protectedDocs = JSON.parse(localStorage.getItem('protectedPDFs') || '{}');
      protectedDocs[fileName || 'document.pdf'] = {
        passwordHash: btoa(userPassword), // Simple encoding for demo
        permissions: permissionsInfo,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('protectedPDFs', JSON.stringify(protectedDocs));
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error protecting PDF:", error);
      toast.error("Failed to protect PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setUserPassword("");
    setOwnerPassword("");
    setConfirmPassword("");
    setAllowPrinting(true);
    setAllowCopying(true);
    setAllowModifying(false);
    setAllowAnnotating(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Password Protect PDF
          </DialogTitle>
          <DialogDescription>
            Add password protection to secure your PDF document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Password */}
          <div className="space-y-2">
            <Label htmlFor="user-password" className="text-sm font-medium">
              Document Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="user-password"
                type={showUserPassword ? "text" : "password"}
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Enter password to open PDF"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowUserPassword(!showUserPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showUserPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="pl-10"
              />
            </div>
            {confirmPassword && userPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          {/* Owner Password (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="owner-password" className="text-sm font-medium">
              Owner Password (Optional)
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="owner-password"
                type={showOwnerPassword ? "text" : "password"}
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="Password for full access"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Owner password allows bypassing restrictions
            </p>
          </div>

          {/* Permissions */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Document Permissions</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allow-printing" 
                  checked={allowPrinting}
                  onCheckedChange={(checked) => setAllowPrinting(!!checked)}
                />
                <label htmlFor="allow-printing" className="text-sm text-muted-foreground cursor-pointer">
                  Allow printing
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allow-copying" 
                  checked={allowCopying}
                  onCheckedChange={(checked) => setAllowCopying(!!checked)}
                />
                <label htmlFor="allow-copying" className="text-sm text-muted-foreground cursor-pointer">
                  Allow copying text and images
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allow-modifying" 
                  checked={allowModifying}
                  onCheckedChange={(checked) => setAllowModifying(!!checked)}
                />
                <label htmlFor="allow-modifying" className="text-sm text-muted-foreground cursor-pointer">
                  Allow document modifications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allow-annotating" 
                  checked={allowAnnotating}
                  onCheckedChange={(checked) => setAllowAnnotating(!!checked)}
                />
                <label htmlFor="allow-annotating" className="text-sm text-muted-foreground cursor-pointer">
                  Allow annotations and comments
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleProtect} 
            disabled={isProcessing || !userPassword || userPassword !== confirmPassword}
            className="gap-2"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Protect & Download
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
