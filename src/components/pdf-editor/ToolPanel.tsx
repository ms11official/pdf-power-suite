import { 
  ArrowRightLeft,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  ScanText,
  Merge,
  Scissors,
  RotateCw,
  Plus,
  Trash2,
  Lock,
  Unlock,
  EyeOff,
  PenLine,
  Stamp,
  Minimize2,
  Wrench,
  Droplets,
  Hash
} from "lucide-react";

interface ToolItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const toolsByCategory: Record<string, ToolItem[]> = {
  edit: [
    { id: "edit-text", label: "Edit Text", description: "Modify existing text", icon: FileText },
    { id: "add-text", label: "Add Text", description: "Insert new text", icon: Plus },
    { id: "add-image", label: "Add Image", description: "Insert images", icon: Image },
    { id: "highlight", label: "Highlight", description: "Highlight text", icon: Stamp },
    { id: "comment", label: "Add Comment", description: "Add annotations", icon: FileText },
  ],
  fill: [
    { id: "fill-form", label: "Fill Form", description: "Fill PDF forms", icon: FileText },
    { id: "signature", label: "Add Signature", description: "Sign documents", icon: PenLine },
    { id: "stamp", label: "Add Stamp", description: "Insert stamps", icon: Stamp },
  ],
  organize: [
    { id: "merge", label: "Merge PDFs", description: "Combine multiple PDFs", icon: Merge },
    { id: "split", label: "Split PDF", description: "Separate pages", icon: Scissors },
    { id: "rotate", label: "Rotate Pages", description: "Rotate page orientation", icon: RotateCw },
    { id: "add-page", label: "Add Page", description: "Insert new pages", icon: Plus },
    { id: "delete-page", label: "Delete Page", description: "Remove pages", icon: Trash2 },
  ],
  protect: [
    { id: "password", label: "Add Password", description: "Protect with password", icon: Lock },
    { id: "unlock", label: "Unlock PDF", description: "Remove protection", icon: Unlock },
    { id: "redact", label: "Redact", description: "Hide sensitive content", icon: EyeOff },
    { id: "e-sign", label: "E-Signature", description: "Digital signatures", icon: PenLine },
  ],
  convert: [
    { id: "to-word", label: "PDF to Word", description: "Convert to .docx", icon: FileText },
    { id: "to-excel", label: "PDF to Excel", description: "Convert to .xlsx", icon: FileSpreadsheet },
    { id: "to-ppt", label: "PDF to PPT", description: "Convert to .pptx", icon: Presentation },
    { id: "to-image", label: "PDF to Image", description: "Convert to JPG/PNG", icon: Image },
    { id: "from-image", label: "Image to PDF", description: "Create from images", icon: ArrowRightLeft },
    { id: "ocr", label: "OCR", description: "Extract text", icon: ScanText },
  ],
  advanced: [
    { id: "compress", label: "Compress", description: "Reduce file size", icon: Minimize2 },
    { id: "repair", label: "Repair", description: "Fix corrupted PDF", icon: Wrench },
    { id: "watermark", label: "Watermark", description: "Add/remove watermark", icon: Droplets },
    { id: "page-numbers", label: "Page Numbers", description: "Add numbering", icon: Hash },
  ],
};

interface ToolPanelProps {
  activeCategory: string;
  onToolClick: (toolId: string) => void;
}

export function ToolPanel({ activeCategory, onToolClick }: ToolPanelProps) {
  const tools = toolsByCategory[activeCategory] || [];

  if (tools.length === 0) return null;

  return (
    <div className="bg-accent/50 border-b border-border px-3 py-2 animate-fade-in">
      <div className="flex flex-wrap gap-1.5">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolClick(tool.id)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-card rounded-lg hover:bg-accent hover:shadow-soft transition-all duration-200 group"
          >
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <tool.icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-xs text-foreground">{tool.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{tool.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
