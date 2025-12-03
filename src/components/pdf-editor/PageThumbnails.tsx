import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

interface PageThumbnailsProps {
  totalPages: number;
  currentPage: number;
  onPageClick: (page: number) => void;
  onAddPage: () => void;
  pdfUrl: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function PageThumbnails({ totalPages, currentPage, onPageClick, onAddPage, pdfUrl, collapsed, onToggleCollapse }: PageThumbnailsProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    if (!pdfUrl || totalPages === 0) { setThumbnails([]); return; }
    const generateThumbnails = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const thumbs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement("canvas");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
          thumbs.push(canvas.toDataURL());
        }
        setThumbnails(thumbs);
      } catch (error) { console.error("Error generating thumbnails:", error); }
    };
    generateThumbnails();
  }, [pdfUrl, totalPages]);

  if (collapsed) {
    return (
      <button onClick={onToggleCollapse} className="w-8 bg-card border-l border-border flex items-center justify-center hover:bg-secondary transition-colors" title="Show thumbnails">
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <aside className="w-[160px] bg-card border-l border-border flex flex-col">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-xs text-foreground">Page Thumbnails</h3>
        <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-secondary transition-colors" title="Hide thumbnails">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {thumbnails.length > 0 ? thumbnails.map((thumb, index) => (
          <button key={index} onClick={() => onPageClick(index + 1)} className="w-full">
            <div className={cn("thumbnail-card aspect-[7/9] overflow-hidden", currentPage === index + 1 && "thumbnail-card-active")}>
              <img src={thumb} alt={`Page ${index + 1}`} className="w-full h-full object-contain bg-white rounded-sm" />
            </div>
            <p className={cn("mt-1 text-center text-xs font-medium", currentPage === index + 1 ? "text-primary" : "text-muted-foreground")}>{index + 1}</p>
          </button>
        )) : Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="w-full">
            <div className="thumbnail-card aspect-[7/9] flex items-center justify-center opacity-40"><span className="text-muted-foreground text-xs">{i + 1}</span></div>
            <p className="mt-1 text-center text-xs font-medium text-muted-foreground">{i + 1}</p>
          </div>
        ))}
        <button onClick={onAddPage} className="w-full thumbnail-card aspect-[7/9] flex flex-col items-center justify-center gap-1 hover:border-primary group">
          <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Add Page</span>
        </button>
      </div>
    </aside>
  );
}
