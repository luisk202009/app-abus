import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerData } from "@/hooks/usePartnerData";
import { PartnerSummaryStats } from "@/components/partner/PartnerSummaryStats";
import { PartnerClientList } from "@/components/partner/PartnerClientList";
import { PartnerDocumentReview } from "@/components/partner/PartnerDocumentReview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Scale } from "lucide-react";
import { toast } from "sonner";
import albusLogo from "@/assets/albus-logo.png";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const {
    isPartner, isLoading, teamName, clients,
    updateCaseStatus, fetchClientDocuments, fetchDocumentComments,
    addComment, updateDocumentStatus, refresh,
  } = usePartnerData();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user]);

  useEffect(() => {
    if (!isLoading && !isPartner && !authLoading && user) navigate("/dashboard");
  }, [isLoading, isPartner, authLoading, user]);

  const handleStatusChange = async (assignmentId: string, status: string) => {
    const { error } = await updateCaseStatus(assignmentId, status);
    if (error) toast.error("Error al actualizar estado");
    else toast.success("Estado del caso actualizado");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isPartner) return null;

  const selectedClient = clients.find((c) => c.assignment.user_id === selectedUserId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={albusLogo} alt="Albus" className="h-8" />
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-sm">{teamName}</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Portal de Partners</h1>

        <PartnerSummaryStats clients={clients} />

        <Card>
          <CardHeader>
            <CardTitle>Clientes Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUserId ? (
              <PartnerDocumentReview
                userId={selectedUserId}
                clientName={selectedClient?.fullName || null}
                fetchDocuments={fetchClientDocuments}
                fetchComments={fetchDocumentComments}
                addComment={addComment}
                updateDocStatus={updateDocumentStatus}
                onBack={() => setSelectedUserId(null)}
              />
            ) : (
              <PartnerClientList
                clients={clients}
                onSelectClient={setSelectedUserId}
                onStatusChange={handleStatusChange}
                selectedUserId={selectedUserId}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PartnerDashboard;
