import { useState, useEffect, useRef, useCallback } from 'react'
import { weddingAudio } from './audioHelper'
import palaceClean from './assets/palace-clean.jpg'
import './App.css'

/* ═══════════════════════════════════════════════════════════
   WEDDING CONFIGURATION
   ═══════════════════════════════════════════════════════════ */
const CONFIG = {
  groomName: 'Mostafa',
  brideName: 'Sara',
  monogram: 'M & S',
  weddingDate: '2026-11-22T18:00:00',
  dateFormatted: '22 . 11 . 2026',
  dateBullet: '22 · 11 · 2026',
  quote: 'Every second brings us closer to forever.',
  venueName: 'Diva El Abd Halls',
  venueLocation: 'TANTA · EGYPT',
  venueAddress: 'Alexandria Agricultural Road, Shubra Al Namlah, Tanta, Egypt',
  venueMapUrl: 'https://maps.app.goo.gl/DjtYhHsUXukjW5CL6',
  closingMessage: "We can't wait to celebrate this beautiful evening with you.",
  timeline: [
    { time: '06:00', title: 'Guest Arrival', highlight: false },
    { time: '07:00', title: 'Enterance', highlight: false },
    { time: '08:00', title: 'Katb Elketab', highlight: true },
    { time: '09:00', title: 'Dinner', highlight: false },
    { time: '10:00', title: 'Celebration Finale', highlight: false },
  ],
}

function App() {
  // Envelope landing & open state
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  // Floating controls state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const isAutoScrollingRef = useRef(false)
  const autoScrollRef = useRef(null)

  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  // ── Live Countdown calculation ──
  useEffect(() => {
    const target = new Date(CONFIG.weddingDate).getTime()
    const updateCountdown = () => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setCountdown({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // ── Auto-Scroll Logic with Average Speed (65px/s) ──
  const stopAutoScroll = useCallback(() => {
    isAutoScrollingRef.current = false
    setIsAutoScrolling(false)
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current)
      autoScrollRef.current = null
    }
    document.documentElement.style.scrollBehavior = ''
  }, [])

  const startAutoScroll = useCallback(() => {
    if (isAutoScrollingRef.current) return
    isAutoScrollingRef.current = true
    setIsAutoScrolling(true)

    // Disable CSS smooth scroll during animation loop to eliminate jank
    document.documentElement.style.scrollBehavior = 'auto'

    let lastTime = performance.now()
    let accumulated = 0
    const SPEED_PX_PER_SEC = 65 // Average, elegant reading speed

    const step = (now) => {
      if (!isAutoScrollingRef.current) return

      const delta = Math.min(now - lastTime, 64)
      lastTime = now

      accumulated += (delta * SPEED_PX_PER_SEC) / 1000

      if (accumulated >= 1) {
        const move = Math.floor(accumulated)
        accumulated -= move

        const scrollEl = document.scrollingElement || document.documentElement || document.body
        const prevTop = scrollEl.scrollTop
        scrollEl.scrollTop += move

        const maxScroll = scrollEl.scrollHeight - window.innerHeight - 4
        if (scrollEl.scrollTop >= maxScroll || (prevTop === scrollEl.scrollTop && move > 0)) {
          stopAutoScroll()
          return
        }
      }

      autoScrollRef.current = requestAnimationFrame(step)
    }

    autoScrollRef.current = requestAnimationFrame(step)
  }, [stopAutoScroll])

  const toggleAutoScroll = () => {
    if (isAutoScrollingRef.current) {
      stopAutoScroll()
    } else {
      startAutoScroll()
    }
  }

  // Pause auto-scroll on actual manual wheel or touch dragging
  useEffect(() => {
    const handleManualScroll = () => {
      if (isAutoScrollingRef.current) {
        stopAutoScroll()
      }
    }

    window.addEventListener('wheel', handleManualScroll, { passive: true })
    window.addEventListener('touchmove', handleManualScroll, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleManualScroll)
      window.removeEventListener('touchmove', handleManualScroll)
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current)
    }
  }, [stopAutoScroll])

  // ── Handle envelope open ──
  const handleOpenEnvelope = () => {
    if (envelopeOpen) return
    setEnvelopeOpen(true)

    // Start background music
    weddingAudio.play()
    setIsPlayingMusic(true)

    // Reveal invitation
    setTimeout(() => {
      setShowInvite(true)
      window.scrollTo({ top: 0, behavior: 'instant' })

      // Start auto-scroll after opening
      setTimeout(() => {
        startAutoScroll()
      }, 1400)
    }, 1000)
  }

  // ── Music Toggle ──
  const toggleMusic = () => {
    const state = weddingAudio.toggle()
    setIsPlayingMusic(state)
  }

  return (
    <div className="wedding-app">

      {/* ══════════════════════════════════════
          1. WAX-SEALED ENVELOPE LANDING
          ══════════════════════════════════════ */}
      {!showInvite && (
        <div className={`envelope-overlay ${envelopeOpen ? 'opened' : ''}`}>
          <div className="envelope-center-box">
            
            <div className="envelope-greeting">
              <span className="env-sub">YOU ARE CORDIALLY INVITED</span>
              <h1 className="env-title">The Wedding Of</h1>
              <p className="env-names">{CONFIG.groomName} &amp; {CONFIG.brideName}</p>
            </div>

            {/* Realistic Envelope Structure */}
            <div className={`envelope-card ${envelopeOpen ? 'flap-open' : ''}`} onClick={handleOpenEnvelope}>
              <div className="env-back" />

              <div className="env-letter">
                <div className="env-letter-content">
                  <span className="env-letter-monogram">{CONFIG.monogram}</span>
                  <span className="env-letter-date">{CONFIG.dateFormatted}</span>
                </div>
              </div>

              <div className="env-fold-left" />
              <div className="env-fold-right" />
              <div className="env-fold-bottom" />
              <div className="env-flap-top" />

              {/* Wax Seal */}
              <button
                type="button"
                className={`wax-seal-btn ${envelopeOpen ? 'broken' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEnvelope()
                }}
                aria-label="Open Wedding Invitation"
              >
                <div className="wax-seal-inner">
                  <span className="wax-seal-icon">❤</span>
                  <span className="wax-seal-initials">{CONFIG.monogram}</span>
                </div>
                <div className="wax-seal-rim" />
              </button>
            </div>

            <div className="envelope-cta">
              <span className="pulse-dot" />
              <span className="pulse-text">TAP THE WAX SEAL TO OPEN</span>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          2. INVITATION MAIN CONTAINER
          Centered luxury card on desktop, full-width on mobile
          ══════════════════════════════════════ */}
      <main className="invitation-container">

        {/* ────────────────────────────────────
            SCREEN 1: HERO / COVER (Image 1)
            Using the new palace asset with precision overlay
            ──────────────────────────────────── */}
        <section className="hero-section" id="hero">
          <img
            src={palaceClean}
            alt="The Wedding of Mostafa & Sara"
            className="hero-exact-img"
          />

          {/* Precision Elegant Typography Overlay */}
          <div className="hero-text-overlay">
            <p className="hero-eyebrow">THE WEDDING OF</p>
            
            <div className="diamond-accent">
              <span className="diamond-symbol">◇</span>
            </div>

            <h1 className="hero-groom">{CONFIG.groomName}</h1>
            
            <div className="hero-ampersand-wrapper">
              <span className="hero-line" />
              <span className="hero-ampersand">&amp;</span>
              <span className="hero-line" />
            </div>

            <h1 className="hero-bride">{CONFIG.brideName}</h1>

            <p className="hero-date">{CONFIG.dateFormatted}</p>
          </div>
        </section>

        {/* ────────────────────────────────────
            SCREEN 2: COUNTDOWN (Image 2)
            ──────────────────────────────────── */}
        <section className="content-section countdown-section" id="countdown">
          <p className="section-eyebrow">C O U N T D O W N</p>

          <div className="ornament-divider">
            <span className="ornament-line" />
            <span className="ornament-diamond">◇</span>
            <span className="ornament-line" />
          </div>

          <h2 className="section-title">Until Our Day</h2>
          <p className="section-subtitle">THE MOMENT WE'VE BEEN WAITING FOR</p>

          <div className="heart-badge">
            <svg className="heart-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>

          {/* 2x2 Rounded Cards Grid */}
          <div className="countdown-grid">
            <div className="count-card">
              <span className="count-number">{countdown.days}</span>
              <span className="count-label">DAYS</span>
            </div>
            <div className="count-card">
              <span className="count-number">{countdown.hours}</span>
              <span className="count-label">HOURS</span>
            </div>
            <div className="count-card">
              <span className="count-number">{countdown.minutes}</span>
              <span className="count-label">MINUTES</span>
            </div>
            <div className="count-card">
              <span className="count-number">{countdown.seconds}</span>
              <span className="count-label">SECONDS</span>
            </div>
          </div>

          <p className="countdown-date-line">{CONFIG.dateBullet}</p>

          <div className="dot-divider">
            <span className="dot-line" />
            <span className="dot-symbol">•</span>
            <span className="dot-line" />
          </div>

          <p className="romantic-quote">"{CONFIG.quote}"</p>

          <div className="ornament-divider bottom-ornament">
            <span className="ornament-line" />
            <span className="ornament-diamond">◇</span>
            <span className="ornament-line" />
          </div>
        </section>

        {/* ────────────────────────────────────
            SCREEN 3: WEDDING TIMELINE (Image 3)
            ──────────────────────────────────── */}
        <section className="content-section timeline-section" id="timeline">
          <p className="section-eyebrow">OUR WEDDING DAY</p>

          <div className="ornament-divider">
            <span className="ornament-line" />
            <span className="ornament-diamond">◇</span>
            <span className="ornament-line" />
          </div>

          <h2 className="section-title">Wedding Timeline</h2>
          <p className="timeline-date-line">{CONFIG.dateBullet}</p>

          {/* Vertical Center-Line Timeline */}
          <div className="timeline-container">
            <div className="timeline-vertical-spine" />

            <div className="timeline-list">
              {CONFIG.timeline.map((item, idx) => (
                <div key={idx} className={`timeline-row ${item.highlight ? 'row-highlight' : ''}`}>
                  <div className="timeline-time">{item.time}</div>

                  <div className="timeline-node">
                    {item.highlight ? (
                      <div className="medallion-badge">
                        <svg className="flower-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5l1.6 3.2 3.5.5-2.5 2.5.6 3.5-3.2-1.7-3.2 1.7.6-3.5-2.5-2.5 3.5-.5z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="ring-node">
                        <div className="inner-dot" />
                      </div>
                    )}
                  </div>

                  <div className="timeline-label">{item.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dot-divider">
            <span className="dot-line" />
            <span className="dot-symbol">•</span>
            <span className="dot-line" />
          </div>

          <p className="timeline-footer-caption">EVERY MOMENT · TOGETHER</p>
        </section>

        {/* ────────────────────────────────────
            SCREEN 4: OUR LOCATION (Image 4)
            ──────────────────────────────────── */}
        <section className="content-section location-section" id="location">
          <p className="section-eyebrow transition-eyebrow">EVERY MOMENT · TOGETHER</p>

          <div className="ornament-divider">
            <span className="ornament-line" />
            <span className="ornament-diamond">◇</span>
            <span className="ornament-line" />
          </div>

          <p className="section-eyebrow">OUR LOCATION</p>

          <div className="ornament-divider small-divider">
            <span className="ornament-line" />
            <span className="ornament-diamond">◇</span>
            <span className="ornament-line" />
          </div>

          <h2 className="section-title">Join Us Here</h2>

          <div className="diamond-accent">
            <span className="diamond-symbol">◇</span>
          </div>

          <h3 className="venue-title">{CONFIG.venueName}</h3>
          <p className="venue-region">{CONFIG.venueLocation}</p>
          <p className="venue-full-address">{CONFIG.venueAddress}</p>

          <div className="dot-divider">
            <span className="dot-line" />
            <span className="dot-symbol">•</span>
            <span className="dot-line" />
          </div>

          <a
            href={CONFIG.venueMapUrl}
            target="_blank"
            rel="noreferrer"
            className="open-location-btn"
          >
            OPEN LOCATION
          </a>

          <p className="venue-closing-note">
            "{CONFIG.closingMessage}"
          </p>

          <div className="ornament-divider bottom-ornament">
            <span className="ornament-line" />
            <span className="ornament-diamond">◇</span>
            <span className="ornament-line" />
          </div>

          <p className="footer-love-note">WITH LOVE</p>
          <p className="footer-brand">Ashraf Khaled</p>
        </section>

      </main>

      {/* ══════════════════════════════════════
          3. FLOATING ACTION CONTROLS (Persistent)
          ══════════════════════════════════════ */}
      {showInvite && (
        <div className="floating-controls-bar">
          {/* Left Button: Music Play / Pause */}
          <button
            type="button"
            className={`floating-btn music-toggle-btn ${isPlayingMusic ? 'active-pulse' : ''}`}
            onClick={toggleMusic}
            title={isPlayingMusic ? 'Pause Music' : 'Play Music'}
            aria-label={isPlayingMusic ? 'Pause Music' : 'Play Music'}
          >
            {isPlayingMusic ? (
              <div className="equalizer-bars">
                <span className="bar bar-1" />
                <span className="bar bar-2" />
                <span className="bar bar-3" />
              </div>
            ) : (
              <svg className="fab-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Right Button: Auto-Scroll Toggle */}
          <button
            type="button"
            className={`floating-btn autoscroll-toggle-btn ${isAutoScrolling ? 'scrolling-active active-pulse' : ''}`}
            onClick={toggleAutoScroll}
            title={isAutoScrolling ? 'Pause Auto-Scroll' : 'Start Auto-Scroll'}
            aria-label={isAutoScrolling ? 'Pause Auto-Scroll' : 'Start Auto-Scroll'}
          >
            {isAutoScrolling ? (
              <svg className="fab-icon" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1.5" />
                <rect x="14" y="5" width="4" height="14" rx="1.5" />
              </svg>
            ) : (
              <svg className="fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            )}
          </button>
        </div>
      )}

    </div>
  )
}

export default App
