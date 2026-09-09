"use client";
import {
  ArrowRight,
  ClipboardCheck,
  Presentation,
  Route,
  Sparkles,
  SpellCheck,
  CalendarDays,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResourceKind, WorkspaceState } from "@/lib/workspace";
import type { View } from "./workspace";
export function TeacherDashboard({
  state,
  go,
  create,
}: {
  state: WorkspaceState;
  go: (v: View) => void;
  create: (k: ResourceKind) => void;
}) {
  const p = state.profile.program,
    resources = state.resources.filter((r) => r.program === p),
    feedback = state.assessments.filter(
      (r) => r.role === "teacher" && r.program === p,
    );
  const programme = {
    pyp: {
      focus: "Inquiry, play and learner agency",
      description:
        "Plan meaningful inquiries, make thinking visible and celebrate each learner's progress.",
      sequence: "Map your programme of inquiry",
      detail:
        "Connect learning goals, concepts, skills and evidence across your school's PYP years.",
    },
    myp: {
      focus: "Concepts, connections and progression",
      description:
        "Build inquiry-led units, connect subject learning and guide students with criteria-based feedback.",
      sequence: "Connect five years of learning",
      detail:
        "Map concepts, global contexts, ATL and assessment evidence across MYP 1 to 5.",
    },
    dp: {
      focus: "Subject depth and assessment confidence",
      description:
        "Sequence demanding content, prepare purposeful lessons and give feedback that moves learning forward.",
      sequence: "Plan the two-year course",
      detail:
        "Sequence subject content, skills, formative checks and assessment preparation across DP 1 and 2.",
    },
  }[p];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {p.toUpperCase()} TEACHER STUDIO · {state.profile.yearGroup}
          </span>
          <h1>Your teaching, thoughtfully prepared.</h1>
          <p>{programme.description}</p>
        </div>
        <span className="soft-badge">{programme.focus}</span>
      </div>
      <div className="teaching-overview">
        <section className="teaching-hero">
          <span className="eyebrow">PREPARE THE NEXT LESSON</span>
          <h2>
            From the first question
            <br />
            to the final slide.
          </h2>
          <p>
            Create a classroom presentation with real teaching content,
            activities and speaker notes. Edit it, present here, or download
            PowerPoint.
          </p>
          <div className="button-row">
            <Button onClick={() => create("presentation")}>
              <Presentation size={18} />
              Create classroom slides <ArrowRight size={16} />
            </Button>
            <Button variant="outline" onClick={() => create("lesson-plan")}>
              Plan a lesson
            </Button>
          </div>
          <small>PowerPoint · Google Slides import · In-app presenter</small>
        </section>
        <section className="panel teaching-desk">
          <span className="eyebrow">ON YOUR DESK</span>
          <div className="teacher-stat">
            <strong>
              {resources.filter((r) => r.kind === "presentation").length}
            </strong>
            <span>Classroom decks</span>
          </div>
          <div className="teacher-stat">
            <strong>{feedback.filter((r) => !r.reviewed).length}</strong>
            <span>Feedback drafts to review</span>
          </div>
          <div className="teacher-stat">
            <strong>{state.learners.length}</strong>
            <span>Learners in your list</span>
          </div>
          <button className="text-button" onClick={() => go("assessment")}>
            Open assessment desk <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <section className="teacher-tools">
        <div className="section-heading">
          <h2>Practical tools for your {p.toUpperCase()} classroom</h2>
        </div>
        <div className="teacher-tool-grid">
          <button
            className="teacher-tool"
            onClick={() => create("scope-sequence")}
          >
            <Route size={26} />
            <span className="eyebrow">LONG-TERM PLANNING</span>
            <h3>{programme.sequence}</h3>
            <p>{programme.detail}</p>
            <span>
              Build scope and sequence <ArrowRight size={16} />
            </span>
          </button>
          <button className="teacher-tool" onClick={() => go("assessment")}>
            <ClipboardCheck size={26} />
            <span className="eyebrow">ASSESSMENT & REPORTING</span>
            <h3>Turn evidence into useful feedback.</h3>
            <p>
              Upload work, apply the task rubric, draft report comments and
              record your own judgement.
            </p>
            <span>
              Review student work <ArrowRight size={16} />
            </span>
          </button>
          <button className="teacher-tool" onClick={() => go("grammar")}>
            <SpellCheck size={26} />
            <span className="eyebrow">WRITING SUPPORT</span>
            <h3>Explain the edit, teach the pattern.</h3>
            <p>
              Check grammar and clarity in learning materials or discuss
              specific improvements with students.
            </p>
            <span>
              Open writing lab <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </section>
      <div className="teaching-bottom">
        <section className="panel">
          <div className="section-heading">
            <h2>Build a complete lesson kit</h2>
            <Sparkles size={21} />
          </div>
          <p>
            Pair your presentation with a quick understanding check and
            take-away practice.
          </p>
          <div className="lesson-kit-actions">
            <Button variant="outline" onClick={() => create("quiz")}>
              Practice quiz
            </Button>
            <Button variant="outline" onClick={() => create("exit-ticket")}>
              Exit ticket
            </Button>
            <Button variant="outline" onClick={() => create("rubric")}>
              Formative rubric
            </Button>
            <Button variant="outline" onClick={() => create("flashcards")}>
              Vocabulary cards
            </Button>
          </div>
          <button className="text-button" onClick={() => go("library")}>
            Open teaching library <ArrowRight size={16} />
          </button>
        </section>
        <section className="panel teaching-links">
          <button onClick={() => go("planner")}>
            <CalendarDays size={23} />
            <span>
              <strong>Teaching calendar</strong>
              <small>Keep lessons and deadlines in view</small>
            </span>
            <ArrowRight size={16} />
          </button>
          <button onClick={() => go("curriculum")}>
            <BookOpen size={23} />
            <span>
              <strong>Curriculum and course changes</strong>
              <small>Check official sources for your cohort</small>
            </span>
            <ArrowRight size={16} />
          </button>
          <button onClick={() => go("coach")}>
            <MessageCircle size={23} />
            <span>
              <strong>Think it through with a coach</strong>
              <small>Talk through an explanation or lesson idea</small>
            </span>
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </>
  );
}
