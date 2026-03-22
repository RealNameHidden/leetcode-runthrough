export const difficulty = 'Hard'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

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

const PRESETS = [
  { label: "LC Example 1", s: "ADOBECODEBANC", t: "ABC" },
  { label: "LC Example 2", s: "a",             t: "a"   },
  { label: "No answer",    s: "aa",             t: "b"   },
  { label: "Repeated t",   s: "AABCBBC",        t: "ABC" },
];

function buildNeed(t) {
  const need = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;
  return need;
}

function simulate(s, t) {
  if (!s || !t) return [];
  const steps = [];
  const need = buildNeed(t);
  const required = Object.keys(need).length;
  let formed = 0;
  const window = {};
  let left = 0;
  let minLen = Infinity, minL = 0, minR = -1;

  steps.push({
    phase: 'init', left: 0, right: -1,
    window: {}, formed, required, need: { ...need },
    minL, minR, minLen,
    desc: `Build need map from t="${t}". Need ${required} distinct char(s). Start expanding right.`,
  });

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window[c] = (window[c] || 0) + 1;
    const prevFormed = formed;
    if (need[c] !== undefined && window[c] === need[c]) formed++;

    steps.push({
      phase: 'expand',
      left, right,
      window: { ...window }, formed, required, need: { ...need },
      minL, minR, minLen,
      expandedChar: c,
      formedChanged: formed > prevFormed,
      desc: `Expand right to ${right} (s[${right}]='${c}'). window['${c}']=${window[c]}. formed=${formed}/${required}.`,
    });

    while (left <= right && formed === required) {
      const winSize = right - left + 1;
      if (winSize < minLen) {
        minLen = winSize;
        minL = left;
        minR = right;
      }
      steps.push({
        phase: 'valid_window',
        left, right,
        window: { ...window }, formed, required, need: { ...need },
        minL, minR, minLen,
        desc: `Valid window! s[${left}..${right}]="${s.slice(left, right + 1)}" (len=${winSize}). ${winSize < (minLen + 1) ? "New best!" : "Not better than current best."} Try shrinking left.`,
      });

      const lc = s[left];
      window[lc] = (window[lc] || 0) - 1;
      if (need[lc] !== undefined && window[lc] < need[lc]) formed--;

      steps.push({
        phase: 'shrink',
        left, right,
        window: { ...window }, formed, required, need: { ...need },
        minL, minR, minLen,
        shrunkChar: lc,
        desc: `Shrink left: remove s[${left}]='${lc}'. window['${lc}']=${window[lc]}. formed=${formed}/${required}.`,
      });
      left++;
    }
  }

  const answer = minLen === Infinity ? "" : s.slice(minL, minR + 1);
  steps.push({
    phase: 'done',
    left, right: s.length - 1,
    window: { ...window }, formed, required, need: { ...need },
    minL, minR, minLen,
    answer,
    desc: answer ? `Done! Minimum window: "${answer}" at s[${minL}..${minR}] (len=${minLen}).` : `Done! No valid window found — return "".`,
  });

  return steps;
}

export default function App() {
  const [tab,    setTab]    = useState("Problem");
  const [sInput, setSInput] = useState("ADOBECODEBANC");
  const [tInput, setTInput] = useState("ABC");
  const [steps,  setSteps]  = useState([]);
  const [si,     setSi]     = useState(0);

  useEffect(() => {
    setSteps(simulate(sInput, tInput));
    setSi(0);
  }, [sInput, tInput]);

  const step      = steps[si] || null;
  const finalStep = steps.length > 0 ? steps[steps.length - 1] : null;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🪟</span>
        <h1 className="font-semibold text-base">Minimum Window Substring</h1>
        <Chip size="sm" color="danger" variant="flat">Hard</Chip>
        <Chip size="sm" color="primary" variant="flat">Sliding Window</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* ── PROBLEM ─────────────────────────────────── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given two strings <code>s</code> and <code>t</code> of lengths <code>m</code> and <code>n</code> respectively, return the <strong>minimum window substring</strong> of <code>s</code> such that every character in <code>t</code> (including duplicates) is included in the window. If there is no such substring, return an empty string.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "String minWindow(String s, String t)", desc: "Return the shortest substring of s containing all chars of t (with counts). If none, return \"\". Constraints: 1 ≤ m, n ≤ 10⁵." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — s = "ADOBECODEBANC", t = "ABC"</p>
                <CodeBlock language="text">{`Input:  s = "ADOBECODEBANC",  t = "ABC"
Output: "BANC"

need = { A:1, B:1, C:1 }   required = 3 distinct chars

Expand right until all 3 chars satisfied:
  right=0 'A'  → window{A:1}         formed=1/3
  right=1 'D'  → window{A:1,D:1}     formed=1/3
  right=2 'O'  → window{...O:1}      formed=1/3
  right=3 'B'  → window{B:1}         formed=2/3
  right=4 'E'  → window{...E:1}      formed=2/3
  right=5 'C'  → window{C:1}         formed=3/3  ← VALID! "ADOBEC" len=6 ← best

Shrink from left while still valid:
  left=0 'A'   window{A:0} → formed=2/3  ← invalid, stop shrinking
  
Expand again:
  right=6..9   'O','D','E','B' → formed stays 2/3
  right=10 'A' → formed=3/3   VALID "DOBECODEBA" → no, too long
  Shrink: left=1..5 → eventually "ODEBANC" len=7 → still worse than 6
  right=11 'N' → nothing
  right=12 'C' → formed=3/3  window "BANC" len=4 ← new best!

Final answer: "BANC"`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          {/* ── INTUITION ───────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Expand Until Valid</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Move the right pointer forward one character at a time, adding it to the window. Track <code>formed</code> — how many distinct required characters are currently satisfied (count ≥ needed). When <code>formed == required</code>, the window contains all chars of t.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">formed == required → valid window</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Shrink While Valid</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Once valid, greedily shrink from the left to minimize the window. Record the window size each time. Stop shrinking when removing the left character breaks the validity (a required char drops below its needed count). Then expand again.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">record best → shrink left → expand right</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`Map<Character, Integer> need = buildNeed(t);
Map<Character, Integer> window = new HashMap<>();
int required = need.size(), formed = 0;
int left = 0, minLen = INF, minL = 0, minR = 0;

for (int right = 0; right < s.length(); right++) {
    char c = s.charAt(right);
    window.merge(c, 1, Integer::sum);
    if (need.containsKey(c) && window.get(c).equals(need.get(c)))
        formed++;                      // this char's need is now fully met

    while (left <= right && formed == required) {
        if (right - left + 1 < minLen) {
            minLen = right - left + 1; // record new best
            minL = left; minR = right;
        }
        char lc = s.charAt(left);
        window.merge(lc, -1, Integer::sum);
        if (need.containsKey(lc) && window.get(lc) < need.get(lc))
            formed--;                  // can no longer satisfy lc
        left++;
    }
}
return minLen == INF ? "" : s.substring(minL, minR + 1);`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Use <code>formed</code> (count of fully-satisfied distinct chars) instead of checking every char on every step — this keeps the validity check O(1). Only update <code>formed</code> when a char's count crosses the exact needed threshold.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME",  v: "O(|s|+|t|)", s: "Each char in s entered and left window at most once; t scanned once for need map" },
                    { l: "SPACE", v: "O(|s|+|t|)", s: "Two hashmaps: window (at most |s| entries) and need (|t| distinct chars)" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 min-w-36 rounded-lg p-4 text-center"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                      <p className="text-xs text-default-400 mt-1">{s}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

          {/* ── VISUALIZER ──────────────────────────────── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PRESETS.map(p => (
                    <Button key={p.label} size="sm"
                      variant={sInput === p.s && tInput === p.t ? "flat" : "bordered"}
                      color={sInput === p.s && tInput === p.t ? "primary" : "default"}
                      onPress={() => { setSInput(p.s); setTInput(p.t); }}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Input label='String s' variant="bordered" size="sm" value={sInput} onValueChange={setSInput} className="flex-1 min-w-0" />
                  <Input label='String t' variant="bordered" size="sm" value={tInput} onValueChange={setTInput} className="w-32" />
                </div>
              </CardBody></Card>

              {step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step Debugger</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                    {si + 1}/{steps.length}
                  </p>

                  <p className="text-xs text-default-500 mb-4">
                    L=<span className="font-semibold" style={{ color: TEAL }}>{step.left}</span>
                    {"  ·  "}
                    R=<span className="font-semibold" style={{ color: GOLD }}>{step.right >= 0 ? step.right : "—"}</span>
                    {"  ·  "}
                    formed=<span className="font-semibold" style={{ color: step.formed === step.required ? TEAL : BLUE }}>{step.formed}</span>/{step.required}
                    {"  ·  "}
                    <span style={{ color:
                      step.phase === 'valid_window' ? TEAL :
                      step.phase === 'shrink'       ? GOLD :
                      step.phase === 'done'         ? BLUE : "var(--viz-muted)"
                    }}>
                      {step.phase === 'init'         ? "init"         :
                       step.phase === 'expand'       ? "expanding →"  :
                       step.phase === 'valid_window' ? "✓ valid — shrink ←" :
                       step.phase === 'shrink'       ? "shrinking ←"  :
                       step.phase === 'done'         ? "done"         : ""}
                    </span>
                  </p>

                  {/* Live code block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'expand'}
                      annotation={step.phase === 'expand' ? `window['${step.expandedChar}']=${step.window[step.expandedChar] || 0}` : undefined}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>window[s[right]]++</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'expand' && step.formedChanged}
                      annotation={step.phase === 'expand' && step.formedChanged ? `formed → ${step.formed}` : step.phase === 'expand' ? `formed stays ${step.formed}` : undefined}
                      annotationColor={step.formedChanged ? TEAL : "var(--code-muted)"}>
                      <span style={{ color: "var(--code-muted)" }}>if (window[c] == need[c]) formed++</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'valid_window'}
                      annotation={step.phase === 'valid_window' ? `len=${step.right - step.left + 1}${step.right - step.left + 1 <= step.minLen ? " ← new best!" : ""}` : `formed=${step.formed}/${step.required}`}
                      annotationColor={step.phase === 'valid_window' ? TEAL : BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>while (formed == required) — record best</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'shrink'}
                      annotation={step.phase === 'shrink' ? `remove '${step.shrunkChar}', window=${step.window[step.shrunkChar] ?? 0}` : undefined}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>window[s[left]]--; left++</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'done'}
                      annotation={step.phase === 'done' ? (step.answer ? `"${step.answer}"` : `""`) : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>return s.substring(minL, minR+1)</span>
                    </CodeLine>
                  </div>

                  {/* String visualization */}
                  <div className="rounded-xl p-4 mb-4 overflow-x-auto" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">
                      <span style={{ color: TEAL }}>■ window</span>{"  ·  "}
                      <span style={{ color: GOLD }}>■ right pointer</span>{"  ·  "}
                      <span style={{ color: BLUE }}>■ best window</span>
                    </p>
                    <div className="flex gap-1 justify-center flex-wrap">
                      {sInput.split('').map((ch, idx) => {
                        const inWindow  = step.right >= 0 && idx >= step.left && idx <= step.right;
                        const isBest    = step.minLen < Infinity && idx >= step.minL && idx <= step.minR;
                        const isRight   = idx === step.right;
                        const isLeft    = idx === step.left && step.phase !== 'init';
                        const inNeed    = step.need && step.need[ch] !== undefined;

                        let bg     = "var(--viz-node-bg)";
                        let border = "var(--viz-border)";
                        let color  = undefined;

                        if (isBest && !inWindow)  { bg = `${BLUE}20`;  border = BLUE;  color = BLUE; }
                        if (inWindow && !isRight)  { bg = `${TEAL}18`; border = TEAL;  color = inNeed ? TEAL : undefined; }
                        if (isRight)               { bg = `${GOLD}25`; border = GOLD;  color = GOLD; }

                        return (
                          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: 6,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: bg, border: `1px solid ${border}`, color,
                              fontSize: 11, fontFamily: "monospace", fontWeight: 600,
                              transition: "all 0.2s",
                            }}>
                              {ch}
                            </div>
                            <div style={{ fontSize: 9, color: isRight ? GOLD : isLeft ? TEAL : "var(--viz-muted)", fontFamily: "monospace" }}>
                              {isRight && isLeft ? "L/R" : isRight ? "R" : isLeft ? "L" : ""}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Need/Window char counts */}
                  {step.need && Object.keys(step.need).length > 0 && (
                    <div className="rounded-xl p-3 mb-4 overflow-x-auto" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-2">Char counts (need vs window)</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(step.need).map(([ch, needed]) => {
                          const have = step.window[ch] || 0;
                          const satisfied = have >= needed;
                          return (
                            <div key={ch} className="rounded-lg px-3 py-2 text-center" style={{
                              background: satisfied ? `${TEAL}15` : `${RED}10`,
                              border: `1px solid ${satisfied ? TEAL : RED}44`,
                              minWidth: 52,
                            }}>
                              <div style={{ fontSize: 16, fontFamily: "monospace", fontWeight: 700, color: satisfied ? TEAL : RED }}>{ch}</div>
                              <div style={{ fontSize: 10, color: "var(--viz-muted)", fontFamily: "monospace" }}>
                                {have}/{needed}
                              </div>
                              <div style={{ fontSize: 9, color: satisfied ? TEAL : RED }}>{satisfied ? "✓" : "✗"}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Best window so far */}
                  {step.minLen < Infinity && (
                    <div className="rounded-lg px-4 py-3 mb-4 text-xs font-mono"
                      style={{ background: `${BLUE}10`, border: `1px solid ${BLUE}33`, borderLeft: `3px solid ${BLUE}` }}>
                      <span style={{ color: BLUE }} className="font-bold">Best so far: </span>
                      "{sInput.slice(step.minL, step.minR + 1)}"
                      <span style={{ color: "var(--viz-muted)" }}> (len={step.minLen}, s[{step.minL}..{step.minR}])</span>
                    </div>
                  )}

                  <div className="rounded-lg px-3 py-2 mb-4 text-xs text-default-500"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    {step.desc}
                  </div>

                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                      onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                      onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {finalStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final Result</p>
                  <div className="rounded-xl p-6 text-center mb-4" style={{
                    background: finalStep.answer ? `${TEAL}0d` : `${RED}0d`,
                    border: `1px solid ${finalStep.answer ? TEAL : RED}33`,
                  }}>
                    {finalStep.answer ? (
                      <>
                        <p className="text-xs text-default-500 mb-1">Minimum window substring</p>
                        <p className="text-2xl font-bold font-mono" style={{ color: TEAL }}>"{finalStep.answer}"</p>
                        <p className="text-xs text-default-400 mt-2">length = {finalStep.answer.length} · s[{finalStep.minL}..{finalStep.minR}]</p>
                      </>
                    ) : (
                      <p className="text-xl font-bold font-mono" style={{ color: RED }}>No valid window — return ""</p>
                    )}
                  </div>
                  {finalStep.answer && (
                    <div className="rounded-xl p-3 overflow-x-auto" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-2 text-center">Minimum window highlighted in s</p>
                      <div className="flex gap-1 justify-center flex-wrap">
                        {sInput.split('').map((ch, idx) => {
                          const isBest = idx >= finalStep.minL && idx <= finalStep.minR;
                          return (
                            <div key={idx} style={{
                              width: 26, height: 26, borderRadius: 6,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: isBest ? `${TEAL}25` : "var(--viz-node-bg)",
                              border: `1px solid ${isBest ? TEAL : "var(--viz-border)"}`,
                              color: isBest ? TEAL : undefined,
                              fontSize: 11, fontFamily: "monospace", fontWeight: 600,
                            }}>
                              {ch}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardBody></Card>
              )}
            </div>
          </Tab>

          {/* ── CODE ────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.HashMap;
import java.util.Map;

public class MinimumWindowSubstring {
    public String minWindow(String s, String t) {
        if (s == null || t == null || s.length() == 0 || t.length() == 0) return "";

        // Count needed characters from t
        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

        int required = need.size(); // distinct chars we need to satisfy
        int formed   = 0;           // distinct chars currently satisfied in window

        Map<Character, Integer> window = new HashMap<>();

        int left = 0;
        int minLen = Integer.MAX_VALUE;
        int minL = 0, minR = 0;

        for (int right = 0; right < s.length(); right++) {
            // Expand right
            char c = s.charAt(right);
            window.merge(c, 1, Integer::sum);

            // Check if this char's count now satisfies the requirement
            if (need.containsKey(c) && window.get(c).intValue() == need.get(c).intValue()) {
                formed++;
            }

            // Try to contract from left while window is valid
            while (left <= right && formed == required) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    minL = left;
                    minR = right;
                }

                char leftChar = s.charAt(left);
                window.merge(leftChar, -1, Integer::sum);
                if (need.containsKey(leftChar) && window.get(leftChar) < need.get(leftChar)) {
                    formed--;
                }
                left++;
            }
        }

        return minLen == Integer.MAX_VALUE ? "" : s.substring(minL, minR + 1);
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "need.merge(c, 1, Integer::sum)", exp: "Build frequency map for t — how many of each char we need the window to contain." },
                    { line: "int required = need.size()", exp: "The number of distinct characters we must fully satisfy. Only distinct chars matter for the 'formed' counter." },
                    { line: "int formed = 0", exp: "Tracks how many distinct required chars are currently at or above their needed count in the window." },
                    { line: "window.merge(c, 1, Integer::sum)", exp: "Add the right-expanded character to the current window count." },
                    { line: "window.get(c).intValue() == need.get(c).intValue()", exp: "Use intValue() to avoid Integer boxing equality pitfall. Increment formed only when the count crosses the exact threshold." },
                    { line: "while (left <= right && formed == required)", exp: "The window is valid. Greedily shrink from the left to find a smaller valid window." },
                    { line: "minLen = right - left + 1", exp: "Record the current window as the new best if it's smaller than any previously seen valid window." },
                    { line: "window.merge(leftChar, -1, Integer::sum)", exp: "Remove the leftmost character from the window before advancing left." },
                    { line: "if (window.get(leftChar) < need.get(leftChar)) formed--", exp: "The left char's count dropped below required — window is no longer valid. Exit the shrink loop." },
                    { line: "return minLen == Integer.MAX_VALUE ? \"\" : s.substring(minL, minR + 1)", exp: "If we never found a valid window, return \"\". Otherwise return the best window." },
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

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "📍", color: TEAL,  tip: "Two hashmaps: 'need' (fixed from t) and 'window' (sliding). The 'formed' counter makes validity check O(1) — never iterate over need on every step." },
                    { icon: "⚠️", color: GOLD,  tip: "Integer boxing pitfall: window.get(c) == need.get(c) can fail for values > 127. Always use .intValue() or .equals() when comparing Integer objects." },
                    { icon: "🔄", color: BLUE,  tip: "Template reuse: any 'find minimum/maximum subarray/substring satisfying condition' problem uses this exact expand-right / shrink-left skeleton." },
                    { icon: "💡", color: TEAL,  tip: "formed only changes at threshold crossings — when window[c] goes from need[c]-1 to need[c] (expand) or from need[c] to need[c]-1 (shrink)." },
                    { icon: "🎯", color: GOLD,  tip: "Related: Longest Substring Without Repeating Characters, Permutation in String, Find All Anagrams — all use the same sliding window hashmap pattern." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
                      <span className="text-base">{icon}</span>
                      <span className="text-sm text-default-500 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

        </Tabs>
      </div>
    </div>
  );
}
