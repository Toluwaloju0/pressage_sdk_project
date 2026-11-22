import Hero from '../components/Hero.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Signals from '../components/Signals.jsx'
import SampleReport from '../components/SampleReport.jsx'
import ProfileSteps from '../components/ProfileSteps.jsx'
import Privacy from '../components/Privacy.jsx'
import Faq from '../components/Faq.jsx'
import SignInBand from '../components/SignInBand.jsx'

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <HowItWorks />
      <Signals />
      <SampleReport />
      <ProfileSteps />
      <Privacy />
      <Faq />
      <SignInBand />
    </main>
  )
}
