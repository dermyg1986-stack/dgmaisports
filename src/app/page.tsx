"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./page.module.css";

type Message = { role: "user" | "assistant"; content: string };

const FEATURES = [
  {
    title: "Session Planning",
    text: "Generate structured training sessions with warm-ups, drills, progressions, and cool-downs tailored to your squad's age and ability.",
  },
  {
    title: "Match Preparation",
    text: "Build pre-match tactical plans, opponent scouting summaries, and team talks for your next fixture.",
  },
  {
    title: "Drill Library",
    text: "Get specific drills with setup instructions, coaching points, and variations for every skill level.",
  },
  {
    title: "Player Analysis",
    text: "Turn performance observations into clear, constructive feedback and development plans.",
  },
  {
    title: "Load Management",
    text: "Plan training cycles, recovery windows, and taper schedules to keep players fit and injury-free.",
  },
  {
    title: "Set Pieces",
    text: "Design attacking and defensive set-piece routines, from corners to free kicks.",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is DrillPitch?",
    a: "DrillPitch is a free AI coaching assistant that helps football and team-sport coaches build training sessions, match-day tactics, drills, and player development plans in seconds.",
  },
  {
    q: "Is DrillPitch free to use?",
    a: "Yes. DrillPitch's coaching assistant is free to use — add your own Anthropic API key and start planning sessions, drills, and match preparation straight away.",
  },
  {
    q: "What sports does DrillPitch support?",
    a: "DrillPitch is built with football (soccer) coaching in mind but adapts to rugby, hockey, basketball, and other team sports when you specify the sport and age group.",
  },
  {
    q: "How does DrillPitch create training sessions?",
    a: "Describe your squad, focus area, and session length, and DrillPitch's AI generates a structured plan with warm-ups, drills, coaching points, and progressions suited to your players.",
  },
  {
    q: "Can DrillPitch help with match preparation and set pieces?",
    a: "Yes — DrillPitch builds tactical match-day plans, opponent scouting summaries, and specific set-piece routines such as attacking and defensive corner setups.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const QUICK_PROMPTS = [
  { label: "Session Plan", text: "Create a 90-minute training session for a semi-professional squad focused on pressing and maintaining a high defensive line." },
  { label: "Match Prep", text: "Help me prepare a match-day plan for Sunday. We're playing a team that sits deep and hits on the counter." },
  { label: "Drill Ideas", text: "Suggest 3 drills to improve forward passing and combination play in tight spaces for under-16 players." },
  { label: "Player Analysis", text: "How should I assess a central defender's decision-making under pressure and give constructive feedback in a 1-to-1 session?" },
  { label: "Recovery Week", text: "Design a recovery and regeneration week for players after a heavy fixture run of 3 games in 7 days." },
  { label: "Set Pieces", text: "Give me 2 corner routines — one attacking near post, one far post — with positioning described in text." },
];

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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
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
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, something went wrong. Please check your API key and try again." };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const autoResize = () => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 160) + "px"; }
  };

  return (
    <>
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚽</span>
          <div>
            <span className={styles.logoTitle}>DrillPitch</span>
            <span className={styles.logoSub}>AI Coach Assistant</span>
          </div>
        </div>
        <span className={styles.badge}>Powered by Claude Opus 4.8</span>
      </header>

      <main className={styles.main}>
        {messages.length === 0 ? (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>🏆</div>
            <h1 className={styles.welcomeTitle}>Your AI Coaching Assistant</h1>
            <p className={styles.welcomeText}>
              Plan sessions, prepare for matches, design drills, and analyse player performance — all in one place.
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
                <div className={styles.bubbleContent}>
                  {m.role === "assistant" ? <MarkdownText text={m.content || (loading && i === messages.length - 1 ? "▋" : "")} /> : m.content}
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
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coaching assistant… (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={loading}
          />
          <button className={styles.sendBtn} onClick={() => send(input)} disabled={loading || !input.trim()}>
            {loading ? <span className={styles.spinner} /> : "Send"}
          </button>
        </div>
        <p className={styles.footerNote}>DrillPitch · AI Coaching Assistant for Every Sport</p>
      </footer>
    </div>

      <section className={styles.seoSection} aria-labelledby="features-heading">
        <div className={styles.seoInner}>
          <h2 id="features-heading">AI-Powered Coaching, Built for Every Level</h2>
          <p className={styles.seoIntro}>
            DrillPitch is a free AI coaching assistant for football and team-sport coaches. Plan
            training sessions, prepare for match day, build drills, and analyse player performance
            — all from a single conversation.
          </p>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>

          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
