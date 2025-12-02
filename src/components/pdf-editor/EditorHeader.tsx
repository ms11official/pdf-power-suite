import { FileText, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditorHeaderProps {
  fileName: string | null;
  currentPage: number;
  totalPages: number;
}

export function EditorHeader({ fileName, currentPage, totalPages }: EditorHeaderProps) {
  return (
    <header className="h-11 bg-card border-b border-border flex items-center justify-between px-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-primary" />
          </div>
          <h1 className="text-sm font-bold text-foreground">PDF Pro</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs">
        {fileName ? (
          <>
            <span className="text-muted-foreground truncate max-w-[150px]">{fileName}</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">No document loaded</span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input 
            placeholder="Search" 
            className="pl-7 h-7 w-40 text-xs bg-secondary border-0"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-full h-7 w-7">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <User className="w-3 h-3 text-primary-foreground" />
          </div>
        </Button>
      </div>
    </header>
  );
}
