import { privacy } from '../content.js'

export default function Privacy() {
  return (
    <section className="section" id="privacy" aria-labelledby="privacy-title">
      <div className="container">
        <h2 className="h-section h-section--wide" id="privacy-title">
          {privacy.title}
        </h2>
        <p className="lede lede--tight">{privacy.lede}</p>

        <div className="panel">
          <div>
            <h3 className="h-item">What happens</h3>
            <ul className="panel__list">
              {privacy.does.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="h-item">What we will not do</h3>
            <ul className="panel__list">
              {privacy.doesNot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
