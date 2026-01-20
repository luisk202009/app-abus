import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Albus</h3>
            <p className="text-gray-400 max-w-md mb-6">
              Tu asistente inteligente para migrar a España. Simplificamos la burocracia para que tú puedas enfocarte en tu nueva vida.
            </p>
            <Button variant="heroOutline" className="border-gray-600 text-primary-foreground hover:bg-gray-800 hover:text-primary-foreground">
              Empezar ahora
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Recursos</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Precios</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Guías</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/privacidad" className="hover:text-primary-foreground transition-colors">Privacidad</Link></li>
              <li><Link to="/terminos" className="hover:text-primary-foreground transition-colors">Términos</Link></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-900/50">
          <p className="text-gray-400 text-sm text-center">
            Albus es una plataforma tecnológica de asistencia. No proporcionamos asesoramiento legal ni somos un despacho de abogados.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Albus. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-sm">
            Hecho con ❤️ para la comunidad migrante
          </p>
        </div>
      </div>
    </footer>
  );
};
