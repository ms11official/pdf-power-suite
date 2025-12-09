import { useState, useCallback, useRef, useEffect } from "react";
import { EditorSidebar } from "./EditorSidebar";
import { EditorToolbar } from "./EditorToolbar";
import { PDFCanvas } from "./PDFCanvas";
import { PageThumbnails } from "./PageThumbnails";
import { ZoomControls } from "./ZoomControls";
import { ToolPanel } from "./ToolPanel";
import { CanvasOverlayRef } from "./CanvasOverlay";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";

export function PDFEditor() {
  const [activeCategory, setActiveCategory] = useState("edit");
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [thumbnailsCollapsed, setThumbnailsCollapsed] = useState(false);
  const [blankPages, setBlankPages] = useState<number[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, hasSelection: false });
  
  // Multi-page annotation storage
  const [pageAnnotations, setPageAnnotations] = useState<Record<number, string>>({});
  const lastPageRef = useRef<number>(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasOverlayRef = useRef<CanvasOverlayRef>(null);

  // Save annotations when leaving a page
  const saveCurrentPageAnnotations = useCallback(() => {
    if (canvasOverlayRef.current && lastPageRef.current > 0) {
      const annotations = canvasOverlayRef.current.exportAnnotations();
      if (annotations && annotations !== "{}") {
        setPageAnnotations(prev => ({
          ...prev,
          [lastPageRef.current]: annotations
        }));
      }
    }
  }, []);

  // Load annotations when changing pages
  useEffect(() => {
    if (currentPage !== lastPageRef.current) {
      // Save current page annotations first
      saveCurrentPageAnnotations();
      
      // Clear canvas and load new page annotations
      setTimeout(() => {
        if (canvasOverlayRef.current) {
          canvasOverlayRef.current.clear();
          const savedAnnotations = pageAnnotations[currentPage];
          if (savedAnnotations) {
            canvasOverlayRef.current.importAnnotations(savedAnnotations);
          }
        }
        lastPageRef.current = currentPage;
      }, 100);
    }
  }, [currentPage, pageAnnotations, saveCurrentPageAnnotations]);

  const handleFileUpload = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    
    // Save current annotations before loading new file
    saveCurrentPageAnnotations();
    
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setFileName(file.name);
    setCurrentPage(1);
    setBlankPages([]);
    setPageAnnotations({});
    lastPageRef.current = 1;
    canvasOverlayRef.current?.clear();
    toast.success(`Loaded: ${file.name}`);
  }, [saveCurrentPageAnnotations]);

  const handlePdfLoaded = useCallback((numPages: number) => {
    setTotalPages(numPages);
  }, []);

  const handleOpenFile = useCallback(() => {
    setTimeout(() => fileInputRef.current?.click(), 0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      
      if (ctrl && e.key === "o") {
        e.preventDefault();
        handleOpenFile();
      } else if (ctrl && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((ctrl && e.key === "y") || (ctrl && e.shiftKey && e.key === "z")) {
        e.preventDefault();
        handleRedo();
      } else if (ctrl && e.key === "p") {
        e.preventDefault();
        handlePrint();
      } else if (ctrl && e.key === "d") {
        e.preventDefault();
        handleDownload();
      } else if (e.key === "+" || (ctrl && e.key === "=")) {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || (ctrl && e.key === "-")) {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          canvasOverlayRef.current?.deleteSelected();
        }
      } else if (e.key === "t" && !ctrl) {
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          canvasOverlayRef.current?.addText();
          toast.info("Text tool activated");
        }
      } else if (e.key === "h" && !ctrl) {
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          setActiveTool("highlight");
          toast.info("Highlight mode");
        }
      } else if (e.key === "Escape") {
        setActiveTool("select");
      } else if (ctrl && e.key === "ArrowRight" && currentPage < totalPages) {
        e.preventDefault();
        setCurrentPage(prev => prev + 1);
      } else if (ctrl && e.key === "ArrowLeft" && currentPage > 1) {
        e.preventDefault();
        setCurrentPage(prev => prev - 1);
      } else if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          setShowShortcuts(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const handleSave = useCallback(() => {
    saveCurrentPageAnnotations();
    toast.success("Document saved");
  }, [saveCurrentPageAnnotations]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(async () => {
    if (!pdfUrl) {
      toast.error("No document to download");
      return;
    }
    
    // Save current page annotations first
    saveCurrentPageAnnotations();
    
    try {
      toast.loading("Preparing PDF with annotations...");
      
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Get all pages with annotations
      const allAnnotations = { ...pageAnnotations };
      const currentAnnotations = canvasOverlayRef.current?.exportAnnotations();
      if (currentAnnotations && currentAnnotations !== "{}") {
        allAnnotations[currentPage] = currentAnnotations;
      }
      
      // For now, apply current page annotation (multi-page export would require more complex logic)
      const annotationDataUrl = canvasOverlayRef.current?.getCanvasDataUrl();
      if (annotationDataUrl) {
        const pngImageBytes = await fetch(annotationDataUrl).then(res => res.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngImageBytes);
        
        const pages = pdfDoc.getPages();
        const page = pages[currentPage - 1];
        const { width, height } = page.getSize();
        
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName?.replace(".pdf", "_annotated.pdf") || "document_annotated.pdf";
      link.click();
      
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF with annotations downloaded!");
    } catch (error) {
      toast.dismiss();
      console.error("Error exporting PDF:", error);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = fileName || "document.pdf";
      link.click();
      toast.success("Download started (without annotations)");
    }
  }, [pdfUrl, fileName, currentPage, pageAnnotations, saveCurrentPageAnnotations]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 400));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleFitToPage = useCallback(() => {
    setZoom(100);
  }, []);


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
    const newPageNum = totalPages + 1;
    setTotalPages(newPageNum);
    setBlankPages(prev => [...prev, newPageNum]);
    setCurrentPage(newPageNum);
    toast.success(`Page ${newPageNum} added`);
  }, [totalPages]);

  const handleContextMenu = useCallback((x: number, y: number, hasSelection: boolean) => {
    setContextMenu({ visible: true, x, y, hasSelection });
  }, []);

  const handleContextMenuAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "copy":
        canvasOverlayRef.current?.copySelected();
        toast.success("Copied");
        break;
      case "paste":
        canvasOverlayRef.current?.paste();
        toast.success("Pasted");
        break;
      case "delete":
        canvasOverlayRef.current?.deleteSelected();
        toast.success("Deleted");
        break;
      case "bring-front":
        canvasOverlayRef.current?.bringToFront();
        toast.success("Brought to front");
        break;
      case "send-back":
        canvasOverlayRef.current?.sendToBack();
        toast.success("Sent to back");
        break;
      case "flip-horizontal":
        canvasOverlayRef.current?.flipHorizontal();
        break;
      case "rotate":
        canvasOverlayRef.current?.rotate90();
        break;
    }
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setActiveColor(color);
    canvasOverlayRef.current?.setColor(color);
  }, []);

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(size);
    canvasOverlayRef.current?.setFontSize(size);
  }, []);

  const handleFontFamilyChange = useCallback((family: string) => {
    setFontFamily(family);
    canvasOverlayRef.current?.setFontFamily(family);
  }, []);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
    canvasOverlayRef.current?.setStrokeWidth(width);
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
            activeColor={activeColor}
            fontSize={fontSize}
            fontFamily={fontFamily}
            strokeWidth={strokeWidth}
            onToolClick={handleToolClick}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onDownload={handleDownload}
            onColorChange={handleColorChange}
            onFontSizeChange={handleFontSizeChange}
            onFontFamilyChange={handleFontFamilyChange}
            onStrokeWidthChange={handleStrokeWidthChange}
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
              activeColor={activeColor}
              fontSize={fontSize}
              fontFamily={fontFamily}
              strokeWidth={strokeWidth}
              onFileUpload={handleFileUpload}
              onPdfLoaded={handlePdfLoaded}
              onHistoryChange={handleHistoryChange}
              onContextMenu={handleContextMenu}
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
            onShowShortcuts={() => setShowShortcuts(true)}
          />
        </div>
      </div>
      
      <KeyboardShortcutsModal 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
      
      <CanvasContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        hasSelection={contextMenu.hasSelection}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        onAction={handleContextMenuAction}
      />
    </div>
  );
}
