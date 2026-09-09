"use client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ClipboardCheck,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import {
  assessmentGuidance,
  assessmentSources,
  assessmentRecordSchema,
  criterionSchema,
  feedbackMarkdown,
  type AssessmentRecord,
  type Criterion,
} from "@/lib/learning-tools";
import {
  csvCell,
  downloadText,
  uid,
  yearGroups,
  type WorkspaceState,
} from "@/lib/workspace";
import { AccessGate, useAIStatus } from "./access-gate";
import { ErrorNote, Field, Picker, SourceLink, type Update } from "./shared";
import { WorkInput } from "./work-input";
import { ExportActions } from "./export-actions";
export function AssessmentWorkspace({
  state,
  update,
}: {
  state: WorkspaceState;
  update: Update;
}) {
  const { profile } = state,
    teacher = profile.role === "teacher",
    api = useAIStatus();
  const [title, setTitle] = useState(""),
    [subject, setSubject] = useState(profile.subjects[0] || "Inquiry"),
    [year, setYear] = useState(
      profile.yearGroup === "Multiple years" ? "Year 1" : profile.yearGroup,
    ),
    [task, setTask] = useState(""),
    [work, setWork] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]),
    [rubricSource, setRubricSource] = useState(""),
    [scoring, setScoring] = useState(false),
    [consent, setConsent] = useState(false);
  const [learner, setLearner] = useState("none"),
    [alias, setAlias] = useState(""),
    [group, setGroup] = useState("");
  const [draft, setDraft] = useState<AssessmentRecord>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const request = useRef<AbortController>();
  useEffect(() => () => request.current?.abort(), []);
  const records = state.assessments.filter(
    (a) => a.role === profile.role && a.program === profile.program,
  );
  const eligible =
    api.status?.text && api.status.authenticated && api.status.tier === "pro";
  const addLearner = () => {
    if (!alias.trim() || state.learners.length >= 200) return;
    const id = uid();
    update((s) => ({
      ...s,
      learners: [
        ...s.learners,
        { id, alias: alias.trim(), group: group.trim() },
      ],
    }));
    setLearner(id);
    setAlias("");
  };
  const addCriterion = () =>
    setCriteria((c) => [
      ...c,
      {
        id: uid(),
        label: "",
        max: profile.program === "myp" ? 8 : null,
        descriptors: "",
      },
    ]);
  const patchCriterion = (id: string, p: Partial<Criterion>) =>
    setCriteria((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));
  const generate = async () => {
    setError("");
    setNotice("");
    if (!title.trim() || task.trim().length < 10 || work.trim().length < 30) {
      setError(
        "Add a title, the assignment instructions and a readable selection of work.",
      );
      return;
    }
    if (
      criteria.some((c) => !criterionSchema.safeParse(c).success) ||
      criteria.reduce((n, c) => n + c.descriptors.length, 0) > 16000
    ) {
      setError(
        "Complete each criterion with its current descriptors. Use up to 16,000 rubric characters in total.",
      );
      return;
    }
    if (
      scoring &&
      (!criteria.length ||
        !rubricSource.trim() ||
        criteria.every((c) => c.max === null))
    ) {
      setError(
        "Add the applicable rubric, its source and criterion maximum marks before requesting mark suggestions.",
      );
      return;
    }
    setBusy(true);
    request.current = new AbortController();
    try {
      const response = await apiFetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: request.current.signal,
        body: JSON.stringify({
          profile: { ...profile, yearGroup: year },
          subject,
          task,
          work,
          criteria,
          rubricSource,
          scoring: profile.program !== "pyp" && scoring,
          consent,
        }),
      });
      const report = await response.json();
      if (!response.ok) throw new Error(report.error);
      const selected = state.learners.find((l) => l.id === learner);
      setDraft(
        assessmentRecordSchema.parse({
          id: uid(),
          learnerId: teacher ? selected?.id || "" : "",
          learnerAlias: teacher ? selected?.alias || "" : "",
          title: title.trim(),
          subject,
          program: profile.program,
          yearGroup: year,
          examYear: profile.examYear,
          role: profile.role,
          task,
          level: profile.program === "dp" ? profile.level : "All",
          examSession: profile.examSession,
          rubricSource,
          criteria,
          report,
          teacherComment: report.comment,
          teacherGrade: "",
          reviewed: false,
          createdAt: new Date().toISOString(),
        }),
      );
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setError(
          e instanceof Error ? e.message : "Feedback could not be created.",
        );
    } finally {
      setBusy(false);
    }
  };
  const save = () => {
    if (!draft) return;
    if (
      state.assessments.length >= 200 &&
      !state.assessments.some((a) => a.id === draft.id)
    ) {
      setError(
        "Export and remove an older feedback record before saving another.",
      );
      return;
    }
    update((s) => ({
      ...s,
      assessments: [draft, ...s.assessments.filter((a) => a.id !== draft.id)],
    }));
    setNotice(
      "Feedback saved on this device. The uploaded file and submission text were not saved.",
    );
  };
  const exportRegister = () =>
    downloadText(
      "Learner,Task,Subject,Programme,Year,Status,Teacher judgement,Comment,Created with\r\n" +
        records
          .map((r) =>
            [
              r.learnerAlias,
              r.title,
              r.subject,
              r.program.toUpperCase(),
              r.yearGroup,
              r.reviewed ? "Teacher reviewed" : "AI draft",
              r.teacherGrade,
              r.teacherComment || r.report.comment,
              "https://IBgenie.com",
            ]
              .map(csvCell)
              .join(","),
          )
          .join("\r\n"),
      "ibgenie-feedback-register.csv",
      "text/csv",
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {teacher ? "ASSESSMENT DESK" : "MY WORK, MY NEXT STEP"} ·{" "}
            {profile.program.toUpperCase()}
          </span>
          <h1>
            {teacher
              ? "Thoughtful feedback, ready for your judgement."
              : profile.program === "pyp"
                ? "See what you did well."
                : "Understand how to improve your work."}
          </h1>
          <p>
            {teacher
              ? "Review one learner's work, draft comments and keep your assessment decisions together."
              : "Bring your own work. Find strengths, check the criteria and choose what to improve next."}
          </p>
        </div>
        <ClipboardCheck size={32} />
      </div>
      <div className="assessment-layout">
        <section className="panel assessment-form">
          <h2>{teacher ? "Review student work" : "Start a self-check"}</h2>
          <AccessGate {...api} capability="rubric" />
          <fieldset disabled={busy} className="tool-fieldset">
            {teacher && (
              <Field
                label="Learner"
                hint="Use an alias or class code. Manage your list below."
              >
                <Picker
                  label="Learner"
                  value={learner}
                  onChange={setLearner}
                  options={[
                    { value: "none", label: "No learner label" },
                    ...state.learners.map((l) => ({
                      value: l.id,
                      label: l.alias + (l.group ? " · " + l.group : ""),
                    })),
                  ]}
                />
              </Field>
            )}
            <Field label="Assignment title">
              <Input
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  profile.program === "pyp"
                    ? "My explanation of how plants grow"
                    : "For example: evaluating evidence in an investigation"
                }
              />
            </Field>
            <div className="form-two">
              <Field label="Subject">
                <Input
                  maxLength={100}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Field>
              <Field label="Programme year">
                <Picker
                  label="Assessment year"
                  value={year}
                  onChange={setYear}
                  options={yearGroups(profile.program, "student")}
                />
              </Field>
            </div>
            <Field label="Assignment instructions and learning goals">
              <Textarea
                rows={4}
                maxLength={4000}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What was the learner asked to do? Include the task requirements and the kind of feedback you need."
              />
            </Field>
            <WorkInput value={work} onChange={setWork} disabled={busy} />
            <details className="rubric-builder">
              <summary>
                Assessment criteria{" "}
                {criteria.length
                  ? `(${criteria.length})`
                  : "and optional mark suggestions"}
              </summary>
              <p>{assessmentGuidance[profile.program]}</p>
              <SourceLink href={assessmentSources[profile.program]}>
                IB assessment guidance
              </SourceLink>
              <Field
                label="Rubric source and version"
                hint="Use your current school-provided guide or rubric. Include subject, year, component and examination cohort as relevant."
              >
                <Input
                  maxLength={300}
                  value={rubricSource}
                  onChange={(e) => setRubricSource(e.target.value)}
                  placeholder="Guide / task rubric title and version"
                />
              </Field>
              {criteria.map((c, i) => (
                <section className="criterion-editor" key={c.id}>
                  <div className="section-heading">
                    <h3>Criterion {i + 1}</h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={"Remove criterion " + (i + 1)}
                      onClick={() =>
                        setCriteria((cs) => cs.filter((x) => x.id !== c.id))
                      }
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                  <Field label="Criterion name">
                    <Input
                      maxLength={140}
                      value={c.label}
                      onChange={(e) =>
                        patchCriterion(c.id, { label: e.target.value })
                      }
                      placeholder="Name from your task rubric"
                    />
                  </Field>
                  {profile.program !== "pyp" && (
                    <Field
                      label="Maximum marks"
                      hint="Leave blank for qualitative feedback."
                    >
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={c.max ?? ""}
                        onChange={(e) =>
                          patchCriterion(c.id, {
                            max: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </Field>
                  )}
                  <Field label="Current level descriptors / success criteria">
                    <Textarea
                      rows={5}
                      maxLength={4000}
                      value={c.descriptors}
                      onChange={(e) =>
                        patchCriterion(c.id, { descriptors: e.target.value })
                      }
                      placeholder="Paste the descriptors for this criterion from materials you have permission to use."
                    />
                  </Field>
                </section>
              ))}
              <Button
                variant="outline"
                onClick={addCriterion}
                disabled={criteria.length >= 8}
              >
                <Plus size={16} />
                Add criterion
              </Button>
              {profile.program !== "pyp" && (
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={scoring}
                    onChange={(e) => setScoring(e.target.checked)}
                  />
                  Suggest tentative criterion marks using this rubric
                </label>
              )}
            </details>
            <p className="muted-note">
              Without a rubric, you receive general formative feedback. Files
              are read on this device. Only the text, task and rubric below your
              consent go to the connected AI provider.
            </p>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I have permission to share this work for AI feedback and have
              removed personal details.
            </label>
            <Button
              disabled={!eligible || !consent || busy || !work.trim()}
              onClick={() => void generate()}
            >
              {busy ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <ClipboardCheck size={17} />
              )}{" "}
              {busy
                ? "Reading the work…"
                : teacher
                  ? "Draft comments and feedback"
                  : "Check my work"}
            </Button>
          </fieldset>
          {error && <ErrorNote>{error}</ErrorNote>}
        </section>
        <aside className="assessment-results">
          {draft ? (
            <section className="panel feedback-report">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    {draft.reviewed ? "TEACHER REVIEWED" : "AI DRAFT"}
                  </span>
                  <h2>{draft.title}</h2>
                  <p>
                    {draft.learnerAlias}
                    {draft.learnerAlias ? " · " : ""}
                    {draft.subject} · {draft.yearGroup}
                  </p>
                </div>
                <Check size={21} />
              </div>
              <p>{draft.report.overview}</p>
              <div className="feedback-strengths">
                <h3>What's working</h3>
                <ul>
                  {draft.report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="feedback-next">
                <h3>Try next</h3>
                <ol>
                  {draft.report.nextSteps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
              {draft.report.criteria.map((c) => {
                const def = draft.criteria.find((d) => d.id === c.id);
                return (
                  <section className="criterion-result" key={c.id}>
                    <div className="section-heading">
                      <h3>{def?.label}</h3>
                      {c.score !== null && (
                        <span className="soft-badge">
                          Suggested {c.score} / {def?.max}
                        </span>
                      )}
                    </div>
                    {c.evidence ? (
                      <blockquote>“{c.evidence}”</blockquote>
                    ) : (
                      <p className="muted">
                        No verified quotation. No mark suggested.
                      </p>
                    )}
                    <p>{c.rationale}</p>
                    <p>
                      <strong>Next step:</strong> {c.nextStep}
                    </p>
                  </section>
                );
              })}
              <Field
                label={
                  teacher
                    ? "Draft report comment"
                    : "Reflection to take forward"
                }
              >
                <Textarea
                  rows={6}
                  maxLength={4000}
                  value={draft.teacherComment}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      teacherComment: e.target.value,
                      reviewed: false,
                    })
                  }
                />
              </Field>
              {teacher && (
                <>
                  <Field
                    label="Your recorded judgement"
                    hint="Enter your own grade, criterion marks or qualitative judgement after reviewing the work and applicable rubric. AI suggestions are not an official IB grade."
                  >
                    <Input
                      maxLength={60}
                      value={draft.teacherGrade}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          teacherGrade: e.target.value,
                          reviewed: false,
                        })
                      }
                      placeholder={
                        profile.program === "pyp"
                          ? "For example: developing independence"
                          : "For example: A 6/8, C 5/8"
                      }
                    />
                  </Field>
                  <label className="inline-check">
                    <input
                      type="checkbox"
                      checked={draft.reviewed}
                      onChange={(e) =>
                        setDraft({ ...draft, reviewed: e.target.checked })
                      }
                    />
                    I reviewed the work, criteria, comments and recorded
                    judgement.
                  </label>
                </>
              )}
              <div className="button-row">
                {teacher && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTitle(draft.title);
                      setSubject(draft.subject);
                      setYear(draft.yearGroup);
                      setTask(draft.task);
                      setCriteria(draft.criteria);
                      setRubricSource(draft.rubricSource);
                      setScoring(draft.criteria.some((c) => c.max !== null));
                      setWork("");
                      setLearner("none");
                      setDraft(undefined);
                      setNotice("");
                    }}
                  >
                    Use task and rubric for next learner
                  </Button>
                )}
                <Button onClick={save}>
                  <Save size={16} />
                  Save feedback
                </Button>
                <ExportActions
                  title={draft.title}
                  markdown={feedbackMarkdown(draft)}
                />
              </div>
              <p className="muted-note">
                {draft.reviewed
                  ? "Teacher-reviewed formative feedback."
                  : "AI draft for review."}{" "}
                This is not an official IB grade. Saved reports include evidence
                excerpts. Use aliases on shared devices.
              </p>
              {notice && (
                <p role="status" className="info-note">
                  {notice}
                </p>
              )}
            </section>
          ) : (
            <section className="panel feedback-empty">
              <ClipboardCheck size={38} />
              <h2>
                {teacher
                  ? "Evidence before judgement."
                  : "A clearer next step."}
              </h2>
              <p>
                {profile.program === "pyp"
                  ? "Find a strength, notice something new and choose one small goal."
                  : "Your feedback will show strengths, practical next steps and evidence for any supplied criteria."}
              </p>
              <p className="muted">{assessmentGuidance[profile.program]}</p>
            </section>
          )}
          {teacher && (
            <section className="panel learner-list">
              <h2>
                <Users size={20} />
                Your learner list
              </h2>
              <p className="muted">
                A list on this device, separate from your Wix account details.
              </p>
              <Field label="Learner alias / code">
                <Input
                  maxLength={60}
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Learner 01"
                />
              </Field>
              <Field label="Class / group">
                <Input
                  maxLength={60}
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="MYP 3 Science"
                />
              </Field>
              <Button
                variant="outline"
                disabled={!alias.trim() || state.learners.length >= 200}
                onClick={addLearner}
              >
                <Plus size={16} />
                Add learner
              </Button>
              <ul>
                {state.learners.map((l) => (
                  <li key={l.id}>
                    <span>
                      {l.alias} <small>{l.group}</small>
                    </span>
                    <button
                      aria-label={"Remove " + l.alias + " from learner list"}
                      onClick={() => {
                        update((s) => ({
                          ...s,
                          learners: s.learners.filter((x) => x.id !== l.id),
                        }));
                        if (learner === l.id) setLearner("none");
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
      <section className="panel feedback-history">
        <div className="section-heading">
          <h2>{teacher ? "Saved feedback register" : "My saved feedback"}</h2>
          {teacher && (
            <Button
              variant="outline"
              disabled={!records.length}
              onClick={exportRegister}
            >
              Export register CSV
            </Button>
          )}
        </div>
        {records.length ? (
          records.map((r) => (
            <div className="feedback-history-row" key={r.id}>
              <button
                onClick={() => {
                  setDraft(r);
                  setNotice("");
                }}
              >
                <strong>
                  {r.learnerAlias ? r.learnerAlias + " · " : ""}
                  {r.title}
                </strong>
                <small>
                  {r.subject} · {r.reviewed ? "Teacher reviewed" : "AI draft"} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </small>
              </button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={"Delete saved feedback for " + r.title}
                onClick={() => {
                  update((s) => ({
                    ...s,
                    assessments: s.assessments.filter((a) => a.id !== r.id),
                  }));
                  if (draft?.id === r.id) setDraft(undefined);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        ) : (
          <p className="muted">
            Save a reviewed draft to return to it here. Export backups in
            Settings.
          </p>
        )}
      </section>
    </>
  );
}
