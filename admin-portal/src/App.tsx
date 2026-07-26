import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PATHS } from "./router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Topbar } from "./components/Topbar";
import Login from "./pages/Login";
import MerchantList from "./pages/MerchantList";
import MerchantNew from "./pages/MerchantNew";
import MerchantDetail from "./pages/MerchantDetail";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <main>{children}</main>
    </div>
  );
}

function protect(children: ReactNode) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path={PATHS.login} element={<Login />} />
      <Route path={PATHS.merchants} element={protect(<MerchantList />)} />
      <Route path={PATHS.merchantNew} element={protect(<MerchantNew />)} />
      <Route path={PATHS.merchantDetail()} element={protect(<MerchantDetail />)} />
      <Route path="*" element={<Navigate to={PATHS.merchants} replace />} />
    </Routes>
  );
}
