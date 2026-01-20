import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Lock, FileText, BookOpen } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  plan_requirement: string;
  category: string | null;
}

interface ResourcesSectionProps {
  isPremium: boolean;
  onCheckout: () => void;
  isCheckoutLoading: boolean;
}

export const ResourcesSection = ({ isPremium, onCheckout, isCheckoutLoading }: ResourcesSectionProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (resource: Resource) => {
    if (resource.plan_requirement === "pro" && !isPremium) {
      onCheckout();
      return;
    }

    if (resource.file_url) {
      window.open(resource.file_url, "_blank");
    }
  };

  const groupedResources = resources.reduce((acc, resource) => {
    const category = resource.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Próximamente más recursos</h3>
          <p className="text-muted-foreground">
            Estamos preparando guías, plantillas y herramientas para tu proceso migratorio.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedResources).map(([category, categoryResources]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold">{category}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {categoryResources.map((resource) => {
              const isLocked = resource.plan_requirement === "pro" && !isPremium;

              return (
                <Card
                  key={resource.id}
                  className={`transition-all ${isLocked ? "opacity-80" : "hover:shadow-md"}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-lg">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{resource.title}</CardTitle>
                          {resource.file_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {resource.file_name}
                            </p>
                          )}
                        </div>
                      </div>
                      {resource.plan_requirement === "pro" && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          PRO
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  {resource.description && (
                    <CardContent className="pt-0 pb-3">
                      <CardDescription>{resource.description}</CardDescription>
                    </CardContent>
                  )}
                  <CardContent className="pt-0">
                    <Button
                      variant={isLocked ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleDownload(resource)}
                      disabled={isCheckoutLoading}
                    >
                      {isCheckoutLoading && isLocked ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isLocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Desbloquear con Pro
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
