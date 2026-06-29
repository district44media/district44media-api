import LegalPageLayout from "@/components/LegalPageLayout";

const PrivacyPolicy = () => (
  <LegalPageLayout title="Privacy Policy">
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>1. Data Controller</h2>
      <p>The data controller responsible for processing personal data is:</p>
      <p className="mt-3">
        D44 Veleta OÜ<br />
        Sepapaja tn 6, 15551 Tallinn<br />
        Estonia<br />
        Email: <a href="mailto:support@district44media.com" className="underline underline-offset-2 hover:text-foreground transition-colors">support@district44media.com</a>
      </p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>2. Data We Collect</h2>
      <p>We may collect and process the following types of information:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Contact information (such as name and email address) when you contact us through forms or email</li>
        <li>Technical information such as IP address, browser type, device type, and operating system</li>
        <li>Basic analytics information related to website usage</li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>3. Purpose of Processing</h2>
      <p>Personal data may be processed for the following purposes:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Responding to inquiries and support requests</li>
        <li>Operating and maintaining the website</li>
        <li>Improving website functionality and user experience</li>
        <li>Ensuring security and preventing misuse or fraud</li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>4. Legal Basis for Processing</h2>
      <p>Personal data is processed in accordance with the General Data Protection Regulation (GDPR) based on the following legal grounds:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Legitimate interest (website operation, security, analytics)</li>
        <li>Contractual necessity where services are provided</li>
        <li>Compliance with legal obligations</li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>5. Data Sharing</h2>
      <p>We do not sell or rent personal data.</p>
      <p className="mt-3">However, certain data may be shared with trusted third-party service providers when necessary to operate the website or process payments, including:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Website hosting providers</li>
        <li>Payment service providers</li>
        <li>Technical infrastructure providers</li>
      </ul>
      <p className="mt-3">These providers process data only as necessary to deliver their services and in accordance with applicable data protection laws.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>6. Data Retention</h2>
      <p>Personal data is retained only for as long as necessary to fulfill the purposes described in this policy or to comply with legal obligations.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>7. Your Rights (GDPR)</h2>
      <p>Under the General Data Protection Regulation, you have the following rights:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Right to access your personal data</li>
        <li>Right to request correction of inaccurate data</li>
        <li>Right to request deletion of your data</li>
        <li>Right to restrict processing</li>
        <li>Right to lodge a complaint with a supervisory authority</li>
      </ul>
      <p className="mt-3">To exercise your rights, please contact:</p>
      <p className="mt-2"><a href="mailto:support@district44media.com" className="underline underline-offset-2 hover:text-foreground transition-colors">support@district44media.com</a></p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>8. Data Security</h2>
      <p>We implement appropriate technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>9. Website Hosting</h2>
      <p>This website is hosted by a third-party hosting provider. Technical information such as IP addresses may be processed by the hosting infrastructure as part of normal website operation.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>10. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Any updates will be published on this page with the revised date.</p>
    </section>

    <section>
      <p className="text-xs text-muted-foreground">Last updated: March 2026</p>
    </section>
  </LegalPageLayout>
);

export default PrivacyPolicy;
