"use client";
import { apiFetch } from "@/lib/api-client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  LoaderCircle,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SUBJECTS } from "@/lib/subjects";
import {
  dpSubjects,
  kindLabels,
  parseCardNotes,
  resourceKinds,
  resourceSchema,
  uid,
  type Profile,
  type Question,
  type Resource,
  type ResourceKind,
} from "@/lib/workspace";
import { AccessGate, useAIStatus } from "./access-gate";
import { ErrorNote, Field, KindIcon, Markdown, Picker } from "./shared";
const outlines: Record<string, string> = {
  "study-guide":
    "## Big idea\n\n## Key concepts\n\n## Worked example\n\n## Retrieval questions\n",
  "lesson-plan":
    "## Learning intention\n\n## Success criteria\n\n## Starter · 5 minutes\n\n## Explore · 15 minutes\n\n## Apply · 20 minutes\n\n## Exit ticket · 10 minutes\n\n## Support and extension\n",
  rubric:
    "## Task and learning goals\n\n## Understanding\nDeveloping:\nSecure:\nExtending:\n\n## Reasoning and evidence\nDeveloping:\nSecure:\nExtending:\n\n## Next steps\n\nOriginal formative rubric, not an official IB mark scheme.",
  "exit-ticket":
    "## Student questions\n1. Explain a key idea.\n2. Apply it to a new example.\n3. What remains unclear?\n\n## Teacher response guide\n",
};
export function ResourceStudio({
  profile,
  initialKind,
  editing,
  onSave,
}: {
  profile: Profile;
  initialKind: ResourceKind;
  editing?: Resource;
  onSave: (r: Resource) => void;
}) {
  const context = {
    ...profile,
    program: editing?.program ?? profile.program,
    examYear: editing?.examYear ?? profile.examYear,
  };
  const [kind, setKind] = useState(initialKind),
    [title, setTitle] = useState(editing?.title || ""),
    [subject, setSubject] = useState(
      editing?.subject || profile.subjects[0] || "Biology",
    ),
    [level, setLevel] = useState<Resource["level"]>(
      editing?.level || profile.level,
    ),
    [summary, setSummary] = useState(editing?.summary || ""),
    [source, setSource] = useState(editing?.sourceNotes || ""),
    [body, setBody] = useState(editing?.body || outlines[initialKind] || ""),
    [cardText, setCardText] = useState(
      editing?.cards
        .map(
          (c) =>
            c.front.replace(/\r?\n/g, " ") +
            " :: " +
            c.back.replace(/\r?\n/g, " "),
        )
        .join("\n") || "",
    ),
    [questions, setQuestions] = useState<Question[]>(editing?.questions || []),
    [mode, setMode] = useState("write"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [generated, setGenerated] = useState(editing?.origin === "ai"),
    [difficulty, setDifficulty] = useState("Mixed"),
    [count, setCount] = useState("8");
  const api = useAIStatus(),
    abort = useRef<AbortController>(),
    fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const subjects = Array.from(
    new Set([
      subject,
      ...profile.subjects,
      ...(context.program === "dp" ? dpSubjects : SUBJECTS[context.program]),
    ]),
  );
  const generate = async () => {
    if (!source.trim()) {
      setError("Add a topic, source notes or learning goals.");
      return;
    }
    setBusy(true);
    setError("");
    abort.current = new AbortController();
    try {
      const r = await apiFetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.current.signal,
        body: JSON.stringify({
          profile: {
            ...context,
            level: level === "All" ? profile.level : level,
          },
          kind,
          subject,
          source,
          difficulty,
          count: Number(count),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setTitle(d.title);
      setSummary(d.summary);
      setBody(d.body);
      setCardText(
        d.cards
          .map(
            (c: { front: string; back: string }) =>
              c.front.replace(/\r?\n/g, " ") +
              " :: " +
              c.back.replace(/\r?\n/g, " "),
          )
          .join("\n"),
      );
      setQuestions(d.questions);
      setGenerated(true);
      setMode("write");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setError(e instanceof Error ? e.message : "Could not create a draft.");
    } finally {
      setBusy(false);
    }
  };
  const save = () => {
    setError("");
    try {
      const cards =
        kind === "flashcards"
          ? parseCardNotes(cardText).map((c, i) => ({
              ...c,
              id:
                editing?.cards[i]?.front === c.front &&
                editing.cards[i]?.back === c.back
                  ? editing.cards[i].id
                  : uid(),
            }))
          : [];
      const r = resourceSchema.parse({
        id: editing?.id || uid(),
        title: title.trim(),
        summary: summary.trim(),
        kind,
        subject,
        body: ["flashcards", "quiz"].includes(kind) ? "" : body,
        cards,
        questions: kind === "quiz" ? questions : [],
        sourceNotes: source,
        program: context.program,
        level: context.program === "dp" ? level : "All",
        examYear: context.examYear,
        origin: generated ? "ai" : "manual",
        starred: editing?.starred || false,
        createdAt: editing?.createdAt || new Date().toISOString(),
      });
      onSave(r);
    } catch (e) {
      setError(
        e instanceof Error && "issues" in e
          ? "Add a title and complete each item, including correct answers and explanations."
          : e instanceof Error
            ? e.message
            : "Check the resource.",
      );
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > 80000 || !/\.(txt|md)$/i.test(file.name)) {
      setError("Choose a text or Markdown file under 80 KB.");
      return;
    }
    const text = await file.text();
    if (text.length > 24000) {
      setError("Use up to 24,000 characters of notes.");
      return;
    }
    setSource(text);
    setError("");
  };
  const patchQuestion = (id: string, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">THE RESOURCE STUDIO</div>
          <h1>{editing ? "Make it your own." : "A good idea starts here."}</h1>
          <p>
            Turn a topic into something you can teach with, learn from, and
            keep.
          </p>
        </div>
        <span className="soft-badge">
          <Check size={15} />
          Editable. Exportable. Yours.
        </span>
      </div>
      <div className="studio-layout">
        <aside className="panel studio-options">
          <h2>What would you like to create?</h2>
          <div className="kind-picker" role="group" aria-label="Resource type">
            {resourceKinds.map((k) => (
              <button
                key={k}
                aria-pressed={kind === k}
                className={kind === k ? "selected" : ""}
                disabled={busy || !!editing}
                onClick={() => {
                  setKind(k);
                  if (!body.trim() || body === outlines[kind])
                    setBody(outlines[k] || "");
                }}
              >
                <KindIcon kind={k} size={19} />
                <span>{kindLabels[k]}</span>
                {kind === k && <Check size={16} />}
              </button>
            ))}
          </div>
          <Field label="Subject">
            <Picker
              value={subject}
              label="Resource subject"
              onChange={setSubject}
              options={subjects}
            />
          </Field>
          {context.program === "dp" && (
            <Field label="Level">
              <Picker
                value={level}
                label="Resource level"
                onChange={(v) => setLevel(v as Resource["level"])}
                options={["SL", "HL", "All"]}
              />
            </Field>
          )}
          <div className="studio-context">
            <strong>
              {context.program.toUpperCase()} · {context.examYear}
            </strong>
            <p>
              Use current school materials to keep content aligned with your
              course.
            </p>
          </div>
        </aside>
        <section className="panel studio-editor">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList>
              <TabsTrigger value="write">
                {editing ? "Edit resource" : "Create it yourself"}
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles size={15} />
                Start with AI
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ai">
              <AccessGate {...api} capability="resources" />
              <Field
                label="Your topic, notes, or learning goals"
                hint="Use material you have permission to use. Remove names and personal student information."
              >
                <Textarea
                  rows={9}
                  maxLength={24000}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="For example: price elasticity of demand, with a worked example and a misconception check."
                />
              </Field>
              <div className="button-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={15} />
                  Add notes (.txt / .md)
                </Button>
                <small>
                  {source.length.toLocaleString()} / 24,000 characters
                </small>
              </div>
              <input
                className="sr-only"
                tabIndex={-1}
                ref={fileRef}
                type="file"
                accept=".txt,.md"
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <div className="form-two">
                <Field label="Challenge">
                  <Picker
                    value={difficulty}
                    label="Challenge"
                    onChange={setDifficulty}
                    options={["Support", "Mixed", "Extension"]}
                  />
                </Field>
                {["flashcards", "quiz"].includes(kind) && (
                  <Field label="Practice items">
                    <Picker
                      value={count}
                      label="Practice items"
                      onChange={setCount}
                      options={["5", "8", "12", "20"]}
                    />
                  </Field>
                )}
              </div>
              <p className="muted">
                Notes and course context go to the connected AI provider. Review
                the draft before use.
              </p>
              <Button
                disabled={
                  busy ||
                  !source.trim() ||
                  !api.status?.text ||
                  !api.status.authenticated ||
                  api.status.tier !== "pro"
                }
                onClick={generate}
              >
                {busy ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Sparkles size={17} />
                )}
                {busy
                  ? "Creating your draft…"
                  : "Draft " + kindLabels[kind].toLowerCase()}
              </Button>
            </TabsContent>
            <TabsContent value="write">
              {generated && (
                <div className="info-note">
                  AI draft ready. Check facts, answers and course alignment
                  before saving.
                </div>
              )}
              <Field label="Resource title">
                <Input
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this resource a useful name"
                />
              </Field>
              <Field label="A short description">
                <Input
                  maxLength={400}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What will this help you understand or teach?"
                />
              </Field>
              {kind === "flashcards" && (
                <Field
                  label="Your flashcards"
                  hint="One card per line, with two colons between question and answer."
                >
                  <Textarea
                    rows={12}
                    value={cardText}
                    onChange={(e) => setCardText(e.target.value)}
                    placeholder={
                      "What is activation energy? :: The minimum energy needed to initiate a reaction.\nWhat does an enzyme do? :: Lowers activation energy."
                    }
                  />
                </Field>
              )}
              {kind === "quiz" && (
                <div className="question-editor">
                  {questions.map((q, i) => (
                    <div className="question-edit-card" key={q.id}>
                      <div className="section-heading">
                        <h3>Question {i + 1}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={"Remove question " + (i + 1)}
                          onClick={() =>
                            setQuestions(questions.filter((x) => x.id !== q.id))
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <Field label="Question">
                        <Input
                          maxLength={2000}
                          value={q.question}
                          onChange={(e) =>
                            patchQuestion(q.id, { question: e.target.value })
                          }
                        />
                      </Field>
                      <fieldset>
                        <legend>Options: select the correct answer</legend>
                        {q.options.map((o, n) => (
                          <div className="option-edit" key={n}>
                            <input
                              type="radio"
                              name={"correct-" + q.id}
                              checked={q.correctAnswer === n}
                              aria-label={"Option " + (n + 1) + " is correct"}
                              onChange={() =>
                                patchQuestion(q.id, { correctAnswer: n })
                              }
                            />
                            <Input
                              aria-label={
                                "Question " + (i + 1) + ", option " + (n + 1)
                              }
                              maxLength={1000}
                              value={o}
                              onChange={(e) =>
                                patchQuestion(q.id, {
                                  options: q.options.map((v, k) =>
                                    k === n ? e.target.value : v,
                                  ),
                                })
                              }
                            />
                          </div>
                        ))}
                      </fieldset>
                      <Field label="Explain why the answer is correct">
                        <Textarea
                          maxLength={4000}
                          rows={2}
                          value={q.explanation}
                          onChange={(e) =>
                            patchQuestion(q.id, { explanation: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    disabled={questions.length >= 30}
                    onClick={() =>
                      setQuestions([
                        ...questions,
                        {
                          id: uid(),
                          question: "",
                          options: ["", "", "", ""],
                          correctAnswer: 0,
                          explanation: "",
                        },
                      ])
                    }
                  >
                    <Plus size={16} />
                    Add a question
                  </Button>
                </div>
              )}
              {!["flashcards", "quiz"].includes(kind) && (
                <Tabs defaultValue="editor">
                  <TabsList>
                    <TabsTrigger value="editor">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="editor">
                    <Field
                      label="Resource content"
                      hint="Use Markdown headings, lists and tables."
                    >
                      <Textarea
                        rows={16}
                        maxLength={40000}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                      />
                    </Field>
                  </TabsContent>
                  <TabsContent value="preview">
                    <Markdown>
                      {body || "Your preview will appear here."}
                    </Markdown>
                  </TabsContent>
                </Tabs>
              )}
              <div className="editor-save">
                <p>Saved on this device. Export backups in Settings.</p>
                <Button onClick={save}>
                  <Save size={16} />
                  Save resource
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          {error && <ErrorNote>{error}</ErrorNote>}
        </section>
      </div>
    </>
  );
}
