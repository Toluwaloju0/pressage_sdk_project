import { Link } from 'react-router-dom'
import { hero } from '../content.js'
import Cta from './Cta.jsx'
import SignalRibbon from './SignalRibbon.jsx'

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <h1 className="h-display hero__title" id="hero-title">
          {hero.title}
        </h1>
        <div>
          <p className="lede">{hero.lede}</p>
          <div className="hero__actions">
            <Cta />
            <Link className="btn btn--ghost" to="/account">
              {hero.profileLink}
            </Link>
            <a className="btn btn--ghost" href="#privacy">
              Read our privacy promises
            </a>
          </div>
        </div>
      </div>
      <SignalRibbon note={hero.sampleNote} />
    </section>
  )
}
