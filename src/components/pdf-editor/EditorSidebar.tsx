import { useState, useRef, useEffect } from "react";
import { 
  Pencil, 
  PenTool, 
  LayoutGrid, 
  Shield, 
  ArrowLeftRight, 
  Wand2,
  Settings,
  HelpCircle,
  User,
  PanelLeftClose,
  PanelLeft,
  Columns,
  Eye,
  MessageSquare,
  Ruler,
  Share2,
  FilePlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainItems = [
  { id: "view", label: "View & Read", icon: Eye, color: "text-cyan-500" },
  { id: "edit", label: "Edit", icon: Pencil, color: "text-primary" },
  { id: "annotate", label: "Annotate", icon: MessageSquare, color: "text-yellow-500" },
  { id: "fill", label: "Fill & Sign", icon: PenTool, color: "text-rose-500" },
  { id: "organize", label: "Organize", icon: LayoutGrid, color: "text-amber-500" },
  { id: "protect", label: "Protect", icon: Shield, color: "text-green-500" },
  { id: "convert", label: "Convert", icon: ArrowLeftRight, color: "text-sky-500" },
  { id: "measure", label: "Measure", icon: Ruler, color: "text-indigo-500" },
  { id: "advanced", label: "Advanced", icon: Wand2, color: "text-slate-500" },
  { id: "create", label: "Create PDF", icon: FilePlus, color: "text-teal-500" },
  { id: "share", label: "Share", icon: Share2, color: "text-lime-500" },
];

const bottomItems = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
];

export type SidebarMode = "expanded" | "collapsed" | "hover";

interface EditorSidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  sidebarMode: SidebarMode;
  onSidebarModeChange: (mode: SidebarMode) => void;
}

export function EditorSidebar({ activeItem, onItemClick, sidebarMode, onSidebarModeChange }: EditorSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isExpanded = sidebarMode === "expanded" || (sidebarMode === "hover" && isHovered);

  const getModeIcon = () => {
    switch (sidebarMode) {
      case "expanded": return <PanelLeft className="w-4 h-4" />;
      case "collapsed": return <PanelLeftClose className="w-4 h-4" />;
      case "hover": return <Columns className="w-4 h-4" />;
    }
  };

  return (
    <aside 
      ref={sidebarRef}
      className={cn(
        "bg-card h-full flex flex-col border-r border-border transition-all duration-300 print:hidden",
        isExpanded ? "w-[200px]" : "w-12"
      )}
      onMouseEnter={() => sidebarMode === "hover" && setIsHovered(true)}
      onMouseLeave={() => sidebarMode === "hover" && setIsHovered(false)}
    >
      <div className="p-2 border-b border-border flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              {getModeIcon()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover z-50">
            <DropdownMenuItem onClick={() => onSidebarModeChange("expanded")} className={cn(sidebarMode === "expanded" && "bg-accent")}>
              <PanelLeft className="w-4 h-4 mr-2" />
              Expanded
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSidebarModeChange("collapsed")} className={cn(sidebarMode === "collapsed" && "bg-accent")}>
              <PanelLeftClose className="w-4 h-4 mr-2" />
              Collapsed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSidebarModeChange("hover")} className={cn(sidebarMode === "hover" && "bg-accent")}>
              <Columns className="w-4 h-4 mr-2" />
              Expand on Hover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
        {mainItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => onItemClick(item.id)} 
            className={cn(
              "sidebar-item w-full text-left", 
              activeItem === item.id && "sidebar-item-active", 
              !isExpanded && "justify-center px-0"
            )} 
            title={!isExpanded ? item.label : undefined}
          >
            <item.icon className={cn("w-4 h-4 shrink-0", activeItem === item.id ? "text-primary-foreground" : item.color)} />
            {isExpanded && <span className="font-medium truncate">{item.label}</span>}
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
              activeItem === item.id && "sidebar-item-active", 
              !isExpanded && "justify-center px-0"
            )} 
            title={!isExpanded ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {isExpanded && <span className="font-medium truncate">{item.label}</span>}
          </button>
        ))}
        <button 
          onClick={() => onItemClick("profile")} 
          className={cn(
            "sidebar-item w-full text-left mt-2", 
            activeItem === "profile" && "sidebar-item-active", 
            !isExpanded && "justify-center px-0"
          )} 
          title={!isExpanded ? "Profile" : undefined}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-primary-foreground" />
          </div>
          {isExpanded && <span className="font-medium truncate">Profile</span>}
        </button>
      </div>
    </aside>
  );
}
