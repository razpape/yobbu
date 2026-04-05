import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhyYobbu from './components/WhyYobbu'
import HowItWorks from './components/HowItWorks'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import BrowsePage from './components/BrowsePage'
import PostTripForm from './components/PostTripForm'
import AuthModal from './components/AuthModal'
import ProfilePage from './pages/ProfilePage'
import Admin from './pages/Admin'
import { useTrips } from './hooks/useTrips'
import { useAuth } from './hooks/useAuth'

const isAdminRoute = new URLSearchParams(window.location.search).get('admin') === 'true'

export default function App() {
  const [lang, setLang]                 = useState('en')
  const [view, setView]                 = useState('home')
  const [showAuth, setShowAuth]         = useState(false)
  const [searchFilter, setSearchFilter] = useState({ dest: '', from: '' })
  const { trips, loading, error, addTrip } = useTrips()
  const { user, signOut }               = useAuth()

  if (isAdminRoute) return <Admin />

  const handleSearch = (filter) => { setSearchFilter(filter); setView('browse') }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    setView('profile')
  }

  const handleSignOut = async () => {
    await signOut()
    setView('home')
  }

  // Profile — full page
  if (view === 'profile') {
    return (
      <ProfilePage
        user={user}
        lang={lang}
        onSignOut={handleSignOut}
        setView={setView}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      <Navbar
        lang={lang} setLang={setLang} setView={setView}
        user={user} onSignOut={handleSignOut}
        onLoginClick={() => setShowAuth(true)}
      />

      {view === 'home' && (
        <>
          <Hero lang={lang} setView={setView} onSearch={handleSearch} />
          <WhyYobbu lang={lang} />
          <HowItWorks lang={lang} />
          <FAQ lang={lang} />
          <Footer lang={lang} setView={setView} />
        </>
      )}

      {view === 'browse' && (
        <BrowsePage lang={lang} setView={setView} trips={trips} loading={loading} error={error} searchFilter={searchFilter} user={user} onLoginRequired={() => setShowAuth(true)} />
      )}

      {view === 'post' && (
        <PostTripForm lang={lang} setView={setView} onAdd={addTrip} />
      )}

      {showAuth && (
        <AuthModal lang={lang} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
      )}
    </div>
  )
}