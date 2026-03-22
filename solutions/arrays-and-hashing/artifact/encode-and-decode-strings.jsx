export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";
import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

// ── Colors ──────────────────────────────────────────────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

// ── Reusable Components ──────────────────────────────────────────────
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

// ── Token Display: colored encoded-string visualization ──────────────
function TokenDisplay({ tokens, highlightIdx }) {
  if (!tokens || tokens.length === 0) {
    return <p className="text-xs text-default-400 italic font-mono">— empty —</p>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {tokens.map((tok, i) => {
        const isActive = i === highlightIdx;
        return (
          <div key={i} className="flex items-center rounded overflow-hidden text-xs font-mono transition-all"
            style={{ border: `2px solid ${isActive ? TEAL : "var(--viz-border)"}` }}>
            <span className="px-1.5 py-1 font-bold"
              style={{ background: isActive ? `${GOLD}44` : `${GOLD}18`, color: GOLD }}>
              {tok.len}
            </span>
            <span className="px-0.5 py-1 font-bold"
              style={{ background: isActive ? `${RED}30` : `${RED}12`, color: RED }}>
              #
            </span>
            <span className="px-1.5 py-1"
              style={{ background: isActive ? `${TEAL}20` : "transparent", color: isActive ? TEAL : "var(--code-text)" }}>
              {tok.content !== "" ? tok.content : <span style={{ opacity: 0.4, fontStyle: "italic" }}>∅</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Algorithm Simulation ─────────────────────────────────────────────
function simulate(inputStr) {
  if (!inputStr) return [];
  const strings = inputStr.split("|");
  const steps = [];

  // ── Encode phase ──────────────────────────────────────────────────
  let encoded = "";
  const tokens = [];

  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];
    const token = `${s.length}#${s}`;
    encoded += token;
    tokens.push({ len: s.length, content: s });

    steps.push({
      phase: "encode",
      idx: i,
      current: s,
      token,
      encoded,
      tokens: [...tokens],
      decoded: [],
      desc: `Encoding "${s}": length=${s.length} → prefix "${s.length}#" → token "${token}"`,
    });
  }

  // ── Decode phase ──────────────────────────────────────────────────
  let pos = 0;
  const decoded = [];

  while (pos < encoded.length) {
    const j   = encoded.indexOf("#", pos);
    const len = parseInt(encoded.slice(pos, j));
    const word = encoded.slice(j + 1, j + 1 + len);
    decoded.push(word);

    steps.push({
      phase: "decode",
      pos,
      hashIdx: j,
      len,
      word,
      encoded,
      tokens,
      decoded: [...decoded],
      desc: `At pos ${pos}: find '#' at ${j} → len=${len}, read ${len} char${len !== 1 ? "s" : ""} → "${word}"`,
    });

    pos = j + 1 + len;
  }

  steps.push({
    phase: "result",
    encoded,
    tokens,
    strings,
    decoded,
    desc: `Roundtrip complete! ${strings.length} string(s) encoded and decoded successfully`,
  });

  return steps;
}

// ── Presets ──────────────────────────────────────────────────────────
const PRESETS = [
  { label: "NeetCode Ex", val: "lint|code|love" },
  { label: "Special Chars", val: "we|say|:|yes" },
  { label: "Empty String", val: "|hello" },
  { label: "Single Word", val: "hello" },
];

// ── Main Component ───────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]     = useState("Problem");
  const [input, setInput] = useState("lint|code|love");
  const [steps, setSteps] = useState([]);
  const [si, setSi]       = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;

  const highlightIdx =
    step?.phase === "encode" ? step.idx :
    step?.phase === "decode" ? step.decoded.length - 1 : -1;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔐</span>
        <h1 className="font-semibold text-base">Encode and Decode Strings</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Arrays & Hashing · Design</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => setTab(String(key))}
          variant="underlined"
          color="primary"
          size="sm"
        >

          {/* ── PROBLEM TAB ─────────────────────────────────────────── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Design an algorithm to <strong>encode</strong> a list of strings into a single string,
                  and <strong>decode</strong> that string back to the original list. The encoded string
                  is transmitted over a network and must survive any characters — including any delimiter
                  you might choose to use.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      sig: "String encode(List<String> strs)",
                      desc: "Encode a list of strings into one transmittable string. Strings may contain any Unicode character.",
                    },
                    {
                      sig: "List<String> decode(String s)",
                      desc: "Decode back to the original list. Must produce the exact original strings, regardless of special characters in their content.",
                    },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">
                  Example — encode/decode ["lint", "code", "love"]
                </p>
                <CodeBlock language="text">{`Input:  ["lint", "code", "love"]

Encoding step-by-step:
  "lint" (len=4) → token = "4#lint"
  "code" (len=4) → token = "4#code"
  "love" (len=4) → token = "4#love"
  Combined: "4#lint4#code4#love"

Decoding "4#lint4#code4#love":
  pos=0:  find '#' at 1 → len=4, read chars [2..6]  → "lint", advance to 6
  pos=6:  find '#' at 7 → len=4, read chars [8..12] → "code", advance to 12
  pos=12: find '#' at 13 → len=4, read chars [14..18]→ "love", advance to 18

Output: ["lint", "code", "love"] ✓`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Why Not a Simple Delimiter?</p>
                <CodeBlock language="text">{`Problem: any character can appear inside the strings themselves.

Naive join with ",":
  ["a,b", "c"] → encode → "a,b,c"
  decode splits on "," → ["a", "b", "c"]  ✗  (3 strings, not 2!)

Naive join with "#":
  ["a#b", "c"] → encode → "a#b#c"
  decode splits on "#" → ["a", "b", "c"]  ✗  same problem

Length-prefix "len#content":
  ["a#b", "c"] → "3#a#b1#c"
  decode: pos=0 → len=3, read "a#b" → advance to 5
          pos=5 → len=1, read "c"   → done  ✓`}</CodeBlock>
              </CardBody></Card>

            </div>
          </Tab>

          {/* ── INTUITION TAB ───────────────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Length-Prefix Encoding</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Prefix each string with its character count followed by a sentinel <code>#</code>.
                      During decode, read the count first, then read <em>exactly</em> that many characters.
                      No ambiguity — you never need to scan for a delimiter inside the content.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">"hello" → "5#hello"</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Why '#' Inside Strings Is Safe</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      At each decode position, the bytes are always <em>digits</em> then <code>#</code>.
                      Digits contain no <code>#</code>, so <code>indexOf('#', pos)</code> finds
                      exactly the length/content separator — not any <code>#</code> buried in previous content.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">"a#b" → "3#a#b" → safe!</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`// ENCODE
String encode(List<String> strs) {
    StringBuilder sb = new StringBuilder();
    for (String s : strs) {
        sb.append(s.length()).append('#').append(s);
    }
    return sb.toString();
}

// DECODE
List<String> decode(String s) {
    List<String> result = new ArrayList<>();
    int i = 0;
    while (i < s.length()) {
        int j = s.indexOf('#', i);                      // find delimiter
        int len = Integer.parseInt(s.substring(i, j));  // parse length
        result.add(s.substring(j + 1, j + 1 + len));   // read exact content
        i = j + 1 + len;                                // advance to next token
    }
    return result;
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  The <code>#</code> is just a visual marker — we <em>never split</em> on it.
                  The pointer advances by <code>len</code> chars past <code>#</code>, so any <code>#</code>
                  inside a string's content is skipped over entirely.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n · k)", s: "Each character of each string touched once for both encode and decode" },
                    { l: "SPACE", v: "O(n · k)", s: "Encoded string stores all characters plus small length prefixes" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 min-w-28 rounded-lg p-4 text-center"
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

          {/* ── VISUALIZER TAB ──────────────────────────────────────── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PRESETS.map(p => (
                    <Button
                      key={p.label} size="sm"
                      variant={input === p.val ? "flat" : "bordered"}
                      color={input === p.val ? "primary" : "default"}
                      onPress={() => setInput(p.val)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <Input
                  label="Strings (pipe-separated)"
                  value={input}
                  onValueChange={v => setInput(v)}
                  placeholder='e.g., lint|code|love  (use | to separate strings)'
                  variant="bordered"
                  size="sm"
                />
                <p className="text-xs text-default-400 mt-2">
                  Use <code>|</code> to separate strings. Start with <code>|hello</code> to include an empty string.
                </p>
              </CardBody></Card>

              {/* Step-by-Step Debugger */}
              {steps.length > 0 && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>{si + 1}/{steps.length}</p>

                  {/* Status Line */}
                  <p className="text-xs text-default-500 mb-4">
                    {step?.phase === "encode" && (
                      <>
                        Phase: <span style={{ color: BLUE }} className="font-bold">ENCODING</span> ·
                        String: <V color={TEAL}>"{step.current}"</V> ·
                        Token: <V color={GOLD}>"{step.token}"</V>
                      </>
                    )}
                    {step?.phase === "decode" && (
                      <>
                        Phase: <span style={{ color: GOLD }} className="font-bold">DECODING</span> ·
                        Pos: <V color={BLUE}>{step.pos}</V> ·
                        Len: <V color={GOLD}>{step.len}</V> ·
                        Word: <V color={TEAL}>"{step.word}"</V>
                      </>
                    )}
                    {step?.phase === "result" && (
                      <>
                        <span style={{ color: TEAL }} className="font-bold">✓ Roundtrip complete! </span>
                        {step.decoded.length} string(s) preserved perfectly
                      </>
                    )}
                  </p>

                  {/* Live Code Block */}
                  <div className="rounded-xl overflow-hidden mb-4"
                    style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step?.phase === "encode"}
                      annotation={step?.phase === "encode" ? `token = "${step?.token}"` : ""}
                      annotationColor={TEAL}
                    >
                      <span style={{ color: "var(--code-muted)" }}>{"sb.append(s.length()).append('#').append(s);"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.phase === "decode"}
                      annotation={step?.phase === "decode" ? `j=${step?.hashIdx}, len=${step?.len}` : ""}
                      annotationColor={GOLD}
                    >
                      <span style={{ color: "var(--code-muted)" }}>{"j = s.indexOf('#', i);  len = parseInt(s[i..j]);"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.phase === "decode"}
                      annotation={step?.phase === "decode" ? `"${step?.word}"` : ""}
                      annotationColor={TEAL}
                    >
                      <span style={{ color: "var(--code-muted)" }}>{"result.add(s.substring(j+1, j+1+len));  i = j+1+len;"}</span>
                    </CodeLine>
                  </div>

                  {/* Visual Panel */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    {/* Legend */}
                    <p className="text-xs text-default-400 mb-3 flex gap-3 flex-wrap items-center">
                      <span>Encoded string:</span>
                      <span><span style={{ color: GOLD }} className="font-bold font-mono">len</span> · <span style={{ color: RED }} className="font-bold font-mono">#</span> · <span style={{ color: TEAL }} className="font-mono">content</span></span>
                      {step?.phase === "decode" && (
                        <span>— reading token at pos <span style={{ color: BLUE }} className="font-mono font-bold">{step.pos}</span></span>
                      )}
                    </p>

                    {/* Token visualization */}
                    <div className="overflow-x-auto pb-1">
                      <TokenDisplay tokens={step?.tokens || []} highlightIdx={highlightIdx} />
                    </div>

                    {/* Decoded strings so far (decode phase) */}
                    {step?.phase === "decode" && step.decoded.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-default-400 mb-2">Decoded so far:</p>
                        <div className="flex gap-1 flex-wrap">
                          {step.decoded.map((w, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                              style={{ background: `${TEAL}20`, color: TEAL, border: `1px solid ${TEAL}44` }}>
                              "{w}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strings being encoded (encode phase) */}
                    {step?.phase === "encode" && (
                      <div className="mt-4">
                        <p className="text-xs text-default-400 mb-2">Input strings encoded so far:</p>
                        <div className="flex gap-1 flex-wrap">
                          {step.tokens.map((tok, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs font-mono"
                              style={{
                                background: i === step.idx ? `${TEAL}20` : `${BLUE}12`,
                                color: i === step.idx ? TEAL : BLUE,
                                border: `1px solid ${i === step.idx ? TEAL : BLUE}44`,
                                fontWeight: i === step.idx ? 700 : 400,
                              }}>
                              "{tok.content}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="bg-content2 rounded-lg px-4 py-3 mb-4 text-sm font-mono"
                    style={{ borderLeft: `3px solid ${step?.phase === "result" ? TEAL : step?.phase === "decode" ? GOLD : BLUE}` }}>
                    {step?.desc}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                      onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                      onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Final State */}
              {step?.phase === "result" && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Roundtrip Result</p>
                  <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-lg" style={{ background: "var(--viz-node-bg)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-2">Encoded string:</p>
                      <code className="text-xs font-mono break-all" style={{ color: GOLD }}>{step.encoded}</code>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: "var(--viz-node-bg)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-2">Decoded strings:</p>
                      <div className="flex gap-1 flex-wrap">
                        {step.decoded.map((w, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                            style={{ background: `${TEAL}20`, color: TEAL, border: `1px solid ${TEAL}44` }}>
                            "{w}"
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-center text-xs font-semibold" style={{ color: TEAL }}>
                      ✓ All {step.decoded.length} string(s) preserved exactly — roundtrip successful!
                    </p>
                  </div>
                </CardBody></Card>
              )}

            </div>
          </Tab>

          {/* ── CODE TAB ────────────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.*;

class Codec {

    // Encode: prefix each string with "length#"
    public String encode(List<String> strs) {
        StringBuilder sb = new StringBuilder();
        for (String s : strs) {
            sb.append(s.length()).append('#').append(s);
        }
        return sb.toString();
    }

    // Decode: parse length before '#', read exactly that many chars
    public List<String> decode(String s) {
        List<String> result = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            int j   = s.indexOf('#', i);                      // find delimiter
            int len = Integer.parseInt(s.substring(i, j));    // parse length
            result.add(s.substring(j + 1, j + 1 + len));     // read content
            i = j + 1 + len;                                  // advance pointer
        }
        return result;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    {
                      line: "sb.append(s.length()).append('#').append(s);",
                      exp: "Append the string's character count, then '#', then the string itself. This is one length-prefixed token. Works for empty strings too ('0#').",
                    },
                    {
                      line: "int j = s.indexOf('#', i);",
                      exp: "Find the NEXT '#' starting from position i. Since the length digits contain no '#', this always lands on the length/content separator — not any '#' inside content.",
                    },
                    {
                      line: "int len = Integer.parseInt(s.substring(i, j));",
                      exp: "Parse the decimal digits from i up to (but not including) j as the content length.",
                    },
                    {
                      line: "result.add(s.substring(j + 1, j + 1 + len));",
                      exp: "Extract exactly len characters starting right after '#'. This is the original string, regardless of any special characters it contains.",
                    },
                    {
                      line: "i = j + 1 + len;",
                      exp: "Advance the pointer past this token: skip over '#' (1 char) and the len content chars. The next token starts here.",
                    },
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
                    { icon: "📍", color: TEAL,  tip: "Encode = prepend \"len#\". Decode = read digits up to '#', parse as length, then read exactly that many chars." },
                    { icon: "⚠️", color: GOLD,  tip: "NEVER split on '#' during decode. The '#' can appear in string content — only the length tells you where a token ends." },
                    { icon: "🔄", color: BLUE,  tip: "Advance pointer: i = j + 1 + len. This always lands at the start of the next token, not mid-content." },
                    { icon: "💡", color: TEAL,  tip: "Same design as HTTP Content-Length header: tell the receiver the exact byte count, then send that many bytes. Zero ambiguity." },
                    { icon: "🎯", color: BLUE,  tip: "Related: Serialize and Deserialize Binary Tree (LC 297), Design HashMap (LC 706), Design a Stack with Push/Pop (LC 155)." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
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
