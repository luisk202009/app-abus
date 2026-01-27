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

        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
        
        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-6">
            Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al acceder y utilizar Albus ("la Plataforma"), aceptas estar vinculado por estos Términos y Condiciones. 
              Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio. 
              Estos términos se aplican a todos los visitantes, usuarios y otras personas que accedan o utilicen el servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Albus es una plataforma tecnológica de asistencia que proporciona herramientas y recursos 
              para facilitar el proceso de migración a España. El servicio incluye:
            </p>
            <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
              <li>Generación automática de documentos pre-rellenados</li>
              <li>Seguimiento personalizado de tu proceso migratorio</li>
              <li>Almacenamiento seguro de documentos</li>
              <li>Acceso a recursos y guías informativas</li>
              <li>Herramientas de planificación y organización</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Cuenta de Usuario</h2>
            <p className="text-muted-foreground leading-relaxed">
              Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, así como de restringir 
              el acceso a tu computadora. Aceptas la responsabilidad de todas las actividades que ocurran bajo 
              tu cuenta o contraseña. Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta 
              o cualquier otra violación de seguridad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Pagos y Suscripciones</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Albus ofrece planes de suscripción con diferentes niveles de funcionalidad. Los pagos se procesan 
              de forma segura a través de <strong>Stripe</strong>, un procesador de pagos líder mundial.
            </p>
            <h3 className="text-xl font-medium mb-3">4.1 Facturación</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Las suscripciones Pro se facturan mensualmente. El ciclo de facturación comienza en la fecha de 
              tu suscripción inicial y se renueva automáticamente cada mes hasta que canceles.
            </p>
            <h3 className="text-xl font-medium mb-3">4.2 Cancelación</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Puedes cancelar tu suscripción en cualquier momento desde tu panel de control. Al cancelar, 
              seguirás teniendo acceso a las funciones Pro hasta el final del período de facturación actual. 
              No se realizan reembolsos por períodos parciales.
            </p>
            <h3 className="text-xl font-medium mb-3">4.3 Reembolsos</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ofrecemos reembolsos completos dentro de los primeros 14 días de tu suscripción inicial si no 
              estás satisfecho con el servicio. Para solicitar un reembolso, contacta a nuestro equipo de soporte.
            </p>
            <h3 className="text-xl font-medium mb-3">4.4 Disputas de Pago</h3>
            <p className="text-muted-foreground leading-relaxed">
              Si tienes alguna disputa sobre un cargo, te animamos a contactarnos primero para resolver el 
              problema directamente. Las disputas se gestionan según las políticas de Stripe y las regulaciones 
              aplicables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed font-medium mb-4">
              <strong>IMPORTANTE:</strong> Albus es una plataforma tecnológica de asistencia. No proporcionamos asesoramiento legal 
              ni somos un despacho de abogados. La información proporcionada a través de nuestra plataforma 
              es únicamente orientativa y no constituye asesoramiento legal profesional.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En ningún caso Albus, ni sus directores, empleados, socios, agentes, proveedores o afiliados, 
              serán responsables por cualquier daño indirecto, incidental, especial, consecuente o punitivo, 
              incluyendo sin limitación, pérdida de beneficios, datos, uso, buena voluntad, u otras pérdidas 
              intangibles, resultantes de tu acceso o uso del servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Propiedad Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La Plataforma y su contenido original, características y funcionalidad son y seguirán siendo 
              propiedad exclusiva de Albus LLC y sus licenciantes. La Plataforma está protegida por derechos 
              de autor, marcas registradas y otras leyes tanto de España como de otros países.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Los documentos generados a través de la Plataforma utilizando tus datos personales te pertenecen. 
              Sin embargo, las plantillas, algoritmos y sistemas utilizados para generarlos son propiedad de Albus.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Terminación del Servicio</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Podemos terminar o suspender tu cuenta y acceso al servicio inmediatamente, sin previo aviso 
              ni responsabilidad, por cualquier razón, incluyendo sin limitación si incumples estos Términos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Tras la terminación, tu derecho a usar el servicio cesará inmediatamente. Si deseas terminar 
              tu cuenta, puedes simplemente dejar de usar el servicio o cancelar tu suscripción desde el 
              panel de control. Tendrás 30 días para descargar tus documentos antes de que sean eliminados 
              permanentemente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Ley Aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en 
              cuenta sus disposiciones sobre conflictos de leyes. Cualquier disputa que surja en relación 
              con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de Madrid, España. 
              Si eres consumidor residente en la Unión Europea, también tendrás derecho a presentar reclamaciones 
              ante los tribunales de tu país de residencia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos 
              en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso con al 
              menos 30 días de anticipación antes de que los nuevos términos entren en vigor. Lo que constituye 
              un cambio material será determinado a nuestra sola discreción. Al continuar accediendo o usando 
              nuestro servicio después de que esas revisiones entren en vigor, aceptas estar vinculado por 
              los términos revisados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier pregunta sobre estos Términos y Condiciones, contáctanos en:
            </p>
            <ul className="list-none mt-4 text-muted-foreground space-y-2">
              <li><strong>Email:</strong> legal@albus.es</li>
              <li><strong>Soporte:</strong> hola@albus.es</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
