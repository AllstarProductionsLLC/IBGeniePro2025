"use client";
import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, SpellCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import {
  grammarSchema,
  BRAND_URL,
  type GrammarReport,
} from "@/lib/learning-tools";
import type { Profile } from "@/lib/workspace";
import { AccessGate, useAIStatus } from "./access-gate";
import { ErrorNote, Field, Picker } from "./shared";
import { WorkInput } from "./work-input";
import { ExportActions } from "./export-actions";
export function GrammarWorkspace({ profile }: { profile: Profile }) {
  const [work, setWork] = useState(""),
    [language, setLanguage] = useState("English"),
    [dialect, setDialect] = useState("British English"),
    [consent, setConsent] = useState(false),
    [report, setReport] = useState<GrammarReport>(),
    [reviewedText, setReviewedText] = useState(""),
    [accepted, setAccepted] = useState<number[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const api = useAIStatus(),
    request = useRef<AbortController>();
  useEffect(() => () => request.current?.abort(), []);
  const generate = async () => {
    setBusy(true);
    setError("");
    request.current = new AbortController();
    try {
      const r = await apiFetch("/api/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: request.current.signal,
        body: JSON.stringify({ profile, work, language, dialect, consent }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setReport(grammarSchema.parse(d));
      setReviewedText(work);
      setAccepted([]);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setError(
          e instanceof Error
            ? e.message
            : "The grammar review could not be completed.",
        );
    } finally {
      setBusy(false);
    }
  };
  const accept = (index: number) => {
    const s = report?.suggestions[index];
    if (!s) return;
    const at = work.indexOf(s.original);
    if (at === -1) {
      setError(
        "This wording has changed. Run a fresh review before applying this suggestion.",
      );
      return;
    }
    if (work.indexOf(s.original, at + 1) !== -1) {
      setError(
        "This phrase appears more than once. Edit the intended occurrence in your text.",
      );
      return;
    }
    setWork(
      work.slice(0, at) + s.replacement + work.slice(at + s.original.length),
    );
    setAccepted((a) => [...a, index]);
    setError("");
  };
  const markdown = report
    ? `# Writing review\n\n${report.summary}\n\n${report.suggestions.map((s, i) => `## ${i + 1}. ${s.category}${accepted.includes(i) ? " (accepted)" : ""}\n\nOriginal: ${s.original}\n\nSuggestion: ${s.replacement}\n\nWhy: ${s.reason}`).join("\n\n")}\n\n## Practise this pattern\n${report.practice}\n\n${BRAND_URL}`
    : "";
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            WRITING LAB · {profile.program.toUpperCase()}
          </span>
          <h1>
            {profile.program === "pyp"
              ? "Make your words clearer."
              : "Polish the writing. Keep your voice."}
          </h1>
          <p>
            {profile.role === "teacher"
              ? "Check classroom materials or discuss small, explained edits with learners."
              : "Understand each suggestion and decide which changes belong in your work."}
          </p>
        </div>
        <SpellCheck size={32} />
      </div>
      <div className="assessment-layout">
        <section className="panel">
          <AccessGate {...api} capability="resources" />
          <fieldset disabled={busy} className="tool-fieldset">
            <div className="form-two">
              <Field label="Writing language">
                <Input
                  maxLength={60}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </Field>
              <Field label="Language preference">
                <Picker
                  label="Language preference"
                  value={dialect}
                  onChange={setDialect}
                  options={[
                    "British English",
                    "American English",
                    "Match my text",
                  ]}
                />
              </Field>
            </div>
            <WorkInput
              value={work}
              onChange={setWork}
              max={12000}
              disabled={busy}
            />
            <label className="inline-check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I have permission to send this text to the connected AI provider
              and have removed personal details.
            </label>
            <Button
              disabled={
                busy ||
                !consent ||
                work.trim().length < 10 ||
                !api.status?.text ||
                !api.status.authenticated ||
                api.status.tier !== "pro"
              }
              onClick={() => void generate()}
            >
              {busy ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <SpellCheck size={17} />
              )}
              Review my writing
            </Button>
          </fieldset>
          {error && <ErrorNote>{error}</ErrorNote>}
          <p className="muted-note">
            Suggestions explain small edits. They do not add arguments or write
            an assignment for you. Check your school's rules for assessed work.
          </p>
          {work.trim() && (
            <ExportActions
              title="My writing"
              markdown={"# My writing\n\n" + work + "\n\n" + BRAND_URL}
            />
          )}
        </section>
        <section className="panel grammar-results">
          <h2>
            {report
              ? "Your writing review"
              : "Small edits, useful explanations."}
          </h2>
          {report ? (
            <>
              <p>{report.summary}</p>
              {work !== reviewedText && (
                <p className="info-note">
                  Your text has changed since this review. Suggestions refer to
                  the version you submitted.
                </p>
              )}
              {report.suggestions.length ? (
                report.suggestions.map((s, i) => (
                  <article className="grammar-suggestion" key={i}>
                    <span className="soft-badge">{s.category}</span>
                    <p className="before-text">{s.original}</p>
                    <p className="after-text">
                      {s.replacement || "Remove this text"}
                    </p>
                    <p>{s.reason}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={accepted.includes(i) || busy}
                      onClick={() => accept(i)}
                    >
                      {accepted.includes(i) ? (
                        <>
                          <Check size={15} />
                          Applied
                        </>
                      ) : (
                        "Apply this edit"
                      )}
                    </Button>
                  </article>
                ))
              ) : (
                <p>
                  No specific corrections suggested. Read it aloud once to check
                  it still says what you mean.
                </p>
              )}
              <div className="feedback-next">
                <h3>Practise this pattern</h3>
                <p>{report.practice}</p>
              </div>
              <ExportActions title="Writing review" markdown={markdown} />
            </>
          ) : (
            <p>
              Upload or paste your writing to see grammar, spelling, punctuation
              and clarity suggestions, with a reason for each.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
