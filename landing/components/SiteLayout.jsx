import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const APP_URL = 'https://app.greencompass.app';

const nav = [
  { href: '/#features', label: 'Features' },
  { href: '/explainer', label: 'How it works' },
  { href: '/research', label: 'Research' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
];

export default function SiteLayout({ children }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="Green Compass home">
            <img src="/images/GCLogo-rich-premium-web.png" alt="" width="52" height="52" />
            <span>Green Compass</span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={router.pathname === item.href ? 'active' : ''}>{item.label}</Link>
            ))}
            <a href={`${APP_URL}/auth/signin`} className="nav-signin">Sign in</a>
            <a href={`${APP_URL}/auth/signup`} className="nav-cta">Start now</a>
          </nav>
          <button
            type="button"
            className="menu-button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
            {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
            <a href={`${APP_URL}/auth/signin`}>Sign in</a>
            <a href={`${APP_URL}/auth/signup`} className="button button-primary">Start now</a>
          </nav>
        ) : null}
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-intro">
              <Link href="/" className="brand brand-inverse" aria-label="Green Compass home">
                <img src="/images/GCLogo-rich-premium-web.png" alt="" width="52" height="52" />
                <span>Green Compass</span>
              </Link>
              <p>A practical companion for turning everyday choices into visible, meaningful progress.</p>
            </div>
            <div>
              <h2>Explore</h2>
              <nav aria-label="Footer navigation">
                <Link href="/#features">Features</Link>
                <Link href="/explainer">How it works</Link>
                <Link href="/research">Research</Link>
                <Link href="/#faq">FAQ</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/tos">Terms</Link>
              </nav>
            </div>
            <div>
              <h2>Follow along</h2>
              <nav>
                <a href="https://www.linkedin.com/company/green-compass-app" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://www.instagram.com/greencompass.app/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://www.facebook.com/profile.php?id=61577595789202" target="_blank" rel="noreferrer">Facebook</a>
                <a href="https://x.com/GreenCompassApp" target="_blank" rel="noreferrer">X</a>
              </nav>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Green Compass. All rights reserved.</p>
            <p>Built for progress, not perfection.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
