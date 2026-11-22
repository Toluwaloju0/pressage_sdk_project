import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import ReminderAlerts from './components/ReminderAlerts.jsx'
import Footer from './components/Footer.jsx'
import AccountPage from './pages/AccountPage.jsx'
import RemindersPage from './pages/RemindersPage.jsx'
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ScanPage from './pages/ScanPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// A new page should open at its top. (Links like /#how scroll on their own.)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Nav />
      <ReminderAlerts />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  )
}
