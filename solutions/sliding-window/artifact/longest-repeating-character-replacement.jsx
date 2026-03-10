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
  { label: "LC Example", text: "AABABBA", k: 1 },
  { label: "Simple", text: "ABAB", k: 2 },
  { label: "Long Run", text: "AAAA", k: 2 },
  { label: "Mixed", text: "BAAAB", k: 2 },
];

function summarizeCounts(counts) {
  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([ch, value]) => ({ ch, value }));
}

function simulate(text, k) {
  const steps = [];
  const counts = {};
  let left = 0;
  let maxFreq = 0;
  let bestLength = 0;
  let bestStart = 0;

  for (let right = 0; right < text.length; right++) {
    const ch = text[right];
    counts[ch] = (counts[ch] || 0) + 1;
    maxFreq = Math.max(maxFreq, counts[ch]);

    let shrinks = 0;
    while ((right - left + 1) - maxFreq > k) {
      const leftChar = text[left];
      counts[leftChar]--;
      left++;
      shrinks++;
    }

    const windowLength = right - left + 1;
    const needed = windowLength - maxFreq;
    let improved = false;
    if (windowLength > bestLength) {
      bestLength = windowLength;
      bestStart = left;
      improved = true;
    }

    const summary = summarizeCounts(counts);
    steps.push({
      left,
      right,
      ch,
      shrinks,
      maxFreq,
      windowLength,
      needed,
      bestLength,
      bestStart,
      bestSubstring: text.slice(bestStart, bestStart + bestLength),
      dominantChar: summary[0]?.ch || "",
      dominantCount: summary[0]?.value || 0,
      summary,
      improved,
      desc: shrinks > 0
        ? `Window needed too many replacements, so shrink left ${shrinks} time(s) until it fits k = ${k}.`
        : improved
          ? `Window "${text.slice(left, right + 1)}" fits with ${needed} replacement(s) and becomes the new best.`
          : `Extend the window with '${ch}' and keep it valid.`,
    });
  }

  steps.push({
    left,
    right: text.length - 1,
    ch: text[text.length - 1],
    shrinks: 0,
    maxFreq,
    windowLength: bestLength,
    needed: 0,
    bestLength,
    bestStart,
    bestSubstring: text.slice(bestStart, bestStart + bestLength),
    dominantChar: "",
    dominantCount: 0,
    summary: summarizeCounts(counts),
    improved: false,
    desc: `Done. Longest replaceable window is "${text.slice(bestStart, bestStart + bestLength)}" with length ${bestLength}.`,
    done: true,
  });

  return steps;
}

function WindowStrip({ text, step, finalMode }) {
  if (!text || !step) return null;
  const bestEnd = step.bestStart + step.bestLength - 1;

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 min-w-max px-2 py-1">
        {text.split("").map((ch, idx) => {
          const inWindow = !finalMode && idx >= step.left && idx <= step.right;
          const current = !finalMode && idx === step.right;
          const inBest = finalMode && idx >= step.bestStart && idx <= bestEnd;

          let border = "var(--viz-border)";
          let bg = "var(--viz-surface)";
          let color = "var(--code-text)";

          if (inWindow) {
            border = TEAL;
            bg = `${TEAL}15`;
          }
          if (current) {
            border = GOLD;
            bg = `${GOLD}20`;
            color = GOLD;
          }
          if (inBest) {
            border = BLUE;
            bg = `${BLUE}18`;
            color = BLUE;
          }

          return (
            <div key={`${ch}-${idx}`} className="flex flex-col items-center gap-1">
              <div className="text-[10px] font-mono" style={{ color: "var(--viz-muted)" }}>{idx}</div>
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center text-sm font-bold font-mono"
                style={{ background: bg, border: `1px solid ${border}`, color }}
              >
                {ch}
              </div>
              <div className="text-[10px] font-mono" style={{ color: current ? GOLD : inWindow ? TEAL : inBest ? BLUE : "var(--viz-muted)" }}>
                {current ? "R" : !finalMode && idx === step.left ? "L" : inBest ? "best" : ""}
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
  const [text, setText] = useState("AABABBA");
  const [kValue, setKValue] = useState("1");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const normalized = text.toUpperCase().replace(/[^A-Z]/g, "");
    const k = Number(kValue);

    if (!normalized.length) {
      setError("Enter at least one letter A-Z.");
      setSteps([]);
      setSi(0);
      return;
    }
    if (!Number.isInteger(k) || k < 0) {
      setError("k must be a non-negative integer.");
      setSteps([]);
      setSi(0);
      return;
    }

    setError("");
    setSteps(simulate(normalized, k));
    setSi(0);
  }, [text, kValue]);

  const normalizedText = text.toUpperCase().replace(/[^A-Z]/g, "");
  const numericK = Number(kValue);
  const step = steps[si] || null;
  const finalStep = steps[steps.length - 1] || null;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🪄</span>
        <h1 className="font-semibold text-base">Longest Repeating Character Replacement</h1>
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
                  Given a string <code>s</code> and an integer <code>k</code>, you may replace at most <code>k</code> characters in a substring so that every character in that substring becomes the same letter. Return the length of the longest possible substring.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "int characterReplacement(String s, int k)", desc: "Return the maximum window length that can be made all one letter using at most k replacements." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono flex-shrink-0" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — s = "AABABBA", k = 1</p>
                <CodeBlock language="text">{`Input: s = "AABABBA", k = 1
Expected output: 4

Try window "AABA":
- most frequent letter = A (3 times)
- replacements needed = 4 - 3 = 1
- valid because 1 <= k

Try window "AABAB":
- most frequent letter = A (3 times)
- replacements needed = 5 - 3 = 2
- invalid because 2 > k, so shrink from the left

Best valid length = 4.`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Keep a Window</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Expand the window with the right pointer and count letter frequencies inside it.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">window = s[left..right]</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Measure Required Replacements</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      A window is valid if <strong>window size - most frequent char count ≤ k</strong>. Otherwise shrink from the left.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">need = windowLength - maxFreq</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`int[] count = new int[26];
int left = 0;
int maxFreq = 0;
int best = 0;

for (int right = 0; right < s.length(); right++) {
    int idx = s.charAt(right) - 'A';
    count[idx]++;
    maxFreq = Math.max(maxFreq, count[idx]);

    while ((right - left + 1) - maxFreq > k) {
        count[s.charAt(left) - 'A']--;
        left++;
    }

    best = Math.max(best, right - left + 1);
}

return best;`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  The number of replacements needed is the total window size minus the count of the most common character, because every other character would have to change.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Left and right move forward only" },
                    { l: "SPACE", v: "O(1)", s: "Only 26 uppercase counts" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
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
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      size="sm"
                      variant={normalizedText === preset.text && numericK === preset.k ? "flat" : "bordered"}
                      color={normalizedText === preset.text && numericK === preset.k ? "primary" : "default"}
                      onPress={() => {
                        setText(preset.text);
                        setKValue(String(preset.k));
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Input label="String (A-Z)" variant="bordered" size="sm" value={text} onValueChange={setText} className="flex-1" />
                  <Input label="k" variant="bordered" size="sm" value={kValue} onValueChange={setKValue} className="w-24" />
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
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {steps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSi(index)}
                        style={{
                          background: index === si ? TEAL : "var(--viz-surface)",
                          border: `1px solid ${index === si ? TEAL : "var(--viz-border)"}`,
                          color: index === si ? "#0b0f0e" : undefined
                        }}
                        className="px-2.5 py-1 rounded text-xs cursor-pointer"
                      >
                        #{index + 1}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-default-500 mb-4">
                    Window: <span style={{ color: TEAL }}>[{step.left}, {step.right}]</span> ·
                    MaxFreq: <span style={{ color: GOLD }}>{step.maxFreq}</span> ·
                    Need: <span style={{ color: step.needed <= numericK ? TEAL : RED }}>{step.needed}</span> ·
                    Best: <span style={{ color: BLUE }}>{step.bestLength}</span> ·
                    <span style={{ color: step.done ? BLUE : step.shrinks > 0 ? RED : step.improved ? BLUE : "var(--viz-muted)" }}>
                      {step.done ? " final answer" : step.shrinks > 0 ? ` shrank ${step.shrinks} time(s)` : step.improved ? " new best window" : " valid window"}
                    </span>
                  </p>

                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine highlight={!step.done} annotation={`count['${step.ch}']++`} annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>count[s.charAt(right) - 'A']++</span>
                    </CodeLine>
                    <CodeLine highlight={!step.done} annotation={`maxFreq = ${step.maxFreq}`} annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>maxFreq = Math.max(maxFreq, count[idx])</span>
                    </CodeLine>
                    <CodeLine highlight={step.shrinks > 0} annotation={`need = ${step.windowLength} - ${step.maxFreq} = ${step.needed}`} annotationColor={step.shrinks > 0 ? RED : TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>while ((right - left + 1) - maxFreq {'>'} k)</span>
                    </CodeLine>
                    <CodeLine highlight={step.improved || step.done} annotation={`best = ${step.bestLength}`} annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>best = Math.max(best, right - left + 1)</span>
                    </CodeLine>
                  </div>

                  <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">Teal = current valid window, gold = newest character.</p>
                    <WindowStrip text={normalizedText} step={step} finalMode={false} />
                    <div className="flex gap-2 justify-center flex-wrap mt-4">
                      {step.summary.map(({ ch, value }) => (
                        <div key={ch} className="px-2.5 py-1 rounded text-xs font-mono" style={{ background: ch === step.dominantChar ? `${GOLD}18` : `${BLUE}10`, border: `1px solid ${ch === step.dominantChar ? GOLD : `${BLUE}55`}`, color: ch === step.dominantChar ? GOLD : BLUE }}>
                          {ch}:{value}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: `${BLUE}0d`, border: `1px solid ${BLUE}44` }}>
                    {step.desc}
                  </div>

                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi((value) => Math.max(0, value - 1))}>
                      ← Prev
                    </Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi((value) => Math.min(steps.length - 1, value + 1))}>
                      Next →
                    </Button>
                  </div>
                </CardBody></Card>
              )}

              {finalStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final State</p>
                  <div className="rounded-xl p-6 mb-4 text-center" style={{ background: `${BLUE}0d`, border: `1px solid ${BLUE}33` }}>
                    <p className="text-xs text-default-500 mb-2">Longest Replaceable Window</p>
                    <p className="text-4xl font-bold" style={{ color: BLUE }}>{finalStep.bestLength}</p>
                    <p className="text-sm mt-2" style={{ color: BLUE }}>"{finalStep.bestSubstring}"</p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">Blue tiles mark the best window found.</p>
                    <WindowStrip text={normalizedText} step={finalStep} finalMode={true} />
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`public class LongestRepeatingCharacterReplacement {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0;
        int maxFreq = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {
            int idx = s.charAt(right) - 'A';
            count[idx]++;
            maxFreq = Math.max(maxFreq, count[idx]); // biggest frequency in the scan

            while ((right - left + 1) - maxFreq > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }

            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "count[idx]++;", exp: "Add the new right-side character into the window frequency table." },
                    { line: "maxFreq = Math.max(maxFreq, count[idx]);", exp: "Track the most common letter seen in the current scan." },
                    { line: "while ((right - left + 1) - maxFreq > k)", exp: "If the window needs too many replacements, it is invalid and must shrink." },
                    { line: "count[s.charAt(left) - 'A']--; left++;", exp: "Remove the leftmost character and move the window forward." },
                    { line: "best = Math.max(best, right - left + 1);", exp: "Record the largest valid window length." },
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
                    { icon: "📍", color: TEAL, tip: "A window is valid when everything except the majority letter can be covered by k replacements." },
                    { icon: "⚠️", color: GOLD, tip: "Use windowLength - maxFreq, not the number of distinct characters." },
                    { icon: "🔄", color: BLUE, tip: "This is a variable-length sliding window with counts, similar to longest substring problems." },
                    { icon: "💡", color: TEAL, tip: "The majority letter acts like the 'anchor' you convert the rest of the window into." },
                    { icon: "🎯", color: BLUE, tip: "Related: max consecutive ones with flips, longest ones after replacement, frequency-based window problems." },
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
