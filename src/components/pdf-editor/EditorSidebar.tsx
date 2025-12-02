import { 
  Pencil, 
  PenTool, 
  LayoutGrid, 
  Shield, 
  ArrowLeftRight, 
  Wand2,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color?: string;
}

const mainItems: SidebarItem[] = [
  { id: "edit", label: "Edit & Annotate", icon: Pencil },
  { id: "fill", label: "Fill & Sign", icon: PenTool },
  { id: "organize", label: "Organize Pages", icon: LayoutGrid },
  { id: "protect", label: "Protect & Secure", icon: Shield },
  { id: "convert", label: "Convert Files", icon: ArrowLeftRight },
  { id: "advanced", label: "Advanced Tools", icon: Wand2 },
];

const bottomItems: SidebarItem[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
];

interface EditorSidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
}

export function EditorSidebar({ activeItem, onItemClick }: EditorSidebarProps) {
  return (
    <aside className="w-[200px] bg-sidebar h-full flex flex-col border-r border-border">
      <nav className="flex-1 p-2 space-y-0.5">
        {mainItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "sidebar-item w-full text-left",
              activeItem === item.id && "sidebar-item-active"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-2 border-t border-border space-y-0.5">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "sidebar-item w-full text-left",
              activeItem === item.id && "sidebar-item-active"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
