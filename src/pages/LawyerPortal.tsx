import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerData, InquiryWithDetails } from "@/hooks/useLawyerData";
import { LawyerPortalHeader } from "@/components/lawyer-portal/LawyerPortalHeader";
import { LawyerCasesList } from "@/components/lawyer-portal/LawyerCasesList";
import { LawyerCaseDetail } from "@/components/lawyer-portal/LawyerCaseDetail";
import { LawyerServicesTab } from "@/components/lawyer-portal/LawyerServicesTab";
import { LawyerProfileTab } from "@/components/lawyer-portal/LawyerProfileTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const LawyerPortal = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { lawyer, isLoading, isLawyer, inquiries, services, serviceTypes, refreshInquiries, refreshServices, refreshLawyer } = useLawyerData();
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithDetails | null>(null);

  useEffect(() => {
    // Solo redirigir cuando estemos seguros de que no hay sesión.
    // Esperamos a que termine la hidratación de auth.
    if (!authLoading && !user) {
      // Pequeño retardo para evitar rebote en hidratación tardía
      const t = setTimeout(() => navigate("/"), 250);
      return () => clearTimeout(t);
    }
  }, [authLoading, user, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user && !isLawyer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Cuenta sin perfil de abogado</h1>
          <p className="text-sm text-muted-foreground">
            Tu cuenta no está registrada como abogado verificado en Albus. Si crees que es un error, contacta al administrador en{" "}
            <a href="mailto:l@albus.com.co" className="underline">l@albus.com.co</a>.
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-sm underline text-muted-foreground hover:text-foreground"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!lawyer) return null;

  const refreshSelected = async () => {
    await refreshInquiries();
  };

  // Sync selected inquiry with refreshed list
  const currentSelected = selectedInquiry
    ? inquiries.find((i) => i.id === selectedInquiry.id) || selectedInquiry
    : null;

  return (
    <div className="min-h-screen bg-background">
      <LawyerPortalHeader lawyerName={lawyer.full_name} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases">Mis Casos</TabsTrigger>
            <TabsTrigger value="services">Mis Servicios</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-4">
            {currentSelected ? (
              <LawyerCaseDetail
                inquiry={currentSelected}
                onBack={() => setSelectedInquiry(null)}
                onRefresh={refreshSelected}
              />
            ) : (
              <>
                <h2 className="text-lg font-semibold">Mis casos ({inquiries.length})</h2>
                <LawyerCasesList inquiries={inquiries} onSelect={setSelectedInquiry} />
              </>
            )}
          </TabsContent>

          <TabsContent value="services">
            <LawyerServicesTab
              lawyerId={lawyer.id}
              services={services}
              serviceTypes={serviceTypes}
              onRefresh={refreshServices}
            />
          </TabsContent>

          <TabsContent value="profile">
            <LawyerProfileTab lawyer={lawyer} onRefresh={refreshLawyer} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LawyerPortal;
