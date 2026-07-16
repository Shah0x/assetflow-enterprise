import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-200/80 pt-6 text-zinc-400 font-medium text-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 AssetFlow SaaS. All rights reserved.</p>
        <p className="flex items-center gap-1.5 font-semibold text-zinc-500">
          <span>Crafted by</span>
          <span className="text-orange-500 hover:text-orange-600 transition-colors">Shahmeer Akram</span>
        </p>
      </div>
    </footer>
  );
}
