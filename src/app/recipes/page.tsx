"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./page.module.css";

type Message = { role: "user" | "assistant"; content: string };

const LANGUAGES = [
  { code: "en-GB", label: "English (UK)" },
  { code: "en-US", label: "English (US)" },
  { code: "fr-FR", label: "Français" },
  { code: "es-ES", label: "Español" },
  { code: "de-DE", label: "Deutsch" },
  { code: "it-IT", label: "Italiano" },
  { code: "pt-BR", label: "Português" },
  { code: "nl-NL", label: "Nederlands" },
  { code: "pl-PL", label: "Polski" },
  { code: "ru-RU", label: "Русский" },
  { code: "ar-SA", label: "العربية" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "tr-TR", label: "Türkçe" },
  { code: "sv-SE", label: "Svenska" },
  { code: "da-DK", label: "Dansk" },
  { code: "fi-FI", label: "Suomi" },
  { code: "nb-NO", label: "Norsk" },
  { code: "cs-CZ", label: "Čeština" },
  { code: "ro-RO", label: "Română" },
  { code: "hu-HU", label: "Magyar" },
  { code: "el-GR", label: "Ελληνικά" },
  { code: "he-IL", label: "עברית" },
  { code: "id-ID", label: "Bahasa Indonesia" },
  { code: "ms-MY", label: "Bahasa Melayu" },
  { code: "th-TH", label: "ภาษาไทย" },
  { code: "vi-VN", label: "Tiếng Việt" },
  { code: "uk-UA", label: "Українська" },
  { code: "af-ZA", label: "Afrikaans" },
  { code: "sw-KE", label: "Kiswahili" },
];

const QUICK_PROMPTS = [
  { label: "Quick Dinner", text: "Give me a healthy, balanced dinner recipe I can make in under 30 minutes with simple ingredients." },
  { label: "Weekly Meal Plan", text: "Create a 7-day healthy meal plan with breakfast, lunch, and dinner — I want variety and simple cooking." },
  { label: "High Protein", text: "Suggest a high-protein lunch recipe that will keep me full for hours and is easy to meal-prep." },
  { label: "Healthy Snacks", text: "Give me 5 nutritious snack ideas I can prepare in advance for the week." },
  { label: "Vegan Recipe", text: "I need a delicious high-protein vegan dinner recipe that is filling and easy to cook." },
  { label: "Low Calorie", text: "Design a satisfying dinner under 500 kcal that is packed with nutrients and doesn't feel like diet food." },
];

// ── Markdown renderer ──────────────────────────────────────────────────────────
function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/```([\s\S]*?)```/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className={styles.codeBlock}><code>{part.replace(/^\w+\n/, "")}</code></pre>
        ) : (
          <span key={i} className={styles.prose} dangerouslySetInnerHTML={{ __html: formatInline(part) }} />
        )
      )}
    </>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

// ── PDF export (strips markdown to plain text) ─────────────────────────────────
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/#{1,3} /g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^- /gm, "• ")
    .replace(/^\d+\. /gm, (m) => m);
}

async function exportToPDF(messages: Message[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const maxW = pageW - margin * 2;
  let y = 20;

  const addLine = (text: string, size = 10, bold = false, color: [number, number, number] = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    lines.forEach((line) => {
      if (y > 272) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += size * 0.45;
    });
    y += 2;
  };

  // Title
  addLine("Healthy Eating Plan", 18, true, [34, 197, 94]);
  addLine(`Generated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, 9, false, [120, 120, 120]);
  y += 4;

  messages.forEach((m) => {
    if (m.role === "user") {
      y += 2;
      addLine("You asked:", 9, true, [80, 80, 80]);
      addLine(m.content, 10, false, [50, 50, 50]);
      y += 2;
    } else {
      addLine("Assistant:", 9, true, [34, 197, 94]);
      const plain = stripMarkdown(m.content);
      plain.split("\n").forEach((line) => {
        if (line.trim()) addLine(line.trim(), 10);
      });
      y += 4;
      // divider
      if (y < 270) {
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, pageW - margin, y);
        y += 4;
      }
    }
  });

  doc.save("healthy-eating-plan.pdf");
}

// ── Voice hook ─────────────────────────────────────────────────────────────────
type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

function useVoiceInput(onResult: (text: string) => void, lang: string) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const toggle = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as typeof window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { alert("Voice input is not supported in this browser. Please use Chrome or Edge."); return; }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;
    rec.onresult = (e) => { onResult(e.results[0][0].transcript); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, lang, onResult]);

  return { listening, toggle };
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function RecipesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [voiceLang, setVoiceLang] = useState(() =>
    typeof navigator !== "undefined"
      ? LANGUAGES.find((l) => navigator.language.startsWith(l.code.split("-")[0]))?.code ?? "en-GB"
      : "en-GB"
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (editingIndex !== null) editRef.current?.focus(); }, [editingIndex]);

  const sendMessages = useCallback(async (msgs: Message[]) => {
    setLoading(true);
    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...msgs, assistantMsg]);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: updated[updated.length - 1].content + chunk };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, something went wrong. Please try again." };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    await sendMessages(newMessages);
  }, [messages, loading, sendMessages]);

  // Edit: replace user message at index and resend from that point
  const submitEdit = useCallback(async (index: number) => {
    if (!editText.trim()) return;
    const updated = messages.slice(0, index);
    updated.push({ role: "user", content: editText.trim() });
    setMessages(updated);
    setEditingIndex(null);
    setEditText("");
    await sendMessages(updated);
  }, [messages, editText, sendMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(index); }
    if (e.key === "Escape") { setEditingIndex(null); setEditText(""); }
  };

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; }
  };

  const { listening, toggle: toggleVoice } = useVoiceInput((transcript) => {
    setInput((prev) => (prev ? prev + " " + transcript : transcript));
    textareaRef.current?.focus();
  }, voiceLang);

  const hasMeaningfulContent = messages.some((m) => m.role === "assistant" && m.content.length > 50);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🥗</span>
          <div>
            <span className={styles.logoTitle}>Healthy Eating Assistant</span>
            <span className={styles.logoSub}>Recipes, nutrition &amp; meal planning</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {hasMeaningfulContent && (
            <button className={styles.pdfBtn} onClick={() => exportToPDF(messages)} title="Download as PDF">
              📄 Save Plan
            </button>
          )}
          <span className={styles.badge}>Powered by Claude Opus 4.8</span>
        </div>
      </header>

      <main className={styles.main}>
        {messages.length === 0 ? (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>🥦</div>
            <h1 className={styles.welcomeTitle}>Your AI Recipe Assistant</h1>
            <p className={styles.welcomeText}>
              Discover healthy recipes, get personalised meal plans, and learn about nutrition — just ask anything about food and healthy eating.
            </p>
            <div className={styles.quickGrid}>
              {QUICK_PROMPTS.map((q) => (
                <button key={q.label} className={styles.quickBtn} onClick={() => send(q.text)}>
                  <strong>{q.label}</strong>
                  <span>{q.text.slice(0, 80)}…</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? styles.userBubble : styles.assistantBubble}>
                {m.role === "assistant" && <span className={styles.avatarAI}>AI</span>}

                <div className={styles.bubbleWrap}>
                  {m.role === "user" && editingIndex === i ? (
                    <div className={styles.editBox}>
                      <textarea
                        ref={editRef}
                        className={styles.editTextarea}
                        value={editText}
                        onChange={(e) => { setEditText(e.target.value); autoResize(e.target); }}
                        onKeyDown={(e) => handleEditKeyDown(e, i)}
                        rows={2}
                      />
                      <div className={styles.editActions}>
                        <button className={styles.editSaveBtn} onClick={() => submitEdit(i)} disabled={loading}>Send</button>
                        <button className={styles.editCancelBtn} onClick={() => { setEditingIndex(null); setEditText(""); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.bubbleContent}>
                      {m.role === "assistant"
                        ? <MarkdownText text={m.content || (loading && i === messages.length - 1 ? "▋" : "")} />
                        : m.content}
                    </div>
                  )}

                  {m.role === "user" && editingIndex !== i && !loading && (
                    <button
                      className={styles.editBtn}
                      onClick={() => { setEditingIndex(i); setEditText(m.content); }}
                      title="Edit message"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>

                {m.role === "user" && <span className={styles.avatarUser}>You</span>}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        {messages.length > 0 && (
          <div className={styles.quickRow}>
            {QUICK_PROMPTS.slice(0, 3).map((q) => (
              <button key={q.label} className={styles.chipBtn} onClick={() => send(q.text)} disabled={loading}>
                {q.label}
              </button>
            ))}
          </div>
        )}
        <div className={styles.inputRow}>
          <div className={styles.voiceGroup}>
            <button
              className={`${styles.voiceBtn} ${listening ? styles.voiceBtnActive : ""}`}
              onClick={toggleVoice}
              title={listening ? "Stop listening" : "Voice input"}
            >
              {listening ? "🔴" : "🎤"}
            </button>
            <select
              className={styles.langSelect}
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
              title="Voice language"
              disabled={listening}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
            onKeyDown={handleKeyDown}
            placeholder={listening ? "Listening… speak now" : "Ask about a recipe, ingredient, meal plan… (Enter to send)"}
            rows={1}
            disabled={loading}
          />
          <button className={styles.sendBtn} onClick={() => send(input)} disabled={loading || !input.trim()}>
            {loading ? <span className={styles.spinner} /> : "Send"}
          </button>
        </div>
        <p className={styles.footerNote}>Healthy Eating Assistant · Recipes, Nutrition &amp; Meal Planning</p>
      </footer>
    </div>
  );
}
