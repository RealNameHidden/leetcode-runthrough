export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED = "#ff6b6b";

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

function arraysEqual(a, b) {
  for (let i = 0; i < 26; i++) if (a[i] !== b[i]) return false;
  return true;
}

const PRESETS = [
  { label: "LC Example", s1: "ab", s2: "eidbaooo" },
  { label: "No Match", s1: "ab", s2: "eidboaoo" },
  { label: "Exact", s1: "adc", s2: "dcda" },
  { label: "Short s2", s1: "abc", s2: "ab" },
];

function simulate(s1, s2) {
  const steps = [];
  if (s1.length > s2.length) return steps;

  const target = s1.length;
  const cs1 = new Int32Array(26);
  const cs2 = new Int32Array(26);

  for (let i = 0; i < s1.length; i++) {
    cs1[s1.charCodeAt(i) - 97]++;
    cs2[s2.charCodeAt(i) - 97]++;
  }

  for (let j = 0; j <= s2.length - target; j++) {
    const windowStart = j;
    const windowEnd = j + target - 1;
    const match = arraysEqual(cs1, cs2);
    const addChar = j > 0 ? s2[windowEnd] : null;
    const removeChar = j > 0 ? s2[j - 1] : null;

    steps.push({
      windowStart,
      windowEnd,
      match,
      addChar,
      removeChar,
      cs2: [...cs2],
      windowStr: s2.slice(windowStart, windowEnd + 1),
      desc: match
        ? `Window "${s2.slice(windowStart, windowEnd + 1)}" matches s1's character counts — permutation found!`
        : j === 0
          ? `Initial window [0, ${target - 1}]. Counts do not match s1.`
          : `Slide: add '${addChar}', remove '${removeChar}'. Window "${s2.slice(windowStart, windowEnd + 1)}" — no match.`,
    });

    if (j < s2.length - target) {
      cs2[s2.charCodeAt(j + target) - 97]++;
      cs2[s2.charCodeAt(j) - 97]--;
    }
  }

  return steps;
}

function CharStrip({ s1, s2, step }) {
  if (!s2 || !step) return null;

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 min-w-max px-2 py-1">
        {s2.split("").map((ch, idx) => {
          const inWindow = idx >= step.windowStart && idx <= step.windowEnd;
          let border = "var(--viz-border)";
          let bg = "var(--viz-surface)";
          let color = "var(--code-text)";
          if (inWindow) {
            border = step.match ? TEAL : GOLD;
            bg = step.match ? `${TEAL}18` : `${GOLD}18`;
            color = step.match ? TEAL : GOLD;
          }
          return (
            <div key={`${ch}-${idx}`} className="flex flex-col items-center gap-1">
              <div className="text-[10px] font-mono" style={{ color: "var(--viz-muted)" }}>{idx}</div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono"
                style={{ background: bg, border: `1px solid ${border}`, color }}
              >
                {ch}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [s1, setS1] = useState("ab");
  const [s2, setS2] = useState("eidbaooo");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!s1.length || !s2.length) {
      setError("Both strings must be non-empty.");
      setSteps([]);
      setSi(0);
      return;
    }
    if (s1.length > s2.length) {
      setError("s1 cannot be longer than s2.");
      setSteps([]);
      setSi(0);
      return;
    }
    setError("");
    setSteps(simulate(s1, s2));
    setSi(0);
  }, [s1, s2]);

  const step = steps[si] || null;
  const finalStep = steps[steps.length - 1] || null;
  const found = steps.some((s) => s.match);

  function isActive(p) {
    return p.s1 === s1 && p.s2 === s2;
  }
  function applyPreset(p) {
    setS1(p.s1);
    setS2(p.s2);
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔀</span>
        <h1 className="font-semibold text-base">Permutation in String</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Sliding Window · Frequency Count</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(String(key))} variant="underlined" color="primary" size="sm">
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given two strings <code>s1</code> and <code>s2</code>, return <strong>true</strong> if <code>s2</code> contains a permutation of <code>s1</code>, or <strong>false</strong> otherwise. A permutation is a contiguous substring of <code>s2</code> that has the same character counts as <code>s1</code> (order can differ).
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "boolean checkInclusion(String s1, String s2)", desc: "Return true if s2 contains a contiguous substring that is a permutation of s1 (same chars, any order)." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — s1 = "ab", s2 = "eidbaooo"</p>
                <CodeBlock language="text">{`Input: s1 = "ab", s2 = "eidbaooo"
Expected output: true

s1 has one 'a' and one 'b'. We need a contiguous window in s2 with the same counts.

Window "ei"  -> e:1, i:1  — no
Window "id"  -> i:1, d:1  — no
Window "db"  -> d:1, b:1  — no
Window "ba"  -> b:1, a:1  — yes! Same counts as s1.

So s2 contains the permutation "ba" of s1 → return true.`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Fixed-Size Sliding Window</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      A permutation of <code>s1</code> must be the <em>same length</em> as <code>s1</code>. So we only need a fixed-size window — no expand/shrink logic needed. Slide it one step at a time, adding one char and dropping one.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">window = [i, i + s1.length() - 1]</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>int[26] Frequency Snapshot</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Two strings are permutations iff they share the same character frequencies. Use two <code>int[26]</code> arrays (one per string). Each <code>Arrays.equals</code> check is O(26) = O(1) — constant time, no sorting needed.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">Arrays.equals(cs1, cs2) → O(1)</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`int[] cs1 = new int[26], cs2 = new int[26];
for (int i = 0; i < s1.length(); i++) {
    cs1[s1.charAt(i)-'a']++;
    cs2[s2.charAt(i)-'a']++;
}
for (int i = s1.length(); i < s2.length(); i++) {
    if (Arrays.equals(cs1, cs2)) return true;
    cs2[s2.charAt(i)-'a']++;
    cs2[s2.charAt(i - s1.length())-'a']--;
}
return Arrays.equals(cs1, cs2);`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Each slide is O(1) — increment the entering char, decrement the leaving char. The check happens <em>before</em> sliding, so the last window is missed by the loop — you must call <code>Arrays.equals</code> once more after the loop exits.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Single pass over s2; O(26)=O(1) compare per step" },
                    { l: "SPACE", v: "O(1)", s: "Two fixed int[26] arrays — 26 lowercase chars" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 min-w-36 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                      <p className="text-xs text-default-400 mt-1">{s}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      size="sm"
                      variant={isActive(p) ? "flat" : "bordered"}
                      color={isActive(p) ? "primary" : "default"}
                      onPress={() => applyPreset(p)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Input label="s1 (pattern)" variant="bordered" size="sm" value={s1} onValueChange={setS1} className="flex-1 min-w-0" />
                  <Input label="s2 (text)" variant="bordered" size="sm" value={s2} onValueChange={setS2} className="flex-1 min-w-0" />
                </div>
                {error && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: `${RED}12`, border: `1px solid ${RED}44`, color: RED }}>
                    {error}
                  </div>
                )}
              </CardBody></Card>

              {step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step Debugger</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                    {si + 1}/{steps.length}
                  </p>

                  <p className="text-xs text-default-500 mb-4">
                    Window: <span style={{ color: TEAL }}>[{step.windowStart}, {step.windowEnd}]</span> "{step.windowStr}" ·
                    {step.addChar != null && (
                      <> Add <span style={{ color: GOLD }}>{step.addChar}</span> · Remove <span style={{ color: RED }}>{step.removeChar}</span> ·</>
                    )}{" "}
                    <span style={{ color: step.match ? TEAL : RED }}>{step.match ? "✓ MATCH" : "✗ No match"}</span>
                  </p>

                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine highlight={si === 0} annotation={si === 0 ? "build initial cs1, cs2" : "already built"} annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>for (i=0; i{'"<"'}s1.length(); i++) cs1[..]++, cs2[..]++</span>
                    </CodeLine>
                    <CodeLine highlight={!step.match && si > 0} annotation={step.match ? "return true" : `check window "${step.windowStr}"`} annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>if (Arrays.equals(cs1, cs2)) return true</span>
                    </CodeLine>
                    <CodeLine highlight={si > 0} annotation={step.addChar != null ? `cs2['${step.addChar}']++` : "—"} annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>cs2[s2.charAt(i)-'a']++</span>
                    </CodeLine>
                    <CodeLine highlight={si > 0} annotation={step.removeChar != null ? `cs2['${step.removeChar}']--` : "—"} annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>cs2[s2.charAt(i-s1.length())-'a']--</span>
                    </CodeLine>
                  </div>

                  <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">s2 with current window. Green = match, gold = no match.</p>
                    <CharStrip s1={s1} s2={s2} step={step} finalMode={false} />
                  </div>

                  <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: step.match ? `${TEAL}0d` : "var(--viz-surface)", border: `1px solid ${step.match ? TEAL + "44" : "var(--viz-border)"}` }}>
                    {step.desc}
                  </div>

                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi((i) => Math.max(0, i - 1))}>
                      ← Prev
                    </Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi((i) => Math.min(steps.length - 1, i + 1))}>
                      Next →
                    </Button>
                  </div>
                </CardBody></Card>
              )}

              {finalStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final State</p>
                  <div className="rounded-xl p-6 mb-4 text-center" style={{ background: found ? `${TEAL}0d` : `${RED}0d`, border: `1px solid ${found ? TEAL + "33" : RED + "33"}` }}>
                    <p className="text-xs text-default-500 mb-2">Result</p>
                    <p className="text-2xl font-bold" style={{ color: found ? TEAL : RED }}>{found ? "true" : "false"}</p>
                    <p className="text-sm mt-2 text-default-500">{found ? "A permutation of s1 was found in s2." : "No permutation of s1 found in s2."}</p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">Last window checked.</p>
                    <CharStrip s1={s1} s2={s2} step={finalStep} finalMode={true} />
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.Arrays;

class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;

        int[] cs1 = new int[26];
        int[] cs2 = new int[26];

        // s1.length() is the fixed window size.
        // Seed cs1 with all of s1, and cs2 with the first window of s2.
        for (int i = 0; i < s1.length(); i++) {
            cs1[s1.charAt(i) - 'a']++;
            cs2[s2.charAt(i) - 'a']++;
        }

        // Check BEFORE sliding — so i leads the window by one position.
        // Each step: add the char entering from the right, drop the one
        // leaving from the left. O(1) update, no full recount needed.
        for (int i = s1.length(); i < s2.length(); i++) {
            if (Arrays.equals(cs1, cs2)) return true;

            cs2[s2.charAt(i) - 'a']++;               // entering char
            cs2[s2.charAt(i - s1.length()) - 'a']--; // leaving char
        }

        // Don't return false! The loop checks before sliding, so the very
        // last window is never tested inside — check it explicitly here.
        return Arrays.equals(cs1, cs2);
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "if (s1.length() > s2.length()) return false;", exp: "No window in s2 can hold a permutation of s1." },
                    { line: "int[] cs1 = new int[26]; int[] cs2 = new int[26];", exp: "Character frequency counts for s1 and for the current window in s2." },
                    { line: "for (...); cs1[...]++; cs2[...]++;", exp: "Build cs1 and the first window's cs2 (s2[0..target-1])." },
                    { line: "if (Arrays.equals(cs1, cs2)) return true;", exp: "Before sliding, check if the current window is a permutation of s1." },
                    { line: "cs2[s2.charAt(i)-'a']++; cs2[...(i - s1.length())...]--;", exp: "Slide: add the new character at i, remove the one that left the window." },
                    { line: "return Arrays.equals(cs1, cs2);", exp: "Check the last window after the loop." },
                  ].map(({ line, exp }) => (
                    <div key={line} className="py-3 flex gap-3 items-start">
                      <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono" style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>
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
                    { icon: "📍", color: TEAL, tip: "s1.length() is the window size. Seed both cs1 (all of s1) and cs2 (first s1.length() chars of s2) in the same loop before anything else." },
                    { icon: "⚠️", color: GOLD, tip: "The loop checks BEFORE sliding — so the final window (last s1.length() chars of s2) is never reached inside the loop. Don't return false at the end: return Arrays.equals(cs1, cs2)." },
                    { icon: "🔄", color: BLUE, tip: "Permutation = same character multiset. int[26] comparison is O(26) = O(1) — no sorting, no HashMap overhead." },
                    { icon: "🚨", color: RED, tip: "Don't recount cs2 from scratch each step — that's O(n·m). Slide in O(1): cs2[entering]++ and cs2[leaving]--. That's the entire optimization." },
                    { icon: "🎯", color: BLUE, tip: "Same pattern as Find All Anagrams (LC 438) — just collect start indices instead of returning true. Related: Minimum Window Substring uses a variable-size window." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start" style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
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
