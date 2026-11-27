import { Link } from 'react-router-dom';
import { IconArrow } from '../components/icons';

export default function NotFound() {
  return (
    <section className="section section--navy notfound">
      <div className="container notfound__inner">
        <span className="eyebrow eyebrow--dark">
          <span className="eyebrow__dot" />
          404
        </span>
        <h1 className="display display--lg display--onDark">
          This page went <em>missing.</em>
        </h1>
        <p className="section-head__lede section-head__lede--onDark">
          The link may be old or mistyped. The homepage is a good place to pick the trail back up.
        </p>
        <Link to="/" className="btn btn--coral btn--lg">
          Back to home <IconArrow width={18} height={18} />
        </Link>
      </div>
    </section>
  );
}
