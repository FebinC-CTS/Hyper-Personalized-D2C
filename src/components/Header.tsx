import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  MessageSquare,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useAssistant, useCart, usePersona } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import type { PersonaId } from "@/types";

const navItems = [
  { to: "/home", label: "Home" },
  { to: "/catalog", label: "Catalog" },
];

export function Header() {
  const { persona, personas, setPersonaId } = usePersona();
  const { toggleAssistant } = useAssistant();
  const { count, openCart } = useCart();
  const navigate = useNavigate();

  const handlePersonaChange = (id: PersonaId) => {
    setPersonaId(id);
    navigate("/home");
  };

  const handleExit = () => {
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-6">
        <NavLink to="/home" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-primo-900 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold text-slate-900">
            Primo <span className="text-primo-700">IQ</span>
          </span>
        </NavLink>

        <nav className="ml-2 flex items-center gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Dropdown>
            <DropdownTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm transition-colors hover:bg-slate-50"
                aria-label="Switch persona"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primo-900 text-[11px] font-semibold text-white">
                  {persona.avatarInitials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-medium text-slate-900">
                    {persona.name}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {persona.role}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownLabel>Switch persona</DropdownLabel>
              {personas.map((p) => (
                <DropdownItem
                  key={p.id}
                  selected={p.id === persona.id}
                  onSelect={() => handlePersonaChange(p.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-primo-900 text-[11px] font-semibold text-white">
                      {p.avatarInitials}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {p.role} · {p.location}
                      </span>
                    </div>
                  </div>
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>

          <Button variant="ai" size="sm" onClick={toggleAssistant}>
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">AI Assistant</span>
          </Button>

          <button
            onClick={openCart}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral-500 px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExit}
            title="Switch to a different shopper"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Switch shopper</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
