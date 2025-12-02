import { cn } from "@/lib/utils";

interface PageThumbnailsProps {
  totalPages: number;
  currentPage: number;
  onPageClick: (page: number) => void;
}

export function PageThumbnails({ totalPages, currentPage, onPageClick }: PageThumbnailsProps) {
  return (
    <aside className="w-[200px] bg-thumbnail border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">Page Thumbnails</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageClick(page)}
            className={cn(
              "thumbnail-card w-full aspect-[3/4] flex items-center justify-center",
              currentPage === page && "thumbnail-card-active"
            )}
          >
            <span className="text-muted-foreground text-xs">{page}</span>
          </button>
        ))}
        
        {totalPages === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="thumbnail-card w-full aspect-[3/4] flex items-center justify-center opacity-40"
              >
                <span className="text-muted-foreground text-xs">{i}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
