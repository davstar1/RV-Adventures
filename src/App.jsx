import './index.css'
import Navbar       from './Navbar'
import Hero         from './Hero'
import OwnerIntro   from './OwnerIntro'
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
  const [showLowerSections, setShowLowerSections] = useState(Boolean(window.location.hash && window.location.hash !== '#home'));

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  useEffect(() => {
    if (showLowerSections) return undefined;

    const timer = window.setTimeout(() => setShowLowerSections(true), 900);
    return () => window.clearTimeout(timer);
  }, [showLowerSections]);

  if (hash.startsWith('#admin')) {
    return <Admin />;
  }

  return (
    <>
      <Navbar />
      <Hero />
      <OwnerIntro />
      {showLowerSections && (
        <>
          <Destinations />
          <Blog />
          <Videos />
          <GearStrip />
          <Community />
        </>
      )}
      <Footer />
    </>
  )
}
