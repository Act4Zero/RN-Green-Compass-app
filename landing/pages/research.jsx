import { ContactForm } from '../components/Forms';
import Seo from '../components/Seo';
import SiteLayout from '../components/SiteLayout';

const methods = [
  ['Carbon activity factors', 'Versioned factors and units are saved at log time. Transport and household-energy templates use reviewed government conversion factors where applicable.'],
  ['Reference benchmarks', 'Country and global territorial emissions are contextual references, never direct verdicts on a partial personal tracker.'],
  ['Tree equivalents', 'Tree visuals use a published seedling methodology and say “equivalent”; the app never claims a tree was planted.'],
  ['Product impact', 'Marketplace estimates require published, versioned methodology and are voided after a full refund.'],
];

export default function ResearchPage() {
  return (
    <SiteLayout>
      <Seo title="Research and methodology" description="Understand the evidence, assumptions and careful boundaries behind Green Compass impact feedback." path="/research" />
      <section className="page-hero research-hero">
        <div className="container narrow">
          <p className="eyebrow">Research & methodology</p>
          <h1>Feedback can help. It still needs context, sources and restraint.</h1>
          <p>Green Compass uses published research to shape the experience—and labels estimates so a useful signal never masquerades as certainty.</p>
        </div>
      </section>

      <section className="section study-section">
        <div className="container proof-grid">
          <div><p className="eyebrow">Behavior feedback</p><h2>A meaningful signal, with important boundaries.</h2><p className="section-lead">A 2024 Journal of Cleaner Production study with 216 participants reported a 23% average emissions decrease after repeated feedback from a carbon-footprint tracking app. Results varied substantially by domain and individual characteristics.</p><a className="text-link" href="https://doi.org/10.1016/j.jclepro.2023.139981" target="_blank" rel="noreferrer">Read the peer-reviewed paper <span aria-hidden="true">↗</span></a></div>
          <div className="study-stats">
            <div><strong>23%</strong><span>average reported decrease</span></div>
            <div><strong>12%</strong><span>mobility result</span></div>
            <div><strong>35%</strong><span>household result</span></div>
            <div><strong>216</strong><span>participants</span></div>
          </div>
        </div>
        <p className="container research-note">These are results reported by Hoffmann, Lasarov, Reimers and Trabandt—not measured outcomes from Green Compass users and not a guaranteed forecast.</p>
      </section>

      <section className="section method-section">
        <div className="container">
          <div className="section-heading split-heading"><div><p className="eyebrow">Inside the calculations</p><h2>Traceable inputs, separated outcomes.</h2></div><p>Green Compass snapshots the methodology used when an activity is recorded. Newer factors do not silently rewrite past results.</p></div>
          <div className="method-grid">{methods.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="section boundary-section">
        <div className="container boundary-grid">
          <div><p className="eyebrow light">What Green Compass does not claim</p><h2>Direction, not certification.</h2></div>
          <ul><li>A partial tracker is not a complete emissions inventory.</li><li>An estimate is not a verified reduction.</li><li>An equivalent is not a physical tree planted.</li><li>An offset is counted only after provider confirmation.</li><li>A study result is not a promise of individual behavior change.</li></ul>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-grid"><div><p className="eyebrow">Discuss the evidence</p><h2>Questions and useful criticism are welcome.</h2><p className="section-lead">If you work in sustainability, research or behavior change, we would value your perspective.</p></div><ContactForm /></div>
      </section>
    </SiteLayout>
  );
}
