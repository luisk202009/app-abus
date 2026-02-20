import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { EligibilityCalculator } from "@/components/eligibility/EligibilityCalculator";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ResourcesSection } from "@/components/ResourcesSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { AnalysisModal } from "@/components/AnalysisModal";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <main>
        <HeroSection onAnalyzeClick={() => setIsModalOpen(true)} />
        <TrustBar />
        <HowItWorksSection />
        <EligibilityCalculator onStartProcess={() => setIsModalOpen(true)} />
        <FeaturesSection />
        <ResourcesSection />
        <PricingSection onStartFree={() => setIsModalOpen(true)} />
      </main>
      <Footer onOpenModal={() => setIsModalOpen(true)} />
      <AnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Index;
