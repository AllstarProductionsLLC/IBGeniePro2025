import { z } from "zod";

export const BRAND_NAME = "IB Genie";
export const BRAND_URL = "https://IBgenie.com";
export const BRAND_DOMAIN = "IBgenie.com";
export const programYears = { pyp: 6, myp: 5, dp: 2 } as const;
export const slideSchema = z.object({
  id: z.string().min(1).max(100),
  layout: z.enum(["title", "explain", "activity", "check"]),
  title: z.string().min(1).max(90),
  bullets: z.array(z.string().min(1).max(160)).max(5),
  prompt: z.string().max(240),
  notes: z.string().max(4000),
});
export const presentationSchema = z
  .object({
    slides: z.array(slideSchema).min(1).max(24),
  })
  .refine(
    (p) => new Set(p.slides.map((s) => s.id)).size === p.slides.length,
    "Slide IDs must be unique",
  );
export type ClassroomSlide = z.infer<typeof slideSchema>;
export type Presentation = z.infer<typeof presentationSchema>;
export const sequenceUnitSchema = z.object({
  id: z.string().min(1).max(100),
  year: z.number().int().min(1).max(6),
  title: z.string().min(1).max(120),
  weeks: z.number().int().min(1).max(40),
  goals: z.string().min(1).max(1400),
  inquiry: z.string().max(800),
  skills: z.string().max(800),
  assessment: z.string().max(1200),
  connections: z.string().max(800),
});
export const sequenceSchema = z
  .object({
    years: z.number().int().min(1).max(6),
    units: z.array(sequenceUnitSchema).min(1).max(36),
  })
  .superRefine((s, ctx) => {
    if (new Set(s.units.map((u) => u.id)).size !== s.units.length)
      ctx.addIssue({ code: "custom", message: "Unit IDs must be unique" });
    if (s.units.some((u) => u.year > s.years))
      ctx.addIssue({
        code: "custom",
        message: "A unit falls outside the selected years",
      });
    for (let year = 1; year <= s.years; year++) {
      const units = s.units.filter((u) => u.year === year);
      if (!units.length)
        ctx.addIssue({
          code: "custom",
          message: "Include at least one unit in each year",
        });
      if (units.reduce((n, u) => n + u.weeks, 0) > 52)
        ctx.addIssue({
          code: "custom",
          message: "A year cannot exceed 52 teaching weeks",
        });
    }
  });
export type Sequence = z.infer<typeof sequenceSchema>;
export type SequenceUnit = z.infer<typeof sequenceUnitSchema>;
export const criterionSchema = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(140),
  max: z.number().int().min(1).max(100).nullable(),
  descriptors: z.string().min(10).max(4000),
});
export type Criterion = z.infer<typeof criterionSchema>;
export const feedbackSchema = z.object({
  overview: z.string().min(1).max(1800),
  strengths: z.array(z.string().min(1).max(800)).min(1).max(5),
  nextSteps: z.array(z.string().min(1).max(800)).min(1).max(5),
  criteria: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        score: z.number().int().min(0).max(100).nullable(),
        evidence: z.string().max(600),
        rationale: z.string().min(1).max(1400),
        nextStep: z.string().min(1).max(800),
      }),
    )
    .max(8),
  comment: z.string().min(1).max(2400),
});
export type Feedback = z.infer<typeof feedbackSchema>;
export const grammarSchema = z.object({
  summary: z.string().min(1).max(1200),
  suggestions: z
    .array(
      z.object({
        original: z.string().min(1).max(500),
        replacement: z.string().max(700),
        reason: z.string().min(1).max(800),
        category: z.enum(["Grammar", "Spelling", "Punctuation", "Clarity"]),
      }),
    )
    .max(20),
  practice: z.string().min(1).max(1200),
});
export type GrammarReport = z.infer<typeof grammarSchema>;
export const learnerSchema = z.object({
  id: z.string().min(1).max(100),
  alias: z.string().min(1).max(60),
  group: z.string().max(60),
});
export const assessmentRecordSchema = z.object({
  id: z.string().min(1).max(100),
  learnerId: z.string().max(100),
  learnerAlias: z.string().max(60),
  title: z.string().min(1).max(150),
  subject: z.string().min(1).max(100),
  program: z.enum(["pyp", "myp", "dp"]),
  yearGroup: z.string().max(30),
  examYear: z.number().int().min(2026).max(2040),
  role: z.enum(["teacher", "student"]),
  task: z.string().max(4000).default(""),
  level: z.enum(["SL", "HL", "All"]).default("All"),
  examSession: z.enum(["May", "November"]).default("May"),
  rubricSource: z.string().max(300),
  criteria: z.array(criterionSchema).max(8),
  report: feedbackSchema,
  // Raw submissions and uploaded files are deliberately not persisted.
  teacherComment: z.string().max(4000),
  teacherGrade: z.string().max(60),
  reviewed: z.boolean(),
  createdAt: z.string().datetime(),
});
export type AssessmentRecord = z.infer<typeof assessmentRecordSchema>;
export const assessmentSources = {
  pyp: "https://ibo.org/programmes/primary-years-programme/curriculum/the-learner/",
  myp: "https://ibo.org/programmes/middle-years-programme/assessment-and-exams/",
  dp: "https://ibo.org/programmes/diploma-programme/assessment-and-exams/understanding-ib-assessment/",
};
export const assessmentGuidance = {
  pyp: "Focus on learning goals, learner agency and next steps. Use your school's success criteria. This tool does not assign PYP numerical grades.",
  myp: "Use the current subject-group criteria and year-appropriate descriptors, or the correct project rubric. Select only the criteria this task assesses. A single task is not a final subject grade.",
  dp: "Use the current subject, SL/HL level, component and examination-session rubric. Component marks do not convert to a course grade without the applicable weighting and boundaries.",
};
export function toolsForRole(role: "teacher" | "student") {
  return role === "teacher"
    ? ([
        "presentation",
        "lesson-plan",
        "scope-sequence",
        "quiz",
        "rubric",
        "exit-ticket",
        "flashcards",
        "study-guide",
      ] as const)
    : (["flashcards", "quiz", "study-guide"] as const);
}
export function canUseResource(role: "teacher" | "student", kind: string) {
  return (toolsForRole(role) as readonly string[]).includes(kind);
}
export function sequenceMarkdown(sequence: Sequence) {
  return Array.from({ length: sequence.years }, (_, i) => {
    const year = i + 1;
    return (
      `## Year ${year}\n\n` +
      sequence.units
        .filter((u) => u.year === year)
        .map(
          (u) =>
            `### ${u.title} · ${u.weeks} weeks\n\n**Learning goals**\n${u.goals}\n\n**Inquiry and concepts**\n${u.inquiry}\n\n**Approaches to learning**\n${u.skills}\n\n**Assessment evidence**\n${u.assessment}\n\n**Connections and progression**\n${u.connections}`,
        )
        .join("\n\n")
    );
  }).join("\n\n");
}
export function presentationMarkdown(presentation: Presentation) {
  return presentation.slides
    .map(
      (s, i) =>
        `## Slide ${i + 1}: ${s.title}\n\n${s.bullets.map((b) => "- " + b).join("\n")}\n\n${s.prompt}\n\n**Speaker notes**\n${s.notes}`,
    )
    .join("\n\n");
}
export function feedbackMarkdown(record: AssessmentRecord) {
  const r = record.report;
  return (
    `# ${record.title}\n\n${record.learnerAlias ? record.learnerAlias + " · " : ""}${record.program.toUpperCase()} · ${record.subject} · ${record.yearGroup}${record.program === "dp" ? " · " + record.level + " · " + record.examSession + " " + record.examYear : ""}\n\n${record.reviewed && record.role === "teacher" ? "Teacher-reviewed formative feedback" : "AI draft for review"}\n\n${r.overview}\n\n## Strengths\n${r.strengths.map((s) => "- " + s).join("\n")}\n\n## Next steps\n${r.nextSteps.map((s) => "- " + s).join("\n")}\n\n` +
    r.criteria
      .map((c) => {
        const def = record.criteria.find((d) => d.id === c.id);
        return `## ${def?.label || "Criterion"}${c.score !== null && def?.max ? ` · Suggested ${c.score}/${def.max}` : ""}\n\n${c.evidence ? `Evidence: “${c.evidence}”\n\n` : "Evidence is insufficient for a mark.\n\n"}${c.rationale}\n\nNext: ${c.nextStep}`;
      })
      .join("\n\n") +
    `\n\n## ${record.reviewed ? "Reviewed comment" : "Draft comment"}\n${record.teacherComment || r.comment}\n\n${record.role === "teacher" && record.teacherGrade ? `Teacher's recorded judgement: ${record.teacherGrade}\n\n` : ""}Rubric: ${record.rubricSource || "General formative feedback; no numerical assessment"}\n\nNot an official IB grade.\n\n${BRAND_URL}\n`
  );
}
