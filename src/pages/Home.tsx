import { Link } from 'react-router-dom';
import HeroSlats from '../components/HeroSlats';
import AudioIntro from '../components/AudioIntro';
import {
  IconArrow,
  IconClock,
  IconGauge,
  IconGrid,
  IconLayers,
  IconPencil,
  IconRadar,
  IconSparkle
} from '../components/icons';

const FEATURES = [
  {
    icon: IconPencil,
    title: 'Easy civic complaint reporting',
    body: 'A short, human form for title, description, category, location and a photo — no account, no paperwork, no jargon.',
    tag: '01 · Capture',
    span: 'wide'
  },
  {
    icon: IconSparkle,
    title: 'AI-powered issue analysis',
    body: 'Every report is read for its real subject and routed to the right department, with the reasoning shown in plain language.',
    tag: '02 · Understand',
    span: 'wide'
  },
  {
    icon: IconGauge,
    title: 'Priority recommendation',
    body: 'Risk language, severity and repetition feed a priority score so dangerous issues rise above cosmetic ones.',
    tag: '03 · Rank',
    span: ''
  },
  {
    icon: IconRadar,
    title: 'Complaint tracking',
    body: 'One complaint ID shows the full journey from received to resolved, with the AI verdict attached.',
    tag: '04 · Follow',
    span: ''
  },
  {
    icon: IconGrid,
    title: 'Admin management',
    body: 'A single dashboard with totals, filters, high-priority alerts and one-click status updates for staff.',
    tag: '05 · Act',
    span: ''
  }
] as const;

const STEPS = [
  {
    title: 'Report an issue',
    body: 'Describe the problem in your own words, add a photo and drop a pin on where it is. Thirty seconds is enough.',
    icon: IconPencil
  },
  {
    title: 'AI analyses the complaint',
    body: 'CivicLens reads the report, predicts the category, scores the urgency and explains what drove the decision.',
    icon: IconSparkle
  },
  {
    title: 'Track its progress',
    body: 'Keep the complaint ID. Watch it move from pending to in progress to resolved, with timestamps at every step.',
    icon: IconClock
  }
] as const;

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__bg">
          <HeroSlats />
          <div className="hero__scrim" />
        </div>

        <div className="container hero__inner">
          <span className="eyebrow eyebrow--dark">
            <span className="eyebrow__dot" />
            Civic technology, powered by AI
          </span>

          <h1 className="hero__title">
            See the issue.
            <br />
            <em>Spark the change.</em>
          </h1>

          <p className="hero__lede">
            CivicLens AI turns the broken streetlight, the overflowing drain and the pothole outside school into clear,
            prioritised complaints that reach the right desk — and stay visible until they are fixed.
          </p>

          <div className="hero__actions">
            <Link to="/report" className="btn btn--coral btn--lg">
              Report an Issue
              <IconArrow width={18} height={18} />
            </Link>
            <a href="#features" className="btn btn--ghost btn--lg">
              Explore Features
            </a>
          </div>

          <ul className="hero__chips">
            <li>
              <IconSparkle width={15} height={15} /> AI triage on every report
            </li>
            <li>
              <IconGauge width={15} height={15} /> Priority scoring
            </li>
            <li>
              <IconRadar width={15} height={15} /> Live status tracking
            </li>
          </ul>
        </div>

        <div className="hero__base" aria-hidden="true" />
      </section>

      <section id="features" className="section section--cream">
        <div className="container">
          <header className="section-head">
            <span className="eyebrow">
              <span className="eyebrow__dot" />
              The platform
            </span>
            <h2 className="display display--md">
              Everything a complaint needs, <em>in one loop.</em>
            </h2>
            <p className="section-head__lede">
              Most civic issues fail between the report and the repair. CivicLens closes that gap with five linked
              pieces — capture, analysis, priority, tracking and management.
            </p>
          </header>

          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className={`feature-card${feature.span ? ` feature-card--${feature.span}` : ''}`}>
                <span className="feature-card__icon" aria-hidden="true">
                  <feature.icon width={22} height={22} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <span className="feature-card__tag">{feature.tag}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AudioIntro />

      <section id="how-it-works" className="section section--navy">
        <div className="container">
          <header className="section-head section-head--split">
            <div>
              <span className="eyebrow eyebrow--dark">
                <span className="eyebrow__dot" />
                How it works
              </span>
              <h2 className="display display--md display--onDark">
                Three steps. <em>Zero black holes.</em>
              </h2>
            </div>
            <p className="section-head__lede section-head__lede--onDark">
              A citizen writes once. The platform does the reading, routing and remembering — so nobody has to chase a
              complaint through five phone calls.
            </p>
          </header>

          <ol className="steps">
            {STEPS.map((step, index) => (
              <li key={step.title} className="step">
                <div className="step__top">
                  <span className="step__num">0{index + 1}</span>
                  <span className="step__icon" aria-hidden="true">
                    <step.icon width={20} height={20} />
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="steps__footer">
            <span className="steps__note">
              <IconLayers width={16} height={16} /> Works for campus municipalities, wards and city councils.
            </span>
            <Link to="/report" className="btn btn--ghost btn--sm">
              Try a report <IconArrow width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--cream section--tight">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__copy">
              <span className="eyebrow eyebrow--dark">
                <span className="eyebrow__dot" />
                Start here
              </span>
              <h2 className="display display--sm display--onDark">
                Spotted something broken? <em>Say it once.</em>
              </h2>
              <p>File a report in under a minute, or check the status of one you already raised.</p>
            </div>
            <div className="cta-card__actions">
              <Link to="/report" className="btn btn--coral btn--lg">
                Report an issue
                <IconArrow width={18} height={18} />
              </Link>
              <Link to="/track" className="btn btn--ghost btn--lg">
                Track a complaint
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
