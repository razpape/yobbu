import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhyYobbu from './components/WhyYobbu'
import HowItWorks from './components/HowItWorks'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import BrowsePage from './components/BrowsePage'
import PostTripForm from './components/PostTripForm'
import AuthModal from './components/AuthModal'
import GPProfile from './components/GPProfile'
import ProfilePage from './pages/ProfilePage'
import PrivacyPage from './pages/PrivacyPage'
import Admin from './pages/Admin'
import { useTrips } from './hooks/useTrips'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'

const isAdminRoute = new URLSearchParams(window.location.search).get('admin') === 'true'

export default function App() {
  const [lang, setLang]                 = useState('en')
  const [view, setView]                 = useState('home')
  const [showAuth, setShowAuth]         = useState(false)
  const [searchFilter, setSearchFilter] = useState({ dest: '', from: '' })
  const [selectedGp, setSelectedGp]     = useState(null)
  const { trips, loading, error, addTrip } = useTrips()
  const { user, signOut }               = useAuth()

  // On sign-in: navigate to profile; check if WhatsApp verification is needed
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user
        
        // Check if user has WhatsApp verified
        const { data: profile } = await supabase
          .from('profiles')
          .select('whatsapp_verified')
          .eq('id', u.id)
          .single()
        
        // If not verified, show auth modal for WhatsApp verification
        if (!profile?.whatsapp_verified) {
          setShowAuth(true)
        } else {
          setView('profile')
        }
        
        // Mark phone users as verified (existing behavior)
        if (u.phone && !profile?.whatsapp_verified) {
          await supabase.from('profiles').upsert({ id: u.id, whatsapp_verified: true }, { onConflict: 'id' })
          setShowAuth(false)
          setView('profile')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

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
        onLoginRequired={() => setShowAuth(true)}
        onBack={() => setView('browse')}
      />
    )
  }

  if (view === 'privacy') {
    return <PrivacyPage lang={lang} setView={setView} />
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
        <BrowsePage
          lang={lang} setView={setView} trips={trips} loading={loading}
          error={error} searchFilter={searchFilter} user={user}
          onLoginRequired={() => setShowAuth(true)}
          onViewProfile={handleViewGp}
        />
      )}

      {view === 'post' && (
        <PostTripForm
          lang={lang} setView={setView} onAdd={addTrip} user={user}
          onLoginRequired={() => setShowAuth(true)}
        />
      )}

      {showAuth && (
        <AuthModal lang={lang} user={user} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
      )}
    </div>
  )
}
