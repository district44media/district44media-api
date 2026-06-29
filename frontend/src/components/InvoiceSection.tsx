import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

const InvoiceSection = () => {
  return (
    <section id="invoice" className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-sm font-medium tracking-widest uppercase text-primary mb-3">
          Invoice Payment
        </p>
        <h2 className="text-3xl md:text-4xl text-foreground mb-4">
          Secure Invoice Payment
        </h2>
        <p className="text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
          Use the form below to securely pay an existing invoice. All payments are processed through a secure, encrypted connection.
        </p>

        <Card className="border border-dashed border-border bg-muted/30 shadow-none">
          <CardContent className="py-16 px-8 flex flex-col items-center gap-4">
            <Lock className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Secure payment form will be added here.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default InvoiceSection;
