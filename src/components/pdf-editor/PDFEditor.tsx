import { useState, useCallback, useRef } from "react";
import { EditorHeader } from "./EditorHeader";
import { EditorSidebar } from "./EditorSidebar";
import { EditorToolbar } from "./EditorToolbar";
import { PDFCanvas } from "./PDFCanvas";
import { PageThumbnails } from "./PageThumbnails";
import { ZoomControls } from "./ZoomControls";
import { ToolPanel } from "./ToolPanel";
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setFileName(file.name);
    setTotalPages(5); // Simulated - would come from PDF.js
    setCurrentPage(1);
    toast.success(`Loaded: ${file.name}`);
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
    toast.info("Undo action");
  }, []);

  const handleRedo = useCallback(() => {
    toast.info("Redo action");
  }, []);

  const handleToolClick = useCallback((toolId: string) => {
    setActiveTool(toolId);
    toast.info(`Selected: ${toolId}`);
  }, []);

  const handleCategoryToolClick = useCallback((toolId: string) => {
    toast.info(`Tool: ${toolId}`);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
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
      
      <EditorHeader 
        fileName={fileName} 
        currentPage={currentPage} 
        totalPages={totalPages} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar 
          activeItem={activeCategory} 
          onItemClick={setActiveCategory} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar
            activeTool={activeTool}
            onToolClick={handleToolClick}
            onUndo={handleUndo}
            onRedo={handleRedo}
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
              onFileUpload={handleFileUpload}
            />
            
            <PageThumbnails
              totalPages={totalPages}
              currentPage={currentPage}
              onPageClick={setCurrentPage}
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
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}
