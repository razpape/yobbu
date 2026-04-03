import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import BrowsePage from './components/BrowsePage'
import PostTripForm from './components/PostTripForm'
import AuthModal from './components/AuthModal'
import { useTrips } from './hooks/useTrips'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const [lang, setLang]           = useState('en')
  const [view, setView]           = useState('home')
  const [showAuth, setShowAuth]   = useState(false)
  const { trips, loading, error, addTrip } = useTrips()
  const { user, signOut }         = useAuth()

  const handlePostClick = () => {
    if (!user) { setShowAuth(true); return }
    setView('post')
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
  }

  return (
    <div className="min-h-screen bg-sand">
      <Navbar
        lang={lang} setLang={setLang}
        view={view} setView={setView}
        user={user} onSignOut={signOut}
        onLoginClick={() => setShowAuth(true)}
      />

      {view === 'home' && (
        <>
          <Hero lang={lang} setView={setView} />
          <HowItWorks lang={lang} />
        </>
      )}

      {view === 'browse' && (
        <BrowsePage
          lang={lang} setView={setView}
          trips={trips} loading={loading} error={error}
          user={user}
          onLoginRequired={() => setShowAuth(true)}
        />
      )}

      {view === 'post' && (
        <PostTripForm
          lang={lang} setView={setView}
          onAdd={addTrip}
        />
      )}

      {showAuth && (
        <AuthModal
          lang={lang}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}