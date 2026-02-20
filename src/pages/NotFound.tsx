import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import isotipoAlbus from "@/assets/isotipo-albus.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="bg-background border border-border rounded-2xl p-10 text-center max-w-md mx-4 shadow-sm">
        <img src={isotipoAlbus} alt="Albus" className="w-14 h-14 mx-auto mb-6" />
        <h1 className="text-6xl font-bold tracking-tight mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-8">Página no encontrada</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <a href="/dashboard">Volver al Dashboard</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Ir al Inicio</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
