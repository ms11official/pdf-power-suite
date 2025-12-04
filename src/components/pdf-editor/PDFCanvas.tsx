import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as pdfjsLib from "pdfjs-dist";
import { CanvasOverlay, CanvasOverlayRef } from "./CanvasOverlay";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFCanvasProps {
  pdfUrl: string | null;
  currentPage: number;
  zoom: number;
  activeTool: string;
  onFileUpload: (file: File) => void;
  onPdfLoaded: (numPages: number) => void;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  canvasRef: React.RefObject<CanvasOverlayRef>;
}

export function PDFCanvas({ 
  pdfUrl, 
  currentPage, 
  zoom, 
  activeTool,
  onFileUpload, 
  onPdfLoaded,
  onHistoryChange,
  canvasRef
}: PDFCanvasProps) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) onFileUpload(acceptedFiles[0]);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] }, 
    multiple: false 
  });

  useEffect(() => {
    if (!pdfUrl) { setPdfDoc(null); return; }
    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        setPdfDoc(pdf);
        onPdfLoaded(pdf.numPages);
      } catch (error) { console.error("Error loading PDF:", error); }
    };
    loadPdf();
  }, [pdfUrl, onPdfLoaded]);

  useEffect(() => {
    if (!pdfDoc || !pdfCanvasRef.current || isRendering) return;
    const renderPage = async () => {
      setIsRendering(true);
      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = pdfCanvasRef.current!;
        const context = canvas.getContext("2d")!;
        const viewport = page.getViewport({ scale: zoom / 100 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        setCanvasSize({ width: viewport.width, height: viewport.height });
        await page.render({ canvasContext: context, viewport }).promise;
      } catch (error) { console.error("Error rendering page:", error); }
      finally { setIsRendering(false); }
    };
    renderPage();
  }, [pdfDoc, currentPage, zoom, isRendering]);

  if (!pdfUrl) {
    return (
      <div className="flex-1 bg-secondary flex items-center justify-center p-4">
        <div {...getRootProps()} className={cn(
          "drop-zone max-w-md w-full flex flex-col items-center justify-center text-center cursor-pointer py-12",
          isDragActive && "drop-zone-active"
        )}>
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className={cn(
              "w-8 h-8 text-primary transition-transform duration-200",
              isDragActive && "scale-110"
            )} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {isDragActive ? "Drop your PDF here" : "No Document Loaded"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            To get started, please open a file or drag and drop a PDF here.
          </p>
          <Button className="gap-2">
            <FileUp className="w-4 h-4" />
            Open a File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-secondary overflow-auto p-4" ref={containerRef}>
      <div className="flex justify-center">
        <div className="relative bg-card shadow-lg rounded-md overflow-hidden">
          <canvas ref={pdfCanvasRef} className="block" />
          <CanvasOverlay
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            activeTool={activeTool}
            onHistoryChange={onHistoryChange}
          />
        </div>
      </div>
    </div>
  );
}
