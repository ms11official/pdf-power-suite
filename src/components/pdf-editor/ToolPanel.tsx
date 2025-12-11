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
  Hash,
  Highlighter,
  MessageSquare,
  Underline,
  Strikethrough,
  StickyNote,
  Pencil,
  Shapes,
  Paperclip,
  QrCode,
  SpellCheck,
  GitCompare,
  ListChecks,
  Ruler,
  Grid3X3,
  Square,
  Type,
  FileImage,
  Globe,
  Crop,
  MoveHorizontal,
  Link,
  CloudUpload,
  Share2,
  Users,
  Moon,
  Sun,
  Bookmark,
  Search,
  ZoomIn
} from "lucide-react";

interface ToolItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const toolsByCategory: Record<string, ToolItem[]> = {
  view: [
    { id: "zoom-in", label: "Zoom In", description: "Increase view size", icon: ZoomIn },
    { id: "fit-page", label: "Fit Page", description: "Fit to window", icon: Square },
    { id: "search-text", label: "Search", description: "Find text in PDF", icon: Search },
    { id: "bookmark", label: "Bookmarks", description: "Manage bookmarks", icon: Bookmark },
    { id: "dark-mode", label: "Dark Mode", description: "Toggle dark mode", icon: Moon },
    { id: "smooth-scroll", label: "Smooth Scroll", description: "Enable smooth scrolling", icon: MoveHorizontal },
  ],
  edit: [
    { id: "edit-text", label: "Edit Text", description: "Modify existing text", icon: Type },
    { id: "add-text", label: "Add Text", description: "Insert new text", icon: Plus },
    { id: "add-image", label: "Add Image", description: "Insert images", icon: Image },
    { id: "add-shapes", label: "Shapes", description: "Rectangle, circle, arrow", icon: Shapes },
    { id: "add-line", label: "Draw Line", description: "Add lines & arrows", icon: Pencil },
    { id: "add-attachment", label: "Attachment", description: "Attach files", icon: Paperclip },
    { id: "watermark-add", label: "Watermark", description: "Add watermark", icon: Droplets },
    { id: "background", label: "Background", description: "Change background", icon: Square },
  ],
  annotate: [
    { id: "highlight", label: "Highlight", description: "Highlight text", icon: Highlighter },
    { id: "underline", label: "Underline", description: "Underline text", icon: Underline },
    { id: "strikethrough", label: "Strike-through", description: "Cross out text", icon: Strikethrough },
    { id: "sticky-note", label: "Sticky Note", description: "Add sticky notes", icon: StickyNote },
    { id: "comment", label: "Comment", description: "Add comments", icon: MessageSquare },
    { id: "drawing", label: "Drawing", description: "Freehand drawing", icon: Pencil },
  ],
  fill: [
    { id: "fill-form", label: "Fill Form", description: "Fill PDF forms", icon: FileText },
    { id: "signature", label: "Add Signature", description: "Sign documents", icon: PenLine },
    { id: "stamp", label: "Add Stamp", description: "Insert stamps", icon: Stamp },
    { id: "create-form", label: "Create Form", description: "Design form fields", icon: ListChecks },
    { id: "checkbox", label: "Checkbox", description: "Add checkboxes", icon: Square },
    { id: "dropdown", label: "Dropdown", description: "Add dropdowns", icon: FileText },
  ],
  organize: [
    { id: "merge", label: "Merge PDFs", description: "Combine multiple PDFs", icon: Merge },
    { id: "split", label: "Split PDF", description: "Separate pages", icon: Scissors },
    { id: "rotate", label: "Rotate Pages", description: "Rotate orientation", icon: RotateCw },
    { id: "add-page", label: "Add Page", description: "Insert new pages", icon: Plus },
    { id: "delete-page", label: "Delete Page", description: "Remove pages", icon: Trash2 },
    { id: "reorder", label: "Reorder", description: "Drag & drop pages", icon: MoveHorizontal },
    { id: "extract", label: "Extract Pages", description: "Extract selected pages", icon: Scissors },
    { id: "crop", label: "Crop Pages", description: "Crop page margins", icon: Crop },
  ],
  protect: [
    { id: "password", label: "Add Password", description: "Protect with password", icon: Lock },
    { id: "unlock", label: "Unlock PDF", description: "Remove protection", icon: Unlock },
    { id: "redact", label: "Redact", description: "Hide sensitive content", icon: EyeOff },
    { id: "e-sign", label: "E-Signature", description: "Digital signatures", icon: PenLine },
    { id: "permissions", label: "Permissions", description: "Set document permissions", icon: Lock },
    { id: "certificate", label: "Certificate", description: "Add digital certificate", icon: FileText },
  ],
  convert: [
    { id: "to-word", label: "PDF to Word", description: "Convert to .docx", icon: FileText },
    { id: "to-excel", label: "PDF to Excel", description: "Convert to .xlsx", icon: FileSpreadsheet },
    { id: "to-ppt", label: "PDF to PPT", description: "Convert to .pptx", icon: Presentation },
    { id: "to-image", label: "PDF to Image", description: "Convert to JPG/PNG", icon: Image },
    { id: "from-image", label: "Image to PDF", description: "Create from images", icon: ArrowRightLeft },
    { id: "from-text", label: "Text to PDF", description: "Create from text", icon: FileText },
    { id: "from-web", label: "Webpage to PDF", description: "Convert webpage", icon: Globe },
    { id: "ocr", label: "OCR", description: "Extract text (200+ languages)", icon: ScanText },
  ],
  measure: [
    { id: "distance", label: "Distance", description: "Measure distance", icon: Ruler },
    { id: "area", label: "Area", description: "Measure area", icon: Square },
    { id: "perimeter", label: "Perimeter", description: "Measure perimeter", icon: Square },
    { id: "scale", label: "Scale Settings", description: "Set measurement scale", icon: Ruler },
    { id: "grid", label: "Grid", description: "Toggle grid overlay", icon: Grid3X3 },
  ],
  advanced: [
    { id: "compress", label: "Compress", description: "Reduce file size", icon: Minimize2 },
    { id: "repair", label: "Repair", description: "Fix corrupted PDF", icon: Wrench },
    { id: "watermark", label: "Watermark", description: "Add/remove watermark", icon: Droplets },
    { id: "page-numbers", label: "Page Numbers", description: "Add numbering", icon: Hash },
    { id: "qr-code", label: "QR Code", description: "Generate QR codes", icon: QrCode },
    { id: "spell-check", label: "Spell Check", description: "Check spelling", icon: SpellCheck },
    { id: "compare", label: "Compare", description: "Compare documents", icon: GitCompare },
    { id: "ocr-correct", label: "OCR Correction", description: "Fix OCR errors", icon: ScanText },
    { id: "comments-export", label: "Export Comments", description: "Export all comments", icon: FileText },
  ],
  share: [
    { id: "cloud-save", label: "Save to Cloud", description: "Google Drive, OneDrive", icon: CloudUpload },
    { id: "share-link", label: "Share Link", description: "Create shareable link", icon: Link },
    { id: "collaborate", label: "Collaborate", description: "Real-time editing", icon: Users },
    { id: "share-pdf", label: "Share PDF", description: "Send via email", icon: Share2 },
  ],
  create: [
    { id: "blank-pdf", label: "Blank PDF", description: "Create empty PDF", icon: FileText },
    { id: "from-images", label: "From Images", description: "Create from images", icon: FileImage },
    { id: "from-text-file", label: "From Text", description: "Create from text file", icon: FileText },
    { id: "from-webpage", label: "From Webpage", description: "Convert webpage to PDF", icon: Globe },
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
    <div className="bg-accent/50 border-b border-border px-3 py-2 animate-fade-in print:hidden">
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
