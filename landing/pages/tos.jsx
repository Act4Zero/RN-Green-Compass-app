import Seo from '../components/Seo';
import SiteLayout from '../components/SiteLayout';

export default function TermsPage() {
  return (
    <SiteLayout>
      <Seo title="Terms of Service" description="Read the Green Compass terms of service." path="/tos" />
      <section className="legal-page">
        <div className="container legal-layout">
          <aside><p className="eyebrow">Legal</p><h1>Terms of Service</h1><p>Effective Date: January 16, 2025</p></aside>
          <article className="legal-content">
            <h2>1. Introduction</h2><p>Welcome to Green Compass (“we,” “our,” “us”). By accessing or using our website and services, you agree to these Terms of Service. If you do not agree, please do not use the services.</p>
            <h2>2. Eligibility</h2><p>You must be at least 13 years old to use our services. By using the platform, you confirm that you meet this requirement.</p>
            <h2>3. User Obligations</h2><p>You agree to use Green Compass responsibly and in compliance with applicable laws and regulations.</p>
            <h2>4. Acceptable Use</h2><p>You may not use Green Compass for unlawful purposes, including spamming, unauthorized access, interference with the service or spreading deliberately harmful misinformation.</p>
            <h2>5. Intellectual Property</h2><p>Green Compass content, branding, text and images are protected by applicable intellectual-property laws. Unauthorized use is prohibited.</p>
            <h2>6. Disclaimers & Limitation of Liability</h2><p>The services are provided “as is.” We do not guarantee uninterrupted access or that sustainability estimates are suitable as a certified inventory, verified reduction or professional financial, scientific or legal advice. To the extent allowed by law, we are not liable for damages resulting from use of or inability to use the platform.</p>
            <h2>7. Termination</h2><p>We may suspend or terminate accounts that violate these terms.</p>
            <h2>8. Governing Law</h2><p>These terms are governed by the laws applicable to Green Compass and its operating entity, without regard to conflict-of-law principles.</p>
            <h2>9. Changes to These Terms</h2><p>We may update these terms from time to time. Continued use after changes take effect constitutes acceptance of the updated terms.</p>
            <h2>10. Contact Us</h2><p>Questions can be sent to <a href="mailto:support@greencompass.app">support@greencompass.app</a>.</p>
          </article>
        </div>
      </section>
    </SiteLayout>
  );
}
