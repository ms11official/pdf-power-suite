import { useState } from "react";
import { Bookmark, Plus, Edit2, Trash2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface BookmarkItem {
  id: string;
  title: string;
  page: number;
}

interface BookmarkPanelProps {
  open: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  onAddBookmark: (title: string, page: number) => void;
  onEditBookmark: (id: string, title: string) => void;
  onDeleteBookmark: (id: string) => void;
  onNavigate: (page: number) => void;
  currentPage: number;
}

export function BookmarkPanel({
  open,
  onClose,
  bookmarks,
  onAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
  onNavigate,
  currentPage,
}: BookmarkPanelProps) {
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddBookmark(newTitle.trim(), currentPage);
      setNewTitle("");
    }
  };

  const handleStartEdit = (bookmark: BookmarkItem) => {
    setEditingId(bookmark.id);
    setEditTitle(bookmark.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onEditBookmark(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle("");
    }
  };

  if (!open) return null;

  return (
    <div className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border shadow-lg z-40 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Bookmarks</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-3 border-b border-border">
        <div className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`Bookmark page ${currentPage}`}
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="sm" className="h-8 px-2" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {bookmarks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No bookmarks yet. Add one above.
            </p>
          ) : (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={cn(
                  "group flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors",
                  bookmark.page === currentPage && "bg-accent"
                )}
              >
                {editingId === bookmark.id ? (
                  <div className="flex-1 flex gap-1">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-6 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={handleSaveEdit}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => onNavigate(bookmark.page)}
                    >
                      <p className="text-xs font-medium truncate">{bookmark.title}</p>
                      <p className="text-[10px] text-muted-foreground">Page {bookmark.page}</p>
                    </div>
                    <div className="hidden group-hover:flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(bookmark);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBookmark(bookmark.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
