import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import albusLogo from "@/assets/albus-logo.png";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <img src={albusLogo} alt="Albus" className="h-6 md:h-7" />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </a>
              <a href="#precios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </a>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <span>Próximamente: Portugal</span>
                <span className="ml-1 px-2 py-0.5 text-xs bg-secondary rounded-full">Soon</span>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="default" onClick={handleAuthClick}>
                {user ? "Ir a mi Dashboard" : "Entrar"}
              </Button>
              {!user && (
                <Button variant="hero" size="default">
                  Empezar Gratis
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-6 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-4">
                <a href="#recursos" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                  Recursos
                </a>
                <a href="#precios" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                  Precios
                </a>
                <div className="flex items-center gap-2 text-base font-medium text-muted-foreground py-2">
                  <span>Próximamente: Portugal</span>
                  <span className="px-2 py-0.5 text-xs bg-secondary rounded-full">Soon</span>
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleAuthClick}
                  >
                    {user ? "Ir a mi Dashboard" : "Entrar"}
                  </Button>
                  {!user && (
                    <Button variant="hero" size="lg" className="w-full">
                      Empezar Gratis
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => navigate("/dashboard")}
      />
    </>
  );
};
