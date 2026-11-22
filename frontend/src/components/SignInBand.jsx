import { Link } from 'react-router-dom'
import { scanEnabled } from '../config.js'
import { profileSteps as copy } from '../content.js'
import Cta from './Cta.jsx'

// The get-started prompt at the bottom of the page.
export default function SignInBand() {
  return (
    <section className="section section--tint" id="get-started" aria-labelledby="get-started-title">
      <div className="container band">
        <div>
          <h2 className="h-section h-section--wide" id="get-started-title">
            {copy.title}
          </h2>
          <p className="lede lede--tight">{copy.body}</p>
        </div>
        <div className="band__action">
          <div className="band__buttons">
            <Link className="btn btn--primary" to="/account">
              {copy.openProfile}
            </Link>
            {scanEnabled && <Cta />}
          </div>
        </div>
      </div>
    </section>
  )
}
