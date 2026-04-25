import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Lawyer {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  bar_number: string | null;
  college: string | null;
  city: string | null;
  bio: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  is_verified: boolean | null;
  is_active: boolean | null;
}

export interface CaseManagement {
  id: string;
  inquiry_id: string | null;
  stage: string | null;
  lawyer_notes: string | null;
  appointment_date: string | null;
  appointment_lot: string | null;
  appointment_notes: string | null;
  tie_status: string | null;
  tie_appointment_date: string | null;
  updated_at: string | null;
}

export interface InquiryWithDetails {
  id: string;
  user_id: string | null;
  lawyer_id: string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
  client_name: string | null;
  client_email: string | null;
  case: CaseManagement | null;
}

export interface LawyerService {
  id: string;
  lawyer_id: string | null;
  service_type_id: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  is_active: boolean | null;
  service_type_name?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  slug: string;
  is_active: boolean | null;
}

export interface ChecklistItem {
  id: string;
  case_id: string | null;
  item: string;
  is_completed: boolean | null;
  order_index: number | null;
}

export const useLawyerData = () => {
  const { user } = useAuth();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inquiries, setInquiries] = useState<InquiryWithDetails[]>([]);
  const [services, setServices] = useState<LawyerService[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  const fetchLawyer = useCallback(async () => {
    if (!user) {
      setLawyer(null);
      setIsLoading(false);
      return null;
    }
    const { data } = await supabase
      .from("lawyers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setLawyer(data as Lawyer | null);
    setIsLoading(false);
    return data as Lawyer | null;
  }, [user]);

  const fetchInquiries = useCallback(async (lawyerId: string) => {
    const { data: inq } = await supabase
      .from("lawyer_inquiries")
      .select("*")
      .eq("lawyer_id", lawyerId)
      .order("created_at", { ascending: false });

    if (!inq || inq.length === 0) {
      setInquiries([]);
      return;
    }

    const userIds = Array.from(new Set(inq.map((i: any) => i.user_id).filter(Boolean)));
    const inquiryIds = inq.map((i: any) => i.id);

    const [{ data: subs }, { data: cases }] = await Promise.all([
      userIds.length
        ? supabase.from("onboarding_submissions").select("user_id, full_name, email").in("user_id", userIds)
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("case_management").select("*").in("inquiry_id", inquiryIds),
    ]);

    const subMap = new Map<string, any>();
    (subs || []).forEach((s: any) => {
      if (s.user_id && !subMap.has(s.user_id)) subMap.set(s.user_id, s);
    });
    const caseMap = new Map<string, any>();
    (cases || []).forEach((c: any) => {
      if (c.inquiry_id) caseMap.set(c.inquiry_id, c);
    });

    const merged: InquiryWithDetails[] = inq.map((i: any) => ({
      id: i.id,
      user_id: i.user_id,
      lawyer_id: i.lawyer_id,
      message: i.message,
      status: i.status,
      created_at: i.created_at,
      client_name: subMap.get(i.user_id)?.full_name ?? null,
      client_email: subMap.get(i.user_id)?.email ?? null,
      case: caseMap.get(i.id) ?? null,
    }));
    setInquiries(merged);
  }, []);

  const fetchServices = useCallback(async (lawyerId: string) => {
    const { data } = await supabase
      .from("lawyer_services")
      .select("*, service_types(name)")
      .eq("lawyer_id", lawyerId)
      .order("created_at", { ascending: false });
    const mapped = (data || []).map((s: any) => ({
      ...s,
      service_type_name: s.service_types?.name,
    }));
    setServices(mapped);
  }, []);

  const fetchServiceTypes = useCallback(async () => {
    const { data } = await supabase
      .from("service_types")
      .select("*")
      .eq("is_active", true)
      .order("name");
    setServiceTypes((data || []) as ServiceType[]);
  }, []);

  useEffect(() => {
    (async () => {
      const l = await fetchLawyer();
      if (l) {
        await Promise.all([fetchInquiries(l.id), fetchServices(l.id), fetchServiceTypes()]);
      }
    })();
  }, [fetchLawyer, fetchInquiries, fetchServices, fetchServiceTypes]);

  const refreshInquiries = useCallback(() => {
    if (lawyer) return fetchInquiries(lawyer.id);
  }, [lawyer, fetchInquiries]);

  const refreshServices = useCallback(() => {
    if (lawyer) return fetchServices(lawyer.id);
  }, [lawyer, fetchServices]);

  return {
    lawyer,
    setLawyer,
    isLoading,
    isLawyer: !!lawyer,
    inquiries,
    services,
    serviceTypes,
    refreshLawyer: fetchLawyer,
    refreshInquiries,
    refreshServices,
  };
};
