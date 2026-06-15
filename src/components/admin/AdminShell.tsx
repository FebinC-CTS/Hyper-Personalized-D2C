import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useSession } from "@/store";
import { ChurnModal } from "@/components/ChurnModal";
import { Toaster } from "@/components/Toaster";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false },
  { to: "/admin/catalog", label: "Catalog", icon: Package, end: false },
];

/**
 * Chrome for the staff-facing admin console. Deliberately distinct from the
 * customer storefront: dark sidebar, staff identity, no cart or shopping
 * assistant. Retention tooling (churn rescue) lives here.
 */
export function AdminShell() {
  const { admin, exitSession } = useSession();
  const navigate = useNavigate();

  const handleSignOut = () => {
    exitSession();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* Sidebar */}
      <aside className="flex shrink-0 flex-col border-r border-slate-800 bg-primo-900 text-slate-200 lg:h-screen lg:w-64 lg:sticky lg:top-0">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">
              Primo <span className="text-primo-300">IQ</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-primo-300">
              Admin Console
            </div>
          </div>
        </div>

        <nav className="flex flex-row gap-1 px-3 py-3 lg:flex-1 lg:flex-col">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Staff identity + sign out */}
        <div className="hidden border-t border-white/10 px-3 py-3 lg:block">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-xs font-semibold text-white">
              {admin.initials}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-medium text-white">
                {admin.name}
              </div>
              <div className="truncate text-[11px] text-primo-300">
                {admin.title}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Primo Brands · Internal
            </div>
            <div className="text-sm font-semibold text-slate-900">
              Customer Intelligence
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-medium text-slate-900">
                {admin.name}
              </div>
              <div className="text-[10px] text-slate-500">{admin.email}</div>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primo-900 text-xs font-semibold text-white">
              {admin.initials}
            </span>
            <button
              onClick={handleSignOut}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>

      <ChurnModal />
      <Toaster />
    </div>
  );
}
