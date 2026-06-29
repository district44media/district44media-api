import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, FileText } from "lucide-react";
import { z } from "zod";

const plans = [
  {
    name: "Starter",
    price: "CHF 29",
    description: "Basic digital visibility tools for small projects.",
    features: [
      "Online promotion tools",
      "Listing publication",
      "Basic indexing",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "CHF 79",
    description: "Extended visibility for growing websites.",
    features: [
      "Multi-platform promotion",
      "Improved search discoverability",
      "Extended promotion tools",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Professional",
    price: "CHF 149",
    description: "Advanced digital promotion for maximum visibility.",
    features: [
      "Advanced promotion campaigns",
      "SEO & indexing optimization",
      "Maximum multi-platform reach",
      "Priority support",
    ],
  },
];

const invoiceSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  company: z.string().optional(),
  description: z.string().trim().min(1, "Payment description is required"),
  reference: z.string().optional(),
  amount: z
    .number({ invalid_type_error: "Please enter a valid amount" })
    .positive("Amount must be greater than 0"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const PricingSection = () => {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof InvoiceFormData, string>>>({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    description: "",
    reference: "",
    amount: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    setFormError("");

    const parsed = invoiceSchema.safeParse({
      ...form,
      amount: form.amount === "" ? undefined : Number(form.amount),
    });

    if (!parsed.success) {
      const errors: Partial<Record<keyof InvoiceFormData, string>> = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0] as keyof InvoiceFormData;
        if (!errors[key]) errors[key] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { reference, ...rest } = parsed.data;
      const res = await fetch(
        "/create-checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...rest, invoiceReference: reference }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFormError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pricing" className="py-24 md:py-32 bg-muted/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl text-foreground">
            Simple, transparent plans
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
            Our services are flexible and can be adapted depending on the visibility needs of each project.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border bg-card shadow-none relative ${
                plan.highlighted
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-2 pt-6 px-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm text-muted-foreground">starting from</span>
                  <span className="text-3xl font-semibold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {plan.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-4">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
              </ul>
              <Button
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full rounded-full mt-6 text-sm font-medium"
                onClick={() => {
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Request a quote
              </Button>
            </CardContent>
          </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-16">
          Every project is different. Contact us for a personalized quote based on your objectives.
        </p>

        {/* Pay an invoice block */}
        <Card className="max-w-xl mx-auto border border-border bg-card shadow-none">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3
              className="text-xl font-semibold text-foreground"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Pay an invoice
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              If you already have an agreement with us for digital promotion or visibility services, you can securely complete your payment online.
            </p>
            <Button
              variant="outline"
              className="rounded-full px-6 text-sm font-medium mt-2"
              onClick={() => setShowInvoiceForm(!showInvoiceForm)}
            >
              {showInvoiceForm ? "Close" : "Pay your invoice"}
            </Button>
          </CardContent>
        </Card>

        {/* Invoice form */}
        <div
          className={`grid transition-all duration-500 ease-in-out ${
            showInvoiceForm ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0 mt-0"
          }`}
        >
          <div className="overflow-hidden">
            <Card className="max-w-xl mx-auto border border-border bg-card shadow-none">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label="First name" required error={fieldErrors.firstName}>
                      <Input
                        value={form.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className="rounded-lg bg-background"
                      />
                    </FieldGroup>
                    <FieldGroup label="Last name" required error={fieldErrors.lastName}>
                      <Input
                        value={form.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className="rounded-lg bg-background"
                      />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Your email" required error={fieldErrors.email}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="rounded-lg bg-background"
                    />
                  </FieldGroup>

                  <FieldGroup label="Company" error={fieldErrors.company}>
                    <Input
                      value={form.company}
                      onChange={(e) => updateField("company", e.target.value)}
                      className="rounded-lg bg-background"
                    />
                  </FieldGroup>

                  <FieldGroup label="Payment description" required error={fieldErrors.description}>
                    <Textarea
                      value={form.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Service, invoice or agreement"
                      className="rounded-lg bg-background min-h-[80px] resize-none"
                    />
                  </FieldGroup>

                  <FieldGroup label="Invoice reference" error={fieldErrors.reference}>
                    <Input
                      value={form.reference}
                      onChange={(e) => updateField("reference", e.target.value)}
                      className="rounded-lg bg-background"
                    />
                  </FieldGroup>

                  <FieldGroup label="Amount (CHF)" required error={fieldErrors.amount}>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => updateField("amount", e.target.value)}
                      className="rounded-lg bg-background"
                    />
                  </FieldGroup>

                  {formError && (
                    <p className="text-sm text-destructive text-center">{formError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 h-11 text-sm font-medium"
                  >
                    {isSubmitting ? "Redirecting..." : "Secure Payment"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    Payments are processed securely through our payment provider. All transactions correspond to previously agreed digital promotion services.
                  </p>
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    By clicking "Secure payment", you agree to our{" "}
                    <a
                      href="/billing-and-subscription-policy"
                      className="underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                      Terms and Conditions
                    </a>
                    .
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

const FieldGroup = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm text-foreground">
      {label}
      {required && <span className="text-primary ml-0.5">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default PricingSection;
