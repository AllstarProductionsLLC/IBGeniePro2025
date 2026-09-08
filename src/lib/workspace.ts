import { z } from "zod";
export const resourceKinds = [
  "flashcards",
  "quiz",
  "study-guide",
  "lesson-plan",
  "rubric",
  "exit-ticket",
] as const;
export type ResourceKind = (typeof resourceKinds)[number];
export const kindLabels: Record<ResourceKind, string> = {
  flashcards: "Flashcards",
  quiz: "Practice quiz",
  "study-guide": "Study guide",
  "lesson-plan": "Lesson plan",
  rubric: "Formative rubric",
  "exit-ticket": "Exit ticket",
};
export const profileSchema = z.object({
  name: z.string().max(60),
  role: z.enum(["student", "teacher"]),
  program: z.enum(["dp", "myp", "pyp"]),
  examYear: z.number().int().min(2026).max(2040),
  examSession: z.enum(["May", "November"]),
  level: z.enum(["SL", "HL"]),
  subjects: z.array(z.string().min(1).max(100)).max(12),
});
export type Profile = z.infer<typeof profileSchema>;
export const defaultProfile: Profile = {
  name: "",
  role: "student",
  program: "dp",
  examYear: 2027,
  examSession: "May",
  level: "HL",
  subjects: [
    "Mathematics: AA",
    "Biology",
    "Economics",
    "English A",
    "Chemistry",
    "Spanish B",
  ],
};
export const dpSubjects = [
  "Mathematics: AA",
  "Mathematics: AI",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Business management",
  "History",
  "Psychology",
  "Computer science",
  "English A",
  "Language A",
  "Spanish B",
  "French B",
  "Language B",
  "Language ab initio",
  "Geography",
  "Global politics",
  "Environmental systems and societies",
  "Design technology",
  "Visual arts",
  "Music",
  "Theatre",
  "Dance",
  "Sports, exercise and health science",
  "TOK",
  "Extended essay",
  "CAS",
];
const cardSchema = z.object({
  id: z.string().min(1).max(100),
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(4000),
});
const questionSchema = z
  .object({
    id: z.string().min(1).max(100),
    question: z.string().min(1).max(2000),
    options: z.array(z.string().min(1).max(1000)).min(2).max(6),
    correctAnswer: z.number().int().min(0),
    explanation: z.string().min(1).max(4000),
  })
  .refine(
    (q) => q.correctAnswer < q.options.length,
    "Answer must refer to an option",
  );
export const resourceContentSchema = z.object({
  title: z.string().min(1).max(150),
  summary: z.string().max(400),
  body: z.string().max(40000),
  cards: z.array(cardSchema).max(60),
  questions: z.array(questionSchema).max(30),
});
export const resourceSchema = resourceContentSchema
  .extend({
    id: z.string().min(1).max(100),
    kind: z.enum(resourceKinds),
    subject: z.string().min(1).max(100),
    program: z.enum(["dp", "myp", "pyp"]),
    level: z.enum(["SL", "HL", "All"]),
    examYear: z.number().int().min(2026).max(2040),
    createdAt: z.string().datetime(),
    origin: z.enum(["starter", "manual", "ai"]),
    starred: z.boolean(),
    sourceNotes: z.string().max(24000),
  })
  .superRefine((r, ctx) => {
    if (r.kind === "flashcards" && !r.cards.length)
      ctx.addIssue({ code: "custom", message: "Add at least one flashcard" });
    if (r.kind === "quiz" && !r.questions.length)
      ctx.addIssue({ code: "custom", message: "Add at least one question" });
    if (!["flashcards", "quiz"].includes(r.kind) && !r.body.trim())
      ctx.addIssue({ code: "custom", message: "Add resource content" });
    if (
      new Set(r.cards.map((c) => c.id)).size !== r.cards.length ||
      new Set(r.questions.map((c) => c.id)).size !== r.questions.length
    )
      ctx.addIssue({ code: "custom", message: "Item IDs must be unique" });
  });
export type Resource = z.infer<typeof resourceSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Question = z.infer<typeof questionSchema>;
export const taskSchema = z.object({
  id: z.string().max(100),
  title: z.string().min(1).max(200),
  subject: z.string().max(100),
  due: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((s) => {
      const d = new Date(s);
      return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
    }),
  kind: z.enum(["Study", "IA", "EE", "TOK", "CAS", "Lesson"]),
  done: z.boolean(),
});
export type Task = z.infer<typeof taskSchema>;
const reviewSchema = z.object({
  resourceId: z.string(),
  cardId: z.string(),
  due: z.string().datetime(),
  interval: z.number().min(0).max(365),
  repetitions: z.number().int().min(0),
});
export type Review = z.infer<typeof reviewSchema>;
const attemptSchema = z
  .object({
    id: z.string(),
    resourceId: z.string(),
    subject: z.string(),
    date: z.string().datetime(),
    correct: z.number().int().min(0),
    total: z.number().int().min(1),
    wrongIds: z.array(z.string()),
  })
  .refine((a) => a.correct <= a.total);
export const workspaceSchema = z
  .object({
    version: z.literal(1),
    profile: profileSchema,
    resources: z.array(resourceSchema).max(500),
    tasks: z.array(taskSchema).max(1000),
    reviews: z.array(reviewSchema).max(10000),
    attempts: z.array(attemptSchema).max(2000),
    core: z.record(z.string().max(120), z.string().max(12000)),
    focusSessions: z
      .array(
        z.object({
          date: z.string().datetime(),
          minutes: z.number().min(1).max(120),
        }),
      )
      .max(2000),
    activity: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .max(366)
      .default([]),
  })
  .refine(
    (w) => new Set(w.resources.map((r) => r.id)).size === w.resources.length,
    "Resource IDs must be unique",
  );
export type WorkspaceState = z.infer<typeof workspaceSchema>;
export function uid() {
  return crypto.randomUUID();
}
export function localDate(date = new Date()) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}
export function scheduleReview(
  previous: Review | undefined,
  rating: "again" | "hard" | "good" | "easy",
  resourceId: string,
  cardId: string,
  now = new Date(),
): Review {
  const old = previous?.interval ?? 0;
  const interval = Math.min(
    365,
    rating === "again"
      ? 0
      : rating === "hard"
        ? Math.max(1, Math.round(old * 1.2))
        : rating === "good"
          ? Math.max(1, Math.round(old * 2.5))
          : Math.max(4, Math.round(old * 3.5)),
  );
  return {
    resourceId,
    cardId,
    interval,
    repetitions: rating === "again" ? 0 : (previous?.repetitions ?? 0) + 1,
    due: new Date(
      now.getTime() + (interval ? interval * 86400000 : 60000),
    ).toISOString(),
  };
}
export function isDue(review: Review | undefined, now = new Date()) {
  return !review || new Date(review.due).getTime() <= now.getTime();
}
export function csvCell(value: string) {
  const safe = /^[\s]*[=+@\-\t\r]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
}
export function resourceMarkdown(r: Resource, answers = true) {
  return (
    "# " +
    r.title +
    "\n\n" +
    r.program.toUpperCase() +
    " · " +
    r.subject +
    " · " +
    r.level +
    " · " +
    r.examYear +
    "\n\n" +
    r.summary +
    "\n\n" +
    r.body +
    "\n\n" +
    r.cards.map((c) => "## " + c.front + "\n\n" + c.back).join("\n\n") +
    r.questions
      .map(
        (q, i) =>
          "\n\n## " +
          (i + 1) +
          ". " +
          q.question +
          "\n\n" +
          q.options
            .map((o, n) => String.fromCharCode(65 + n) + ". " + o)
            .join("\n") +
          (answers
            ? "\n\nAnswer: " +
              String.fromCharCode(65 + q.correctAnswer) +
              "\n\n" +
              q.explanation
            : ""),
      )
      .join("") +
    "\n\n---\nIndependent practice resource. " +
    (r.origin === "ai" ? "AI draft: review before use. " : "") +
    "Not an official IB assessment.\n"
  );
}
export function downloadText(
  text: string,
  filename: string,
  type = "text/plain",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function safeFilename(title: string) {
  return title.replace(/[^a-z0-9-]+/gi, "-").slice(0, 80) || "ibgenie-resource";
}
export function parseCardNotes(notes: string): Card[] {
  const lines = notes.split("\n").filter((l) => l.trim());
  if (!lines.length || lines.length > 60)
    throw new Error("Add between 1 and 60 lines.");
  return lines.map((line, i) => {
    const at = line.indexOf("::");
    if (at < 1 || !line.slice(at + 2).trim())
      throw new Error("Line " + (i + 1) + ": use question :: answer.");
    return {
      id: "card-" + (i + 1),
      front: line.slice(0, at).trim(),
      back: line.slice(at + 2).trim(),
    };
  });
}
