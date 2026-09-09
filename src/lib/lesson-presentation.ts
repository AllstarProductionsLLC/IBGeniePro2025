import { type Resource, uid } from "./workspace";
import { type ClassroomSlide } from "./learning-tools";
export function lessonToPresentation(lesson: Resource): Resource {
  const slides: ClassroomSlide[] = [
    {
      id: uid(),
      layout: "title",
      title: lesson.title.slice(0, 90),
      bullets: [],
      prompt: lesson.summary.slice(0, 240),
      notes: lesson.summary,
    },
  ];
  for (const section of lesson.body.split(/(?=^#{1,3} )/m)) {
    const first = section.trim().split("\n")[0];
    if (!first) continue;
    const hasHeading = /^#{1,3}\s/.test(first);
    const heading = hasHeading ? first : lesson.title;
    const chunks = section.trim().match(/[\s\S]{1,3500}/g) || [""];
    for (const [index, chunk] of chunks.entries()) {
      slides.push({
        id: uid(),
        layout: /ticket|check|assess/i.test(heading)
          ? "check"
          : /apply|explore|investig|discuss|practice/i.test(heading)
            ? "activity"
            : "explain",
        title: (
          heading.replace(/^#+\s*/, "") + (index ? " (continued)" : "")
        ).slice(0, 90),
        bullets: (index === 0 && hasHeading
          ? chunk.split("\n").slice(1).join("\n")
          : chunk
        )
          .split(/\n+/)
          .filter(Boolean)
          .slice(0, 5)
          .map(
            (l) =>
              l.replace(/^[-*]\s*/, "").slice(0, 157) +
              (l.length > 157 ? "…" : ""),
          ),
        prompt: "",
        notes: chunk,
      });
    }
  }
  if (slides.length > 24) {
    // Preserve all source content in speaker notes even for unusually fragmented plans.
    const chunks = lesson.body.match(/[\s\S]{1,3500}/g) || [""];
    slides.splice(
      1,
      slides.length - 1,
      ...chunks.map((notes, i): ClassroomSlide => ({
        id: uid(),
        layout: "explain",
        title: `Lesson notes ${i + 1}`,
        bullets: notes
          .split(/\n+/)
          .filter(Boolean)
          .slice(0, 5)
          .map((l) => l.slice(0, 157) + (l.length > 157 ? "…" : "")),
        prompt: "",
        notes,
      })),
    );
  }
  return {
    ...lesson,
    id: uid(),
    title: (lesson.title + " · classroom slides").slice(0, 150),
    kind: "presentation",
    body: "",
    cards: [],
    questions: [],
    presentation: { slides },
    sequence: undefined,
    sourceNotes: lesson.body.slice(0, 24000),
    origin: "manual",
    starred: false,
    createdAt: new Date().toISOString(),
  };
}
