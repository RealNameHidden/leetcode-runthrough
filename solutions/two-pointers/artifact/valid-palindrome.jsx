export const difficulty = 'Easy'
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
  { label: "LC Example 1", value: "A man, a plan, a canal: Panama" },
  { label: "LC Example 2", value: "race a car" },
  { label: "Single char",  value: "a" },
  { label: "Numbers",      value: "0P" },
];

function isAlphaNum(c) {
  return /[a-zA-Z0-9]/.test(c);
}

function simulate(s) {
  if (!s) return [];
  const steps = [];
  let left = 0, right = s.length - 1;

  // Init step
  steps.push({ phase: 'init', left, right, s, skipLeft: false, skipRight: false, match: null, result: null });

  while (left < right) {
    // Skip non-alphanumeric from left
    if (!isAlphaNum(s[left])) {
      steps.push({ phase: 'skip_left', left, right, s, skipLeft: true, skipRight: false, match: null, result: null });
      left++;
      continue;
    }
    // Skip non-alphanumeric from right
    if (!isAlphaNum(s[right])) {
      steps.push({ phase: 'skip_right', left, right, s, skipLeft: false, skipRight: true, match: null, result: null });
      right--;
      continue;
    }
    // Compare
    const lc = s[left].toLowerCase();
    const rc = s[right].toLowerCase();
    const matched = lc === rc;
    steps.push({ phase: matched ? 'match' : 'mismatch', left, right, s, skipLeft: false, skipRight: false, match: matched, result: matched ? null : false });
    if (!matched) return steps;
    left++;
    right--;
  }

  steps.push({ phase: 'done', left, right, s, skipLeft: false, skipRight: false, match: null, result: true });
  return steps;
}

export default function App() {
  const [tab,    setTab]    = useState("Problem");
  const [input,  setInput]  = useState("A man, a plan, a canal: Panama");
  const [steps,  setSteps]  = useState([]);
  const [si,     setSi]     = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const finalStep = steps.length > 0 ? steps[steps.length - 1] : null;
  const finalResult = finalStep ? finalStep.result : null;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔤</span>
        <h1 className="font-semibold text-base">Valid Palindrome</h1>
        <Chip size="sm" color="success" variant="flat">Easy</Chip>
        <Chip size="sm" color="primary" variant="flat">Two Pointers</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* ── PROBLEM ─────────────────────────────────── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string <code>s</code>, return <code>true</code> if it is a palindrome, or <code>false</code> otherwise.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "boolean isPalindrome(String s)", desc: "Ignore case and non-alphanumeric characters. Constraints: 1 ≤ s.length ≤ 2×10⁵, s consists only of printable ASCII." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — "A man, a plan, a canal: Panama"</p>
                <CodeBlock language="text">{`Input:  s = "A man, a plan, a canal: Panama"
Output: true

Step 1: Strip non-alphanumeric + lowercase → "amanaplanacanalpanama"
Step 2: Apply two pointers:
  L=0 'a'  R=19 'a'  → match ✓  →  L++, R--
  L=1 'm'  R=18 'm'  → match ✓  →  L++, R--
  L=2 'a'  R=17 'a'  → match ✓  →  L++, R--
  ...all chars match → PALINDROME ✓

Counter-example: s = "race a car"
  Cleaned: "raceacar"
  L=0 'r'  R=7 'r'  → match ✓
  L=1 'a'  R=6 'a'  → match ✓
  L=2 'c'  R=5 'c'  → match ✓
  L=3 'e'  R=4 'a'  → MISMATCH ✗ → return false`}</CodeBlock>
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
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Skip Junk, Compare Clean</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Move both pointers inward, skipping any character that is not a letter or digit. Only compare the alphanumeric characters, case-insensitively. No need to build a cleaned string — do it in place.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">Character.isLetterOrDigit(c)</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Converging Pointers</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Start left at 0 and right at the last index. Any mismatch at the current pair immediately falsifies the palindrome — no need to continue. If pointers cross without a mismatch, it's a palindrome.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">while (left &lt; right)</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;

    while (left < right) {
        while (left < right && !Character.isLetterOrDigit(s.charAt(left)))
            left++;
        while (left < right && !Character.isLetterOrDigit(s.charAt(right)))
            right--;

        if (Character.toLowerCase(s.charAt(left))
         != Character.toLowerCase(s.charAt(right)))
            return false;

        left++;
        right--;
    }
    return true;
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  The inner skip loops must also check <code>left &lt; right</code> — otherwise when all remaining chars on one side are junk, the pointers can cross and you'd compare out-of-bounds or invalid positions.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME",  v: "O(n)", s: "Each character visited at most once" },
                    { l: "SPACE", v: "O(1)", s: "Only two pointer variables; no extra string" },
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
                      variant={input === p.value ? "flat" : "bordered"}
                      color={input === p.value ? "primary" : "default"}
                      onPress={() => setInput(p.value)}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <Input
                  label="String s"
                  variant="bordered"
                  size="sm"
                  value={input}
                  onValueChange={setInput}
                  className="w-full"
                />
              </CardBody></Card>

              {step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step Debugger</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                    {si + 1}/{steps.length}
                  </p>

                  <p className="text-xs text-default-500 mb-4">
                    L=<span className="font-semibold" style={{ color: TEAL }}>{step.left}</span>
                    {" "}
                    {step.left < step.s.length && <>(<span style={{ color: TEAL }}>'{step.s[step.left]}'</span>)</>}
                    {"  ·  "}
                    R=<span className="font-semibold" style={{ color: GOLD }}>{step.right}</span>
                    {" "}
                    {step.right >= 0 && <>(<span style={{ color: GOLD }}>'{step.s[step.right]}'</span>)</>}
                    {"  ·  "}
                    <span style={{ color:
                      step.phase === 'match'    ? TEAL :
                      step.phase === 'mismatch' ? RED  :
                      step.phase === 'skip_left' || step.phase === 'skip_right' ? BLUE :
                      step.phase === 'done' ? TEAL : "var(--viz-muted)"
                    }}>
                      {step.phase === 'init'       ? "Initialize"        :
                       step.phase === 'skip_left'  ? "Skip non-alphanum (L)" :
                       step.phase === 'skip_right' ? "Skip non-alphanum (R)" :
                       step.phase === 'match'      ? "✓ Match — advance both" :
                       step.phase === 'mismatch'   ? "✗ Mismatch → false" :
                       step.phase === 'done'       ? "✓ Pointers crossed → true" : ""}
                    </span>
                  </p>

                  {/* Live code block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'skip_left'}
                      annotation={step.phase === 'skip_left' ? `'${step.s[step.left]}' not alphanumeric, left++` : `left=${step.left}`}
                      annotationColor={step.phase === 'skip_left' ? BLUE : TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>while (!isAlphaNum(s[left])) left++</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'skip_right'}
                      annotation={step.phase === 'skip_right' ? `'${step.s[step.right]}' not alphanumeric, right--` : `right=${step.right}`}
                      annotationColor={step.phase === 'skip_right' ? BLUE : GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>while (!isAlphaNum(s[right])) right--</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'match' || step.phase === 'mismatch'}
                      annotation={
                        step.phase === 'match'    ? `'${step.s[step.left].toLowerCase()}' == '${step.s[step.right].toLowerCase()}' ✓` :
                        step.phase === 'mismatch' ? `'${step.s[step.left].toLowerCase()}' != '${step.s[step.right].toLowerCase()}' ✗` :
                        step.left < step.s.length && step.right >= 0 ? `comparing '${step.s[step.left]}' vs '${step.s[step.right]}'` : undefined
                      }
                      annotationColor={step.phase === 'match' ? TEAL : step.phase === 'mismatch' ? RED : BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>if (toLowerCase(s[left]) != toLowerCase(s[right])) return false</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'match'}
                      annotation={step.phase === 'match' ? `left++→${step.left + 1}, right--→${step.right - 1}` : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>left++; right--</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'done'}
                      annotation={step.phase === 'done' ? "pointers crossed → palindrome" : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>return true</span>
                    </CodeLine>
                  </div>

                  {/* String visualization */}
                  <div className="rounded-xl p-4 mb-4 overflow-x-auto" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">
                      <span style={{ color: TEAL }}>■ L</span>{"  ·  "}<span style={{ color: GOLD }}>■ R</span>{"  ·  "}<span style={{ color: BLUE }}>■ skipping</span>{"  ·  "}<span style={{ color: "var(--viz-muted)" }}>□ non-alphanum</span>
                    </p>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {step.s.split('').map((ch, idx) => {
                        const isLeft  = idx === step.left;
                        const isRight = idx === step.right;
                        const isAlpha = isAlphaNum(ch);
                        const isSkippingLeft  = step.phase === 'skip_left'  && idx === step.left;
                        const isSkippingRight = step.phase === 'skip_right' && idx === step.right;
                        let bg     = isAlpha ? "var(--viz-node-bg)" : "var(--viz-surface)";
                        let border = isAlpha ? "var(--viz-border)"  : "var(--viz-border)";
                        let color  = isAlpha ? undefined : "var(--viz-muted)";
                        if (isSkippingLeft || isSkippingRight) { bg = `${BLUE}20`; border = BLUE; color = BLUE; }
                        else if (isLeft)  { bg = `${TEAL}20`; border = TEAL; color = TEAL; }
                        else if (isRight) { bg = `${GOLD}20`; border = GOLD; color = GOLD; }
                        return (
                          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: 6,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: bg, border: `1px solid ${border}`, color,
                              fontSize: 11, fontFamily: "monospace", fontWeight: 600,
                              transition: "all 0.2s",
                            }}>
                              {ch === ' ' ? '·' : ch}
                            </div>
                            <div style={{ fontSize: 9, color: isLeft ? TEAL : isRight ? GOLD : "var(--viz-muted)", fontFamily: "monospace" }}>
                              {isLeft && isRight ? "L/R" : isLeft ? "L" : isRight ? "R" : ""}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {step.phase === 'mismatch' && (
                    <div className="rounded-lg px-4 py-3 mb-4 text-xs font-mono"
                      style={{ background: `${RED}12`, border: `1px solid ${RED}44`, borderLeft: `3px solid ${RED}` }}>
                      <span style={{ color: RED }} className="font-bold">✗ Mismatch: </span>
                      '{step.s[step.left].toLowerCase()}' ≠ '{step.s[step.right].toLowerCase()}' → NOT a palindrome
                    </div>
                  )}
                  {step.phase === 'done' && (
                    <div className="rounded-lg px-4 py-3 mb-4 text-xs font-mono"
                      style={{ background: `${TEAL}12`, border: `1px solid ${TEAL}44`, borderLeft: `3px solid ${TEAL}` }}>
                      <span style={{ color: TEAL }} className="font-bold">✓ All pairs matched — PALINDROME</span>
                    </div>
                  )}

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
                  <div className="rounded-xl p-6 text-center" style={{
                    background: finalResult ? `${TEAL}0d` : `${RED}0d`,
                    border: `1px solid ${finalResult ? TEAL : RED}33`,
                  }}>
                    <p className="text-2xl font-bold font-mono mb-2" style={{ color: finalResult ? TEAL : RED }}>
                      {finalResult ? "PALINDROME ✓" : "NOT PALINDROME ✗"}
                    </p>
                    <p className="text-xs text-default-500">
                      "{input}" → <span style={{ color: finalResult ? TEAL : RED }}>{finalResult ? "true" : "false"}</span>
                    </p>
                  </div>
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
                <CodeBlock>{`public class ValidPalindrome {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;

        while (left < right) {
            // Skip non-alphanumeric from the left
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
                left++;
            }
            // Skip non-alphanumeric from the right
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
                right--;
            }
            // Compare case-insensitively
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }

        return true;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "int left = 0, right = s.length() - 1", exp: "Initialize two pointers at opposite ends of the string." },
                    { line: "while (left < right)", exp: "Keep going while there are unchecked pairs. Single char or all-same is trivially a palindrome." },
                    { line: "while (!Character.isLetterOrDigit(s.charAt(left))) left++", exp: "Advance left past any punctuation, spaces, or special chars. The inner guard 'left < right' prevents overshooting." },
                    { line: "while (!Character.isLetterOrDigit(s.charAt(right))) right--", exp: "Same skip logic for the right pointer." },
                    { line: "Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))", exp: "Case-insensitive compare. One mismatch is enough to return false immediately." },
                    { line: "left++; right--", exp: "Both pointers advance inward — this pair matched, move to the next." },
                    { line: "return true", exp: "Pointers have crossed without any mismatch — the string is a palindrome." },
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
                    { icon: "📍", color: TEAL, tip: "Always guard inner skip-loops with 'left < right' — without it, pointers can cross and you'd compare invalid chars on all-junk strings." },
                    { icon: "⚠️", color: GOLD, tip: "Case-insensitive: use Character.toLowerCase() on both sides, not equalsIgnoreCase() (that's for Strings, not chars)." },
                    { icon: "🔄", color: BLUE, tip: "Related: Palindrome Number (same two-pointer idea on digit array), Longest Palindromic Substring (expand-around-center)." },
                    { icon: "💡", color: TEAL, tip: "O(1) space: do NOT build a cleaned string with replaceAll + toLowerCase first — it costs O(n) space and is unnecessary." },
                    { icon: "🎯", color: GOLD, tip: "Palindrome check pattern: left < right outer loop; skip non-target chars with inner while loops; compare; advance both." },
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
