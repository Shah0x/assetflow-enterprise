import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Activity, 
  Package, 
  Users, 
  ShieldCheck, 
  Zap, 
  Wrench,
  CornerDownLeft,
  Command,
  PlusCircle,
  CheckSquare,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  onTriggerAction?: (actionType: "add-asset" | "checkout" | "log-ticket") => void;
}

export default function CommandPalette({ onTriggerAction }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset indices and focus on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    {
      id: "dashboard",
      title: "Dashboard Overview",
      description: "Enterprise high-level command center and stats",
      icon: Activity,
      category: "Navigation",
      action: () => navigate("/"),
    },
    {
      id: "assets",
      title: "Inventory Vault",
      description: "Manage physical and virtual hardware assets",
      icon: Package,
      category: "Navigation",
      action: () => navigate("/assets"),
    },
    {
      id: "employees",
      title: "Staff & Allocations",
      description: "Manage team directory and hardware assignments",
      icon: Users,
      category: "Navigation",
      action: () => navigate("/employees"),
    },
    {
      id: "licenses",
      title: "Software Licenses",
      description: "Monitor and assign active SaaS subscriptions",
      icon: ShieldCheck,
      category: "Navigation",
      action: () => navigate("/licenses"),
    },
    {
      id: "consumables",
      title: "Office Consumables",
      description: "Track ink, cartridges, and office essentials",
      icon: Zap,
      category: "Navigation",
      action: () => navigate("/consumables"),
    },
    {
      id: "maintenance",
      title: "Maintenance Hub",
      description: "Log complaints, assign fixes, and view service history",
      icon: Wrench,
      category: "Navigation",
      action: () => navigate("/maintenance"),
    },
    // Quick Actions
    {
      id: "add-asset",
      title: "Provision New Hardware Asset",
      description: "Quickly register new equipment in the vault",
      icon: PlusCircle,
      category: "Actions",
      action: () => {
        setIsOpen(false);
        if (onTriggerAction) onTriggerAction("add-asset");
      },
    },
    {
      id: "checkout",
      title: "Handoff Asset to Employee",
      description: "Assign an available asset to a team member",
      icon: CheckSquare,
      category: "Actions",
      action: () => {
        setIsOpen(false);
        if (onTriggerAction) onTriggerAction("checkout");
      },
    },
    {
      id: "log-ticket",
      title: "Log Hardware Issue / Complaint",
      description: "File a repair ticket for malfunctioning hardware",
      icon: AlertTriangle,
      category: "Actions",
      action: () => {
        setIsOpen(false);
        if (onTriggerAction) onTriggerAction("log-ticket");
      },
    }
  ];

  // Filter items based on search query
  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Handle arrow keys and Enter
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, filteredItems, selectedIndex]);

  return (
    <>
      {/* Keyboard Shortcut Banner / Helper badge */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-zinc-200/80 shadow-lg text-[11px] font-bold text-zinc-500 hover:scale-105 transition-transform cursor-pointer" onClick={() => setIsOpen(true)}>
        <Command className="w-3.5 h-3.5 text-orange-500" />
        <span>Quick Search</span>
        <kbd className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] font-mono ml-1 font-semibold text-zinc-400">Ctrl+K</kbd>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Backdrop with elegant modern blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Command Palette Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden mx-4 flex flex-col max-h-[60vh]"
            >
              {/* Search Header */}
              <div className="flex items-center px-6 border-b border-zinc-100 h-16">
                <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages, modules, or fast-actions..."
                  className="w-full h-full bg-transparent border-none outline-none font-medium text-sm text-zinc-900 placeholder-zinc-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                />
                <div className="flex items-center gap-1 shrink-0 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-xl text-[10px] font-black text-zinc-400">
                  <span>ESC</span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-3 max-h-[45vh] scrollbar-thin">
                {filteredItems.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group by Category if needed, but simple list looks incredible */}
                    <div className="space-y-1">
                      {filteredItems.map((item, idx) => {
                        const Icon = item.icon;
                        const isSelected = idx === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            className={cn(
                              "w-full text-left flex items-center justify-between px-4 py-3 rounded-2xl transition-all group duration-200 border border-transparent",
                              isSelected 
                                ? "bg-orange-50 border-orange-100 text-orange-950" 
                                : "hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950"
                            )}
                            onClick={() => {
                              item.action();
                              setIsOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                          >
                            <div className="flex items-center gap-4.5 min-w-0">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                isSelected 
                                  ? "bg-orange-500 text-white" 
                                  : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold tracking-tight">{item.title}</p>
                                <p className={cn(
                                  "text-xs truncate font-medium mt-0.5",
                                  isSelected ? "text-orange-700/80" : "text-zinc-400"
                                )}>
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            {/* Chevron / Hotkey Hint */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg",
                                item.category === "Actions" 
                                  ? "bg-amber-100 text-amber-700 border-none"
                                  : "bg-zinc-100 text-zinc-500"
                              )}>
                                {item.category}
                              </span>
                              {isSelected && (
                                <CornerDownLeft className="w-4 h-4 text-orange-500 animate-pulse" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                    <Search className="w-10 h-10 text-zinc-200 mb-3" />
                    <p className="text-sm font-bold">No results found for "{search}"</p>
                    <p className="text-xs font-medium text-zinc-400 mt-1">Try searching for 'assets', 'staff', 'licenses' or action words.</p>
                  </div>
                )}
              </div>

              {/* Navigation help footer */}
              <div className="bg-zinc-50/50 px-6 py-3.5 border-t border-zinc-100/80 flex items-center justify-between text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="text-zinc-600 font-bold">↑↓</span> Navigate</span>
                  <span className="flex items-center gap-1"><span className="text-zinc-600 font-bold">↵</span> Select</span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500 font-bold">
                  <span>ASSETFLOW SEARCH ENGINE</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
