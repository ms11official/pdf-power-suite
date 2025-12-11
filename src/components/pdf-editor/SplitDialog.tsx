import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Scissors, Download, FileText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";

interface SplitDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  fileName: string | null;
  totalPages: number;
}

type SplitMode = "range" | "individual" | "custom";

export function SplitDialog({ 
  open, 
  onClose, 
  pdfUrl, 
  fileName,
  totalPages 
}: SplitDialogProps) {
  const [splitMode, setSplitMode] = useState<SplitMode>("range");
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [customRanges, setCustomRanges] = useState("1-3, 5, 7-10");
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRangeEnd(Math.min(3, totalPages));
      setSelectedPages([]);
    }
  }, [open, totalPages]);

  const handlePageToggle = (page: number) => {
    setSelectedPages(prev => 
      prev.includes(page) 
        ? prev.filter(p => p !== page)
        : [...prev, page].sort((a, b) => a - b)
    );
  };

  const parseCustomRanges = (input: string): number[] => {
    const pages: Set<number> = new Set();
    const parts = input.split(",").map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          pages.add(page);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const getPagesToDextract = (): number[] => {
    switch (splitMode) {
      case "range":
        const pages: number[] = [];
        for (let i = rangeStart; i <= Math.min(rangeEnd, totalPages); i++) {
          pages.push(i);
        }
        return pages;
      case "individual":
        return selectedPages;
      case "custom":
        return parseCustomRanges(customRanges);
      default:
        return [];
    }
  };

  const handleSplit = async () => {
    if (!pdfUrl) {
      toast.error("No PDF loaded");
      return;
    }

    const pagesToExtract = getPagesToDextract();
    if (pagesToExtract.length === 0) {
      toast.error("Please select at least one page");
      return;
    }

    setIsSplitting(true);
    toast.loading("Splitting PDF...");

    try {
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const srcDoc = await PDFDocument.load(existingPdfBytes);
      const newDoc = await PDFDocument.create();

      const copiedPages = await newDoc.copyPages(
        srcDoc,
        pagesToExtract.map(p => p - 1)
      );

      copiedPages.forEach(page => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const baseName = fileName?.replace(".pdf", "") || "document";
      link.download = `${baseName}_pages_${pagesToExtract.join("-")}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success(`Extracted ${pagesToExtract.length} page(s)`);
      onClose();
    } catch (error) {
      console.error("Split error:", error);
      toast.dismiss();
      toast.error("Failed to split PDF");
    } finally {
      setIsSplitting(false);
    }
  };

  const handleExtractAll = async () => {
    if (!pdfUrl) {
      toast.error("No PDF loaded");
      return;
    }

    setIsSplitting(true);
    toast.loading("Extracting all pages...");

    try {
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const srcDoc = await PDFDocument.load(existingPdfBytes);
      const baseName = fileName?.replace(".pdf", "") || "document";

      for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(copiedPage);

        const pdfBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}_page_${i + 1}.pdf`;
        link.click();

        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      toast.dismiss();
      toast.success(`Extracted ${totalPages} individual pages`);
      onClose();
    } catch (error) {
      console.error("Extract all error:", error);
      toast.dismiss();
      toast.error("Failed to extract pages");
    } finally {
      setIsSplitting(false);
    }
  };

  const pagesToExtract = getPagesToDextract();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Split PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Total pages: <span className="font-medium text-foreground">{totalPages}</span>
          </div>

          {/* Split Mode Tabs */}
          <div className="flex gap-1 p-1 bg-accent/50 rounded-lg">
            <button
              onClick={() => setSplitMode("range")}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-all ${
                splitMode === "range" 
                  ? "bg-background shadow text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Page Range
            </button>
            <button
              onClick={() => setSplitMode("individual")}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-all ${
                splitMode === "individual" 
                  ? "bg-background shadow text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Select Pages
            </button>
            <button
              onClick={() => setSplitMode("custom")}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-all ${
                splitMode === "custom" 
                  ? "bg-background shadow text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom
            </button>
          </div>

          {/* Range Mode */}
          {splitMode === "range" && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">From Page</label>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <span className="text-muted-foreground mt-5">to</span>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">To Page</label>
                <Input
                  type="number"
                  min={rangeStart}
                  max={totalPages}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(Math.min(totalPages, parseInt(e.target.value) || rangeStart))}
                />
              </div>
            </div>
          )}

          {/* Individual Selection Mode */}
          {splitMode === "individual" && (
            <div className="max-h-[200px] overflow-y-auto border rounded-lg p-3">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <label
                    key={page}
                    className={`flex items-center justify-center gap-1 p-2 border rounded cursor-pointer transition-all ${
                      selectedPages.includes(page)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedPages.includes(page)}
                      onCheckedChange={() => handlePageToggle(page)}
                      className="hidden"
                    />
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{page}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Mode */}
          {splitMode === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter page numbers or ranges</label>
              <Input
                value={customRanges}
                onChange={(e) => setCustomRanges(e.target.value)}
                placeholder="e.g., 1-3, 5, 7-10"
              />
              <p className="text-xs text-muted-foreground">
                Use commas to separate, hyphens for ranges
              </p>
            </div>
          )}

          {/* Preview */}
          {pagesToExtract.length > 0 && (
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-sm">
                <span className="font-medium">{pagesToExtract.length}</span> page(s) will be extracted:
                <span className="text-muted-foreground ml-2">
                  {pagesToExtract.length <= 10 
                    ? pagesToExtract.join(", ")
                    : `${pagesToExtract.slice(0, 10).join(", ")}...`
                  }
                </span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={handleExtractAll}
              disabled={isSplitting || totalPages === 0}
            >
              Extract All Pages
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSplit}
                disabled={isSplitting || pagesToExtract.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Extract Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
