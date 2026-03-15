# Artifact Creation Standards

This file defines the exact spec for creating interactive algorithm artifacts.
Every artifact lives at `solutions/<category>/artifact/<slug>.jsx` and is auto-discovered by `src/App.jsx` via `import.meta.glob`.

---

## File Skeleton

```jsx
export const difficulty = 'Easy' | 'Medium' | 'Hard'  // REQUIRED — drives sidebar badge
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

// ── Colors (use these exact values, every artifact) ─────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";   // only import if used

export default function App() { ... }
```

---

## Required Tabs — ALL FOUR must be present

```
Problem | Intuition | Visualizer | Code
```

Missing any tab = incomplete artifact. Every artifact must start with a Problem tab that explains the requirements.

---

## Tab 0 — Problem

Must contain **in this order**:

### 1. Problem Statement Card
Clear explanation of what needs to be solved, with constraints and expectations.

**Do NOT:**
- Use HTML entities for generics in the method signature (e.g. `List&lt;List&lt;Integer&gt;&gt;`). They render as literal `&lt;`/`&gt;` in the UI. Put the real characters in the data and render with `{sig}`.
- Omit `flex-wrap` and `min-w-0`/`flex-1` on the signature row; without them the description can wrap awkwardly or be squeezed.

**Do:**
- Store the signature as a normal string with real angle brackets, e.g. `sig: "List<List<Integer>> methodName(int[] nums)"`, and render it as `{sig}` so brackets display correctly.
- Use the layout below so the signature can break and the description has room: container has `flex-wrap`, code has `shrink-0 min-w-0 break-all`, description span has `min-w-0 flex-1` and `text-xs text-default-500 leading-relaxed`.

```jsx
<Card><CardBody>
  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
  <p className="text-sm text-default-600 leading-relaxed mb-4">
    Description of the problem with key requirements highlighted.
  </p>
  <div className="flex flex-col gap-2">
    {[
      { sig: "List<List<Integer>> methodName(int[] nums)", desc: "What it does and constraints." },
    ].map(({ sig, desc }) => (
      <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
        <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
        <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
      </div>
    ))}
  </div>
</CardBody></Card>
```

### 2. Example Walkthrough Card
A step-by-step example showing input, process, and output using `<CodeBlock>` with monospace text formatting.

```jsx
<Card><CardBody>
  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — [specific scenario]</p>
  <CodeBlock language="text">{`Input: ...
Expected output: ...
Step-by-step breakdown...`}</CodeBlock>
</CardBody></Card>
```

---

---

## Tab 1 — Intuition

Must contain **in this order**:

### 1. Core Idea Card (dual-panel)
Two side-by-side colored cards explaining the two key concepts of the algorithm.
- Left card: TEAL border/bg (`${TEAL}0d` bg, `${TEAL}33` border)
- Right card: GOLD border/bg (`${GOLD}0d` bg, `${GOLD}33` border)
- Each has a bold title, 1–2 sentence explanation, and a short monospace note

```jsx
<Card><CardBody>
  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
  <div className="flex gap-3 flex-wrap">
    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Concept A</p>
      <p className="text-sm leading-relaxed text-default-500">...</p>
      <p className="text-xs text-default-400 mt-3 font-mono">short note</p>
    </div>
    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
      ...
    </div>
  </div>
</CardBody></Card>
```

### 2. Algorithm Template Card
Show the canonical code pattern using `<CodeBlock>`. Must be the distilled recursive/iterative template, NOT the full solution (that goes in the Code tab).
Followed by a GOLD callout box with the key insight / gotcha:

```jsx
<div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
  One critical thing to remember about this algorithm.
</div>
```

### 3. Complexity Card
Two metric blocks side-by-side: TIME and SPACE.

```jsx
<Card><CardBody>
  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
  <div className="flex gap-3">
    {[{ l: "TIME", v: "O(n)", s: "why" }, { l: "SPACE", v: "O(h)", s: "why" }].map(({ l, v, s }) => (
      <div key={l} className="flex-1 rounded-lg p-4 text-center"
        style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
        <p className="text-xs text-default-500 mb-1">{l}</p>
        <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
        <p className="text-xs text-default-400 mt-1">{s}</p>
      </div>
    ))}
  </div>
</CardBody></Card>
```

---

## Tab 2 — Visualizer

Must contain **in this order**:

### 1. Configure Card
- Preset buttons (3–4 named examples) that set inputs
- One or two `<Input>` fields for custom values
- Optional error message in a red box

```jsx
<Card><CardBody>
  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
  <div className="flex gap-2 mb-4 flex-wrap">
    {PRESETS.map(p => (
      <Button key={p.label} size="sm"
        variant={isActive(p) ? "flat" : "bordered"}
        color={isActive(p) ? "primary" : "default"}
        onPress={() => applyPreset(p)}>
        {p.label}
      </Button>
    ))}
  </div>
  <Input ... />
</CardBody></Card>
```

### 2. Step-by-Step Debugger Card
This is the CORE of the visualizer. It must have:

**a) Step counter** — a single `{si+1}/{steps.length}` label in TEAL. No individual pill per step:
```jsx
<p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
  {si + 1}/{steps.length}
</p>
```

**b) Status line** — one sentence describing current node/index/state with colored spans:
```jsx
<p className="text-xs text-default-500 mb-4">
  Node: <span style={{ color: TEAL }}>{step.nodeVal}</span> ·
  Max: <span style={{ color: GOLD }}>{step.max}</span> ·
  <span style={{ color: step.isGood ? TEAL : RED }}>{step.isGood ? "✓ GOOD" : "✗ Bad"}</span>
</p>
```

**c) Live code block** — shows the algorithm's key lines annotated with current values.
Use the `CodeLine` helper component (see Reusable Components below).
The currently executing line must have `highlight` prop set.
Every line should have an `annotation` prop showing the live value.

```jsx
<div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
  <CodeLine highlight annotation={`value = ${step.val}`} annotationColor={TEAL}>
    <span style={{ color: "var(--code-muted)" }}>int val = node.val</span>
  </CodeLine>
  <CodeLine annotation="updates children" annotationColor={GOLD}>
    ...
  </CodeLine>
</div>
```

**d) Visual representation** — the SVG tree / array bars / grid in a rounded surface panel:
```jsx
<div className="rounded-xl p-5 mb-4 text-center"
  style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
  <p className="text-xs text-default-400 mb-3">legend text</p>
  <YourVizComponent ... />
</div>
```

**e) Prev / Next buttons**:
```jsx
<div className="flex gap-2">
  <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
    onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
  <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
    onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
</div>
```

### 3. Final State Card
Shows the complete result after all steps. For trees: show the full highlighted tree. For arrays: show the final array. For counts/values: show a large centered number.

---

## Tab 3 — Code

Must contain **in this order**:

### 1. Full Java Solution
The complete, runnable Java class inside `<CodeBlock>`. Include comments on key lines.

### 2. Line-by-Line Breakdown
A list of `(code snippet → explanation)` pairs rendered as a divided list:

```jsx
<Card><CardBody>
  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
  <div className="flex flex-col divide-y divide-divider">
    {[
      { line: "if (root == null) return 0", exp: "Base case: ..." },
      { line: "maxVal = Math.max(...)", exp: "..." },
    ].map(({ line, exp }) => (
      <div key={line} className="py-3 flex gap-3 items-start">
        <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono"
          style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>
          {line}
        </code>
        <span className="text-sm text-default-500 leading-relaxed">{exp}</span>
      </div>
    ))}
  </div>
</CardBody></Card>
```

### 3. Pattern Memorization
4–5 tips with emoji icons and left-colored borders. Covers: what to remember, common mistakes, related problems.

```jsx
<Card><CardBody>
  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
  <div className="flex flex-col gap-2">
    {[
      { icon: "📍", color: TEAL, tip: "Key thing to remember." },
      { icon: "⚠️", color: GOLD, tip: "Common mistake to avoid." },
      { icon: "🔄", color: BLUE, tip: "Related problem pattern." },
    ].map(({ icon, color, tip }) => (
      <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
        style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
        <span className="text-base">{icon}</span>
        <span className="text-sm text-default-500 leading-relaxed">{tip}</span>
      </div>
    ))}
  </div>
</CardBody></Card>
```

---

## Header

Every artifact's main `<div>` starts with a consistent header:

```jsx
<div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
  <span className="text-xl">🌳</span>  {/* pick a relevant emoji */}
  <h1 className="font-semibold text-base">Problem Title</h1>
  <Chip size="sm" color="warning" variant="flat">Medium</Chip>
  <Chip size="sm" color="primary" variant="flat">Category · Technique</Chip>
</div>
```

Chip colors: `color="success"` Easy, `color="warning"` Medium, `color="danger"` Hard.

---

## Reusable Components (define locally in each artifact)

### V — inline value badge
```jsx
function V({ children, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 5px", marginLeft: 2,
      borderRadius: 4, background: `${color}28`, color, fontWeight: 700, fontSize: 12
    }}>
      {children}
    </span>
  );
}
```

### CodeLine — annotated code line
```jsx
function CodeLine({ children, highlight, annotation, annotationColor }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12,
      padding: "6px 16px",
      background: highlight ? "rgba(78,204,163,0.08)" : "transparent",
      borderLeft: `3px solid ${highlight ? TEAL : "transparent"}`,
      transition: "background 0.2s",
    }}>
      <div style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.5, flexShrink: 0 }}>
        {children}
      </div>
      {annotation && (
        <div style={{ fontSize: 11, color: annotationColor, whiteSpace: "nowrap", fontFamily: "monospace", opacity: 0.85 }}>
          // {annotation}
        </div>
      )}
    </div>
  );
}
```

---

## CSS Variables (provided by the app theme)

| Variable | Usage |
|---|---|
| `var(--viz-surface)` | Card inner panels, code bg |
| `var(--viz-border)` | Borders on panels/nodes |
| `var(--viz-node-bg)` | Unvisited SVG node fill |
| `var(--viz-muted)` | Muted text inside SVG |
| `var(--code-bg)` | Code block background |
| `var(--code-text)` | Code block text |
| `var(--code-border)` | Code block border |
| `var(--code-muted)` | Dim code (syntax) |

---

## Algorithm Simulation Pattern

Simulate the algorithm **once upfront**, recording every meaningful decision into a `steps` array. Then the UI just indexes into `steps[si]`.

```js
function simulate(input) {
  const steps = [];

  function dfs(node, ...) {
    // record BEFORE recursing, capturing all values for this frame
    steps.push({ nodeVal: node.val, maxSoFar, isGood, ... });
    dfs(node.left, ...);
    dfs(node.right, ...);
  }

  dfs(root, ...);
  return steps;
}
```

Each step object should contain everything the UI needs for that frame — no recomputation in render.

---

## Quality Checklist

Before considering an artifact done:

- [ ] `export const difficulty` is set
- [ ] All 4 tabs present: Problem, Intuition, Visualizer, Code
- [ ] Problem: statement card + example walkthrough with input/output
- [ ] Problem statement: method signature uses real angle brackets in data (no `&lt;`/`&gt;`), and signature row uses `flex-wrap`, code `shrink-0 min-w-0 break-all`, span `min-w-0 flex-1`
- [ ] Intuition: dual-panel core idea, algorithm template, key insight callout, complexity
- [ ] Visualizer: presets, inputs, step pills, status line, live code block, visual panel, prev/next, final state
- [ ] Step counter shows `{si+1}/{steps.length}` in TEAL — no individual pill per step
- [ ] Code: full Java solution, line-by-line breakdown, pattern tips
- [ ] Colors only use TEAL / GOLD / BLUE / RED constants — no hardcoded hex elsewhere
- [ ] CSS variables used for all theme-dependent colors (backgrounds, borders, text)
- [ ] Steps array simulated once in a pure function, not recomputed on render
- [ ] Each CodeLine in the live debugger has both a highlighted state AND an annotation showing the live value
- [ ] SVGs use `width="100%"` with a `viewBox` — never hardcode a fixed pixel width on `<svg>`
- [ ] Visualizers that grow wide (Gantt, tables) are wrapped in `overflow-x-auto`
- [ ] Two-column flex panels use `flex-wrap` so they stack on mobile
- [ ] No fixed `min-w` values wider than 160px on flex children
