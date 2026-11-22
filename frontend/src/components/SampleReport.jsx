import { sample } from '../content.js'

export default function SampleReport() {
  return (
    <section className="section section--tint" id="report" aria-labelledby="report-title">
      <div className="container split">
        <div className="sample__intro">
          <h2 className="h-section" id="report-title">
            What you get back
          </h2>
          {sample.intro.map((p) => (
            <p className="lede lede--tight" key={p}>
              {p}
            </p>
          ))}
        </div>

        <article className="sheet" aria-label="Example report">
          <header className="sheet__head">
            <h3 className="h-item">Your scan report</h3>
            <span className="tag">Sample data</span>
          </header>

          <dl className="readings">
            {sample.readings.map((r) => (
              <div className={`reading reading--${r.id}`} key={r.id}>
                <dt className="reading__name">{r.name}</dt>
                <dd className="reading__value">{r.value}</dd>
                <dd className="reading__unit">{r.unit}</dd>
              </div>
            ))}
          </dl>

          <h4 className="sheet__h">In plain words</h4>
          <p>{sample.meaning}</p>

          <h4 className="sheet__h">Habits worth trying this week</h4>
          <ul className="sheet__list">
            {sample.habits.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <p className="sheet__foot">{sample.foot}</p>
        </article>
      </div>
    </section>
  )
}
