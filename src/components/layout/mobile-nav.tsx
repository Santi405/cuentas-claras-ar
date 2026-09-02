"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLinks } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm"
        aria-expanded={open}
        aria-controls="menu-movil"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X aria-hidden size={16} /> : <Menu aria-hidden size={16} />}
        Menú
      </button>
      {open ? (
        <div id="menu-movil" className="mt-3 border-t border-line pt-3">
          <NavLinks className="flex flex-col gap-3" onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
