import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { AssistantPanel } from "@/components/AssistantPanel";
import { ChurnModal } from "@/components/ChurnModal";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/Toaster";

export function AppShell() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 py-8">
        <Outlet />
      </main>
      <AssistantPanel />
      <ChurnModal />
      <CartDrawer />
      <Toaster />
    </div>
  );
}
