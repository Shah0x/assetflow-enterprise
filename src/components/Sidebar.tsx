import { useAuth } from "../hooks/useAuth.tsx";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  History, 
  Settings, 
  LogOut,
  Building2,
  Menu,
  ChevronRight,
  ShieldCheck,
  Zap,
  MousePointer2,
  Wrench,
  MapPin,
  FileText,
  Database,
  Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

const navGroups = [
  {
    label: "Intelligence",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Reports", href: "/reports", icon: FileText },
    ]
  },
  {
    label: "Inventory",
    items: [
      { name: "All Assets", href: "/assets", icon: Package },
      { name: "Licenses", href: "/licenses", icon: ShieldCheck },
      { name: "Consumables", href: "/consumables", icon: Zap },
      { name: "Accessories", href: "/accessories", icon: MousePointer2 },
    ]
  },
  {
    label: "Operations",
    items: [
      { name: "Maintenance", href: "/maintenance", icon: Wrench },
      { name: "People", href: "/employees", icon: Users },
      { name: "Locations", href: "/locations", icon: MapPin },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Audit Trail", href: "/audit", icon: History },
      { name: "Configuration", href: "/settings", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div 
      initial={false}
      animate={{ width: isOpen ? 288 : 88 }}
      className={cn(
        "h-screen bg-[#09090b] text-zinc-400 border-r border-zinc-900 flex flex-col z-50 overflow-hidden relative"
      )}
    >
      <div className="p-6 flex items-center justify-between mx-2 mb-4">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 text-white font-black text-2xl tracking-tighter"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="hidden sm:inline">AssetFlow<span className="text-orange-500">.</span></span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
        >
          <Menu className={cn("w-5 h-5 transition-transform", !isOpen && "rotate-180")} />
        </Button>
      </div>

      <div className="px-4 mb-6">
        <div className={cn(
          "flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-500 transition-all",
          !isOpen && "justify-center px-0"
        )}>
           <Search className="w-4 h-4 shrink-0" />
           {isOpen && <span className="text-xs font-medium tracking-tight">Search system...</span>}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pt-2">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            <AnimatePresence>
              {isOpen && (
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600"
                >
                  {group.label}
                </motion.h3>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                      isActive 
                        ? "bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-white font-bold" 
                        : "hover:bg-zinc-900 hover:text-zinc-200"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" 
                      />
                    )}
                    <Icon className={cn(
                      "w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110",
                      isActive ? "text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    {isOpen && <span className="text-sm tracking-tight">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        <div className={cn(
          "bg-zinc-900/30 rounded-2xl p-3 border border-zinc-900 group cursor-pointer hover:bg-zinc-900/50 transition-all",
          !isOpen && "p-1"
        )}>
           <div className={cn(
            "flex items-center gap-3",
            !isOpen && "justify-center"
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-black shadow-lg border border-zinc-800">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>
            {isOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-white truncate leading-tight">{user?.name}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{user?.role?.replace("_", " ")}</span>
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start gap-4 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl py-6 transition-all group",
            !isOpen && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
          {isOpen && <span className="font-bold uppercase tracking-widest text-[11px]">Logout</span>}
        </Button>
      </div>
    </motion.div>
  );
}
