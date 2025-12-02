import { cn } from "@/lib/utils";

interface PageThumbnailsProps {
  totalPages: number;
  currentPage: number;
  onPageClick: (page: number) => void;
}

export function PageThumbnails({ totalPages, currentPage, onPageClick }: PageThumbnailsProps) {
  return (
    <aside className="w-[140px] bg-thumbnail border-l border-border flex flex-col">
      <div className="px-2 py-1.5 border-b border-border">
        <h3 className="font-semibold text-xs text-foreground">Thumbnails</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageClick(page)}
            className={cn(
              "thumbnail-card w-full aspect-[3/4] flex items-center justify-center",
              currentPage === page && "thumbnail-card-active"
            )}
          >
            <span className="text-muted-foreground text-[10px]">{page}</span>
          </button>
        ))}
        
        {totalPages === 0 && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="thumbnail-card w-full aspect-[3/4] flex items-center justify-center opacity-40"
              >
                <span className="text-muted-foreground text-[10px]">{i}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
