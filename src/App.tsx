import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "@/store";
import { CustomerShell } from "@/components/CustomerShell";
import Home from "@/routes/Home";
import Catalog from "@/routes/Catalog";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route element={<CustomerShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
