import { Link } from 'react-router-dom'
import { profileSteps as copy } from '../content.js'

// Homepage section: how to set up a profile, with a link to the profile settings page.
export default function ProfileSteps() {
  return (
    <section className="section" id="profile-setup" aria-labelledby="profile-setup-title">
      <div className="container split">
        <div>
          <h2 className="h-section" id="profile-setup-title">
            {copy.title}
          </h2>
          <p className="lede lede--tight">{copy.body}</p>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/account">
              {copy.openProfile}
            </Link>
          </div>
        </div>
        <ol className="steps">
          {copy.steps.map((step, i) => (
            <li className="step" key={step.title}>
              <span className="step__num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="step__body">
                <h3 className="h-item">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
