import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import BrowsePage from './components/BrowsePage'
import PostTripForm from './components/PostTripForm'
import { useTrips } from './hooks/useTrips'

export default function App() {
  const [lang, setLang] = useState('en')
  const [view, setView] = useState('home')
  const { trips, loading, error, addTrip } = useTrips()

  return (
    <div className="min-h-screen bg-sand">
      <Navbar lang={lang} setLang={setLang} view={view} setView={setView} />

      {view === 'home' && (
        <>
          <Hero lang={lang} setView={setView} />
          <HowItWorks lang={lang} />
        </>
      )}

      {view === 'browse' && (
        <BrowsePage
          lang={lang}
          setView={setView}
          trips={trips}
          loading={loading}
          error={error}
        />
      )}

      {view === 'post' && (
        <PostTripForm
          lang={lang}
          setView={setView}
          onAdd={addTrip}
        />
      )}
    </div>
  )
}
