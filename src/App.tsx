import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminModeProvider } from "@/contexts/AdminModeContext";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import RouteDetail from "./pages/RouteDetail";
import Explorar from "./pages/Explorar";
import Regularizacion2026 from "./pages/espana/Regularizacion2026";
import Arraigos from "./pages/espana/Arraigos";
import RegularizacionPais from "./pages/espana/RegularizacionPais";
import Recursos from "./pages/Recursos";
import Success from "./pages/Success";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ComingSoon from "./pages/ComingSoon";
import Admin from "./pages/Admin";
import AdminManual from "./pages/AdminManual";
import PartnerDashboard from "./pages/PartnerDashboard";
import LawyerPortal from "./pages/LawyerPortal";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AcceptInvitation from "./pages/AcceptInvitation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AdminModeProvider>
          <AnalyticsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/route/:routeId" element={<RouteDetail />} />
                <Route path="/explorar" element={<Explorar />} />
                {/* España routes */}
                <Route path="/españa/regularizacion" element={<Regularizacion2026 />} />
                <Route path="/españa/regularizacion/:paisId" element={<RegularizacionPais />} />
                <Route path="/españa/arraigos" element={<Arraigos />} />
                <Route path="/recursos" element={<Recursos />} />
                {/* Legacy redirect */}
                <Route path="/regularizacion" element={<Navigate to="/españa/arraigos" replace />} />
                <Route path="/success" element={<Success />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/aceptar-invitacion" element={<AcceptInvitation />} />
                <Route path="/terminos" element={<Terms />} />
                <Route path="/privacidad" element={<Privacy />} />
                <Route path="/destinos/:countryId" element={<ComingSoon />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/manual" element={<AdminManual />} />
                <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                <Route path="/portal-abogado" element={<LawyerPortal />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AnalyticsProvider>
        </AdminModeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
