import { Mail } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 md:py-32 bg-muted/40">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-3">
            Contact
          </p>
          <h2 className="text-3xl md:text-4xl text-foreground mb-4">
            Get in touch
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Have a question or ready to get started? We'd love to hear from you.
          </p>
        </div>

        <div className="flex justify-center max-w-xl mx-auto">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Mail className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </p>
            <a
              href="mailto:contact@district44media.com"
              className="text-foreground hover:text-primary transition-colors"
            >
              contact@district44media.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
