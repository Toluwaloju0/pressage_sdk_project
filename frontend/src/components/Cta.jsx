import { Link } from 'react-router-dom'
import { scanEnabled, scanPath } from '../config.js'

// One place decides where the primary button goes, so flipping `scanEnabled`
// in config.js updates every button on the page.
export default function Cta({ small = false }) {
  const size = small ? ' btn--small' : ''
  if (scanEnabled) {
    return (
      <Link className={`btn btn--primary${size}`} to={scanPath}>
        Start a scan
      </Link>
    )
  }
  return (
    <a className={`btn btn--primary${size}`} href="#how">
      See how it works
    </a>
  )
}
