import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const APP_URL = 'https://app.greencompass.app';

const navEn = [
  { href: '/#features', label: 'Features' },
  { href: '/explainer', label: 'How it works' },
  { href: '/research', label: 'Research' },
  { href: '/sofia', label: 'For Sofia' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
];

const navBg = [
  { href: '/sofia#platform', label: 'Платформата' },
  { href: '/sofia#opportunities', label: 'Възможности' },
  { href: '/sofia#producers', label: 'Биопроизводители' },
  { href: '/sofia#contact', label: 'Контакт' },
];

export default function SiteLayout({ children, locale = 'en' }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isBg = locale === 'bg';
  const nav = isBg ? navBg : navEn;

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = locale;
    return () => { document.documentElement.lang = previousLanguage; };
  }, [locale]);

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">{isBg ? 'Към съдържанието' : 'Skip to content'}</a>
      <header className="site-header">
        <div className="container header-inner">
          <Link href={isBg ? '/sofia' : '/'} className="brand" aria-label={isBg ? 'Начална страница на Green Compass за София' : 'Green Compass home'}>
            <img src="/images/GCLogo-rich-premium-web.png" alt="" width="52" height="52" />
            <span>Green Compass</span>
          </Link>
          <nav className="desktop-nav" aria-label={isBg ? 'Основна навигация' : 'Primary navigation'}>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={router.pathname === item.href ? 'active' : ''}>{item.label}</Link>
            ))}
            <a href={`${APP_URL}/auth/signin`} className="nav-signin">{isBg ? 'Вход' : 'Sign in'}</a>
            <a href={APP_URL} className="nav-cta">{isBg ? 'Към приложението' : 'Start now'}</a>
          </nav>
          <button
            type="button"
            className="menu-button"
            aria-label={menuOpen ? (isBg ? 'Затваряне на навигацията' : 'Close navigation') : (isBg ? 'Отваряне на навигацията' : 'Open navigation')}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-navigation" className="mobile-nav" aria-label={isBg ? 'Мобилна навигация' : 'Mobile navigation'}>
            {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
            <a href={`${APP_URL}/auth/signin`}>{isBg ? 'Вход' : 'Sign in'}</a>
            <a href={APP_URL} className="button button-primary">{isBg ? 'Към приложението' : 'Start now'}</a>
          </nav>
        ) : null}
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-intro">
              <Link href={isBg ? '/sofia' : '/'} className="brand brand-inverse" aria-label={isBg ? 'Начална страница на Green Compass за София' : 'Green Compass home'}>
                <img src="/images/GCLogo-rich-premium-web.png" alt="" width="52" height="52" />
                <span>Green Compass</span>
              </Link>
              <p>{isBg ? 'Практична платформа за устойчиви навици, знание, местни възможности и общностно участие.' : 'A practical companion for turning everyday choices into visible, meaningful progress.'}</p>
            </div>
            <div>
              <h2>{isBg ? 'Разгледайте' : 'Explore'}</h2>
              <nav aria-label={isBg ? 'Навигация в долната част' : 'Footer navigation'}>
                {isBg ? <>
                  <Link href="/sofia#platform">Платформата</Link>
                  <Link href="/sofia#opportunities">Възможности за София</Link>
                  <Link href="/sofia#producers">Биопроизводители</Link>
                  <Link href="/">English website</Link>
                  <Link href="/privacy">Privacy policy</Link>
                </> : <>
                  <Link href="/#features">Features</Link>
                  <Link href="/explainer">How it works</Link>
                  <Link href="/research">Research</Link>
                  <Link href="/sofia">For Sofia</Link>
                  <Link href="/#faq">FAQ</Link>
                  <Link href="/privacy">Privacy</Link>
                  <Link href="/tos">Terms</Link>
                </>}
              </nav>
            </div>
            <div>
              <h2>{isBg ? 'Последвайте ни' : 'Follow along'}</h2>
              <nav>
                <a href="https://www.linkedin.com/company/green-compass-app" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://www.instagram.com/greencompass.app/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://www.facebook.com/profile.php?id=61577595789202" target="_blank" rel="noreferrer">Facebook</a>
                <a href="https://x.com/GreenCompassApp" target="_blank" rel="noreferrer">X</a>
              </nav>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Green Compass. {isBg ? 'Всички права запазени.' : 'All rights reserved.'}</p>
            <p>{isBg ? 'Независим проект в развитие.' : 'Built for progress, not perfection.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
