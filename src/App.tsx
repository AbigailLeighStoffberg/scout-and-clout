import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import MerchantDashboard from "./pages/MerchantDashboard"; // KEEP THIS
import ScoutDashboard from "./pages/ScoutDashboard";
import CuratorStudio from "./dashboards/CuratorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "merchant" | "curator";
}) {
  const { isAuthenticated, user } = useAppStore();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (requiredRole && !user?.role) return <Navigate to="/auth" replace />;

  // Multi-role check: Checks if the user's role matches or if they have dual roles
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === "merchant" ? "/merchant" : "/scout"} replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* MERCHANT ROUTES - All pointing to the Cyberpunk Dashboard */}
          <Route
            path="/merchant"
            element={
              <ProtectedRoute requiredRole="merchant">
                <MerchantDashboard />
              </ProtectedRoute>
            }
          />
          {/* We point /merchant/manage to the SAME dashboard to avoid breaking links */}
          <Route
            path="/merchant/manage"
            element={
              <ProtectedRoute requiredRole="merchant">
                <MerchantDashboard />
              </ProtectedRoute>
            }
          />

          {/* SCOUT ROUTES */}
          <Route
            path="/scout"
            element={
              <ProtectedRoute requiredRole="curator">
                <ScoutDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout/studio"
            element={
              <ProtectedRoute requiredRole="curator">
                <CuratorStudio />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;