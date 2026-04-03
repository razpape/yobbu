import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import BrowsePage from './components/BrowsePage'
import PostTripForm from './components/PostTripForm'
import { SEED_TRIPS } from './data/trips'

export default function App() {
  const [lang, setLang]   = useState('en')
  const [view, setView]   = useState('home')
  const [trips, setTrips] = useState(SEED_TRIPS)

  const addTrip = (trip) => setTrips((prev) => [trip, ...prev])

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
          setTrips={setTrips}
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
