import { useState } from "react";
import Sidebar from "./Sidebar.tsx";
import { Outlet } from "react-router-dom";
import Footer from "./Footer.tsx";
import CommandPalette from "./CommandPalette.tsx";
import QuickActionModals from "./QuickActionModals.tsx";

export default function Layout() {
  const [activeModal, setActiveModal] = useState<"add-asset" | "checkout" | "log-ticket" | null>(null);

  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette onTriggerAction={setActiveModal} />

      {/* Global Quick Action Modals */}
      <QuickActionModals 
        activeType={activeModal} 
        onClose={() => setActiveModal(null)} 
        onSuccess={() => {
          // Soft-refresh the active page to synchronize database state with UI
          window.location.reload();
        }}
      />
    </div>
  );
}
