import { createWorkspace, starterResources } from "./starter-resources";
import {
  cohortUpdates,
  curriculumIsStale,
  curriculumContext,
} from "./curriculum";
import {
  csvCell,
  isDue,
  parseCardNotes,
  resourceMarkdown,
  resourceSchema,
  scheduleReview,
  taskSchema,
  workspaceSchema,
} from "./workspace";
describe("Workspace data and learning behavior", () => {
  it("restores a complete starter workspace and preserves original practice provenance", () => {
    const w = workspaceSchema.parse(createWorkspace());
    expect(w.resources).toHaveLength(6);
    expect(w.resources.every((r) => r.origin === "starter")).toBe(true);
    expect(w.attempts).toEqual([]);
    expect(w.tasks).toEqual([]);
  });
  it("rejects missing cards, invalid answers and duplicate item IDs", () => {
    const quiz = starterResources.find((r) => r.kind === "quiz")!;
    const deck = starterResources[0];
    expect(resourceSchema.safeParse({ ...deck, cards: [] }).success).toBe(
      false,
    );
    expect(
      resourceSchema.safeParse({
        ...quiz,
        questions: [{ ...quiz.questions[0], correctAnswer: 8 }],
      }).success,
    ).toBe(false);
    expect(
      resourceSchema.safeParse({
        ...deck,
        cards: [deck.cards[0], deck.cards[0]],
      }).success,
    ).toBe(false);
  });
  it("rejects impossible dates instead of silently rolling them into another month", () => {
    const t = {
      id: "task",
      title: "Read",
      subject: "Biology",
      due: "2027-02-30",
      kind: "Study",
      done: false,
    };
    expect(taskSchema.safeParse(t).success).toBe(false);
    expect(taskSchema.safeParse({ ...t, due: "2028-02-29" }).success).toBe(
      true,
    );
  });
  it("parses notes and identifies an incomplete line", () => {
    expect(parseCardNotes("Cause :: Effect\nTerm :: Meaning")).toMatchObject([
      { front: "Cause", back: "Effect" },
      { front: "Term", back: "Meaning" },
    ]);
    expect(() => parseCardNotes("No delimiter")).toThrow("Line 1");
  });
  it("neutralizes spreadsheet formulas in CSV exports", () => {
    expect(csvCell("=SUM(A1:A2)")).toBe('"\'=SUM(A1:A2)"');
    expect(csvCell("  +1")).toBe('"\'  +1"');
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
  });
  it("omits answer keys from a student quiz export", () => {
    const r = starterResources.find((r) => r.kind === "quiz")!;
    expect(resourceMarkdown(r, false)).not.toContain("Answer:");
    expect(resourceMarkdown(r, false)).not.toContain(
      r.questions[0].explanation,
    );
    expect(resourceMarkdown(r, true)).toContain(r.questions[0].explanation);
  });
  it("schedules an immediate retry and a longer interval for easy recall", () => {
    const now = new Date("2026-09-08T12:00:00Z");
    const again = scheduleReview(undefined, "again", "r", "c", now);
    const easy = scheduleReview(undefined, "easy", "r", "c", now);
    expect(again.due).toBe("2026-09-08T12:01:00.000Z");
    expect(easy.interval).toBe(4);
    expect(isDue(easy, now)).toBe(false);
    expect(isDue(undefined, now)).toBe(true);
  });
  it("increases successful review spacing and resets it after a lapse", () => {
    const now = new Date("2026-09-08T12:00:00Z");
    const previous = scheduleReview(undefined, "easy", "r", "c", now);
    expect(scheduleReview(previous, "good", "r", "c", now).interval).toBe(10);
    expect(scheduleReview(previous, "again", "r", "c", now).repetitions).toBe(
      0,
    );
  });
  it("keeps future assessment changes out of an earlier cohort", () => {
    const rows = cohortUpdates(2027);
    expect(rows.find((u) => u.id === "ee-2027")?.applies).toBe(true);
    expect(rows.find((u) => u.id === "history-2028")?.applies).toBe(false);
    expect(rows.find((u) => u.id === "math-2029")?.applies).toBe(false);
    expect(cohortUpdates(2029).find((u) => u.id === "math-2029")?.applies).toBe(
      true,
    );
  });
  it("flags an overdue curriculum review", () => {
    expect(curriculumIsStale(new Date("2026-09-08T12:00:00Z"))).toBe(false);
    expect(curriculumIsStale(new Date("2026-10-10T12:00:00Z"))).toBe(true);
  });
  it("does not inject DP assessment requirements into MYP coaching", () => {
    const context = curriculumContext(
      { program: "myp", examYear: 2027, examSession: "May" },
      "Biology",
    );
    expect(context).toContain("do not apply DP assessment rules");
    expect(context).not.toContain("30 marks");
  });
});
