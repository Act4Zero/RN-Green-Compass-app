import Seo from '../components/Seo';
import SiteLayout from '../components/SiteLayout';

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <Seo title="Privacy Policy" description="Read the Green Compass website privacy policy." path="/privacy" />
      <section className="legal-page">
        <div className="container legal-layout">
          <aside><p className="eyebrow">Legal</p><h1>Privacy Policy</h1><p>Effective Date: January 16, 2025</p></aside>
          <article className="legal-content">
            <h2>1. Introduction</h2><p>Welcome to Green Compass (“we,” “our,” “us”). Your privacy is important to us, and we are committed to protecting it. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, interact with our services, or communicate with us. By using our website, you agree to the terms outlined in this Privacy Policy.</p>
            <h2>2. Information We Collect</h2><p>We collect information you provide voluntarily and limited information about how the website is used.</p>
            <h3>2.1 Information You Provide Voluntarily</h3><ul><li><strong>Contact form data:</strong> your name, email address and the details you choose to provide.</li><li><strong>Newsletter subscription:</strong> your email address.</li></ul>
            <h3>2.2 Automatically Collected Information</h3><p>We may use analytics to understand pages viewed, time spent and approximate geographic region. This information is used to improve our services.</p>
            <h2>3. How We Use Your Information</h2><ul><li>To respond to inquiries and provide support.</li><li>To send updates when you have subscribed.</li><li>To analyze website usage and improve our services.</li><li>To comply with legal obligations.</li></ul>
            <h2>4. Information Sharing</h2><p>We do not sell, trade or rent your personal information. We may share data with trusted service providers that help operate the website, or when disclosure is required by law or needed to protect legal rights.</p>
            <h2>5. Data Retention</h2><p>We retain personal information only as long as necessary for the purposes described here or as required by law.</p>
            <h2>6. Your Rights</h2><p>You may request access to, correction of or deletion of personal information we hold about you, and you may unsubscribe from marketing communications at any time. Contact <a href="mailto:privacy@greencompass.app">privacy@greencompass.app</a> to exercise these rights.</p>
            <h2>7. Security</h2><p>We use reasonable security measures to protect personal information. No online system is entirely secure, so absolute security cannot be guaranteed.</p>
            <h2>8. Third-Party Links</h2><p>Our website may link to external websites. We are not responsible for their privacy practices or content.</p>
            <h2>9. Changes to This Privacy Policy</h2><p>We may update this policy periodically. Changes will be posted here with an updated effective date.</p>
            <h2>10. Contact Us</h2><p>Questions or concerns can be sent to <a href="mailto:privacy@greencompass.app">privacy@greencompass.app</a>.</p>
          </article>
        </div>
      </section>
    </SiteLayout>
  );
}
