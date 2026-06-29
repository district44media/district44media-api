import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SolutionsSection from "@/components/SolutionsSection";
import PricingSection from "@/components/PricingSection";

import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <SolutionsSection />
      <PricingSection />
      
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
