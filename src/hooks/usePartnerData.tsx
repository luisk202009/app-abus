import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PartnerAssignment {
  id: string;
  partner_id: string;
  user_id: string;
  case_status: string;
  assigned_at: string;
  notes: string | null;
}

export interface PartnerClient {
  assignment: PartnerAssignment;
  fullName: string | null;
  email: string | null;
  routeName: string | null;
}

export interface PartnerDocument {
  id: string;
  user_id: string;
  category: string;
  document_type: string;
  file_url: string | null;
  file_name: string | null;
  status: string | null;
  validation_message: string | null;
  updated_at: string | null;
}

export interface PartnerComment {
  id: string;
  document_id: string;
  author_email: string;
  content: string;
  created_at: string;
}

export const usePartnerData = () => {
  const { user } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [clients, setClients] = useState<PartnerClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPartner, setIsPartner] = useState(false);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const init = async () => {
      const { data: partner } = await supabase
        .from("partners")
        .select("id, team_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!partner) { setIsLoading(false); return; }

      setPartnerId(partner.id);
      setTeamName(partner.team_name);
      setIsPartner(true);

      await loadClients(partner.id);
    };

    init();
  }, [user]);

  const loadClients = async (pid: string) => {
    setIsLoading(true);
    try {
      const { data: assignments } = await supabase
        .from("partner_assignments")
        .select("*")
        .eq("partner_id", pid);

      if (!assignments || assignments.length === 0) {
        setClients([]);
        return;
      }

      const userIds = assignments.map((a) => a.user_id);

      const { data: submissions } = await supabase
        .from("onboarding_submissions")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const { data: routes } = await supabase
        .from("user_active_routes")
        .select("user_id, template_id")
        .in("user_id", userIds);

      const { data: templates } = await supabase
        .from("route_templates")
        .select("id, name");

      const tMap: Record<string, string> = {};
      (templates || []).forEach((t) => { tMap[t.id] = t.name; });

      const subMap: Record<string, { full_name: string | null; email: string | null }> = {};
      (submissions || []).forEach((s) => {
        if (s.user_id) subMap[s.user_id] = { full_name: s.full_name, email: s.email };
      });

      const routeMap: Record<string, string> = {};
      (routes || []).forEach((r) => {
        if (r.user_id && r.template_id) routeMap[r.user_id] = tMap[r.template_id] || "";
      });

      const enriched: PartnerClient[] = assignments.map((a) => ({
        assignment: a,
        fullName: subMap[a.user_id]?.full_name || null,
        email: subMap[a.user_id]?.email || null,
        routeName: routeMap[a.user_id] || null,
      }));

      setClients(enriched);
    } catch (err) {
      console.error("Error loading partner clients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCaseStatus = async (assignmentId: string, newStatus: string) => {
    // Find the user_id for this assignment
    const assignment = clients.find((c) => c.assignment.id === assignmentId);
    
    const { error } = await supabase
      .from("partner_assignments")
      .update({ case_status: newStatus })
      .eq("id", assignmentId);

    // When marked as "aprobada", create/update user_appointments
    if (!error && newStatus === "aprobada" && assignment) {
      const userId = assignment.assignment.user_id;
      const { data: existing } = await supabase
        .from("user_appointments")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase.from("user_appointments")
          .update({ application_status: "aprobada", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_appointments")
          .insert({ user_id: userId, application_status: "aprobada" });
      }
    }

    if (!error && partnerId) await loadClients(partnerId);
    return { error };
  };

  const fetchClientDocuments = async (userId: string) => {
    const { data } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data || []) as PartnerDocument[];
  };

  const fetchDocumentComments = async (documentId: string) => {
    const { data } = await supabase
      .from("document_comments")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true });
    return (data || []) as PartnerComment[];
  };

  const addComment = async (documentId: string, content: string) => {
    const email = user?.email || "partner";
    const { error } = await supabase
      .from("document_comments")
      .insert({ document_id: documentId, author_email: email, content });
    return { error };
  };

  const updateDocumentStatus = async (docId: string, status: string) => {
    const { error } = await supabase
      .from("user_documents")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", docId);
    return { error };
  };

  const refresh = useCallback(() => {
    if (partnerId) loadClients(partnerId);
  }, [partnerId]);

  return {
    isPartner,
    isLoading,
    partnerId,
    teamName,
    clients,
    updateCaseStatus,
    fetchClientDocuments,
    fetchDocumentComments,
    addComment,
    updateDocumentStatus,
    refresh,
  };
};
