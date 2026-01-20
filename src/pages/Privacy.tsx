import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-6">
            Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Recopilamos información que nos proporcionas directamente, incluyendo tu nombre, 
              correo electrónico, nacionalidad, y otros datos necesarios para ayudarte en tu proceso 
              de migración a España.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Generar documentos pre-rellenados con tu información</li>
              <li>Enviar comunicaciones relacionadas con el servicio</li>
              <li>Mejorar nuestros servicios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Almacenamiento y Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tus datos se almacenan de forma segura utilizando encriptación de nivel bancario. 
              Los documentos que subes a nuestra plataforma están protegidos y solo tú tienes acceso a ellos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Compartir Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              No vendemos ni compartimos tu información personal con terceros, excepto cuando 
              sea necesario para proporcionar nuestros servicios o cuando lo exija la ley.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Tus Derechos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. 
              Puedes ejercer estos derechos contactándonos directamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies esenciales para el funcionamiento de la plataforma. 
              No utilizamos cookies de seguimiento o publicidad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier pregunta sobre esta Política de Privacidad, contáctanos en privacidad@albus.es
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
