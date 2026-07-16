import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth.tsx";
import Layout from "./components/Layout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Assets from "./pages/Assets.tsx";
import Employees from "./pages/Employees.tsx";
import Licenses from "./pages/Licenses.tsx";
import Consumables from "./pages/Consumables.tsx";
import Maintenance from "./pages/Maintenance.tsx";
import Login from "./pages/Login.tsx";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-medium text-zinc-500">Authenticating...</p>
      </div>
    </div>
  );
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="employees" element={<Employees />} />
            <Route path="licenses" element={<Licenses />} />
            <Route path="consumables" element={<Consumables />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="accessories" element={<div className="p-10 font-bold text-zinc-400">ACCESSORIES MODULE (READY FOR EXPANSION)</div>} />
            <Route path="locations" element={<div className="p-10 font-bold text-zinc-400">LOCATIONS MODULE (READY FOR EXPANSION)</div>} />
            <Route path="reports" element={<div className="p-10 font-bold text-zinc-400">REPORTING ENGINE (UPGRADING...)</div>} />
            <Route path="audit" element={<div className="p-10 font-bold text-zinc-400">SECURITY AUDIT LOGS</div>} />
            <Route path="settings" element={<div className="p-10 font-bold text-zinc-400">SYSTEM CONFIGURATION</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
