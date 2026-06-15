import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "@/store";
import { RequireRole } from "@/components/RequireRole";
import { CustomerShell } from "@/components/CustomerShell";
import { AdminShell } from "@/components/admin/AdminShell";
import Landing from "@/routes/Landing";
import Home from "@/routes/Home";
import Catalog from "@/routes/Catalog";
import Dashboard from "@/routes/admin/Dashboard";
import Customers from "@/routes/admin/Customers";
import CatalogAdmin from "@/routes/admin/CatalogAdmin";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Portal chooser */}
          <Route path="/" element={<Landing />} />

          {/* Customer storefront */}
          <Route
            element={
              <RequireRole role="customer">
                <CustomerShell />
              </RequireRole>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
          </Route>

          {/* Admin console */}
          <Route
            element={
              <RequireRole role="admin">
                <AdminShell />
              </RequireRole>
            }
          >
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/catalog" element={<CatalogAdmin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
