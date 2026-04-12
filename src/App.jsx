import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhyYobbu from './components/WhyYobbu'
import HowItWorks from './components/HowItWorks'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import BrowsePage from './components/BrowsePage'
import PostTripForm from './components/PostTripForm'
import PhoneAuth from './pages/PhoneAuth'
import GPProfile from './components/GPProfile'
import ProfilePage from './pages/ProfilePage'
import PrivacyPage from './pages/PrivacyPage'
import SendPackagePage from './pages/SendPackagePage'
import Admin from './pages/Admin'
import { useTrips } from './hooks/useTrips'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'

const isAdminRoute = new URLSearchParams(window.location.search).get('admin') === 'true'

// Handle OAuth callback from Facebook (removes hash fragment issues)
const handleOAuthCallback = () => {
  const hash = window.location.hash
  const search = window.location.search
  
  // Check for access_token in URL (OAuth success)
  if (hash.includes('access_token') || search.includes('code=')) {
    // Let Supabase handle the session
    return true
  }
  
  // Check for error in URL
  if (search.includes('error=')) {
    console.error('OAuth error:', search)
    // Clear the error from URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
  
  return false
}

export default function App() {
  const [lang, setLang]                 = useState('en')
  const [view, setView]                 = useState('home')
  const [searchFilter, setSearchFilter] = useState({ dest: '', from: '' })
  const [selectedGp, setSelectedGp]     = useState(null)
  const { trips, loading: tripsLoading, error, addTrip } = useTrips()
  const { user, loading: authLoading, signOut } = useAuth()

  // Handle OAuth callback errors in URL on mount
  useEffect(() => {
    handleOAuthCallback()
  }, [])

  if (isAdminRoute) return <Admin />


  const handleSearch = (filter) => { setSearchFilter(filter); setView('browse') }

  const handlePhoneAuthComplete = () => {
    setView('home')
  }

  const handleSignOut = async () => {
    await signOut()
    setView('home')
  }

  const handleViewGp = (gp) => {
    setSelectedGp(gp)
    setView('gp')
  }

  // Full-page views
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

  if (view === 'gp' && selectedGp) {
    return (
      <GPProfile
        gp={selectedGp}
        lang={lang}
        user={user}
        onLoginRequired={() => setView('phone-auth')}
        onBack={() => setView('browse')}
      />
    )
  }

  if (view === 'privacy') {
    return <PrivacyPage lang={lang} setView={setView} />
  }

  if (view === 'send') {
    return (
      <SendPackagePage
        lang={lang}
        user={user}
        onBack={() => setView('browse')}
        onLoginRequired={() => setView('phone-auth')}
      />
    )
  }

  // Phone Auth flow (new)
  if (view === 'phone-auth') {
    return (
      <PhoneAuth 
        lang={lang} 
        onComplete={handlePhoneAuthComplete}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      <Navbar
        lang={lang} setLang={setLang} setView={setView}
        user={user} onSignOut={handleSignOut}
        onLoginClick={() => setView('phone-auth')}
      />
      {view === 'home' && (
        <>
          <Hero lang={lang} setView={setView} onSearch={handleSearch} onSend={() => setView('send')} />
          <WhyYobbu lang={lang} />
          <HowItWorks lang={lang} />
          <FAQ lang={lang} />
          <Footer lang={lang} setView={setView} />
        </>
      )}

      {view === 'browse' && (
        <BrowsePage
          lang={lang} setView={setView} trips={trips} loading={tripsLoading}
          error={error} searchFilter={searchFilter} user={user}
          onLoginRequired={() => setView('phone-auth')}
          onViewProfile={handleViewGp}
        />
      )}

      {view === 'post' && (
        <PostTripForm
          lang={lang} setView={setView} onAdd={addTrip} user={user}
          onLoginRequired={() => setView('phone-auth')}
        />
      )}

    </div>
  )
}
