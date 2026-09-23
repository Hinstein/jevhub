"use client";

import { useEffect, useState } from "react";
import { DEMO_EMAILS } from "@/content/inbox-demo";
import { INBOX_TRIAGE_COPY } from "@/i18n/inbox-triage-copy";
import type { Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";
import { INBOX_LIMITS, type InboxEmailResult, type InboxQueue, type InboxResult } from "@/lib/inbox-triage";

const QUEUES: InboxQueue[] = ["needs_reply", "review", "read_later"];

function percentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function InboxTriage({ locale }: { locale: Locale }) {
  const copy = INBOX_TRIAGE_COPY[locale];
  const [customOpen, setCustomOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastMode, setLastMode] = useState<"demo" | "custom">("demo");
  const [result, setResult] = useState<{ mode: "demo" | "custom"; data: InboxResult } | null>(null);

  useEffect(() => { trackEvent("inbox_triage_view", { locale }); }, [locale]);

  async function run(mode: "demo" | "custom") {
    if (busy) return;
    if (mode === "custom" && (!text.trim() || text.trim().length > INBOX_LIMITS.customCharacters)) return;
    setBusy(true);
    setLastMode(mode);
    setError("");
    setResult(null);
    trackEvent(mode === "demo" ? "inbox_triage_demo_submit" : "inbox_triage_custom_submit", { locale, mode, count: mode === "demo" ? DEMO_EMAILS.length : 1 });
    try {
      const response = await fetch("/api/inbox-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "demo" ? { mode } : { mode, text: text.trim() }),
        cache: "no-store",
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string" ? payload.error : copy.error;
        throw new Error(message);
      }
      if (typeof payload !== "object" || payload === null || !("emails" in payload) || !Array.isArray(payload.emails)) throw new Error(copy.error);
      const data = payload as InboxResult;
      if (data.emails.length !== (mode === "demo" ? DEMO_EMAILS.length : 1)) throw new Error(copy.error);
      setResult({ mode, data });
      trackEvent(mode === "demo" ? "inbox_triage_demo_result" : "inbox_triage_custom_result", { locale, mode, count: data.emails.length, success: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.error);
      trackEvent(mode === "demo" ? "inbox_triage_demo_result" : "inbox_triage_custom_result", { locale, mode, count: mode === "demo" ? DEMO_EMAILS.length : 1, success: false });
    } finally {
      setBusy(false);
    }
  }

  function card(email: InboxEmailResult, mode: "demo" | "custom") {
    const sample = mode === "demo" ? DEMO_EMAILS.find((item) => item.id === email.id) : undefined;
    return <article className="inbox-result-card" key={email.id}>
      <div className="inbox-result-head">
        <div>
          <span className="inbox-from">{sample?.from || copy.customTitle}</span>
          <h4>{sample?.subject || copy.customTitle}</h4>
        </div>
        <span className="badge">{copy.types[email.messageType]}</span>
      </div>
      {sample && <p className="inbox-message-text">{sample.body}</p>}
      <details className="inbox-signals">
        <summary>{copy.details}</summary>
        <dl>
          <div><dt>{copy.typeLabel}</dt><dd>{copy.types[email.messageType]}</dd></div>
          <div><dt>{copy.typeConfidence}</dt><dd>{percentage(email.categoryConfidence)}</dd></div>
          <div><dt>{copy.replyLabel}</dt><dd>{percentage(email.replyProbability)}</dd></div>
          <div><dt>{copy.timeLabel}</dt><dd>{email.timeSensitivity.toFixed(1)} / 2</dd></div>
          <div><dt>{copy.timeConfidence}</dt><dd>{percentage(email.timeConfidence)}</dd></div>
        </dl>
      </details>
    </article>;
  }

  return <section className="inbox-workspace" aria-label={copy.title}>
    <div className="shell">
      <div className="inbox-start-grid">
        <div className="card inbox-start-card">
          <div className="eyebrow">01 / DEMO</div>
          <h2>{copy.sampleTitle}</h2>
          <p>{copy.sampleBody}</p>
          <button className="button-primary" type="button" onClick={() => void run("demo")} disabled={busy}>{busy ? copy.loading : copy.sampleButton} →</button>
        </div>
        <div className="card inbox-custom-card">
          <div className="eyebrow">02 / YOUR EMAIL</div>
          <h2>{copy.customTitle}</h2>
          <p>{copy.customBody}</p>
          {!customOpen && <button className="button-secondary" type="button" onClick={() => { setCustomOpen(true); trackEvent("inbox_triage_custom_open", { locale }); }}>{copy.customOpen} →</button>}
          {customOpen && <div className="inbox-custom-input">
            <label htmlFor="inbox-custom-text">{copy.customTitle}</label>
            <textarea id="inbox-custom-text" value={text} onChange={(event) => setText(event.target.value)} maxLength={INBOX_LIMITS.customCharacters} rows={8} placeholder={copy.customPlaceholder} />
            <div className="inbox-char-count">{text.length} / {INBOX_LIMITS.customCharacters}</div>
            <p className="inbox-privacy">{copy.privacy} <a href="https://typesafe.ai/privacy" target="_blank" rel="noreferrer">TypeSafe AI Privacy Policy ↗</a></p>
            <div className="actions"><button className="button-primary" type="button" disabled={busy || !text.trim()} onClick={() => void run("custom")}>{busy ? copy.loading : copy.customButton}</button><button className="button-secondary" type="button" onClick={() => setCustomOpen(false)}>{copy.customClose}</button></div>
          </div>}
        </div>
      </div>

      {!result && <div className="inbox-samples">
        <div className="section-heading"><div className="eyebrow">INBOX / 06</div><h2>{copy.samplesLabel}</h2></div>
        <div className="inbox-sample-grid">{DEMO_EMAILS.map((email) => <article className="inbox-sample-card" key={email.id}><div className="inbox-from">{email.from}</div><h3>{email.subject}</h3><p>{email.body}</p></article>)}</div>
      </div>}

      {busy && <p className="inbox-status" role="status">{copy.loading}</p>}
      {error && <div className="callout inbox-error" role="alert"><strong>{copy.error}</strong><p>{error}</p><button className="button-secondary" type="button" onClick={() => void run(lastMode)}>{copy.retry}</button></div>}

      {result && <section className="inbox-results" aria-live="polite">
        <div className="section-heading"><div className="eyebrow">JEV / RESULT</div><h2>{copy.resultTitle}</h2><p>{copy.resultDescription}</p></div>
        <div className="inbox-queue-grid">{QUEUES.map((queue) => <section className={`inbox-queue inbox-queue-${queue}`} key={queue} aria-label={copy.queues[queue].title}>
          <div className="inbox-queue-heading"><h3>{copy.queues[queue].title}</h3><span>{result.data.summary[queue]}</span></div>
          <p>{copy.queues[queue].description}</p>
          <div className="inbox-queue-cards">{result.data.emails.filter((email) => email.queue === queue).map((email) => card(email, result.mode))}</div>
        </section>)}</div>
        <p className="small inbox-result-note">{copy.noReply}</p>
      </section>}
    </div>
  </section>;
}
