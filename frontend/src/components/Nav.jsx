import { Link } from 'react-router-dom'
import { APP_NAME, scanEnabled } from '../config.js'
import { navLinks } from '../content.js'
import Cta from './Cta.jsx'

function Logo() {
  return (
    <Link className="logo" to="/" aria-label={`${APP_NAME} home`}>
      <svg width="30" height="28" viewBox="0 0 30 28" aria-hidden="true">
        <path
          d="M2 15h6l3-9 5 17 3-8h9"
          fill="none"
          stroke="var(--pulse)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {APP_NAME}
    </Link>
  )
}

export default function Nav() {
  return (
    <header className="nav" id="top">
      <div className="container nav__inner">
        <Logo />
        <div className="nav__end">
          <nav aria-label="Main">
            <ul className="nav__links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav__tools">
            <Link className="nav__plain" to="/reminders">Reminders</Link>
            <Link className="nav__plain" to="/account">Account</Link>
            {scanEnabled && <Cta small />}
          </div>
        </div>
      </div>
    </header>
  )
}
