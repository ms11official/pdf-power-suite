import { useEffect, useState, useCallback, useRef } from "react";
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
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map());
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const generatedRef = useRef(false);

  useEffect(() => {
    if (!pdfUrl) { 
      setThumbnails(new Map()); 
      setPdfPageCount(0);
      generatedRef.current = false;
      return; 
    }
    
    if (generatedRef.current) return;
    generatedRef.current = true;
    
    const generateThumbnails = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        setPdfPageCount(pdf.numPages);
        const thumbsMap = new Map<number, string>();
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement("canvas");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
          thumbsMap.set(i, canvas.toDataURL());
        }
        setThumbnails(thumbsMap);
      } catch (error) { 
        console.error("Error generating thumbnails:", error); 
        generatedRef.current = false;
      }
    };
    generateThumbnails();
  }, [pdfUrl]);

  const handleAddPageClick = useCallback(() => {
    onAddPage();
  }, [onAddPage]);

  if (collapsed) {
    return (
      <button onClick={onToggleCollapse} className="w-8 bg-card border-l border-border flex items-center justify-center hover:bg-secondary transition-colors" title="Show thumbnails">
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  const displayPages = Math.max(totalPages, pdfPageCount, 1);

  return (
    <aside className="w-[160px] bg-card border-l border-border flex flex-col">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-xs text-foreground">Pages ({displayPages})</h3>
        <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-secondary transition-colors" title="Hide thumbnails">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {Array.from({ length: displayPages }, (_, i) => {
          const pageNum = i + 1;
          const thumb = thumbnails.get(pageNum);
          const isBlankPage = pageNum > pdfPageCount;
          
          return (
            <button key={pageNum} onClick={() => onPageClick(pageNum)} className="w-full">
              <div className={cn(
                "thumbnail-card aspect-[7/9] overflow-hidden",
                currentPage === pageNum && "thumbnail-card-active"
              )}>
                {thumb ? (
                  <img src={thumb} alt={`Page ${pageNum}`} className="w-full h-full object-contain bg-white rounded-sm" />
                ) : (
                  <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
                    {isBlankPage ? (
                      <span className="text-muted-foreground text-[10px]">Blank</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">{pageNum}</span>
                    )}
                  </div>
                )}
              </div>
              <p className={cn(
                "mt-1 text-center text-xs font-medium",
                currentPage === pageNum ? "text-primary" : "text-muted-foreground"
              )}>
                {pageNum}
              </p>
            </button>
          );
        })}
        <button 
          onClick={handleAddPageClick} 
          className="w-full thumbnail-card aspect-[7/9] flex flex-col items-center justify-center gap-1 hover:border-primary group"
          type="button"
        >
          <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Add Page</span>
        </button>
      </div>
    </aside>
  );
}
