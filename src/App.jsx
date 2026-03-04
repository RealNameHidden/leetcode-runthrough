import { useState, lazy, Suspense, useMemo, useEffect, useRef } from 'react'

// Auto-discover all artifact JSX files
const artifactModules = import.meta.glob('../solutions/**/artifact/*.jsx')

// Build artifact list from discovered paths
const artifactList = Object.entries(artifactModules).map(([path, loader]) => {
  const parts = path.split('/')
  const artifactIdx = parts.indexOf('artifact')
  const category = parts[artifactIdx - 1]
  const filename = parts[parts.length - 1].replace('.jsx', '')
  const name = filename
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return { path, loader, category, filename, name }
})

// Group artifacts by category
const grouped = artifactList.reduce((acc, a) => {
  if (!acc[a.category]) acc[a.category] = []
  acc[a.category].push(a)
  return acc
}, {})

// Generate deterministic stars
function generateStars(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: ((i * 137.508 + 23) % 100),
    y: ((i * 89.3 + 11) % 65),
    r: (i % 3 === 0 ? 2 : i % 3 === 1 ? 1.5 : 1),
    opacity: 0.4 + (i % 5) * 0.12,
    twinkleDuration: 2 + (i % 4) * 0.8,
    twinkleDelay: (i % 7) * 0.4,
  }))
}

const STARS = generateStars(220)

// Category label formatter
function formatCategory(cat) {
  return cat.replace(/_/g, ' & ').replace(/-/g, ' ').toUpperCase()
}

// ─── Stars background ────────────────────────────────────────────────────────
function Starfield() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {STARS.filter(s => s.r > 1.5).map(s => (
          <filter key={`glow-${s.id}`} id={`sg${s.id}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
      </defs>
      {STARS.map(s => (
        <circle
          key={s.id}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="white"
          filter={s.r > 1.5 ? `url(#sg${s.id})` : undefined}
          style={{
            opacity: s.opacity,
            animation: `twinkle ${s.twinkleDuration}s ease-in-out ${s.twinkleDelay}s infinite alternate`,
          }}
        />
      ))}
    </svg>
  )
}

// ─── Giant ringed planet (right side) ────────────────────────────────────────
function RingedPlanet() {
  return (
    <svg
      style={{ position: 'absolute', top: '2%', right: '-4%', width: '38vw', maxWidth: 560, pointerEvents: 'none', zIndex: 1 }}
      viewBox="0 0 560 420"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Planet surface gradient */}
        <radialGradient id="planetGrad" cx="38%" cy="35%" r="62%">
          <stop offset="0%" stopColor="#b5d4f0" />
          <stop offset="25%" stopColor="#7aaed4" />
          <stop offset="55%" stopColor="#3d6e9e" />
          <stop offset="80%" stopColor="#1a3a5e" />
          <stop offset="100%" stopColor="#0a1a2e" />
        </radialGradient>
        {/* Cloud bands */}
        <radialGradient id="cloudBand1" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#a8c8e8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a8c8e8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cloudBand2" cx="50%" cy="58%" r="40%">
          <stop offset="0%" stopColor="#7ba8c8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7ba8c8" stopOpacity="0" />
        </radialGradient>
        {/* Atmosphere glow */}
        <radialGradient id="atmosphere" cx="50%" cy="50%" r="55%">
          <stop offset="78%" stopColor="transparent" />
          <stop offset="88%" stopColor="#4a9de0" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2266aa" stopOpacity="0.06" />
        </radialGradient>
        {/* Ring gradients */}
        <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4a7fa0" stopOpacity="0" />
          <stop offset="12%" stopColor="#4a7fa0" stopOpacity="0.55" />
          <stop offset="35%" stopColor="#a8d4f0" stopOpacity="0.75" />
          <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          <stop offset="65%" stopColor="#a8d4f0" stopOpacity="0.75" />
          <stop offset="88%" stopColor="#4a7fa0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#4a7fa0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5589a8" stopOpacity="0" />
          <stop offset="10%" stopColor="#5589a8" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#c8e8ff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          <stop offset="60%" stopColor="#c8e8ff" stopOpacity="0.6" />
          <stop offset="90%" stopColor="#5589a8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#5589a8" stopOpacity="0" />
        </linearGradient>
        {/* Clip to hide ring section behind planet */}
        <clipPath id="ringFront">
          <rect x="0" y="210" width="560" height="210" />
        </clipPath>
        <clipPath id="ringBack">
          <rect x="0" y="0" width="560" height="210" />
        </clipPath>
      </defs>

      {/* Ring back (behind planet) */}
      <ellipse cx="280" cy="210" rx="260" ry="32" fill="url(#ringGrad1)" clipPath="url(#ringBack)" />
      <ellipse cx="280" cy="210" rx="230" ry="24" fill="url(#ringGrad2)" clipPath="url(#ringBack)" />

      {/* Planet body */}
      <circle cx="280" cy="210" r="168" fill="url(#planetGrad)" />
      {/* Cloud bands */}
      <ellipse cx="280" cy="185" rx="140" ry="48" fill="url(#cloudBand1)" />
      <ellipse cx="280" cy="238" rx="118" ry="38" fill="url(#cloudBand2)" />
      {/* Atmosphere */}
      <circle cx="280" cy="210" r="168" fill="url(#atmosphere)" />
      {/* Terminator shadow */}
      <ellipse cx="370" cy="210" rx="110" ry="168" fill="#071525" style={{ opacity: 0.42 }} />

      {/* Ring front (in front of planet) */}
      <ellipse cx="280" cy="210" rx="260" ry="32" fill="url(#ringGrad1)" clipPath="url(#ringFront)" />
      <ellipse cx="280" cy="210" rx="230" ry="24" fill="url(#ringGrad2)" clipPath="url(#ringFront)" />
    </svg>
  )
}

// ─── Small distant planet (upper left) ───────────────────────────────────────
function SmallPlanet() {
  return (
    <svg
      style={{ position: 'absolute', top: '8%', left: '12%', width: '10vw', maxWidth: 130, pointerEvents: 'none', zIndex: 1 }}
      viewBox="0 0 130 130"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sp1" cx="36%" cy="32%" r="64%">
          <stop offset="0%" stopColor="#e8a870" />
          <stop offset="40%" stopColor="#c06030" />
          <stop offset="75%" stopColor="#6a2010" />
          <stop offset="100%" stopColor="#1a0808" />
        </radialGradient>
        <radialGradient id="spa1" cx="50%" cy="50%" r="55%">
          <stop offset="80%" stopColor="transparent" />
          <stop offset="92%" stopColor="#e05818" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#e05818" stopOpacity="0.04" />
        </radialGradient>
      </defs>
      <circle cx="65" cy="65" r="55" fill="url(#sp1)" />
      <circle cx="65" cy="65" r="55" fill="url(#spa1)" />
      <ellipse cx="85" cy="65" rx="38" ry="55" fill="#120404" style={{ opacity: 0.38 }} />
    </svg>
  )
}

// ─── Nebula clouds ────────────────────────────────────────────────────────────
function Nebula() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '60%', pointerEvents: 'none', zIndex: 0 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="nblur">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <radialGradient id="neb1" cx="30%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a2a6c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1a2a6c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="neb2" cx="70%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#2d0b4e" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2d0b4e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="neb3" cx="55%" cy="65%" r="45%">
          <stop offset="0%" stopColor="#0d3b5e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0d3b5e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#neb1)" filter="url(#nblur)" />
      <rect width="100%" height="100%" fill="url(#neb2)" filter="url(#nblur)" />
      <rect width="100%" height="100%" fill="url(#neb3)" filter="url(#nblur)" />
    </svg>
  )
}

// ─── Alien terrain silhouette ─────────────────────────────────────────────────
function Terrain() {
  return (
    <svg
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '28vh', pointerEvents: 'none', zIndex: 2 }}
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="terrainFog" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a1a2e" stopOpacity="0" />
          <stop offset="100%" stopColor="#0a1a2e" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="terrainGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a4a6e" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#0a1a2e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Back ridge */}
      <path
        d="M0,140 C80,115 140,95 220,108 C300,122 340,88 420,80 C490,72 540,102 620,95 C700,88 750,65 840,72 C920,78 975,55 1060,62 C1140,68 1200,90 1300,85 C1370,80 1420,105 1440,110 L1440,200 L0,200 Z"
        fill="#071020"
      />
      {/* Mid ridge with spires */}
      <path
        d="M0,165 C60,150 100,135 160,142 C200,147 230,128 268,115 C278,112 282,120 290,115 C298,110 303,98 312,95 C320,92 326,100 335,98 C345,96 360,125 400,132 C445,140 480,118 530,122 C580,126 620,145 680,148 C730,151 770,132 820,125 C855,120 870,108 888,102 C898,98 904,107 914,104 C924,101 932,88 944,85 C954,82 962,93 975,90 C990,87 1020,115 1070,122 C1120,128 1170,110 1240,118 C1300,124 1380,150 1440,155 L1440,200 L0,200 Z"
        fill="#0a1828"
      />
      {/* Glowing ridge line */}
      <path
        d="M0,165 C60,150 100,135 160,142 C200,147 230,128 268,115 C278,112 282,120 290,115 C298,110 303,98 312,95 C320,92 326,100 335,98 C345,96 360,125 400,132 C445,140 480,118 530,122 C580,126 620,145 680,148 C730,151 770,132 820,125 C855,120 870,108 888,102 C898,98 904,107 914,104 C924,101 932,88 944,85 C954,82 962,93 975,90 C990,87 1020,115 1070,122 C1120,128 1170,110 1240,118 C1300,124 1380,150 1440,155"
        fill="none"
        stroke="#1a6090"
        strokeWidth="1.5"
        style={{ opacity: 0.5 }}
      />
      {/* Foreground fill */}
      <rect x="0" y="175" width="1440" height="25" fill="#060e18" />
      {/* Atmospheric fog overlay */}
      <rect x="0" y="0" width="1440" height="200" fill="url(#terrainFog)" />
    </svg>
  )
}

// ─── HUD scanline overlay ─────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
    }} />
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selected, setSelected] = useState(null)
  const [ActiveComponent, setActiveComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})

  const categoryOrder = Object.keys(grouped).sort()

  async function openArtifact(artifact) {
    if (selected?.path === artifact.path) return
    setSelected(artifact)
    setActiveComponent(null)
    setLoading(true)
    try {
      const mod = await artifact.loader()
      setActiveComponent(() => mod.default)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function toggleCategory(cat) {
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(175deg, #00060f 0%, #010d1e 35%, #030a18 60%, #060e18 100%)',
      fontFamily: "'Share Tech Mono', monospace",
      color: '#8ec8e8',
    }}>
      <style>{`
        @keyframes twinkle {
          from { opacity: var(--op, 0.5); transform: scale(1); }
          to   { opacity: calc(var(--op, 0.5) * 0.3); transform: scale(0.7); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 8px #1a8fc040, 0 0 20px #1a8fc010; }
          50%       { box-shadow: 0 0 14px #1a8fc070, 0 0 30px #1a8fc025; }
        }
        @keyframes scanIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sidebarGlow {
          0%, 100% { border-color: #1a4a6e; }
          50%       { border-color: #2a7ab0; }
        }
        @keyframes spinRing {
          from { transform: rotateX(75deg) rotateZ(0deg); }
          to   { transform: rotateX(75deg) rotateZ(360deg); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020a14; }
        ::-webkit-scrollbar-thumb { background: #1a4a6e; border-radius: 2px; }
        .artifact-item {
          cursor: pointer;
          padding: 9px 12px 9px 28px;
          border-left: 2px solid transparent;
          color: #5898b8;
          font-size: 15px;
          letter-spacing: 0.06em;
          transition: all 0.18s ease;
          position: relative;
        }
        .artifact-item::before {
          content: '◈';
          position: absolute;
          left: 8px;
          color: #1a4a6e;
          font-size: 13px;
          transition: color 0.18s;
        }
        .artifact-item:hover {
          color: #a8daf8;
          border-left-color: #2a7ab0;
          background: rgba(26,74,110,0.15);
        }
        .artifact-item:hover::before { color: #4aacf0; }
        .artifact-item.active {
          color: #c8eeff;
          border-left-color: #4aacf0;
          background: rgba(74,172,240,0.1);
        }
        .artifact-item.active::before { color: #4aacf0; }
        .cat-header {
          cursor: pointer;
          padding: 10px 12px;
          color: #3a8aaa;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.18s;
          user-select: none;
        }
        .cat-header:hover { color: #6abcd8; }
        .cat-arrow { transition: transform 0.2s; display: inline-block; font-size: 10px; }
        .cat-arrow.open { transform: rotate(90deg); }
        .hud-corner {
          position: absolute;
          width: 14px;
          height: 14px;
          border-color: #2a7ab0;
          border-style: solid;
          opacity: 0.7;
        }
        .close-btn {
          background: none;
          border: 1px solid #1a4a6e;
          color: #5898b8;
          font-family: inherit;
          font-size: 13px;
          letter-spacing: 0.1em;
          padding: 6px 16px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .close-btn:hover {
          background: rgba(26,74,110,0.3);
          color: #a8daf8;
          border-color: #4aacf0;
        }
      `}</style>

      {/* Sky layers */}
      <Nebula />
      <Starfield />
      <RingedPlanet />
      <SmallPlanet />
      <Terrain />
      <Scanlines />

      {/* ── Layout ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 5,
      }}>

        {/* Header HUD bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '10px 22px',
          background: 'linear-gradient(90deg, rgba(2,12,24,0.95) 0%, rgba(4,18,36,0.85) 60%, rgba(2,12,24,0.6) 100%)',
          borderBottom: '1px solid #0e2a42',
          flexShrink: 0,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 700, color: '#4aacf0', letterSpacing: '0.18em' }}>
              ARTIFACT ARCHIVE
            </div>
            <div style={{ fontSize: 12, color: '#2a6a90', letterSpacing: '0.25em' }}>
              INTERACTIVE ALGORITHM VISUALIZATIONS // NMS-CLASS TERMINAL
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 18, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#1a5a7a', letterSpacing: '0.15em' }}>ARTIFACTS INDEXED</div>
              <div style={{ fontSize: 22, color: '#4aacf0', fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>
                {artifactList.length.toString().padStart(3, '0')}
              </div>
            </div>
            <div style={{ width: 1, height: 32, background: '#0e2a42' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#1a5a7a', letterSpacing: '0.15em' }}>CATEGORIES</div>
              <div style={{ fontSize: 22, color: '#4aacf0', fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>
                {categoryOrder.length.toString().padStart(3, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Main area */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <div style={{
            width: 290,
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(2,10,20,0.97) 0%, rgba(4,14,26,0.94) 100%)',
            borderRight: '1px solid #0e2a42',
            display: 'flex',
            flexDirection: 'column',
            animation: 'sidebarGlow 4s ease-in-out infinite',
            overflowY: 'auto',
          }}>
            {/* Sidebar header */}
            <div style={{
              padding: '12px 14px 10px',
              borderBottom: '1px solid #0a2030',
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 11, color: '#1a5070', letterSpacing: '0.2em', marginBottom: 2 }}>
                ◀ NAVIGATION MATRIX ▶
              </div>
              <div style={{ fontSize: 12, color: '#2a6a8a', letterSpacing: '0.1em' }}>
                SELECT ARTIFACT TO RENDER
              </div>
            </div>

            {/* Category list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {categoryOrder.map(cat => {
                const isOpen = expanded[cat] !== false  // default open
                return (
                  <div key={cat}>
                    <div className="cat-header" onClick={() => toggleCategory(cat)}>
                      <span className={`cat-arrow ${isOpen ? 'open' : ''}`}>▶</span>
                      <span>{formatCategory(cat)}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#1a4a6a' }}>
                        [{grouped[cat].length}]
                      </span>
                    </div>
                    {isOpen && grouped[cat].map(artifact => (
                      <div
                        key={artifact.path}
                        className={`artifact-item${selected?.path === artifact.path ? ' active' : ''}`}
                        onClick={() => openArtifact(artifact)}
                      >
                        {artifact.name}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Sidebar footer */}
            <div style={{
              padding: '10px 14px',
              borderTop: '1px solid #0a2030',
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 11, color: '#0e2a40', letterSpacing: '0.12em' }}>
                SYS: ATLAS v2.6 // UPLINK ACTIVE
              </div>
            </div>
          </div>

          {/* ── Main content ─────────────────────────────────────── */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {!selected ? (
              // Empty state
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                padding: 40,
              }}>
                {/* Animated hexagon scanner */}
                <svg width="120" height="138" viewBox="0 0 120 138" style={{ opacity: 0.4 }}>
                  <defs>
                    <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a8fc0" />
                      <stop offset="100%" stopColor="#0a4a70" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="60,4 114,33 114,105 60,134 6,105 6,33"
                    fill="none"
                    stroke="url(#hexGrad)"
                    strokeWidth="1.5"
                    style={{ animation: 'pulse 2.5s ease-in-out infinite' }}
                  />
                  <polygon
                    points="60,22 96,42 96,96 60,116 24,96 24,42"
                    fill="none"
                    stroke="#0d3a56"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  <text x="60" y="66" textAnchor="middle" fill="#1a6080" fontSize="9" fontFamily="'Orbitron', sans-serif" letterSpacing="1">
                    SELECT
                  </text>
                  <text x="60" y="82" textAnchor="middle" fill="#1a6080" fontSize="9" fontFamily="'Orbitron', sans-serif" letterSpacing="1">
                    ARTIFACT
                  </text>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, color: '#1a5070', letterSpacing: '0.2em', marginBottom: 6 }}>
                    NO ARTIFACT SELECTED
                  </div>
                  <div style={{ fontSize: 13, color: '#0d2a3a', letterSpacing: '0.12em' }}>
                    CHOOSE FROM THE NAVIGATION MATRIX TO BEGIN RENDERING
                  </div>
                </div>
              </div>
            ) : loading ? (
              // Loading state
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 14,
              }}>
                <div style={{
                  width: 48, height: 48, border: '2px solid #0d2a40',
                  borderTop: '2px solid #4aacf0', borderRadius: '50%',
                  animation: 'spinRing 0.9s linear infinite',
                }} />
                <div style={{ fontSize: 13, color: '#1a5070', letterSpacing: '0.2em' }}>
                  LOADING ARTIFACT DATA...
                </div>
              </div>
            ) : ActiveComponent ? (
              // Artifact viewer
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Artifact header bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 16px',
                  background: 'rgba(2,10,20,0.92)',
                  borderBottom: '1px solid #0e2a42',
                  flexShrink: 0,
                }}>
                  {/* HUD corners */}
                  <div className="hud-corner" style={{ borderWidth: '1px 0 0 1px', top: 0, left: 0 }} />
                  <div className="hud-corner" style={{ borderWidth: '1px 1px 0 0', top: 0, right: 0 }} />
                  <div style={{ fontSize: 12, color: '#1a5070', letterSpacing: '0.15em' }}>RENDERING //</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: '#4aacf0', letterSpacing: '0.1em' }}>
                    {selected.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: '#0d2a3a', letterSpacing: '0.12em' }}>
                    :: {formatCategory(selected.category)}
                  </div>
                  <button className="close-btn" style={{ marginLeft: 'auto' }} onClick={() => { setSelected(null); setActiveComponent(null) }}>
                    ✕ CLOSE
                  </button>
                </div>

                {/* Artifact iframe-style render area */}
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  background: '#0d1117',
                  animation: 'scanIn 0.3s ease-out',
                }}>
                  <Suspense fallback={
                    <div style={{ padding: 40, color: '#1a5070', fontSize: 14, letterSpacing: '0.15em' }}>
                      RENDERING COMPONENT...
                    </div>
                  }>
                    <ActiveComponent />
                  </Suspense>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer HUD bar */}
        <div style={{
          padding: '6px 22px',
          background: 'rgba(2,8,16,0.96)',
          borderTop: '1px solid #0a1e30',
          display: 'flex', alignItems: 'center', gap: 24,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, color: '#0d2a40', letterSpacing: '0.15em' }}>
            ◈ ATLAS FOUNDATION // ARTIFACT ARCHIVE SYSTEM // ITERATION 1.0
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
            {['UPLINK: ACTIVE', 'SYS: NOMINAL', 'MEM: STABLE'].map(label => (
              <div key={label} style={{ fontSize: 11, color: '#0d2a40', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a6040', display: 'inline-block', boxShadow: '0 0 4px #1a9040' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
