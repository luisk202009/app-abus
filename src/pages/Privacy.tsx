import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const { hash } = useLocation();
  
  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

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
            <p className="text-muted-foreground leading-relaxed mb-4">
              Recopilamos información que nos proporcionas directamente, incluyendo:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Datos de identificación:</strong> nombre completo, correo electrónico, nacionalidad</li>
              <li><strong>Datos migratorios:</strong> situación laboral, profesión, ubicación actual, planes de residencia</li>
              <li><strong>Datos financieros:</strong> rango de ingresos y ahorros (para evaluar requisitos de visado)</li>
              <li><strong>Documentos:</strong> archivos que subes a la plataforma para tu proceso migratorio</li>
              <li><strong>Datos de pago:</strong> procesados de forma segura por Stripe (no almacenamos datos de tarjetas)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Base Legal del Tratamiento (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Tratamos tus datos personales bajo las siguientes bases legales:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Ejecución del contrato:</strong> para proporcionarte los servicios que has contratado</li>
              <li><strong>Consentimiento:</strong> para comunicaciones de marketing (puedes retirarlo en cualquier momento)</li>
              <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios y prevenir fraudes</li>
              <li><strong>Obligación legal:</strong> para cumplir con requisitos fiscales y regulatorios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Uso de la Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Personalizar tu experiencia y roadmap migratorio</li>
              <li>Generar documentos pre-rellenados con tu información</li>
              <li>Procesar pagos y gestionar tu suscripción</li>
              <li>Enviar comunicaciones relacionadas con el servicio</li>
              <li>Mejorar nuestros servicios mediante análisis agregados</li>
              <li>Prevenir fraude y garantizar la seguridad de la plataforma</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Procesadores de Datos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Compartimos tus datos con los siguientes proveedores de servicios que actúan como procesadores:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Stripe:</strong> procesamiento de pagos (certificado PCI-DSS Nivel 1)</li>
              <li><strong>Supabase:</strong> almacenamiento de base de datos y autenticación (servidores en UE)</li>
              <li><strong>Resend:</strong> envío de correos electrónicos transaccionales</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Todos nuestros procesadores están sujetos a acuerdos de procesamiento de datos (DPA) que 
              cumplen con el GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Almacenamiento y Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tus datos se almacenan de forma segura utilizando encriptación de nivel bancario (AES-256). 
              Los documentos que subes a nuestra plataforma están protegidos y solo tú tienes acceso a ellos.
              Implementamos medidas de seguridad técnicas y organizativas apropiadas, incluyendo:
            </p>
            <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
              <li>Encriptación en tránsito (TLS 1.3) y en reposo</li>
              <li>Autenticación segura con verificación de email</li>
              <li>Acceso restringido basado en roles</li>
              <li>Monitoreo continuo de seguridad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Compartir Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              No vendemos, alquilamos ni compartimos tu información personal con terceros para fines 
              de marketing. Solo compartimos datos cuando es necesario para proporcionar nuestros servicios, 
              cuando tú lo autorizas expresamente, o cuando lo exige la ley.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Transferencias Internacionales</h2>
            <p className="text-muted-foreground leading-relaxed">
              Principalmente almacenamos y procesamos tus datos dentro del Espacio Económico Europeo (EEE). 
              Cuando sea necesario transferir datos fuera del EEE (por ejemplo, a proveedores en EE.UU.), 
              nos aseguramos de que existan salvaguardias apropiadas, como Cláusulas Contractuales Estándar 
              aprobadas por la Comisión Europea.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Retención de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conservamos tus datos personales mientras tu cuenta esté activa o según sea necesario para 
              proporcionarte servicios. Tras la cancelación de tu cuenta:
            </p>
            <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
              <li>Tus documentos se eliminan después de 30 días</li>
              <li>Datos de facturación se conservan 7 años (obligación fiscal)</li>
              <li>Logs de seguridad se conservan 1 año</li>
              <li>Puedes solicitar la eliminación inmediata de datos no sujetos a obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Tus Derechos (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Como titular de los datos, tienes los siguientes derechos:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Acceso:</strong> solicitar una copia de tus datos personales</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos ("derecho al olvido")</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y legible</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo</li>
              <li><strong>Limitación:</strong> restringir el tratamiento en determinadas circunstancias</li>
              <li><strong>Retirar consentimiento:</strong> cuando el tratamiento se base en tu consentimiento</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para ejercer estos derechos, contacta a privacidad@albus.es. Responderemos en un plazo máximo 
              de 30 días. También tienes derecho a presentar una reclamación ante la Agencia Española de 
              Protección de Datos (AEPD).
            </p>
          </section>

          <section id="cookies" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento de la plataforma (autenticación, seguridad)</li>
              <li><strong>Cookies de preferencias:</strong> recuerdan tu idioma y configuración</li>
              <li><strong>Cookies analíticas:</strong> nos ayudan a entender cómo usas la plataforma (anonimizadas)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>No utilizamos cookies de publicidad ni de seguimiento de terceros.</strong> Puedes gestionar 
              las cookies desde la configuración de tu navegador. Ten en cuenta que deshabilitar las cookies 
              esenciales puede afectar la funcionalidad de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Menores de Edad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente 
              información personal de menores. Si descubrimos que hemos recopilado datos de un menor sin 
              consentimiento parental verificable, eliminaremos esa información lo antes posible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Cambios en esta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios 
              significativos por correo electrónico o mediante un aviso destacado en la plataforma antes de 
              que el cambio entre en vigor. Te recomendamos revisar esta política regularmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier pregunta sobre esta Política de Privacidad o para ejercer tus derechos:
            </p>
            <ul className="list-none mt-4 text-muted-foreground space-y-2">
              <li><strong>Responsable del tratamiento:</strong> Albus LLC</li>
              <li><strong>Email de privacidad:</strong> privacidad@albus.es</li>
              <li><strong>Soporte general:</strong> hola@albus.es</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
