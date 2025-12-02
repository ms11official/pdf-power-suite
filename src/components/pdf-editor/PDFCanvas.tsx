import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PDFCanvasProps {
  pdfUrl: string | null;
  currentPage: number;
  zoom: number;
  onFileUpload: (file: File) => void;
}

export function PDFCanvas({ pdfUrl, currentPage, zoom, onFileUpload }: PDFCanvasProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  if (!pdfUrl) {
    return (
      <div className="flex-1 bg-canvas flex items-center justify-center p-4">
        <div
          {...getRootProps()}
          className={cn(
            "drop-zone max-w-sm w-full flex flex-col items-center justify-center text-center cursor-pointer",
            isDragActive && "drop-zone-active"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3">
            <FileText className={cn(
              "w-6 h-6 text-primary transition-transform duration-200",
              isDragActive && "scale-110"
            )} />
          </div>
          
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {isDragActive ? "Drop your PDF here" : "No Document Loaded"}
          </h3>
          
          <p className="text-xs text-muted-foreground mb-3">
            Open a file or drag and drop a PDF here
          </p>
          
          <Button size="sm" className="gap-1.5 text-xs h-7">
            <FileUp className="w-3 h-3" />
            Open File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-canvas overflow-auto p-4">
      <div 
        className="mx-auto bg-card shadow-soft-lg rounded-md overflow-hidden"
        style={{ 
          width: `${595 * (zoom / 100)}px`,
          minHeight: `${842 * (zoom / 100)}px`
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
          <p>PDF Preview - Page {currentPage}</p>
        </div>
      </div>
    </div>
  );
}
