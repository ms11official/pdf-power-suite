import { 
  Pencil, 
  PenTool, 
  LayoutGrid, 
  Shield, 
  ArrowLeftRight, 
  Wand2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainItems = [
  { id: "edit", label: "Edit & Annotate", icon: Pencil, color: "text-primary" },
  { id: "fill", label: "Fill & Sign", icon: PenTool, color: "text-rose-500" },
  { id: "organize", label: "Organize Pages", icon: LayoutGrid, color: "text-amber-500" },
  { id: "protect", label: "Protect & Secure", icon: Shield, color: "text-green-500" },
  { id: "convert", label: "Convert Files", icon: ArrowLeftRight, color: "text-sky-500" },
  { id: "advanced", label: "Advanced Tools", icon: Wand2, color: "text-slate-500" },
];

const bottomItems = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
];

interface EditorSidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function EditorSidebar({ activeItem, onItemClick, collapsed, onToggleCollapse }: EditorSidebarProps) {
  return (
    <aside className={cn("bg-card h-full flex flex-col border-r border-border transition-all duration-300", collapsed ? "w-12" : "w-[200px]")}>
      <div className="p-2 border-b border-border flex justify-end">
        <button onClick={onToggleCollapse} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
        {mainItems.map((item) => (
          <button key={item.id} onClick={() => onItemClick(item.id)} className={cn("sidebar-item w-full text-left", activeItem === item.id && "sidebar-item-active", collapsed && "justify-center px-0")} title={collapsed ? item.label : undefined}>
            <item.icon className={cn("w-4 h-4 shrink-0", activeItem === item.id ? "text-primary" : item.color)} />
            {!collapsed && <span className="font-medium truncate">{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-2 border-t border-border space-y-0.5">
        {bottomItems.map((item) => (
          <button key={item.id} onClick={() => onItemClick(item.id)} className={cn("sidebar-item w-full text-left", activeItem === item.id && "sidebar-item-active", collapsed && "justify-center px-0")} title={collapsed ? item.label : undefined}>
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="font-medium truncate">{item.label}</span>}
          </button>
        ))}
        <button onClick={() => onItemClick("profile")} className={cn("sidebar-item w-full text-left mt-2", activeItem === "profile" && "sidebar-item-active", collapsed && "justify-center px-0")} title={collapsed ? "Profile" : undefined}>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-medium truncate">Profile</span>}
        </button>
      </div>
    </aside>
  );
}
