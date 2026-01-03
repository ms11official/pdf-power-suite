import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, ChevronLeft, ChevronRight, Layers, SplitSquareVertical } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

interface PDFCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPdfUrl: string | null;
  currentFileName: string | null;
}

interface PDFState {
  url: string | null;
  name: string | null;
  doc: pdfjsLib.PDFDocumentProxy | null;
  totalPages: number;
  currentPage: number;
}

export function PDFCompareDialog({
  open,
  onOpenChange,
  currentPdfUrl,
  currentFileName,
}: PDFCompareDialogProps) {
  const [leftPdf, setLeftPdf] = useState<PDFState>({
    url: currentPdfUrl,
    name: currentFileName,
    doc: null,
    totalPages: 0,
    currentPage: 1,
  });

  const [rightPdf, setRightPdf] = useState<PDFState>({
    url: null,
    name: null,
    doc: null,
    totalPages: 0,
    currentPage: 1,
  });

  const [viewMode, setViewMode] = useState<"side-by-side" | "overlay">("side-by-side");
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [syncPages, setSyncPages] = useState(true);

  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current PDF into left side when dialog opens
  useEffect(() => {
    if (open && currentPdfUrl) {
      loadPdf(currentPdfUrl, currentFileName, "left");
    }
  }, [open, currentPdfUrl, currentFileName]);

  // Render PDFs when state changes
  useEffect(() => {
    if (leftPdf.doc) {
      renderPage(leftPdf.doc, leftPdf.currentPage, leftCanvasRef.current);
    }
  }, [leftPdf.doc, leftPdf.currentPage]);

  useEffect(() => {
    if (rightPdf.doc) {
      renderPage(rightPdf.doc, rightPdf.currentPage, rightCanvasRef.current);
    }
  }, [rightPdf.doc, rightPdf.currentPage]);

  // Render overlay when both PDFs are loaded
  useEffect(() => {
    if (viewMode === "overlay" && leftPdf.doc && rightPdf.doc) {
      renderOverlay();
    }
  }, [viewMode, leftPdf.doc, rightPdf.doc, leftPdf.currentPage, rightPdf.currentPage, overlayOpacity]);

  const loadPdf = async (url: string, name: string | null, side: "left" | "right") => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const newState: PDFState = {
        url,
        name,
        doc,
        totalPages: doc.numPages,
        currentPage: 1,
      };

      if (side === "left") {
        setLeftPdf(newState);
      } else {
        setRightPdf(newState);
      }

      toast.success(`Loaded: ${name || "PDF"}`);
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF");
    }
  };

  const renderPage = async (
    doc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement | null
  ) => {
    if (!canvas || !doc) return;

    try {
      const page = await doc.getPage(pageNum);
      const scale = 1.0;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) return;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  const renderOverlay = async () => {
    if (!overlayCanvasRef.current || !leftPdf.doc || !rightPdf.doc) return;

    const canvas = overlayCanvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    try {
      // Get both pages
      const leftPage = await leftPdf.doc.getPage(leftPdf.currentPage);
      const rightPage = await rightPdf.doc.getPage(rightPdf.currentPage);

      const scale = 1.0;
      const leftViewport = leftPage.getViewport({ scale });
      const rightViewport = rightPage.getViewport({ scale });

      // Use the larger dimensions
      canvas.width = Math.max(leftViewport.width, rightViewport.width);
      canvas.height = Math.max(leftViewport.height, rightViewport.height);

      // Render left page
      await leftPage.render({
        canvasContext: context,
        viewport: leftViewport,
      }).promise;

      // Create temporary canvas for right page
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempContext = tempCanvas.getContext("2d");
      if (!tempContext) return;

      await rightPage.render({
        canvasContext: tempContext,
        viewport: rightViewport,
      }).promise;

      // Overlay with opacity
      context.globalAlpha = overlayOpacity / 100;
      context.drawImage(tempCanvas, 0, 0);
      context.globalAlpha = 1.0;
    } catch (error) {
      console.error("Error rendering overlay:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    const url = URL.createObjectURL(file);
    await loadPdf(url, file.name, "right");
    e.target.value = "";
  };

  const handlePageChange = (side: "left" | "right", direction: "prev" | "next") => {
    const pdf = side === "left" ? leftPdf : rightPdf;
    const setPdf = side === "left" ? setLeftPdf : setRightPdf;
    const otherPdf = side === "left" ? rightPdf : leftPdf;
    const setOtherPdf = side === "left" ? setRightPdf : setLeftPdf;

    const newPage =
      direction === "next"
        ? Math.min(pdf.currentPage + 1, pdf.totalPages)
        : Math.max(pdf.currentPage - 1, 1);

    setPdf((prev) => ({ ...prev, currentPage: newPage }));

    // Sync pages if enabled
    if (syncPages && otherPdf.doc) {
      const syncedPage = Math.min(newPage, otherPdf.totalPages);
      setOtherPdf((prev) => ({ ...prev, currentPage: syncedPage }));
    }
  };

  const resetDialog = () => {
    setRightPdf({
      url: null,
      name: null,
      doc: null,
      totalPages: 0,
      currentPage: 1,
    });
    setViewMode("side-by-side");
    setOverlayOpacity(50);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetDialog();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SplitSquareVertical className="w-5 h-5" />
            Compare PDFs
          </DialogTitle>
          <DialogDescription>
            Upload a second PDF to compare side by side or overlay with the current document.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Controls */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "side-by-side" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("side-by-side")}
            >
              <SplitSquareVertical className="w-4 h-4 mr-1" />
              Side by Side
            </Button>
            <Button
              variant={viewMode === "overlay" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("overlay")}
              disabled={!rightPdf.doc}
            >
              <Layers className="w-4 h-4 mr-1" />
              Overlay
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {viewMode === "overlay" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm w-8">{overlayOpacity}%</span>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={syncPages}
                onChange={(e) => setSyncPages(e.target.checked)}
                className="rounded"
              />
              Sync pages
            </label>
          </div>
        </div>

        {/* PDF Viewers */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "side-by-side" ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Left PDF */}
              <div className="flex flex-col border rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {leftPdf.name || "No PDF loaded"}
                  </span>
                  {leftPdf.doc && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handlePageChange("left", "prev")}
                        disabled={leftPdf.currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs">
                        {leftPdf.currentPage} / {leftPdf.totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handlePageChange("left", "next")}
                        disabled={leftPdf.currentPage >= leftPdf.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
                  {leftPdf.doc ? (
                    <canvas ref={leftCanvasRef} className="max-w-full shadow-lg" />
                  ) : (
                    <p className="text-muted-foreground">No PDF loaded</p>
                  )}
                </div>
              </div>

              {/* Right PDF */}
              <div className="flex flex-col border rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {rightPdf.name || "Upload PDF to compare"}
                  </span>
                  {rightPdf.doc ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setRightPdf((prev) => ({ ...prev, url: null, name: null, doc: null, totalPages: 0, currentPage: 1 }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handlePageChange("right", "prev")}
                        disabled={rightPdf.currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs">
                        {rightPdf.currentPage} / {rightPdf.totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handlePageChange("right", "next")}
                        disabled={rightPdf.currentPage >= rightPdf.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  )}
                </div>
                <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
                  {rightPdf.doc ? (
                    <canvas ref={rightCanvasRef} className="max-w-full shadow-lg" />
                  ) : (
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click or drag to upload a PDF
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Overlay view
            <div className="h-full flex flex-col">
              <div className="bg-muted px-3 py-2 flex items-center justify-between rounded-t-lg">
                <span className="text-sm font-medium">
                  Overlay: {leftPdf.name} + {rightPdf.name}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handlePageChange("left", "prev")}
                    disabled={leftPdf.currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs">
                    Page {leftPdf.currentPage}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handlePageChange("left", "next")}
                    disabled={leftPdf.currentPage >= Math.max(leftPdf.totalPages, rightPdf.totalPages)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4 rounded-b-lg border">
                <canvas ref={overlayCanvasRef} className="max-w-full shadow-lg" />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
