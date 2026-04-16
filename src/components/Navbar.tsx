import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { DestinosDropdown } from "@/components/DestinosDropdown";
import { WaitlistModal } from "@/components/WaitlistModal";
import albusLogo from "@/assets/albus-logo.png";

interface NavbarProps {
  onOpenModal?: () => void;
}

interface Country {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export const Navbar = ({ onOpenModal }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [waitlistCountry, setWaitlistCountry] = useState<Country | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleStartFree = () => {
    if (onOpenModal) {
      onOpenModal();
    }
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleCountrySelect = (country: Country) => {
    if (country.active) {
      // Spain is active, scroll to hero or do nothing
      scrollToSection("hero");
    } else {
      // Show coming soon page
      navigate(`/destinos/${country.id}`);
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
              <DestinosDropdown onCountrySelect={handleCountrySelect} />
              <a
                href="/españa/regularizacion"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                Regularización
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground text-background text-[10px] font-medium px-1.5 py-0.5 tracking-wide">
                  <span className="w-1 h-1 rounded-full bg-background animate-pulse" />
                  Nuevo
                </span>
              </a>
              <a
                href="/recursos"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Recursos
              </a>
              <button
                onClick={() => scrollToSection("precios")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Precios
              </button>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="default" onClick={handleAuthClick}>
                {user ? "Ir a mi Dashboard" : "Entrar"}
              </Button>
              {!user && (
                <Button variant="hero" size="default" onClick={handleStartFree}>
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
                <div className="py-2">
                  <DestinosDropdown onCountrySelect={(country) => {
                    setIsMenuOpen(false);
                    handleCountrySelect(country);
                  }} />
                </div>
                <a
                  href="/recursos"
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 text-left block"
                >
                  Recursos
                </a>
                <button
                  onClick={() => scrollToSection("precios")}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2 text-left"
                >
                  Precios
                </button>
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
                    <Button variant="hero" size="lg" className="w-full" onClick={handleStartFree}>
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
        defaultMode="login"
      />

      {/* Waitlist Modal */}
      {waitlistCountry && (
        <WaitlistModal
          isOpen={!!waitlistCountry}
          onClose={() => setWaitlistCountry(null)}
          country={waitlistCountry}
        />
      )}
    </>
  );
};
