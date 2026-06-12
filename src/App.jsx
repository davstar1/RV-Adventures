import './index.css'
import Navbar       from './Navbar'
import Hero         from './Hero'
import AdventurePicker from './AdventurePicker'
import Blog         from './Blog'
import Destinations from './Destinations'
import Videos       from './Videos'
import GearStrip    from './GearStrip'
import Community    from './Community'
import Admin        from './Admin'
import Footer       from './Footer'
import { useEffect, useState } from 'react'

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  if (hash.startsWith('#admin')) {
    return <Admin />;
  }

  return (
    <>
      <Navbar />
      <Hero />
      <AdventurePicker />
      <Destinations />
      <Blog />
      <Videos />
      <GearStrip />
      <Community />
      <Footer />
    </>
  )
}
