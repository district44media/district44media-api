import LegalPageLayout from "@/components/LegalPageLayout";

const TermsOfService = () => (
  <LegalPageLayout title="Terms of Service">
    <section>
      <p className="font-medium text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>District 44 Media – D44 Veleta OÜ</p>
      <p className="mt-2">Last updated: February 21, 2026</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>1. Introduction</h2>
      <p>These Terms of Service ("Terms") govern the access to and use of the services provided by D44 Veleta OÜ, operating under the brand name District 44 Media, a company registered in Estonia.</p>
      <p className="mt-3">By accessing or using our website and services, you agree to be bound by these Terms.</p>
      <p className="mt-3">District 44 Media reserves the right to update or modify these Terms at any time. Continued use of the website or services after such modifications constitutes acceptance of the updated Terms.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>2. Nature of the Services</h2>
      <p>District 44 Media provides digital services designed to support online visibility, digital presence, and promotion of digital platforms.</p>
      <p className="mt-3">All services are provided exclusively in digital form.</p>
      <p className="mt-3">District 44 Media does not guarantee any specific commercial outcome, level of visibility, or revenue resulting from the use of its services.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>3. Eligibility and Account Registration</h2>
      <p>Access to certain services may require the creation of an account.</p>
      <p className="mt-3">By registering, you agree to:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Provide accurate and complete information</li>
        <li>Maintain the confidentiality of your account credentials</li>
        <li>Use the services in compliance with applicable laws</li>
      </ul>
      <p className="mt-3">We reserve the right to suspend or terminate accounts in case of misuse or violation of these Terms.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>4. Business Model and Pricing</h2>
      <p>Services provided by District 44 Media are billed as <strong className="text-foreground">one-time payments for agreed digital promotion or visibility services</strong>.</p>
      <p className="mt-3">Pricing may vary depending on the scope of the project, platform requirements, or specific digital services requested.</p>
      <p className="mt-3">All applicable pricing is communicated prior to purchase or payment.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>5. Payments</h2>
      <p>Payments are processed securely through third-party payment service providers.</p>
      <p className="mt-3">District 44 Media does not store or process full payment card details directly.</p>
      <p className="mt-3">By completing a transaction, you authorize the payment provider to charge the applicable fees.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>6. Refund Policy</h2>
      <p>Unless otherwise stated, payments for digital services are <strong className="text-foreground">non-refundable once the service has started or access to the service has been granted</strong>.</p>
      <p className="mt-3">Exceptions may apply where required by applicable consumer protection laws.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>7. Intellectual Property</h2>
      <p>All website content, software, branding, and materials provided by District 44 Media remain the exclusive property of D44 Veleta OÜ.</p>
      <p className="mt-3">Users may not reproduce, copy, distribute, or exploit any content without prior written consent.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>8. Limitation of Liability</h2>
      <p>District 44 Media provides digital services on an "as is" and "as available" basis.</p>
      <p className="mt-3">To the maximum extent permitted by law:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>District 44 Media shall not be liable for indirect or consequential damages</li>
        <li>The company's total liability shall not exceed the amount paid by the user for the relevant service</li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>9. Termination</h2>
      <p>We reserve the right to suspend or terminate access to the services in case of:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Violation of these Terms</li>
        <li>Fraudulent or unlawful activity</li>
        <li>Abuse of the services or platform</li>
      </ul>
      <p className="mt-3">Users may terminate their account at any time.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>10. Data Protection</h2>
      <p>Personal data is processed in accordance with our Privacy Policy.</p>
      <p className="mt-3">D44 Veleta OÜ complies with applicable European data protection regulations, including the General Data Protection Regulation (GDPR).</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>11. Governing Law</h2>
      <p>These Terms shall be governed by and construed in accordance with the laws of Estonia.</p>
      <p className="mt-3">Any dispute arising under these Terms shall be subject to the jurisdiction of the competent courts of Estonia.</p>
    </section>

    <section>
      <p>Contact: <a href="mailto:contact@district44media.com" className="underline underline-offset-2 hover:text-foreground transition-colors">contact@district44media.com</a></p>
    </section>
  </LegalPageLayout>
);

export default TermsOfService;
