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
import TermsPage from './pages/TermsPage'
import SendPackagePage from './pages/SendPackagePage'
import OnboardingPage from './pages/OnboardingPage'
import Admin from './pages/Admin'
import ErrorBoundary from './components/ErrorBoundary'
import { useTrips } from './hooks/useTrips'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'

// Map URL paths → view names and back
const PATH_TO_VIEW = { '/': 'home', '/browse': 'browse', '/send': 'send', '/post': 'post', '/privacy': 'privacy', '/terms': 'terms', '/login': 'phone-auth', '/profile': 'profile' }
const VIEW_TO_PATH = Object.fromEntries(Object.entries(PATH_TO_VIEW).map(([k, v]) => [v, k]))

function getInitialView() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('admin') === 'true') return 'admin'
  return PATH_TO_VIEW[window.location.pathname] || 'home'
}

function navigateTo(view, replace = false) {
  const path = VIEW_TO_PATH[view] || '/'
  if (replace) window.history.replaceState({ view }, '', path)
  else window.history.pushState({ view }, '', path)
}

const handleOAuthCallback = () => {
  const { hash, search } = window.location
  if (hash.includes('access_token') || search.includes('code=')) return true
  if (search.includes('error=')) {
    console.error('OAuth error:', search)
    window.history.replaceState({}, document.title, window.location.pathname)
  }
  return false
}

export default function App() {
  const [lang, setLang]                 = useState('en')
  const [view, setViewState]            = useState(getInitialView)
  const [searchFilter, setSearchFilter] = useState({ dest: '', from: '' })
  const [selectedGp, setSelectedGp]     = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const { trips, loading: tripsLoading, error, addTrip } = useTrips()
  const { user, loading: authLoading, signOut } = useAuth()

  // Wrap setView so it always keeps the URL in sync
  const setView = (v, replace = false) => {
    setViewState(v)
    navigateTo(v, replace)
  }

  // Handle browser back/forward
  useEffect(() => {
    const onPop = (e) => {
      const v = e.state?.view || PATH_TO_VIEW[window.location.pathname] || 'home'
      setViewState(v)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    handleOAuthCallback()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setView('home', true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Once useAuth finishes loading, check if we need to navigate to onboarding or profile
  useEffect(() => {
    if (!authLoading && user && view === 'home') {
      setView(user.onboarding_complete ? 'profile' : 'onboarding', true)
    }
  }, [authLoading, user, view])

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    setInstallPrompt(null)
  }

  if (view === 'admin') return <Admin />

  const handleSearch = (filter) => { setSearchFilter(filter); setView('browse') }

  const handlePhoneAuthComplete = async (completedUser) => {
    const uid = completedUser?.id || user?.id
    if (!uid) { setView('home'); return }
    const { data } = await supabase.from('profiles').select('onboarding_complete').eq('id', uid).single()
    setView(data?.onboarding_complete ? 'profile' : 'onboarding')
  }

  const handleSignOut = async () => {
    await signOut()
    setView('home')
  }

  const handleViewGp = (gp) => {
    setSelectedGp(gp)
    setViewState('gp') // don't push /gp to URL — back button should go to browse
    window.history.pushState({ view: 'gp' }, '', '/browse')
  }

  if (view === 'profile')    return <ErrorBoundary><ProfilePage user={user} lang={lang} onSignOut={handleSignOut} setView={setView} /></ErrorBoundary>
  if (view === 'gp' && selectedGp) return <ErrorBoundary><GPProfile gp={selectedGp} lang={lang} user={user} onLoginRequired={() => setView('phone-auth')} onBack={() => setView('browse')} /></ErrorBoundary>
  if (view === 'onboarding') return <ErrorBoundary><OnboardingPage user={user} lang={lang} onComplete={() => setView('profile')} onBrowse={() => setView('browse')} /></ErrorBoundary>
  if (view === 'privacy')    return <PrivacyPage lang={lang} setView={setView} />
  if (view === 'terms')      return <TermsPage lang={lang} setView={setView} />
  if (view === 'send')       return <ErrorBoundary><SendPackagePage lang={lang} setView={setView} /></ErrorBoundary>
  if (view === 'phone-auth') return <PhoneAuth lang={lang} onComplete={handlePhoneAuthComplete} />

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
        <Navbar lang={lang} setLang={setLang} setView={setView} user={user} onSignOut={handleSignOut} onLoginClick={() => setView('phone-auth')} showInstall={!!installPrompt} onInstallClick={handleInstallApp} />

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
          <PostTripForm lang={lang} setView={setView} onAdd={addTrip} user={user} onLoginRequired={() => setView('phone-auth')} />
        )}
      </div>
    </ErrorBoundary>
  )
}
