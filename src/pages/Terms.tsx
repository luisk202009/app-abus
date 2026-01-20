import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Términos de Servicio</h1>
        
        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-6">
            Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al acceder y utilizar Albus, aceptas estar vinculado por estos Términos de Servicio. 
              Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Albus es una plataforma tecnológica de asistencia que proporciona herramientas y recursos 
              para facilitar el proceso de migración a España. El servicio incluye generación de documentos, 
              seguimiento de procesos y almacenamiento seguro de documentos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed font-medium">
              Albus es una plataforma tecnológica de asistencia. No proporcionamos asesoramiento legal 
              ni somos un despacho de abogados. La información proporcionada a través de nuestra plataforma 
              es únicamente orientativa y no constituye asesoramiento legal profesional.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Cuenta de Usuario</h2>
            <p className="text-muted-foreground leading-relaxed">
              Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. 
              Aceptas notificarnos inmediatamente cualquier uso no autorizado de tu cuenta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Pagos y Suscripciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las suscripciones Pro se facturan mensualmente. Puedes cancelar tu suscripción en cualquier momento, 
              y seguirás teniendo acceso hasta el final del período de facturación actual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier pregunta sobre estos Términos de Servicio, contáctanos en hola@albus.es
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
