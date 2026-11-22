import { faqs } from '../content.js'

// Native <details> keeps this keyboard and screen-reader accessible with no extra code.
export default function Faq() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container">
        <h2 className="h-section" id="faq-title">
          Questions people ask
        </h2>
        <div className="faq">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p className="faq__answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
