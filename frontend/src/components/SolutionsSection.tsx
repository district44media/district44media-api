const services = [
  {
    title: "Online Listing Creation",
    description:
      "We create and publish online listings to help websites gain visibility across multiple digital platforms.",
  },
  {
    title: "Website Promotion",
    description:
      "Our services help websites increase their online presence through structured digital promotion strategies.",
  },
  {
    title: "SEO & Online Indexing",
    description:
      "We help websites improve their discoverability on search engines and online platforms.",
  },
  {
    title: "Multi-Platform Visibility",
    description:
      "Our solutions allow websites to reach new audiences across different digital environments.",
  },
];

const SolutionsSection = () => {
  return (
    <section id="solutions" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Intro */}
        <div className="text-center mb-20">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-3">
            Solutions
          </p>
          <h2 className="text-3xl md:text-4xl text-foreground">
            Simple solutions to improve your online visibility
          </h2>
        </div>

        {/* Services */}
        <div className="mb-0">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-10 text-center">
            Services
          </p>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 max-w-5xl mx-auto">
            {services.map((s) => (
              <div key={s.title} className="space-y-3">
                <h3
                  className="text-lg font-semibold text-primary"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
