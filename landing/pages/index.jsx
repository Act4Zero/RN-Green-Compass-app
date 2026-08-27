import Link from 'next/link';
import { ContactForm, NewsletterForm } from '../components/Forms';
import Seo from '../components/Seo';
import SiteLayout from '../components/SiteLayout';

const APP_URL = 'https://app.greencompass.app';

const features = [
  {
    number: '01',
    status: 'In the app',
    title: 'Habits & carbon clarity',
    text: 'Log everyday actions, set measurable goals, follow streaks, and see tracked emissions, avoided impact, offsets, and remaining balance as separate values.',
    detail: 'Versioned factors and transparent methodology keep estimates useful without overstating certainty.',
  },
  {
    number: '02',
    status: 'In the app',
    title: 'Your living ecosystem',
    text: 'Watch a personal landscape grow from seed to thriving habitat as your Green Points and positive actions accumulate.',
    detail: 'Open every species to learn what it represents and what helps the ecosystem grow.',
  },
  {
    number: '03',
    status: 'Sign-in required',
    title: 'Sustainability map',
    text: 'Explore greener places, verified details, community events, EV charging and curated eco-tours through an interactive 3D globe.',
    detail: 'The first reviewed catalogue focuses on Bulgaria; public visitors can see a lightweight preview.',
  },
  {
    number: '04',
    status: 'BG + EN',
    title: 'Personalized Knowledge Hub',
    text: 'Move from articles to quizzes, learning paths, daily missions, simulations, webinars, practical toolkits and shareable certificates.',
    detail: 'Recommendations adapt to interests and progress while public learning remains easy to explore.',
  },
  {
    number: '05',
    status: 'In the app',
    title: 'Community action',
    text: 'Join challenges, private circles, shared goals, reviewed projects and scoped leaderboards—without exposing the habits you keep private.',
    detail: 'Green Points, badges and contribution rewards make collective progress visible.',
  },
  {
    number: '06',
    status: 'Pilot rollout',
    title: 'Verified marketplace',
    text: 'Discover lower-impact physical products from reviewed businesses, with evidence-backed scores, certifications and versioned impact estimates.',
    detail: 'Catalog and checkout are enabled in stages as partners, stock and payment operations complete verification.',
  },
];

const faq = [
  ['Is Green Compass available now?', 'Yes. The web app contains habit tracking, impact views, Knowledge Hub, community experiences, the living ecosystem and an authenticated sustainability map. Some services—such as marketplace checkout and offset purchasing—remain controlled rollouts.'],
  ['Are the impact numbers exact?', 'No. Green Compass presents directional estimates with versioned factors, units, sources and assumptions. It does not present a partial personal tracker as an emissions inventory, certification or carbon-neutrality claim.'],
  ['What stays private?', 'Personal activities, goals, travel entries, reminders and reflections are private by default. Community comparisons use only aggregate impact summaries and require explicit opt-in.'],
  ['Can I use the map without an account?', 'You can view the bundled public preview. The interactive 3D globe and its live catalogue require an account so Green Compass can protect privacy, moderation workflows and map-service capacity.'],
  ['What does “verified” mean in the marketplace?', 'Businesses, product claims, certifications and impact evidence pass editorial and operational checks before publication. The pilot does not seed invented products or unreviewed sustainability claims.'],
];

export default function HomePage() {
  return (
    <SiteLayout>
      <Seo
        title="Green Compass — Turn everyday choices into visible progress"
        description="Build sustainable habits, understand your impact, discover greener places, learn, connect, and grow a living ecosystem with Green Compass."
      />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy fade-rise">
            <p className="eyebrow">One compass. A whole sustainability practice.</p>
            <h1>Turn everyday choices into <em>visible progress.</em></h1>
            <p className="hero-lead">Green Compass brings habits, impact, learning, local discovery and community into one thoughtful rhythm—so the next good step is easier to see and easier to keep.</p>
            <div className="button-row">
              <a className="button button-primary" href={`${APP_URL}/auth/signup`}>Start your journey <span aria-hidden="true">→</span></a>
              <a className="button button-secondary" href={APP_URL}>Explore the app</a>
            </div>
            <div className="hero-proof" aria-label="Product principles">
              <span>Free to begin</span><span>Private by design</span><span>Evidence-aware</span>
            </div>
          </div>

          <div className="ecosystem-stage" aria-label="Illustration of a growing Green Compass ecosystem">
            <div className="sun-orbit" />
            <div className="canopy canopy-one" />
            <div className="canopy canopy-two" />
            <div className="trunk" />
            <div className="ground">
              <span className="plant plant-one">✦</span>
              <span className="plant plant-two">✽</span>
              <span className="plant plant-three">✦</span>
            </div>
            <div className="impact-card">
              <p>YOUR LIVING ECOSYSTEM</p>
              <strong>Oak seedling</strong>
              <span>480 Green Points · 12 day streak</span>
              <div className="progress-track"><i /></div>
              <small>120 points to the next species</small>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Green Compass capabilities">
        <div className="container signal-grid">
          <div><strong>6</strong><span>connected product areas</span></div>
          <div><strong>BG + EN</strong><span>learning & marketplace content</span></div>
          <div><strong>1 wallet</strong><span>Green Points across the app</span></div>
          <div><strong>Private</strong><span>by default, shared by choice</span></div>
        </div>
      </section>

      <section id="features" className="section feature-section">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">What Green Compass does</p>
              <h2>From one good action to a living view of change.</h2>
            </div>
            <p>The app has grown beyond a knowledge library. Its modules now work as one system: learn something useful, act on it, understand the result and keep momentum with others.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className="feature-meta"><span>{feature.number}</span><b>{feature.status}</b></div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <small>{feature.detail}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section rhythm-section">
        <div className="container rhythm-grid">
          <div className="rhythm-copy">
            <p className="eyebrow light">A daily rhythm that connects</p>
            <h2>Learn. Act. See it grow. Move together.</h2>
            <p>Green Compass is designed as a reinforcing loop rather than a pile of disconnected tools.</p>
            <Link className="button button-accent" href="/explainer">See how the system works</Link>
          </div>
          <ol className="rhythm-steps">
            <li><span>01</span><div><strong>Choose a next step</strong><p>Use a daily practice, a personal goal, a lesson or a community challenge.</p></div></li>
            <li><span>02</span><div><strong>Record what happened</strong><p>Log an action with the right unit, context and methodology snapshot.</p></div></li>
            <li><span>03</span><div><strong>Understand the pattern</strong><p>See streaks, tracked impact, Green Points and honest comparisons over time.</p></div></li>
            <li><span>04</span><div><strong>Grow beyond yourself</strong><p>Build your ecosystem, discover local options and contribute to shared goals.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section proof-section">
        <div className="container proof-grid">
          <div className="proof-visual">
            <p className="proof-label">A clearer carbon balance</p>
            <div className="balance-row"><span>Tracked emissions</span><strong>42.8 kg</strong></div>
            <div className="balance-row positive"><span>Estimated avoided</span><strong>− 9.4 kg</strong></div>
            <div className="balance-row positive"><span>Provider-confirmed offsets</span><strong>− 5.0 kg</strong></div>
            <div className="balance-total"><span>Remaining tracked balance</span><strong>28.4 kg CO₂e</strong></div>
            <small>Illustrative example · Values stay separate and traceable.</small>
          </div>
          <div>
            <p className="eyebrow">Honest by design</p>
            <h2>Useful numbers without false precision.</h2>
            <p className="section-lead">Every impact estimate should help you understand a choice—not manufacture certainty. Green Compass records the factor, unit, source and methodology used at the time of logging.</p>
            <ul className="check-list">
              <li>Gross emissions, avoided impact and offsets stay separate.</li>
              <li>Comparisons only create avoided impact when units truly match.</li>
              <li>Reference benchmarks are context, not personal verdicts.</li>
              <li>Private reflections never become public activity data.</li>
            </ul>
            <Link className="text-link" href="/research">Explore the evidence approach <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="section map-callout">
        <div className="container map-grid">
          <div>
            <p className="eyebrow light">Discovery grounded in place</p>
            <h2>A sustainability map built for useful context—not just pins.</h2>
            <p>Search greener places, explore verified profiles, see connector details, join mapped events and follow curated eco-tours. Community submissions and reviews enter moderation before they can influence the catalogue.</p>
            <a className="button button-accent" href={`${APP_URL}/map`}>Preview the map</a>
          </div>
          <div className="map-panel" aria-label="Map coverage summary">
            <div className="map-dot dot-one" /><div className="map-dot dot-two" /><div className="map-dot dot-three" /><div className="map-dot dot-four" />
            <div className="map-card"><span>FIRST CATALOGUE</span><strong>Bulgaria</strong><p>Renewable energy · Local & organic · Zero waste · EV charging · Recycling · Green spaces · Community events</p></div>
          </div>
        </div>
      </section>

      <section id="faq" className="section faq-section">
        <div className="container faq-grid">
          <div className="faq-title">
            <p className="eyebrow">Questions, answered plainly</p>
            <h2>Know what is ready, what is gated and what the numbers mean.</h2>
          </div>
          <div className="faq-list">
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Help shape what comes next</p>
            <h2>Talk to the people building Green Compass.</h2>
            <p className="section-lead">Share a question, research lead, partnership idea or a piece of the experience that needs to work better.</p>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="newsletter-section">
        <div className="container newsletter-grid">
          <div><p className="eyebrow light">Stay close to the build</p><h2>See what changes—and why.</h2></div>
          <NewsletterForm inverse />
        </div>
      </section>
    </SiteLayout>
  );
}
