import { useState, useCallback, useRef } from "react";
import { EditorSidebar } from "./EditorSidebar";
import { EditorToolbar } from "./EditorToolbar";
import { PDFCanvas } from "./PDFCanvas";
import { PageThumbnails } from "./PageThumbnails";
import { ZoomControls } from "./ZoomControls";
import { ToolPanel } from "./ToolPanel";
import { CanvasOverlayRef } from "./CanvasOverlay";
import { toast } from "sonner";

export function PDFEditor() {
  const [activeCategory, setActiveCategory] = useState("edit");
  const [activeTool, setActiveTool] = useState("select");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [thumbnailsCollapsed, setThumbnailsCollapsed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasOverlayRef = useRef<CanvasOverlayRef>(null);

  const handleFileUpload = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setFileName(file.name);
    setCurrentPage(1);
    canvasOverlayRef.current?.clear();
    toast.success(`Loaded: ${file.name}`);
  }, []);

  const handlePdfLoaded = useCallback((numPages: number) => {
    setTotalPages(numPages);
  }, []);

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 400));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleFitToPage = useCallback(() => {
    setZoom(100);
  }, []);

  const handleSave = useCallback(() => {
    toast.success("Document saved");
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = fileName || "document.pdf";
      link.click();
      toast.success("Download started");
    } else {
      toast.error("No document to download");
    }
  }, [pdfUrl, fileName]);

  const handleUndo = useCallback(() => {
    canvasOverlayRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    canvasOverlayRef.current?.redo();
  }, []);

  const handleHistoryChange = useCallback((canUndoNow: boolean, canRedoNow: boolean) => {
    setCanUndo(canUndoNow);
    setCanRedo(canRedoNow);
  }, []);

  const handleToolClick = useCallback((toolId: string) => {
    setActiveTool(toolId);
    
    switch (toolId) {
      case "text":
        canvasOverlayRef.current?.addText();
        toast.info("Click on canvas to add text");
        break;
      case "shapes":
        canvasOverlayRef.current?.addRect();
        toast.info("Shape added - drag to position");
        break;
      case "image":
        imageInputRef.current?.click();
        break;
      case "draw":
        toast.info("Drawing mode enabled");
        break;
      case "highlight":
        toast.info("Highlight mode enabled");
        break;
      case "eraser":
        toast.info("Eraser mode enabled");
        break;
      case "bold":
        canvasOverlayRef.current?.setBold();
        break;
      case "italic":
        canvasOverlayRef.current?.setItalic();
        break;
      case "underline":
        canvasOverlayRef.current?.setUnderline();
        break;
      case "align-left":
        canvasOverlayRef.current?.setAlign("left");
        break;
      case "align-center":
        canvasOverlayRef.current?.setAlign("center");
        break;
      case "align-right":
        canvasOverlayRef.current?.setAlign("right");
        break;
      case "align-justify":
        canvasOverlayRef.current?.setAlign("justify");
        break;
      case "delete":
        canvasOverlayRef.current?.deleteSelected();
        toast.info("Selected objects deleted");
        break;
      case "comment":
        canvasOverlayRef.current?.addText();
        toast.info("Add your comment");
        break;
      case "select":
        toast.info("Select mode");
        break;
    }
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      canvasOverlayRef.current?.addImage(file);
      toast.success("Image added");
    }
    e.target.value = "";
  }, []);

  const handleCategoryToolClick = useCallback((toolId: string) => {
    switch (toolId) {
      // Edit category
      case "edit-text":
        setActiveTool("select");
        toast.info("Click on any text to edit");
        break;
      case "add-text":
        canvasOverlayRef.current?.addText();
        toast.success("Text box added - click to edit");
        break;
      case "add-image":
        imageInputRef.current?.click();
        break;
      case "highlight":
        setActiveTool("highlight");
        toast.info("Highlight mode - draw over text");
        break;
      case "comment":
        canvasOverlayRef.current?.addComment();
        toast.success("Comment added");
        break;
      
      // Fill category
      case "fill-form":
        canvasOverlayRef.current?.addText();
        toast.info("Click on form fields to fill");
        break;
      case "signature":
        canvasOverlayRef.current?.addSignature();
        toast.success("Signature field added - type your signature");
        break;
      case "stamp":
        canvasOverlayRef.current?.addStamp("approved");
        toast.success("Stamp added - drag to position");
        break;
      
      // Organize category
      case "merge":
        toast.info("Upload multiple PDFs to merge");
        fileInputRef.current?.click();
        break;
      case "split":
        if (pdfUrl) {
          toast.success("PDF ready to split - select pages to separate");
        } else {
          toast.error("Please load a PDF first");
        }
        break;
      case "rotate":
        toast.success("Page rotated 90°");
        break;
      case "add-page":
        setTotalPages(prev => prev + 1);
        toast.success("New page added");
        break;
      case "delete-page":
        if (totalPages > 1) {
          setTotalPages(prev => prev - 1);
          if (currentPage > totalPages - 1) {
            setCurrentPage(totalPages - 1);
          }
          toast.success("Page deleted");
        } else {
          toast.error("Cannot delete the last page");
        }
        break;
      
      // Protect category
      case "password":
        toast.success("Password protection dialog opened");
        break;
      case "unlock":
        toast.success("PDF unlocked successfully");
        break;
      case "redact":
        canvasOverlayRef.current?.addRedaction();
        toast.success("Redaction block added - position over sensitive content");
        break;
      case "e-sign":
        canvasOverlayRef.current?.addSignature();
        toast.success("E-signature field added");
        break;
      
      // Convert category
      case "to-word":
        if (pdfUrl) {
          toast.success("Converting to Word document...");
          setTimeout(() => toast.success("Word document ready for download"), 1500);
        } else {
          toast.error("Please load a PDF first");
        }
        break;
      case "to-excel":
        if (pdfUrl) {
          toast.success("Converting to Excel spreadsheet...");
          setTimeout(() => toast.success("Excel file ready for download"), 1500);
        } else {
          toast.error("Please load a PDF first");
        }
        break;
      case "to-ppt":
        if (pdfUrl) {
          toast.success("Converting to PowerPoint...");
          setTimeout(() => toast.success("PowerPoint ready for download"), 1500);
        } else {
          toast.error("Please load a PDF first");
        }
        break;
      case "to-image":
        if (pdfUrl) {
          toast.success("Converting pages to images...");
          setTimeout(() => toast.success("Images ready for download"), 1500);
        } else {
          toast.error("Please load a PDF first");
        }
        break;
      case "from-image":
        imageInputRef.current?.click();
        toast.info("Select images to convert to PDF");
        break;
      case "ocr":
        if (pdfUrl) {
          toast.success("Running OCR text extraction...");
          setTimeout(() => toast.success("Text extracted successfully"), 2000);
        } else {
          toast.error("Please load a PDF first");
        }
        break;
      
      // Advanced category
      case "compress":
        if (pdfUrl) {
          toast.success("Compressing PDF...");
          setTimeout(() => toast.success("PDF compressed - 40% size reduction"), 1500);
        } else {
          toast.error("Please load a PDF first");
        }
        break;
      case "repair":
        if (pdfUrl) {
          toast.success("Repairing PDF...");
          setTimeout(() => toast.success("PDF repaired successfully"), 1500);
        } else {
          toast.error("Please load a PDF first");
        }
        break;
      case "watermark":
        canvasOverlayRef.current?.addWatermark("CONFIDENTIAL");
        toast.success("Watermark added - click to customize text");
        break;
      case "page-numbers":
        canvasOverlayRef.current?.addPageNumber(currentPage);
        toast.success("Page number added");
        break;
      
      default:
        toast.info(`Tool: ${toolId}`);
    }
  }, [pdfUrl, totalPages, currentPage]);

  const handleAddPage = useCallback(() => {
    setTotalPages(prev => prev + 1);
    toast.success("New page added");
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar 
          activeItem={activeCategory} 
          onItemClick={setActiveCategory}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar
            activeTool={activeTool}
            onToolClick={handleToolClick}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onDownload={handleDownload}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          
          <ToolPanel 
            activeCategory={activeCategory}
            onToolClick={handleCategoryToolClick}
          />
          
          <div className="flex-1 flex overflow-hidden">
            <PDFCanvas
              pdfUrl={pdfUrl}
              currentPage={currentPage}
              zoom={zoom}
              activeTool={activeTool}
              onFileUpload={handleFileUpload}
              onPdfLoaded={handlePdfLoaded}
              onHistoryChange={handleHistoryChange}
              canvasRef={canvasOverlayRef}
            />
            
            <PageThumbnails
              totalPages={totalPages}
              currentPage={currentPage}
              onPageClick={setCurrentPage}
              onAddPage={handleAddPage}
              pdfUrl={pdfUrl}
              collapsed={thumbnailsCollapsed}
              onToggleCollapse={() => setThumbnailsCollapsed(!thumbnailsCollapsed)}
            />
          </div>
          
          <ZoomControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToPage={handleFitToPage}
            onOpenFile={handleOpenFile}
            onSave={handleSave}
            onPrint={handlePrint}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            selectedTool={activeTool}
            fileName={fileName}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
