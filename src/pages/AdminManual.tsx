import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Loader2 } from "lucide-react";
import isotipoAlbus from "@/assets/isotipo-albus.png";

const ADMIN_EMAIL = "l@albus.com.co";

const AdminManual = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate("/");
      return;
    }
    setAuthorized(true);
  }, [user, isLoading, navigate]);

  if (isLoading || !authorized) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
          <div className="flex items-center gap-2">
            <img src={isotipoAlbus} alt="Albus" className="w-6 h-6" />
            <span className="font-semibold">Manual de Operación</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardContent className="pt-6">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="partners">
                <AccordionTrigger className="text-base font-semibold">
                  Cómo asignar Partners
                </AccordionTrigger>
                <AccordionContent className="prose prose-sm max-w-none text-muted-foreground space-y-2">
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Ve a <strong>Admin Panel → Pestaña Usuarios</strong>.</li>
                    <li>Busca al usuario al que deseas asignar un partner.</li>
                    <li>En la columna <strong>"Partner"</strong>, selecciona el partner del menú desplegable.</li>
                    <li>El partner asignado podrá ver los documentos y el progreso del usuario desde su panel.</li>
                    <li>Para desasignar, selecciona <strong>"Sin asignar"</strong> en el menú.</li>
                  </ol>
                  <p>Los partners se crean directamente en la tabla <code>partners</code> de Supabase con el <code>user_id</code> del usuario que actuará como partner.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="referrals">
                <AccordionTrigger className="text-base font-semibold">
                  Cómo validar recompensas de referidos
                </AccordionTrigger>
                <AccordionContent className="prose prose-sm max-w-none text-muted-foreground space-y-2">
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Cuando un usuario referido completa su pago en Stripe, se crea un registro en la tabla <code>referrals</code> con estado <strong>"pendiente"</strong>.</li>
                    <li>Verifica el pago en el <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline">Dashboard de Stripe</a>.</li>
                    <li>Ve al <a href="https://supabase.com/dashboard/project/uidwcgxbybjpbteowrnh/sql/new" target="_blank" rel="noopener noreferrer" className="underline">SQL Editor de Supabase</a> y actualiza el estado:</li>
                  </ol>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`UPDATE public.referrals
SET status = 'completado'
WHERE id = '<referral_id>';`}
                  </pre>
                  <p>El usuario referidor verá la recompensa reflejada en su panel de Referidos.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contacts">
                <AccordionTrigger className="text-base font-semibold">
                  Contactos de soporte técnico
                </AccordionTrigger>
                <AccordionContent className="prose prose-sm max-w-none text-muted-foreground space-y-2">
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Administrador principal:</strong> l@albus.com.co</li>
                    <li><strong>Soporte Supabase:</strong> <a href="https://supabase.com/dashboard/support" target="_blank" rel="noopener noreferrer" className="underline">supabase.com/dashboard/support</a></li>
                    <li><strong>Soporte Stripe:</strong> <a href="https://support.stripe.com" target="_blank" rel="noopener noreferrer" className="underline">support.stripe.com</a></li>
                  </ul>
                  <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-xs mt-3">
                    <strong>Nota de seguridad:</strong> Habilita la protección de contraseñas filtradas en Supabase Dashboard → Authentication → Settings → Password Security.
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminManual;
