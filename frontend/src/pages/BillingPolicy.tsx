import LegalPageLayout from "@/components/LegalPageLayout";

const BillingPolicy = () => (
  <LegalPageLayout title="Billing Policy">
    <section>
      <p className="font-medium text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>District 44 Media – D44 Veleta OÜ</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>1. Overview</h2>
      <p>District 44 Media provides digital services related to online visibility, digital promotion, and platform support.</p>
      <p className="mt-3">All services are billed as <strong>one-time payments for agreed digital promotion or visibility services</strong>.</p>
      <p className="mt-3">Pricing may vary depending on the scope of the requested services or project requirements.</p>
      <p className="mt-3">All applicable pricing is communicated prior to payment.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>2. One-Time Payments</h2>
      <p>Payments for services provided by District 44 Media are charged once for the agreed service.</p>
      <p className="mt-3">One-time payments:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Are charged a single time</li>
        <li>Do not automatically renew</li>
        <li>Provide access to the agreed digital service as described prior to payment</li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>3. Payment Processing</h2>
      <p>Payments are securely processed through authorized third-party payment service providers.</p>
      <p className="mt-3">District 44 Media does not store or process full payment card information directly.</p>
      <p className="mt-3">By completing a transaction, you authorize the payment provider to charge the applicable amount for the agreed service.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>4. Refund Policy</h2>
      <p>Unless otherwise stated, payments for digital services are <strong>non-refundable once the service has started or access to the service has been granted</strong>.</p>
      <p className="mt-3">Exceptions may apply where required by applicable consumer protection laws.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>5. Price Changes</h2>
      <p>District 44 Media reserves the right to modify pricing for future services at any time.</p>
      <p className="mt-3">Such changes do not affect services that have already been purchased.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>6. Billing Support</h2>
      <p>For any billing-related inquiries, please contact:</p>
      <p className="mt-2"><a href="mailto:contact@district44media.com" className="underline underline-offset-2 hover:text-foreground transition-colors">contact@district44media.com</a></p>
    </section>

    <section>
      <p className="text-xs text-muted-foreground">Last updated: March 2026</p>
    </section>
  </LegalPageLayout>
);

export default BillingPolicy;
