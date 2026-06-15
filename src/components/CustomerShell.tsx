import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { AssistantPanel } from "@/components/AssistantPanel";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/Toaster";

/**
 * Chrome for the customer-facing storefront: top nav, shopping assistant,
 * and cart. The churn-rescue tooling lives in the admin console, not here.
 */
export function CustomerShell() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 py-8">
        <Outlet />
      </main>
      <AssistantPanel />
      <CartDrawer />
      <Toaster />
    </div>
  );
}
