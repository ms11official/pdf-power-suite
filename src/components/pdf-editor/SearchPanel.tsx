import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronUp, ChevronDown, Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SearchResult {
  page: number;
  text: string;
  index: number;
}

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onNavigateToResult: (result: SearchResult) => void;
  results: SearchResult[];
  currentResultIndex: number;
  onNextResult: () => void;
  onPrevResult: () => void;
  isSearching: boolean;
}

export function SearchPanel({
  open,
  onClose,
  onSearch,
  onNavigateToResult,
  results,
  currentResultIndex,
  onNextResult,
  onPrevResult,
  isSearching,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  }, [query, onSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Enter" && !e.shiftKey) {
        if (results.length > 0) {
          onNextResult();
        } else {
          handleSearch();
        }
      } else if (e.key === "Enter" && e.shiftKey) {
        onPrevResult();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results.length, onNextResult, onPrevResult, onClose, handleSearch]);

  if (!open) return null;

  return (
    <div className="absolute right-4 top-2 bg-card border border-border rounded-lg shadow-lg z-50 w-80 animate-fade-in">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in document..."
          className="h-8 text-xs border-0 focus-visible:ring-0 p-0"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        {results.length > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5">
            {currentResultIndex + 1}/{results.length}
          </Badge>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
        >
          {isSearching ? "Searching..." : "Find"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onPrevResult}
          disabled={results.length === 0}
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onNextResult}
          disabled={results.length === 0}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {results.length > 0 && (
        <div className="max-h-48 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={`${result.page}-${result.index}`}
              className={cn(
                "flex items-start gap-2 p-2 hover:bg-accent cursor-pointer text-xs border-b border-border last:border-0",
                index === currentResultIndex && "bg-primary/10"
              )}
              onClick={() => onNavigateToResult(result)}
            >
              <Highlighter className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-[10px]">Page {result.page}</p>
                <p className="truncate">{result.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && !isSearching && (
        <p className="text-xs text-muted-foreground text-center py-3">
          No results found
        </p>
      )}
    </div>
  );
}
