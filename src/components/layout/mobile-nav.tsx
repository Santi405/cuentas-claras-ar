"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { NavLinks } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded border border-line px-3 py-2 text-sm"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X aria-hidden size={16} /> : <Menu aria-hidden size={16} />}
        {open ? "Cerrar menú" : "Menú"}
      </button>
      {open ? (
        <div id={menuId} className="mt-3 border-t border-line pt-3">
          <NavLinks className="flex flex-col gap-3" onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
