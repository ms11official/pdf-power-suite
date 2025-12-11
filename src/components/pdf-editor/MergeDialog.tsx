import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Merge, Upload, X, GripVertical, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";

interface MergeFile {
  id: string;
  file: File;
  name: string;
  pages: number;
}

interface MergeDialogProps {
  open: boolean;
  onClose: () => void;
  onMergeComplete: (mergedPdfUrl: string, fileName: string) => void;
  currentPdfUrl?: string | null;
  currentFileName?: string | null;
}

export function MergeDialog({
  open,
  onClose,
  onMergeComplete,
  currentPdfUrl,
  currentFileName,
}: MergeDialogProps) {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: MergeFile[] = [];

    for (const file of acceptedFiles) {
      if (file.type === "application/pdf") {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          newFiles.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            pages: pdfDoc.getPageCount(),
          });
        } catch (error) {
          toast.error(`Failed to load ${file.name}`);
        }
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);
    setFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleMerge = async () => {
    if (files.length < 1) {
      toast.error("Add at least one PDF to merge");
      return;
    }

    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();

      // Add current PDF first if exists
      if (currentPdfUrl) {
        const currentPdfBytes = await fetch(currentPdfUrl).then((res) =>
          res.arrayBuffer()
        );
        const currentPdfDoc = await PDFDocument.load(currentPdfBytes);
        const pages = await mergedPdf.copyPages(
          currentPdfDoc,
          currentPdfDoc.getPageIndices()
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      // Add all selected PDFs
      for (const pdfFile of files) {
        const pdfBytes = await pdfFile.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const mergedName = currentFileName
        ? currentFileName.replace(".pdf", "_merged.pdf")
        : "merged_document.pdf";

      onMergeComplete(url, mergedName);
      setFiles([]);
      toast.success(
        `Successfully merged ${(currentPdfUrl ? 1 : 0) + files.length} PDFs!`
      );
      onClose();
    } catch (error) {
      console.error("Merge error:", error);
      toast.error("Failed to merge PDFs");
    } finally {
      setIsMerging(false);
    }
  };

  const totalPages =
    files.reduce((sum, f) => sum + f.pages, 0) +
    (currentPdfUrl ? files.length > 0 ? 0 : 0 : 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="w-5 h-5 text-primary" />
            Merge PDFs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentPdfUrl && (
            <div className="p-3 bg-accent rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Current Document</p>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium truncate">
                  {currentFileName || "Current PDF"}
                </span>
              </div>
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop PDFs here..."
                : "Drag & drop PDFs or click to select"}
            </p>
          </div>

          {files.length > 0 && (
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-2">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-2 bg-accent rounded-lg cursor-move ${
                      draggedIndex === index ? "opacity-50" : ""
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.pages} pages
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleRemove(file.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {files.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Drag to reorder • {files.length} file(s) selected
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={files.length === 0 || isMerging}>
            {isMerging ? "Merging..." : "Merge PDFs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
