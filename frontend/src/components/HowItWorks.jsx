import { Link } from 'react-router-dom'
import { steps, stepsIntro } from '../content.js'

export default function HowItWorks() {
  return (
    <section className="section" id="how" aria-labelledby="how-title">
      <div className="container split">
        <div>
          <h2 className="h-section" id="how-title">
            From a short scan to a plain-language report
          </h2>
          <p className="lede lede--tight">{stepsIntro}</p>
        </div>
        <ol className="steps">
          {steps.map((step, i) => (
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
                {step.action && (
                  <Link className="step__link" to="/account">
                    {step.action.label}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
