import LegalPageLayout from "@/components/LegalPageLayout";

const Cookies = () => (
  <LegalPageLayout title="Cookie Policy">
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Use of Cookies</h2>
      <p>This website uses only essential cookies required for basic website functionality and security.</p>
      <p className="mt-3">These cookies are necessary for the proper operation of the website and do not collect personal data for advertising or marketing purposes.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>No Tracking Technologies</h2>
      <p>District 44 Media does not use third-party tracking technologies such as:</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Google Analytics</li>
        <li>Advertising pixels</li>
        <li>Behavioral tracking tools</li>
      </ul>
      <p className="mt-3">No third-party tracking cookies are installed on this website.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Browser Settings</h2>
      <p>Most web browsers allow users to manage, block, or delete cookies through their browser settings.</p>
      <p className="mt-3">Please note that disabling essential cookies may affect the proper functioning of certain parts of the website.</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Changes to This Policy</h2>
      <p>This Cookie Policy may be updated from time to time. Any changes will be published on this page.</p>
    </section>

    <section>
      <p className="text-xs text-muted-foreground">Last updated: March 2026</p>
    </section>
  </LegalPageLayout>
);

export default Cookies;
