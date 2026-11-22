import { APP_NAME } from '../config.js'
import { footer } from '../content.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__name">{APP_NAME}</p>
          <p className="footer__fine">
            Built for the{' '}
            <a href="https://dev.to/challenges/presage-2026-11-04">Presage SmartSpectra SDK Challenge</a> on DEV.
            “{APP_NAME}” is a working name.
          </p>
        </div>
        <p className="footer__fine">{footer.fine}</p>
      </div>
    </footer>
  )
}
