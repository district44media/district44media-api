import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-16">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-sm font-medium tracking-widest uppercase text-primary mb-6">
          District·44·Media
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 text-foreground">
          Digital visibility solutions designed for growth.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
          We help online businesses and independent professionals improve visibility,
          strengthen presentation, and support long-term digital growth.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="rounded-full px-8 text-sm font-medium"
            onClick={() => scrollTo("pricing")}
          >
            View plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 text-sm font-medium"
            onClick={() => scrollTo("solutions")}
          >
            Our solutions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
