import LegalPageLayout from "@/components/LegalPageLayout";

const LegalNotice = () => (
  <LegalPageLayout title="Legal Notice">
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>1. Publisher</h2>
      <p>This website is operated by:</p>
      <p className="mt-2">D44 Veleta OÜ</p>
      <p>Registry code: 17439007</p>
      <p>Registered office: Sepapaja tn 6, 15551 Tallinn, Estonia</p>
      <p>Email: <a href="mailto:support@district44media.com" className="underline underline-offset-2 hover:text-foreground transition-colors">support@district44media.com</a></p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>2. Hosting Provider</h2>
      <p>This website is hosted by:</p>
      <p className="mt-2">Hostinger International Ltd.</p>
      <p>61 Lordou Vironos Street</p>
      <p>6023 Larnaca, Cyprus</p>
      <p>Website: <a href="https://www.hostinger.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">https://www.hostinger.com</a></p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>3. Intellectual Property</h2>
      <p>All content published on this website (texts, graphics, branding elements, structure and layout) is the exclusive property of D44 Veleta OÜ unless otherwise stated.</p>
      <p className="mt-2">Any reproduction, distribution or use without prior written permission is strictly prohibited.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>4. Limitation of Liability</h2>
      <p>The information provided on this website is for general informational purposes only.</p>
      <p className="mt-2">D44 Veleta OÜ makes no guarantees regarding accuracy, completeness or suitability for a specific purpose.</p>
      <p className="mt-2">Under no circumstances shall D44 Veleta OÜ be held liable for any direct or indirect damages resulting from the use of this website or reliance on the information provided.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>5. Contact</h2>
      <p>For any questions regarding this website or the services provided, you may contact us at:</p>
      <p className="mt-2"><a href="mailto:support@district44media.com" className="underline underline-offset-2 hover:text-foreground transition-colors">support@district44media.com</a></p>
    </section>
  </LegalPageLayout>
);

export default LegalNotice;
