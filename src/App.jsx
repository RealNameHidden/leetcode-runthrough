import { useState, Suspense, useEffect, useRef } from 'react'
import { Button, Switch, Spinner, ScrollShadow, Chip, Input } from '@heroui/react'
import { motion } from 'framer-motion'
import SystemDesign from './SystemDesign'
import RoadmapGraph from './RoadmapGraph'
import { ArtifactRevisionProvider } from './ArtifactRevisedButton'

// Auto-discover all artifact JSX files
const artifactModules = import.meta.glob('../solutions/**/artifact/*.jsx')
const artifactDifficulty = import.meta.glob('../solutions/**/artifact/*.jsx', { eager: true, import: 'difficulty' })

const difficultyStyle = {
  Easy:   { letter: 'e', bg: 'bg-green-200 text-green-700' },
  Medium: { letter: 'm', bg: 'bg-orange-200 text-orange-700' },
  Hard:   { letter: 'h', bg: 'bg-pink-200 text-pink-700' },
}

// Replace this with your real support link later.
const SUPPORT_URL = 'https://buymeacoffee.com/your-link-here'

const artifactList = Object.entries(artifactModules).map(([path, loader]) => {
  const parts = path.split('/')
  const artifactIdx = parts.indexOf('artifact')
  const category = parts[artifactIdx - 1]
  const filename = parts[parts.length - 1].replace('.jsx', '')
  const name = filename
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  const difficulty = artifactDifficulty[path] ?? null
  return { path, loader, category, filename, name, difficulty }
})

const grouped = artifactList.reduce((acc, a) => {
  if (!acc[a.category]) acc[a.category] = []
  acc[a.category].push(a)
  return acc
}, {})

function formatCategory(cat) {
  return cat.replace(/_/g, ' & ').replace(/-/g, ' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function CoffeeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8h1a3 3 0 0 1 0 6h-1" />
      <path d="M2 8h14v5a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
      <path d="M6 22h8" />
    </svg>
  )
}

function ModeSwitch({ mode, onChange }) {
  const options = [
    { id: 'archive', label: 'Algorithms', shortLabel: 'Algo' },
    { id: 'system-design', label: 'System Design', shortLabel: 'Design' },
  ]

  return (
    <div className="flex items-center rounded-full border border-divider bg-content2 p-0.5 sm:p-1">
      {options.map(option => {
        const active = mode === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            title={option.label}
            className={`rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
              active
                ? 'bg-[#cfdbf2] text-[#005bc4] dark:bg-purple-900/40 dark:text-purple-200'
                : 'text-default-500 hover:text-foreground'
            }`}
          >
            <span className="sm:hidden">{option.shortLabel}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(false)
  const [mode, setMode] = useState('archive')
  const [selected, setSelected] = useState(null)
  const [ActiveComponent, setActiveComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [revisions, setRevisions] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('artifact-revisions') || '{}')
      const out = {}
      for (const [path, val] of Object.entries(raw)) {
        out[path] = typeof val === 'object' && val != null && 'count' in val
          ? { count: val.count, lastDate: val.lastDate || '' }
          : { count: Number(val) || 0, lastDate: '' }
      }
      return out
    } catch { return {} }
  })

  function getRevisionCount(path) {
    const v = revisions[path]
    return typeof v === 'object' && v != null ? v.count : (Number(v) || 0)
  }

  function canLogRevisionToday(path) {
    const today = new Date().toISOString().slice(0, 10)
    const v = revisions[path]
    const lastDate = typeof v === 'object' && v != null ? v.lastDate : ''
    return lastDate !== today
  }
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollY = useRef(0)
  const headerToggleScrollY = useRef(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  function switchMode(nextMode) {
    setMode(nextMode)
    setSidebarOpen(false)
    setHeaderHidden(false)
  }

  function handleContentScroll(e) {
    const y = e.currentTarget.scrollTop
    const maxScrollTop = e.currentTarget.scrollHeight - e.currentTarget.clientHeight
    const atTop = y <= 0
    const atBottom = y >= maxScrollTop - 2
    const delta = y - lastScrollY.current

    if (atTop) {
      setHeaderHidden(false)
      headerToggleScrollY.current = 0
    } else if (!headerHidden && delta > 6 && y > 56) {
      setHeaderHidden(true)
      headerToggleScrollY.current = y
    } else if (
      headerHidden &&
      !atBottom &&
      delta < -6 &&
      headerToggleScrollY.current - y > 20
    ) {
      setHeaderHidden(false)
      headerToggleScrollY.current = y
    }

    lastScrollY.current = y
  }

  // Restore last opened artifact on mount
  useEffect(() => {
    const lastPath = localStorage.getItem('lastArtifactPath')
    if (lastPath) {
      const artifact = artifactList.find(a => a.path === lastPath)
      if (artifact) openArtifact(artifact)
    }
  }, [])

  function openSystemDesign() {
    switchMode('system-design')
  }

  function logRevision() {
    if (!selected?.path) return
    if (!canLogRevisionToday(selected.path)) return
    const today = new Date().toISOString().slice(0, 10)
    setRevisions(prev => {
      const v = prev[selected.path]
      const count = (typeof v === 'object' && v != null ? v.count : Number(v) || 0) + 1
      const next = { ...prev, [selected.path]: { count, lastDate: today } }
      localStorage.setItem('artifact-revisions', JSON.stringify(next))
      return next
    })
  }

  async function openArtifact(artifact) {
    switchMode('archive')
    if (selected?.path === artifact.path) { setSidebarOpen(false); return }
    setSelected(artifact)
    setActiveComponent(null)
    setLoading(true)
    setSidebarOpen(false)
    localStorage.setItem('lastArtifactPath', artifact.path)
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

  function onCategoryClick(categoryId) {
    setSidebarOpen(true)
    setExpanded(prev => ({ ...prev, [categoryId]: true }))
    setTimeout(() => {
      document.getElementById(`cat-${categoryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

const categoryOrder = Object.keys(grouped).sort()

  const query = search.trim().toLowerCase()
  const filteredGrouped = query
    ? Object.fromEntries(
        categoryOrder
          .map(cat => [cat, grouped[cat].filter(a => a.name.toLowerCase().includes(query))])
          .filter(([, items]) => items.length > 0)
      )
    : grouped
  const filteredCategories = query ? Object.keys(filteredGrouped) : categoryOrder
  const quickStartArtifact =
    artifactList.find(artifact => artifact.filename === 'two-sum') ??
    artifactList[0] ??
    null

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {mode === 'system-design' ? (
        <SystemDesign
          isDark={isDark}
          onDarkModeChange={setIsDark}
          onSwitchToArchive={() => switchMode('archive')}
          supportUrl={SUPPORT_URL}
        />
      ) : (
        <>
          {/* ── Header — fixed overlay on mobile; inner wrapper holds padding so header bg reaches top ────── */}
          <header
            className={`
              nav-header
              fixed top-0 left-0 right-0 z-50
              md:static md:z-auto
              flex flex-col gap-2 min-w-0
              border-b border-divider bg-content1
              transition-transform duration-300 md:translate-y-0
              ${headerHidden ? '-translate-y-full' : 'translate-y-0'}
            `}
          >
            <div className="flex items-center justify-between gap-2 min-w-0 px-3 py-2 sm:px-4 sm:py-3 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] md:pt-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-content2 text-default-500 transition-colors flex-shrink-0"
                onClick={() => setSidebarOpen(o => !o)}
                aria-label="Toggle navigation"
              >
                <HamburgerIcon />
              </button>
              <button
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0"
                onClick={() => { setSelected(null); setActiveComponent(null); setSidebarOpen(false); setExpanded({}); localStorage.removeItem('lastArtifactPath') }}
                aria-label="Go home"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <BookIcon />
                </div>
                <div className="text-left min-w-0 hidden sm:block">
                  <h1 className="text-base font-bold leading-tight tracking-tight text-foreground truncate">Leetcode Archive</h1>
                  <p className="text-xs text-default-400 leading-none">Interactive Algorithm Visualizations</p>
                </div>
                <span className="sm:hidden font-semibold text-foreground truncate">Archive</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ModeSwitch mode={mode} onChange={switchMode} />
              <Chip size="sm" variant="flat" color="primary" className="hidden sm:flex">{artifactList.length} Artifacts</Chip>
              <Chip size="sm" variant="flat" color="default" className="hidden sm:flex">{categoryOrder.length} Categories</Chip>
              <div className="flex items-center gap-1 sm:gap-1.5 text-default-400">
                <SunIcon />
                <Switch
                  size="sm"
                  isSelected={isDark}
                  onValueChange={setIsDark}
                  aria-label="Toggle dark mode"
                  className="scale-90 sm:scale-100 origin-center"
                />
                <MoonIcon />
              </div>
            </div>
            </div>
          </header>

          {/* ── Body — offset on mobile to sit below fixed header ───────── */}
          <div
            className={`
              flex flex-1 overflow-hidden relative transition-[padding] duration-300 md:pt-0
              ${headerHidden ? 'pt-0' : 'pt-[calc(6rem+env(safe-area-inset-top,0px))]'}
            `}
          >

            {/* ── Mobile overlay backdrop ──────────────────────────────── */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-20 bg-black/40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className={`
              fixed md:relative left-0 bottom-0 top-[calc(6rem+env(safe-area-inset-top,0px))] md:inset-y-0 md:top-auto z-30
              w-64 flex-shrink-0 border-r border-divider bg-content1 flex flex-col
              transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
              <div className="px-4 pt-2.5 pb-2 border-b border-divider flex-shrink-0 flex flex-col gap-2">
                <p className="text-xs font-semibold text-default-400 uppercase tracking-wider">Navigation</p>
                <Input
                  size="sm"
                  placeholder="Search artifacts..."
                  value={search}
                  onValueChange={setSearch}
                  isClearable
                  onClear={() => setSearch('')}
                  startContent={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-default-400 flex-shrink-0">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  }
                />
              </div>
              <ScrollShadow className="flex-1 overflow-y-auto pt-3 pb-2 px-2">

                {filteredCategories.length === 0 && (
                  <p className="text-xs text-default-400 text-center py-6">No results for "{search}"</p>
                )}
                {filteredCategories.map(cat => {
                  const isOpen = query ? true : expanded[cat] === true
                  return (
                    <div key={cat} id={`cat-${cat}`} className="mb-0.5">
                      <button
                        onClick={() => toggleCategory(cat)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-content2 transition-colors"
                      >
                        <span className={`text-[10px] text-default-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                        <span className="text-sm font-medium text-default-600 flex-1 text-left">{formatCategory(cat)}</span>
                        <Chip size="sm" variant="flat" className="text-[10px] h-5 min-w-6">{grouped[cat].length}</Chip>
                      </button>
                      {isOpen && (
                        <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-divider pl-3 pb-1">
                          {filteredGrouped[cat].map(artifact => (
                            <motion.button
                              key={artifact.path}
                              onClick={() => openArtifact(artifact)}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                selected?.path === artifact.path
                                  ? 'bg-[#cfdbf2] dark:bg-purple-900/40 text-[#005bc4] dark:text-purple-200 font-medium shadow-sm dark:shadow-purple-900/50'
                                  : 'text-default-500 hover:bg-content2 hover:text-foreground'
                              }`}
                            >
                              <span className="flex items-center justify-between gap-1">
                                <span className="truncate">{artifact.name}</span>
                                {artifact.difficulty && difficultyStyle[artifact.difficulty] && (
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${difficultyStyle[artifact.difficulty].bg}`}>
                                    {difficultyStyle[artifact.difficulty].letter}
                                  </span>
                                )}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="px-2 pt-4 pb-2">
                  <div className="flex flex-col items-center gap-1.5 border-t border-divider pt-3">
                    <p className="text-[10px] text-default-300 text-center">Leetcode Archive v2.0</p>
                    <button
                      className="text-[10px] text-default-300 hover:text-red-400 transition-colors"
                      onClick={() => {
                        if (confirm('Reset all revision progress?')) {
                          setRevisions({})
                          localStorage.removeItem('artifact-revisions')
                        }
                      }}
                    >
                      Reset revision progress
                    </button>
                    <a
                      href="https://github.com/RealNameHidden"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-default-400 transition-colors hover:text-foreground"
                    >
                      About me
                    </a>
                    <a
                      href={SUPPORT_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-default-400 transition-colors hover:text-foreground"
                    >
                      <CoffeeIcon />
                      Buy me a coffee
                    </a>
                  </div>
                </div>
              </ScrollShadow>
            </aside>

            {/* ── Main content ────────────────────────────────────────── */}
            <main className="flex-1 overflow-hidden flex flex-col bg-background">
              {!selected ? (
                <div className="flex-1 overflow-hidden flex flex-col items-center p-3 gap-2">
                  <p className="text-xs text-default-400 flex-shrink-0">Click a category to open it in the sidebar</p>
                  <div className="flex-1 w-full min-h-0">
                    <RoadmapGraph
                      artifacts={artifactList}
                      revisions={revisions}
                      onCategoryClick={onCategoryClick}
                      isDark={isDark}
                    />
                  </div>
                </div>
              ) : loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Spinner size="lg" label="Loading artifact..." color="primary" />
                </div>
              ) : ActiveComponent ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ArtifactRevisionProvider
                    artifactPath={selected?.path ?? null}
                    revisionCount={selected?.path ? getRevisionCount(selected.path) : 0}
                    canLogToday={selected?.path ? canLogRevisionToday(selected.path) : false}
                    onLog={logRevision}
                  >
                    <div className="flex-1 overflow-auto pb-2" onScroll={handleContentScroll}>
                      <Suspense fallback={
                        <div className="flex items-center justify-center p-12">
                          <Spinner label="Rendering..." />
                        </div>
                      }>
                        <ActiveComponent />
                      </Suspense>
                    </div>
                  </ArtifactRevisionProvider>
                </div>
              ) : null}
            </main>
          </div>
        </>
      )}
    </div>
  )
}
