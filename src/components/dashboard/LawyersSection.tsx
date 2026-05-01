import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LawyerCard, type LawyerCardData } from "./LawyerCard";
import { LawyerProfileModal } from "./LawyerProfileModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, Scale } from "lucide-react";

interface LawyersSectionProps {
  hasAccess: boolean;
  onUpgrade: () => void;
  isUpgradeLoading?: boolean;
}

const SPECIALTY_OPTIONS = [
  { value: "all", label: "Todas las especialidades" },
  { value: "regularización", label: "Regularización" },
  { value: "arraigos", label: "Arraigos" },
  { value: "recursos", label: "Recursos" },
  { value: "nómada digital", label: "Nómada Digital" },
];

export const LawyersSection = ({ hasAccess, onUpgrade, isUpgradeLoading = false }: LawyersSectionProps) => {
  const [lawyers, setLawyers] = useState<LawyerCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [specialty, setSpecialty] = useState("all");
  const [city, setCity] = useState("all");
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerCardData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data: lawyersData, error } = await supabase
          .from("lawyers")
          .select("id, full_name, city, photo_url, specialties, languages, college, bar_number, bio")
          .eq("is_verified", true)
          .eq("is_active", true);

        if (error) throw error;

        const ids = (lawyersData || []).map((l) => l.id);
        let priceMap: Record<string, number> = {};
        if (ids.length > 0) {
          const { data: services } = await supabase
            .from("lawyer_services")
            .select("lawyer_id, price")
            .eq("is_active", true)
            .in("lawyer_id", ids);

          (services || []).forEach((s) => {
            if (!s.lawyer_id || s.price === null) return;
            const current = priceMap[s.lawyer_id];
            if (current === undefined || Number(s.price) < current) {
              priceMap[s.lawyer_id] = Number(s.price);
            }
          });
        }

        setLawyers(
          (lawyersData || []).map((l) => ({
            ...l,
            minPrice: priceMap[l.id] ?? null,
          }))
        );
      } catch (err) {
        console.error("Error loading lawyers:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const cities = useMemo(() => {
    const unique = Array.from(
      new Set(lawyers.map((l) => l.city).filter((c): c is string => Boolean(c)))
    );
    return unique.sort();
  }, [lawyers]);

  const filtered = useMemo(() => {
    return lawyers.filter((l) => {
      const specOk =
        specialty === "all" ||
        (l.specialties || []).some((s) => s.toLowerCase() === specialty.toLowerCase());
      const cityOk = city === "all" || l.city === city;
      return specOk && cityOk;
    });
  }, [lawyers, specialty, city]);

  const handleView = (lawyer: LawyerCardData) => {
    if (!hasAccess) return;
    setSelectedLawyer(lawyer);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="w-6 h-6" />
          Directorio de Abogados Verificados
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Conecta con abogados especializados en extranjería verificados por Albus.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Especialidad" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALTY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid + overlay */}
      <div className="relative">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Scale className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No encontramos abogados con esos filtros.</p>
          </div>
        ) : (
          <div
            className={
              !hasAccess
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pointer-events-none blur-sm select-none"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            }
          >
            {filtered.map((l) => (
              <LawyerCard key={l.id} lawyer={l} onView={handleView} />
            ))}
          </div>
        )}

        {!hasAccess && !isLoading && filtered.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm rounded-lg">
            <div className="bg-background border rounded-xl p-6 max-w-sm text-center shadow-lg space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Directorio Premium</h3>
              <p className="text-sm text-muted-foreground">
                Disponible para usuarios Premium y usuarios de Regularización 2026.
              </p>
              <Button onClick={onUpgrade} className="w-full">
                Mejorar mi plan
              </Button>
            </div>
          </div>
        )}
      </div>

      <LawyerProfileModal
        lawyer={selectedLawyer}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};
