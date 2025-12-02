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
      <div className="flex-1 bg-canvas flex items-center justify-center p-8">
        <div
          {...getRootProps()}
          className={cn(
            "drop-zone max-w-xl w-full flex flex-col items-center justify-center text-center cursor-pointer",
            isDragActive && "drop-zone-active"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-6">
            <FileText className={cn(
              "w-10 h-10 text-primary transition-transform duration-200",
              isDragActive && "scale-110"
            )} />
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {isDragActive ? "Drop your PDF here" : "No Document Loaded"}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            To get started, please open a file from your computer or simply drag and drop a PDF here.
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
    <div className="flex-1 bg-canvas overflow-auto p-8">
      <div 
        className="mx-auto bg-card shadow-soft-lg rounded-lg overflow-hidden"
        style={{ 
          width: `${595 * (zoom / 100)}px`,
          minHeight: `${842 * (zoom / 100)}px`
        }}
      >
        {/* PDF content would render here */}
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <p>PDF Preview - Page {currentPage}</p>
        </div>
      </div>
    </div>
  );
}
