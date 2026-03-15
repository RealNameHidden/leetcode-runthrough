import { useMemo, useState } from 'react'

const W = 170
const H = 52

const LAYOUT = {
  'arrays-and-hashing':  { label: 'Arrays & Hashing',     x: 400, y: 55  },
  'two-pointers':        { label: 'Two Pointers',          x: 230, y: 165 },
  'stack-and-queue':     { label: 'Stack',                 x: 570, y: 165 },
  'binary-search':       { label: 'Binary Search',         x: 110, y: 295 },
  'sliding-window':      { label: 'Sliding Window',        x: 300, y: 295 },
  'linked-list':         { label: 'Linked List',           x: 510, y: 295 },
  'trees':               { label: 'Trees',                 x: 290, y: 410 },
  'tries':               { label: 'Tries',                 x: 110, y: 520 },
  'heap_priorityqueue':  { label: 'Heap / Priority Queue', x: 270, y: 625 },
  'backtracking':        { label: 'Backtracking',          x: 620, y: 520 },
  'intervals':           { label: 'Intervals',             x: 110, y: 745 },
  'greedy':              { label: 'Greedy',                x: 295, y: 745 },
  'graphs':              { label: 'Graphs',                x: 555, y: 635 },
  'dynamic-programming': { label: '1-D DP',                x: 710, y: 635 },
  'bit-manipulation':    { label: 'Bit Manipulation',      x: 650, y: 745 },
  'math-and-geometry':   { label: 'Math & Geometry',       x: 590, y: 860 },
}

const KNOWN_EDGES = [
  ['arrays-and-hashing', 'two-pointers'],
  ['arrays-and-hashing', 'stack-and-queue'],
  ['two-pointers', 'binary-search'],
  ['two-pointers', 'sliding-window'],
  ['two-pointers', 'linked-list'],
  ['stack-and-queue', 'linked-list'],
  ['binary-search', 'trees'],
  ['sliding-window', 'trees'],
  ['linked-list', 'trees'],
  ['trees', 'tries'],
  ['trees', 'heap_priorityqueue'],
  ['trees', 'backtracking'],
  ['heap_priorityqueue', 'intervals'],
  ['heap_priorityqueue', 'greedy'],
  ['backtracking', 'graphs'],
  ['backtracking', 'dynamic-programming'],
  ['graphs', 'bit-manipulation'],
  ['dynamic-programming', 'bit-manipulation'],
  ['bit-manipulation', 'math-and-geometry'],
]

export default function RoadmapGraph({ artifacts, revisions, onCategoryClick, isDark }) {
  const [hovered, setHovered] = useState(null)

  const { nodes, overflowCount } = useMemo(() => {
    const cats = [...new Set(artifacts.map(a => a.category))]
    const unknown = cats.filter(c => !LAYOUT[c])

    const knownNodes = Object.entries(LAYOUT).map(([id, pos]) => ({
      id, label: pos.label, x: pos.x, y: pos.y,
      hasArtifacts: cats.includes(id),
    }))

    const overflowNodes = unknown.map((id, i) => ({
      id,
      label: id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      x: 110 + i * 190, y: 960,
      hasArtifacts: true,
    }))

    return { nodes: [...knownNodes, ...overflowNodes], overflowCount: overflowNodes.length }
  }, [artifacts])

  const nodeMap = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes])

  const progressByCategory = useMemo(() => {
    const map = {}
    for (const node of nodes) {
      const inCat = artifacts.filter(a => a.category === node.id)
      const counts = inCat.map(a => {
        const v = revisions[a.path]
        return typeof v === 'object' && v != null && 'count' in v ? v.count : (Number(v) || 0)
      })
      const minCount = inCat.length > 0 ? Math.min(...counts) : 0
      const seen = inCat.filter((_, i) => counts[i] > 0).length
      let tier = 'none'
      if (minCount > 20) tier = 'legendary'
      else if (minCount > 10) tier = 'gold'
      else if (minCount > 5) tier = 'silver'
      else if (minCount > 0) tier = 'bronze'
      map[node.id] = { seen, total: inCat.length, minCount, tier }
    }
    return map
  }, [artifacts, revisions, nodes])

  const edges = useMemo(() =>
    KNOWN_EDGES.filter(([a, b]) => nodeMap[a]?.hasArtifacts && nodeMap[b]?.hasArtifacts),
    [nodeMap]
  )

  function getMedalTooltip(tier) {
    switch (tier) {
      case 'bronze':
        return 'Bronze — every problem in this category revised at least once. Next: Silver (revise each >5 times).'
      case 'silver':
        return 'Silver — every problem revised more than 5 times. Next: Gold (revise each >10 times).'
      case 'gold':
        return 'Gold — every problem revised more than 10 times. Next: Legendary (revise each >20 times).'
      case 'legendary':
        return "Legendary — every problem revised more than 20 times. You've reached the top tier!"
      default:
        return 'No medal yet. Next: Bronze (revise every problem in this category at least once).'
    }
  }

  const viewBoxH = overflowCount > 0 ? 1050 : 930

  // Glass colour tokens — differ by mode
  const glass = isDark ? {
    nodeFill:      'rgba(255,255,255,0.07)',
    nodeFillHov:   'rgba(255,255,255,0.13)',
    nodeFillDim:   'rgba(255,255,255,0.03)',
    border:        'rgba(255,255,255,0.18)',
    borderHov:     'rgba(255,255,255,0.45)',
    sheen:         'rgba(255,255,255,0.12)',
    text:          'rgba(255,255,255,0.92)',
    textDim:       'rgba(255,255,255,0.22)',
    barTrack:      'rgba(255,255,255,0.08)',
    edge:          'rgba(255,255,255,0.12)',
    overflowLabel: 'rgba(255,255,255,0.2)',
    shadowColor:   'rgba(0,0,0,0.5)',
  } : {
    nodeFill:      'rgba(255,255,255,0.55)',
    nodeFillHov:   'rgba(255,255,255,0.82)',
    nodeFillDim:   'rgba(255,255,255,0.25)',
    border:        'rgba(255,255,255,0.75)',
    borderHov:     'rgba(255,255,255,1)',
    sheen:         'rgba(255,255,255,0.7)',
    text:          'rgba(15,23,42,0.85)',
    textDim:       'rgba(15,23,42,0.25)',
    barTrack:      'rgba(15,23,42,0.08)',
    edge:          'rgba(15,23,42,0.1)',
    overflowLabel: 'rgba(15,23,42,0.25)',
    shadowColor:   'rgba(100,120,180,0.18)',
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 830 ${viewBoxH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Node drop shadow */}
          <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5"
              floodColor={glass.shadowColor} floodOpacity="1" />
          </filter>

          {/* Hover glow */}
          <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6"
              floodColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(99,140,255,0.35)'} floodOpacity="1" />
          </filter>

          {/* Legendary: blue fire glow */}
          <filter id="legendaryGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
            <feFlood floodColor="#3b82f6" floodOpacity="0.9" result="blue" />
            <feComposite in="blue" in2="blur1" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="legendaryNodeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#60a5fa" floodOpacity="0.6" />
            <feComposite in2="blur" operator="in" result="soft" />
            <feMerge>
              <feMergeNode in="soft" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Node gradient: lighter at top, dimmer at bottom */}
          <linearGradient id="glassGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.13)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
          <linearGradient id="glassGradLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.45)" />
          </linearGradient>
          <linearGradient id="glassGradDim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          {/* Legendary node: shiny blue */}
          <linearGradient id="legendaryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(96,165,250,0.5)" />
            <stop offset="50%"  stopColor="rgba(59,130,246,0.35)" />
            <stop offset="100%" stopColor="rgba(37,99,235,0.25)" />
          </linearGradient>
          <linearGradient id="legendarySheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          {/* Legendary star icon */}
          <symbol id="legendaryIcon" viewBox="0 0 24 24">
            <path fill="#60a5fa" stroke="#3b82f6" strokeWidth="0.6" d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 16l-6.5 5 2.5-7.5L2 9.5h7.5L12 2z" />
          </symbol>
        </defs>

        {/* ── Edges ── */}
        {edges.map(([a, b]) => {
          const src = nodeMap[a], tgt = nodeMap[b]
          if (!src || !tgt) return null
          const midY = (src.y + H / 2 + tgt.y - H / 2) / 2
          return (
            <path
              key={`${a}-${b}`}
              d={`M ${src.x} ${src.y + H / 2} C ${src.x} ${midY} ${tgt.x} ${midY} ${tgt.x} ${tgt.y - H / 2}`}
              fill="none"
              stroke={glass.edge}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )
        })}

        {/* ── Nodes ── */}
        {nodes.map(node => {
          const prog = progressByCategory[node.id] || { seen: 0, total: 0, totalRevisions: 0, tier: 'none' }
          const { tier } = prog
          const nx = node.x - W / 2
          const ny = node.y - H / 2
          const isHov = hovered === node.id
          const clickable = node.hasArtifacts
          const isLegendary = tier === 'legendary'

          const gradId = !node.hasArtifacts
            ? 'glassGradDim'
            : isLegendary
              ? 'legendaryGrad'
              : isDark ? 'glassGradDark' : 'glassGradLight'

          const medalEmoji = tier === 'bronze' ? '🥉' : tier === 'silver' ? '🥈' : tier === 'gold' ? '🥇' : null

          return (
            <g
              key={node.id}
              onClick={() => clickable && onCategoryClick(node.id)}
              onMouseEnter={() => clickable && setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                cursor: clickable ? 'pointer' : 'default',
                opacity: node.hasArtifacts ? 1 : 0.35,
              }}
              filter={isLegendary ? 'url(#legendaryNodeGlow)' : (isHov ? 'url(#nodeGlow)' : 'url(#nodeShadow)')}
            >
              {/* Glass body (or legendary shiny) */}
              <rect
                x={nx} y={ny} width={W} height={H} rx={10}
                fill={`url(#${gradId})`}
                stroke={isLegendary ? '#60a5fa' : (isHov ? glass.borderHov : glass.border)}
                strokeWidth={isLegendary ? 1.5 : 1}
              />

              {/* Top sheen — legendary gets extra shine */}
              <rect
                x={nx + 8} y={ny + 2} width={W - 16} height={H * 0.38} rx={8}
                fill={isLegendary ? 'rgba(255,255,255,0.35)' : glass.sheen}
                opacity={isLegendary ? 0.9 : 0.5}
              />
              {isLegendary && (
                <rect x={nx} y={ny} width={W} height={H} rx={10} fill="url(#legendarySheen)" opacity={0.25} />
              )}

              {/* Label */}
              <text
                x={node.x}
                y={node.y - 7}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={node.hasArtifacts ? glass.text : glass.textDim}
                fontSize={node.label.length > 17 ? 10.5 : 12}
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
                style={{ userSelect: 'none' }}
              >
                {node.label}
              </text>

              {/* Medal: emoji or legendary SVG (with tooltip on hover) */}
              {tier !== 'none' ? (
                <g transform={`translate(${node.x}, ${node.y + 16})`}>
                  <title>{getMedalTooltip(tier)}</title>
                  {tier === 'legendary' ? (
                    <g filter="url(#legendaryGlow)">
                      <use href="#legendaryIcon" x="-8" y="-8" width={16} height={16} />
                    </g>
                  ) : (
                    <text textAnchor="middle" dominantBaseline="middle" fontSize={14} style={{ userSelect: 'none' }}>
                      {medalEmoji}
                    </text>
                  )}
                </g>
              ) : node.hasArtifacts ? (
                <g transform={`translate(${node.x}, ${node.y + 16})`}>
                  <title>{getMedalTooltip('none')}</title>
                  <rect x={-10} y={-6} width={20} height={12} fill="transparent" />
                </g>
              ) : null}
            </g>
          )
        })}

        {overflowCount > 0 && (
          <text
            x={415} y={925}
            textAnchor="middle"
            fill={glass.overflowLabel}
            fontSize={11}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Additional categories
          </text>
        )}
      </svg>
    </div>
  )
}
