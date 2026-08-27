import Seo from '../components/Seo';
import SiteLayout from '../components/SiteLayout';
import { NewsletterForm } from '../components/Forms';

const APP_URL = 'https://app.greencompass.app';

const stages = [
  ['1', 'Choose your direction', 'Set a Green Identity baseline, select focus areas and turn intent into goals that fit your real routine.'],
  ['2', 'Take one meaningful action', 'Log a habit, complete a daily eco practice, learn through a mission or contribute to a community goal.'],
  ['3', 'See what changed', 'Review streaks, actions, CO₂e estimates, direct measures and the source behind each calculated value.'],
  ['4', 'Grow your ecosystem', 'Green Points unlock species and turn progress into a living habitat you can revisit and understand.'],
  ['5', 'Connect the next step', 'Use the map, Knowledge Hub, community and marketplace to move from insight to another practical choice.'],
];

export default function ExplainerPage() {
  return (
    <SiteLayout>
      <Seo title="How Green Compass works" description="See how Green Compass connects habits, impact, learning, local discovery, community and a living ecosystem." path="/explainer" />
      <section className="page-hero eco-grid">
        <div className="container narrow">
          <p className="eyebrow">How it works</p>
          <h1>One clear feedback loop, across your whole sustainability practice.</h1>
          <p>Green Compass connects learning, action and reflection so each part of the app makes the next one more useful.</p>
          <div className="button-row"><a className="button button-primary" href={`${APP_URL}/auth/signup`}>Start your journey</a><a className="button button-secondary" href={APP_URL}>Open the app</a></div>
        </div>
      </section>

      <section className="section">
        <div className="container explainer-grid">
          <div className="sticky-copy"><p className="eyebrow">The product loop</p><h2>From intention to something you can see.</h2><p>Every stage is useful on its own. Together, they help build momentum without turning sustainability into a purity test.</p></div>
          <ol className="stage-list">
            {stages.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="section status-section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow light">Readiness, made visible</p><h2>Not every capability opens at the same time.</h2><p>Feature flags protect staged rollouts, partner onboarding, payment operations and third-party service capacity.</p></div>
          <div className="status-grid">
            <article><b>Available in the app</b><h3>Daily practice</h3><p>Habits, goals, impact views, personalized learning, community, points, badges and the living ecosystem.</p></article>
            <article><b>Access controlled</b><h3>Interactive globe</h3><p>Anonymous visitors see a zero-cost preview; authenticated sessions receive the live experience when capacity is available.</p></article>
            <article><b>Pilot rollout</b><h3>Marketplace & offsets</h3><p>Catalog, checkout and provider operations open only after verification, onboarding and production acceptance are complete.</p></article>
          </div>
        </div>
      </section>

      <section className="section privacy-section">
        <div className="container proof-grid">
          <div><p className="eyebrow">Privacy boundaries</p><h2>Your progress is yours first.</h2><p className="section-lead">Community features use deliberate, narrow sharing boundaries. Joining a group never exposes individual habits, travel records, journals, reflections or poll choices.</p></div>
          <div className="principle-card">
            <p><strong>Private by default</strong><span>Activities, goals, reminders and reflections stay owner-scoped.</span></p>
            <p><strong>Aggregate by choice</strong><span>Group comparisons require opt-in and show summary progress only.</span></p>
            <p><strong>Moderated contributions</strong><span>Places, reviews, projects and knowledge submissions are reviewed before publication.</span></p>
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="container newsletter-grid"><div><p className="eyebrow light">Stay close to the build</p><h2>See what changes—and why.</h2></div><NewsletterForm inverse /></div>
      </section>
    </SiteLayout>
  );
}
