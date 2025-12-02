import { FileText, Search, User, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditorHeaderProps {
  fileName: string | null;
  currentPage: number;
  totalPages: number;
}

export function EditorHeader({ fileName, currentPage, totalPages }: EditorHeaderProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground">PDF Pro</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        {fileName ? (
          <>
            <span className="text-muted-foreground">{fileName}</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">No document loaded</span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search document" 
            className="pl-10 w-64 bg-secondary border-0"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        </Button>
      </div>
    </header>
  );
}
