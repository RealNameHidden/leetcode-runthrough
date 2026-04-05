import { useMemo, useEffect } from 'react'
import { ScrollShadow } from '@heroui/react'
import { motion } from 'framer-motion'

const TEAL = "#4ecca3"
const GOLD = "#f6c90e"
const RED  = "#ff6b6b"
const FADE_DAYS = 15

function daysSince(dateStr) {
  if (!dateStr) return null
  const last = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today - last) / 86_400_000)
}

function retention(days) {
  if (days === null) return 0
  return Math.max(0, Math.round((1 - days / FADE_DAYS) * 100))
}

function barColor(pct) {
  if (pct > 60) return TEAL
  if (pct > 25) return GOLD
  return RED
}

function fadeMessage(days) {
  if (days === null) return { text: 'no revision data — mystery brain 🤷', color: '#8b84c0' }
  if (days === 0)    return { text: 'just revised — your brain is thriving! 🧠✨', color: TEAL }
  if (days === 1)    return { text: 'revised yesterday — still locked in 💪🧠', color: TEAL }
  const daysLeft = FADE_DAYS - days
  if (daysLeft > 8)  return { text: `solid! might fade from memory in ${daysLeft} days 🧠`, color: TEAL }
  if (daysLeft > 3)  return { text: `uh oh... this one's slipping 😬 fades in ${daysLeft} days`, color: GOLD }
  if (daysLeft > 0)  return { text: `danger zone! fades from memory in ${daysLeft} day${daysLeft === 1 ? '' : 's'} 🚨`, color: GOLD }
  if (daysLeft === 0) return { text: `fading today — quick, revise it! 😅`, color: RED }
  return               { text: `gone 🫠 — this one left your brain ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago`, color: RED }
}

function revisedLabel(days) {
  if (days === null) return '—'
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

const diffStyle = {
  Easy:   { bg: '#16a34a22', color: '#16a34a' },
  Medium: { bg: '#ea580c22', color: '#ea580c' },
  Hard:   { bg: '#e11d4822', color: '#e11d48' },
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function StatBlock({ value, label, emoji, color }) {
  return (
    <div className="flex-1 min-w-[80px] rounded-xl px-3 py-3 flex flex-col items-center gap-1 text-center"
      style={{ background: 'var(--viz-surface)', border: '1px solid var(--viz-border)' }}>
      {emoji && <span className="text-xl leading-none">{emoji}</span>}
      <span className="text-2xl font-bold tabular-nums leading-none" style={{ color }}>{value}</span>
      <span className="text-[10px] text-default-400 leading-tight">{label}</span>
    </div>
  )
}

function ProblemRow({ row }) {
  const { name, category, difficulty, count, days, pct } = row
  const color = barColor(pct)
  const diff = diffStyle[difficulty]
  const fade = fadeMessage(days)

  return (
    <li className="rounded-xl px-4 py-3 flex flex-col gap-2.5"
      style={{ background: 'var(--viz-surface)', border: '1px solid var(--viz-border)', borderLeft: `4px solid ${color}` }}>

      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {diff && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: diff.bg, color: diff.color }}>{difficulty}</span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
              style={{ background: 'var(--viz-border)', color: 'var(--heroui-default-500)' }}>
              {category.replace(/-/g, ' ').replace(/_/g, ' & ')}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className="text-sm font-bold tabular-nums" style={{ color: TEAL }}>×{count}</span>
          <span className="text-[11px] text-default-400">{revisedLabel(days)}</span>
        </div>
      </div>

      {/* Brain fade message */}
      <p className="text-[11px] font-medium leading-relaxed" style={{ color: fade.color }}>{fade.text}</p>

      {/* Retention bar */}
      <div className="flex flex-col gap-1">
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--viz-border)' }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: '9999px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-default-400">still in your head</span>
          <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{pct}%</span>
        </div>
      </div>
    </li>
  )
}

export default function RevisionStats({ revisions, artifactList, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const { rows, totalRevisions, freshCount, fadedCount, topProblem } = useMemo(() => {
    const rows = artifactList
      .filter(a => {
        const v = revisions[a.path]
        return v && (v.count ?? 0) > 0
      })
      .map(a => {
        const v = revisions[a.path]
        const count = v.count
        const lastDate = v.lastDate || ''
        const days = daysSince(lastDate)
        const pct = retention(days)
        return { ...a, count, lastDate, days, pct }
      })
      .sort((a, b) => a.pct - b.pct) // most faded first

    const totalRevisions = rows.reduce((s, r) => s + r.count, 0)
    const freshCount = rows.filter(r => r.pct > 0).length
    const fadedCount = rows.filter(r => r.pct === 0).length
    const topProblem = rows.length
      ? [...rows].sort((a, b) => b.count - a.count)[0]
      : null

    return { rows, totalRevisions, freshCount, fadedCount, topProblem }
  }, [revisions, artifactList])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-content1 flex flex-col overflow-hidden rounded-t-2xl md:rounded-2xl md:max-w-2xl max-h-[90vh] md:max-h-[85vh]"
        style={{ border: '1px solid var(--viz-border)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--viz-border)' }}>
          <span className="text-xl">🧠</span>
          <h2 className="text-base font-semibold text-foreground flex-1">Memory Tracker <span className="text-default-400 font-normal text-sm">— how's your brain doing?</span></h2>
          <button type="button" onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-default-400 hover:bg-content2 hover:text-foreground transition-colors"
            aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <ScrollShadow className="flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <span className="text-4xl">🧠</span>
              <p className="text-sm font-medium text-foreground">Your brain is empty... for now 👀</p>
              <p className="text-xs text-default-400 max-w-xs leading-relaxed">
                Open a problem, go to the Code tab, and tap <strong>Revised!</strong> — feed the brain! 🍽️
              </p>
            </div>
          ) : (
            <div className="px-5 py-4 flex flex-col gap-5">

              {/* Dashboard */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-bold text-default-400 uppercase tracking-wider">🧠 Brain Report</p>

                <div className="flex gap-2 flex-wrap">
                  <StatBlock value={totalRevisions} emoji="🔁" label="reps logged" color={TEAL} />
                  <StatBlock value={rows.length} emoji="📚" label="in the vault" color={TEAL} />
                  <StatBlock value={freshCount} emoji="🧠" label="brain has it" color={GOLD} />
                  {fadedCount > 0 && <StatBlock value={fadedCount} emoji="🫠" label="gone :(" color={RED} />}
                </div>

                {topProblem && (
                  <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: `${TEAL}0d`, border: `1px solid ${TEAL}33` }}>
                    <span className="text-base">🏆</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-default-400 mb-0.5">obsessed with this one 👇</p>
                      <p className="text-sm font-semibold truncate" style={{ color: TEAL }}>{topProblem.name}</p>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: TEAL }}>×{topProblem.count}</span>
                  </div>
                )}

                {/* Memory distribution bar */}
                <div className="rounded-xl px-4 py-3 flex flex-col gap-2"
                  style={{ background: 'var(--viz-surface)', border: '1px solid var(--viz-border)' }}>
                  <p className="text-[10px] text-default-400">how's your brain doing across the board? 👇</p>
                  <div className="flex gap-0.5 h-3 rounded-full overflow-hidden w-full">
                    {[
                      { label: 'Fresh',  filter: r => r.pct > 60,               color: TEAL },
                      { label: 'Fading', filter: r => r.pct > 0 && r.pct <= 60, color: GOLD },
                      { label: 'Faded',  filter: r => r.pct === 0,              color: RED  },
                    ].map(({ label, filter, color }) => {
                      const n = rows.filter(filter).length
                      if (n === 0) return null
                      const pct = Math.round((n / rows.length) * 100)
                      return <div key={label} style={{ width: `${pct}%`, background: color }} />
                    })}
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    {[
                      { label: 'Fresh 🧠',  filter: r => r.pct > 60,               color: TEAL },
                      { label: 'Fading ⏳',  filter: r => r.pct > 0 && r.pct <= 60, color: GOLD },
                      { label: 'Faded 🫠',   filter: r => r.pct === 0,              color: RED  },
                    ].map(({ label, filter, color }) => {
                      const n = rows.filter(filter).length
                      if (n === 0) return null
                      return (
                        <span key={label} className="flex items-center gap-1.5 text-[10px]" style={{ color }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          {n} {label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Problem list */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-bold text-default-400 uppercase tracking-wider">🚨 Most forgotten first — go fix it</p>
                <ul className="flex flex-col gap-2 pb-4">
                  {rows.map(row => <ProblemRow key={row.path} row={row} />)}
                </ul>
              </div>

            </div>
          )}
        </ScrollShadow>
      </motion.div>
    </div>
  )
}
