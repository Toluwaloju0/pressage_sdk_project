import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main id="main" className="page">
      <div className="container">
        <div className="profile">
          <h1 className="h-section h-section--wide">This page does not exist</h1>
          <p className="lede lede--tight">The link may be old or mistyped.</p>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/">
              Go to the homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
