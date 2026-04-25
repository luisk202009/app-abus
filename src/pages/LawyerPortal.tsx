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
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && !isLoading && user && !isLawyer) navigate("/");
  }, [authLoading, isLoading, user, isLawyer, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
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
