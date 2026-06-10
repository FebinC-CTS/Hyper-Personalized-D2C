import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "@/store";
import { AppShell } from "@/components/AppShell";
import Landing from "@/routes/Landing";
import Home from "@/routes/Home";
import Catalog from "@/routes/Catalog";
import Analytics from "@/routes/Analytics";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
