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
  { label: "LC Example", value: "abcabcbb" },
  { label: "All Same", value: "bbbbb" },
  { label: "LeetCode", value: "pwwkew" },
  { label: "Edge Jump", value: "dvdf" },
];

function simulate(text) {
  const steps = [];
  const lastSeen = {};
  let left = 0;
  let bestLength = 0;
  let bestStart = 0;

  for (let right = 0; right < text.length; right++) {
    const ch = text[right];
    const previous = lastSeen[ch];
    let jumped = false;

    if (previous !== undefined && previous >= left) {
      left = previous + 1;
      jumped = true;
    }

    lastSeen[ch] = right;
    const windowLength = right - left + 1;
    let improved = false;

    if (windowLength > bestLength) {
      bestLength = windowLength;
      bestStart = left;
      improved = true;
    }

    steps.push({
      left,
      right,
      ch,
      previous,
      jumped,
      improved,
      windowLength,
      bestLength,
      bestStart,
      bestSubstring: text.slice(bestStart, bestStart + bestLength),
      currentWindow: text.slice(left, right + 1),
      desc: jumped
        ? `Duplicate '${ch}' was already inside the window, so move left to ${left}.`
        : improved
          ? `Window "${text.slice(left, right + 1)}" is a new best with length ${windowLength}.`
          : `Extend the window to include '${ch}'.`,
    });
  }

  steps.push({
    left,
    right: text.length - 1,
    ch: text[text.length - 1],
    previous: null,
    jumped: false,
    improved: false,
    windowLength: bestLength,
    bestLength,
    bestStart,
    bestSubstring: text.slice(bestStart, bestStart + bestLength),
    currentWindow: text.slice(left),
    desc: `Done. Longest valid substring is "${text.slice(bestStart, bestStart + bestLength)}" with length ${bestLength}.`,
    done: true,
  });

  return steps;
}

function CharStrip({ text, step, finalMode }) {
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
  const [input, setInput] = useState("abcabcbb");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!input.length) {
      setError("Enter a non-empty string.");
      setSteps([]);
      setSi(0);
      return;
    }
    setError("");
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const finalStep = steps[steps.length - 1] || null;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔤</span>
        <h1 className="font-semibold text-base">Longest Substring Without Repeating Characters</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Sliding Window · Hash Map</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(String(key))} variant="underlined" color="primary" size="sm">
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given a string <code>s</code>, return the length of the longest substring that contains <strong>no repeated characters</strong>. The substring must be contiguous.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "int lengthOfLongestSubstring(String s)", desc: "Return the maximum length of a substring with all unique characters." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono flex-shrink-0" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — s = "abcabcbb"</p>
                <CodeBlock language="text">{`Input: s = "abcabcbb"
Expected output: 3

Walkthrough:
"a"    -> valid, best = 1
"ab"   -> valid, best = 2
"abc"  -> valid, best = 3
"abca" -> duplicate 'a', move left past old 'a' -> window becomes "bca"
"bcab" -> duplicate 'b', move left -> window becomes "cab"

The longest valid substring is "abc", so answer = 3.`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Expand Right</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Grow the window by moving <strong>right</strong> one character at a time. As long as every character is unique, the whole window is valid.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">window = s[left..right]</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Jump Left on Duplicates</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      When the new character already appeared inside the current window, move <strong>left</strong> just past that older copy.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">left = lastSeen[ch] + 1</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`Map<Character, Integer> lastSeen = new HashMap<>();
int left = 0;
int best = 0;

for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    if (lastSeen.containsKey(ch) && lastSeen.get(ch) >= left) {
        left = lastSeen.get(ch) + 1;
    }
    lastSeen.put(ch, right);
    best = Math.max(best, right - left + 1);
}

return best;`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Only move <code>left</code> forward when the duplicate is still inside the current window. Older duplicates to the left of <code>left</code> do not matter anymore.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Each pointer only moves forward" },
                    { l: "SPACE", v: "O(min(n, alphabet))", s: "Last seen index per character" },
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
                      variant={input === preset.value ? "flat" : "bordered"}
                      color={input === preset.value ? "primary" : "default"}
                      onPress={() => setInput(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <Input label="String" variant="bordered" size="sm" value={input} onValueChange={setInput} />
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
                    Char: <span style={{ color: GOLD }}>{step.ch}</span> ·
                    Window: <span style={{ color: TEAL }}>[{step.left}, {step.right}]</span> ·
                    Length: <span style={{ color: TEAL }}>{step.windowLength}</span> ·
                    Best: <span style={{ color: BLUE }}>{step.bestLength}</span> ·
                    <span style={{ color: step.jumped ? RED : step.improved ? BLUE : "var(--viz-muted)" }}>
                      {step.done ? " final answer" : step.jumped ? " left pointer jumped" : step.improved ? " new best window" : " window extended"}
                    </span>
                  </p>

                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine highlight={!!step.jumped} annotation={step.previous !== undefined && step.previous !== null ? `lastSeen('${step.ch}') = ${step.previous}` : "new character"} annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>if (lastSeen.containsKey(ch) && lastSeen.get(ch) {'>='} left)</span>
                    </CodeLine>
                    <CodeLine highlight={!!step.jumped} annotation={`left = ${step.left}`} annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>left = lastSeen.get(ch) + 1</span>
                    </CodeLine>
                    <CodeLine highlight={!step.done} annotation={`lastSeen('${step.ch}') = ${step.right}`} annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>lastSeen.put(ch, right)</span>
                    </CodeLine>
                    <CodeLine highlight={!!step.improved || !!step.done} annotation={`best = ${step.bestLength}`} annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>best = Math.max(best, right - left + 1)</span>
                    </CodeLine>
                  </div>

                  <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">Teal = current window, gold = newest character.</p>
                    <CharStrip text={input} step={step} finalMode={false} />
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
                    <p className="text-xs text-default-500 mb-2">Longest Unique Substring</p>
                    <p className="text-4xl font-bold" style={{ color: BLUE }}>{finalStep.bestLength}</p>
                    <p className="text-sm mt-2" style={{ color: BLUE }}>"{finalStep.bestSubstring}"</p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">Blue tiles mark the final best substring.</p>
                    <CharStrip text={input} step={finalStep} finalMode={true} />
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.HashMap;
import java.util.Map;

public class LongestSubstringWithoutRepeatingCharacters {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int left = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);

            if (lastSeen.containsKey(ch) && lastSeen.get(ch) >= left) {
                left = lastSeen.get(ch) + 1;   // jump past duplicate
            }

            lastSeen.put(ch, right);           // latest index
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
                    { line: "Map<Character, Integer> lastSeen = new HashMap<>();", exp: "Store the latest index where each character appeared." },
                    { line: "if (lastSeen.containsKey(ch) && lastSeen.get(ch) >= left)", exp: "Only react when the duplicate is still inside the current window." },
                    { line: "left = lastSeen.get(ch) + 1;", exp: "Jump the left edge just past the earlier duplicate." },
                    { line: "lastSeen.put(ch, right);", exp: "Update the character's newest position." },
                    { line: "best = Math.max(best, right - left + 1);", exp: "Measure the current unique window and keep the maximum." },
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
                    { icon: "📍", color: TEAL, tip: "Right pointer always expands; left only moves forward when a duplicate enters the window." },
                    { icon: "⚠️", color: GOLD, tip: "Do not move left backward. Use max logic with the current left boundary." },
                    { icon: "🔄", color: BLUE, tip: "A last-seen map is stronger than a set because it lets you jump left in one move." },
                    { icon: "💡", color: TEAL, tip: "This is the classic variable-length sliding window for 'all unique' constraints." },
                    { icon: "🎯", color: BLUE, tip: "Related problems: minimum window substring, permutation in string, longest repeating replacement." },
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
