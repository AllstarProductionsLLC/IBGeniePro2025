"use client";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Flame,
  Headphones,
  Plus,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  isDue,
  kindLabels,
  localDate,
  type Resource,
  type ResourceKind,
  type WorkspaceState,
} from "@/lib/workspace";
import { curriculum } from "@/lib/curriculum";
import { KindIcon, type Update } from "./shared";
import { TeacherDashboard } from "./teacher-dashboard";
import type { View } from "./workspace";
type Props = {
  state: WorkspaceState;
  update: Update;
  go: (v: View) => void;
  create: (k: ResourceKind) => void;
  study: (r: Resource) => void;
  coach: (s: string) => void;
};
export function Dashboard({ state, update, go, create, study, coach }: Props) {
  const teacher = state.profile.role === "teacher";
  if (teacher)
    return <TeacherDashboard state={state} go={go} create={create} />;
  const program = state.profile.program;
  const due = state.resources
    .filter(
      (r) => r.kind === "flashcards" && r.program === state.profile.program,
    )
    .map((resource) => ({
      resource,
      count: resource.cards.filter((c) =>
        isDue(
          state.reviews.find(
            (x) => x.resourceId === resource.id && x.cardId === c.id,
          ),
        ),
      ).length,
    }))
    .filter((r) => r.count);
  const total = due.reduce((n, r) => n + r.count, 0);
  const tasks = state.tasks
    .filter((t) => !t.done)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 3);
  const days = new Set([
    ...state.activity,
    ...state.attempts.map((a) => localDate(new Date(a.date))),
    ...state.focusSessions.map((a) => localDate(new Date(a.date))),
  ]);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + i);
    return d;
  });
  week[0].setHours(0, 0, 0, 0);
  const minutes = state.focusSessions
    .filter((s) => Date.parse(s.date) >= week[0].getTime())
    .reduce((n, s) => n + s.minutes, 0);
  const kinds: ResourceKind[] = teacher
    ? ["lesson-plan", "quiz", "rubric", "exit-ticket"]
    : ["flashcards", "quiz", "study-guide"];
  const name = state.profile.name
    ? ", " + state.profile.name.split(" ")[0]
    : "";
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {program.toUpperCase()} · {state.profile.yearGroup}
            {program === "dp"
              ? " · " + state.profile.examSession + " " + state.profile.examYear
              : ""}
          </div>
          <h1>
            {teacher
              ? "A little inspiration" + name + "."
              : program === "pyp"
                ? "What will you discover" + name + "?"
                : program === "myp"
                  ? "Make a new connection" + name + "."
                  : "Your next breakthrough" + name + "."}
          </h1>
          <p>
            {teacher
              ? "Less preparation. More room for great teaching."
              : "A clear plan, a curious mind, and one good place to start."}
          </p>
        </div>
        <span className="date-label">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString("en", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="overview-grid">
        <section className="focus-banner">
          <div className="eyebrow">
            <Sparkles size={15} />
            {teacher
              ? "YOUR TEACHING STUDIO"
              : "A LITTLE FOCUS GOES A LONG WAY"}
          </div>
          <h2>
            {teacher ? (
              <>
                Give your next lesson
                <br />a great starting point.
              </>
            ) : (
              <>
                {program === "pyp"
                  ? "Play with an idea."
                  : program === "myp"
                    ? "Make the connections."
                    : "Build your understanding."}
                <br />
                <span>
                  {program === "pyp"
                    ? "See where it takes you."
                    : program === "myp"
                      ? "Try it in a new way."
                      : "One good session at a time."}
                </span>
              </>
            )}
          </h2>
          <p>
            {teacher
              ? "Build a lesson, adapt the challenge, and check understanding with resources you can edit."
              : total
                ? total +
                  " cards are ready for a fresh look. Start a short review and see what sticks."
                : "Choose a subject, make your first resource, or make a little space to focus."}
          </p>
          <div className="button-row">
            <Button
              className="lime-button"
              onClick={() =>
                teacher
                  ? create("lesson-plan")
                  : program === "pyp"
                    ? go("practice")
                    : due[0]
                      ? study(due[0].resource)
                      : create("flashcards")
              }
            >
              {teacher
                ? "Plan a lesson"
                : program === "pyp"
                  ? "Play and discover"
                  : due[0]
                    ? "Start a quick review"
                    : "Create flashcards"}
              <ArrowRight size={17} />
            </Button>
            <button className="banner-secondary" onClick={() => go("planner")}>
              Plan my week <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="banner-foot">
            <Clock3 size={14} />
            One focused session is a good start
          </div>
          <div className="focus-geometry" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>✦</span>
          </div>
        </section>
        <section className="panel week-panel">
          <div className="section-heading">
            <h2>This week, at a glance</h2>
            <Flame size={20} />
          </div>
          <div className="week-days">
            {week.map((d) => (
              <div key={localDate(d)}>
                <small>
                  {d.toLocaleDateString("en", { weekday: "short" }).slice(0, 1)}
                </small>
                <span
                  className={
                    (days.has(localDate(d)) ? "active " : "") +
                    (localDate(d) === localDate() ? "today" : "")
                  }
                >
                  {days.has(localDate(d)) ? <Check size={16} /> : d.getDate()}
                </span>
              </div>
            ))}
          </div>
          <div className="week-stats">
            <div>
              <strong>
                {minutes}
                <small> min</small>
              </strong>
              <span>Focused this week</span>
            </div>
            <div>
              <strong>
                {
                  state.attempts.filter(
                    (a) => Date.parse(a.date) >= week[0].getTime(),
                  ).length
                }
              </strong>
              <span>Quizzes completed</span>
            </div>
          </div>
          <div className="gentle-note">
            <Target size={17} />
            <span>
              {days.size
                ? "Every session is another step forward."
                : "Your progress starts with your first session."}
            </span>
          </div>
        </section>
      </div>
      <div className="student-pathways">
        <button onClick={() => go("practice")}>
          <span>01</span>
          <strong>
            {program === "pyp"
              ? "Play and discover"
              : program === "myp"
                ? "Concept challenges"
                : "Recall and reasoning"}
          </strong>
          <p>
            {program === "pyp"
              ? "Match words, make predictions, try again."
              : "Connect ideas, test yourself and apply what you know."}
          </p>
          <ArrowRight size={18} />
        </button>
        <button onClick={() => go("assessment")}>
          <span>02</span>
          <strong>
            {program === "pyp" ? "Look at my learning" : "Check my work"}
          </strong>
          <p>See strengths and next steps in your own assignment.</p>
          <ArrowRight size={18} />
        </button>
        <button onClick={() => go("grammar")}>
          <span>03</span>
          <strong>My writing lab</strong>
          <p>Learn why an edit helps, and keep your own voice.</p>
          <ArrowRight size={18} />
        </button>
      </div>
      <section className="quick-create">
        <div className="section-heading">
          <h2>
            {teacher
              ? "What are we teaching next?"
              : "Make something that helps it click."}
          </h2>
          <button className="text-button" onClick={() => go("studio")}>
            Open studio <ArrowRight size={15} />
          </button>
        </div>
        <div className="tool-grid">
          {kinds.map((k, i) => (
            <button
              className={"tool-card tone-" + i}
              key={k}
              onClick={() => create(k)}
            >
              <span className="tool-icon">
                <KindIcon kind={k} />
              </span>
              <strong>{kindLabels[k]}</strong>
              <span>
                {
                  {
                    flashcards: "Build recall, one card at a time",
                    quiz: "Find out what you really know",
                    "study-guide": "Make the big ideas clear",
                    "lesson-plan": "Turn a topic into a great lesson",
                    rubric: "Make feedback actionable",
                    "exit-ticket": "Check what clicked today",
                    presentation: "Teach from a complete editable slide deck",
                    "scope-sequence": "Plan progression across programme years",
                  }[k]
                }
              </span>
              <ArrowUpRight className="tool-arrow" size={18} />
            </button>
          ))}
        </div>
      </section>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="section-heading">
            <h2>
              {teacher ? "Ready to make your own" : "Pick up a little momentum"}
            </h2>
            <button className="text-button" onClick={() => go("library")}>
              All resources <ArrowRight size={15} />
            </button>
          </div>
          <div className="resource-rows">
            {state.resources
              .filter(
                (r) =>
                  r.program === state.profile.program &&
                  (!teacher ||
                    ["lesson-plan", "exit-ticket", "rubric"].includes(r.kind)),
              )
              .slice(0, 3)
              .map((r) => (
                <button
                  className="resource-row"
                  key={r.id}
                  onClick={() =>
                    ["flashcards", "quiz"].includes(r.kind)
                      ? study(r)
                      : go("library")
                  }
                >
                  <span className={"resource-row-icon kind-" + r.kind}>
                    <KindIcon kind={r.kind} />
                  </span>
                  <span>
                    <strong>{r.title}</strong>
                    <small>
                      {r.subject} · {kindLabels[r.kind]}
                      {r.origin === "starter" ? " · Starter example" : ""}
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
          </div>
          <div className="subjects-strip">
            <small>YOUR SUBJECTS</small>
            <div>
              {state.profile.subjects.slice(0, 6).map((s, i) => (
                <button key={s} onClick={() => coach(s)}>
                  <span className={"subject-dot color-" + (i % 4)} />
                  {s}
                </button>
              ))}
              <button onClick={() => go("settings")} aria-label="Edit subjects">
                <Plus size={15} />
              </button>
            </div>
          </div>
        </section>
        <section className="panel next-panel">
          <div className="section-heading">
            <h2>Coming up</h2>
            <button className="text-button" onClick={() => go("planner")}>
              Plan <ArrowRight size={15} />
            </button>
          </div>
          {tasks.length ? (
            tasks.map((t) => (
              <div className="mini-task" key={t.id}>
                <Checkbox
                  id={"home-" + t.id}
                  checked={t.done}
                  onCheckedChange={(done) =>
                    update((s) => ({
                      ...s,
                      tasks: s.tasks.map((x) =>
                        x.id === t.id ? { ...x, done: !!done } : x,
                      ),
                    }))
                  }
                />
                <label htmlFor={"home-" + t.id}>
                  <strong>{t.title}</strong>
                  <small>
                    {t.subject} · {t.due}
                  </small>
                </label>
              </div>
            ))
          ) : (
            <div className="plan-prompt">
              <CalendarDays size={25} />
              <strong>Give your week some breathing room.</strong>
              <p>Add school deadlines and a few manageable study goals.</p>
              <Button variant="outline" onClick={() => go("planner")}>
                <Plus size={15} />
                Add a first task
              </Button>
            </div>
          )}
        </section>
      </div>
      <div className="coach-callout">
        <span className="coach-callout-icon">
          <Headphones size={25} />
        </span>
        <div>
          <h3>Talk it through. Then try it yourself.</h3>
          <p>
            Explore a tricky idea with an AI subject coach, by text or live
            voice.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => coach(state.profile.subjects[0] || "Biology")}
        >
          Meet your coaches <ArrowRight size={16} />
        </Button>
      </div>
      <button className="curriculum-strip" onClick={() => go("curriculum")}>
        <BookOpen size={18} />
        <span>
          <strong>The right curriculum for your cohort.</strong> Official
          sources and course transitions.
        </span>
        <span>
          Checked {curriculum.checkedAt}
          <ArrowRight size={16} />
        </span>
      </button>
    </>
  );
}
