"use client";
import { useState } from "react";
import {
  BookOpen,
  Download,
  Edit3,
  Play,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  csvCell,
  downloadText,
  kindLabels,
  resourceKinds,
  resourceMarkdown,
  safeFilename,
  type Resource,
  type ResourceKind,
  type WorkspaceState,
} from "@/lib/workspace";
import { EmptyState, KindIcon, Markdown, Picker, type Update } from "./shared";
import {
  canUseResource,
  type Presentation as Deck,
} from "@/lib/learning-tools";
import { ExportActions } from "./export-actions";
import { PresentationPlayer } from "./presentation-player";
import { lessonToPresentation } from "@/lib/lesson-presentation";
export function ResourceLibrary({
  state,
  update,
  create,
  study,
  edit,
}: {
  state: WorkspaceState;
  update: Update;
  create: (k: ResourceKind) => void;
  study: (r: Resource) => void;
  edit: (r: Resource) => void;
}) {
  const [search, setSearch] = useState(""),
    [kind, setKind] = useState("all"),
    [subject, setSubject] = useState("all"),
    [starred, setStarred] = useState(false),
    [selected, setSelected] = useState<Resource>(),
    [deleting, setDeleting] = useState<Resource>(),
    [answers, setAnswers] = useState(false);
  const [presenting, setPresenting] = useState<Resource>();
  const teacher = state.profile.role === "teacher";
  const resources = state.resources.filter(
    (r) =>
      r.program === state.profile.program &&
      canUseResource(state.profile.role, r.kind) &&
      (kind === "all" || r.kind === kind) &&
      (subject === "all" || r.subject === subject) &&
      (!starred || r.starred) &&
      (r.title + " " + r.subject + " " + r.summary)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">COLLECT. CREATE. COME BACK.</div>
          <h1>A library that grows with you.</h1>
          <p>Your resources, ready for the next lesson or learning session.</p>
        </div>
        <Button onClick={() => create(teacher ? "presentation" : "flashcards")}>
          <Plus size={17} />
          New resource
        </Button>
      </div>
      <div className="library-toolbar">
        <div className="search-field">
          <Search size={18} />
          <Input
            aria-label="Search resources"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a topic, subject, or resource…"
          />
        </div>
        <Picker
          value={kind}
          label="Resource type"
          onChange={setKind}
          options={[
            { value: "all", label: "All resource types" },
            ...resourceKinds
              .filter((k) => canUseResource(state.profile.role, k))
              .map((k) => ({ value: k, label: kindLabels[k] })),
          ]}
        />
        <Picker
          value={subject}
          label="Filter subject"
          onChange={setSubject}
          options={[
            { value: "all", label: "All subjects" },
            ...Array.from(new Set(state.resources.map((r) => r.subject))),
          ]}
        />
        <Button
          variant={starred ? "secondary" : "outline"}
          aria-pressed={starred}
          onClick={() => setStarred(!starred)}
        >
          <Star size={16} />
          Saved
        </Button>
      </div>
      <div className="library-caption">
        <span>{resources.length} resources</span>
        <span>
          Starter examples are original practice, not official IB questions.
        </span>
      </div>
      <div className="library-grid">
        {resources.map((r) => (
          <article className={"resource-card kind-" + r.kind} key={r.id}>
            <div className="resource-card-top">
              <span className="tool-icon">
                <KindIcon kind={r.kind} size={24} />
              </span>
              <button
                className={"icon-button " + (r.starred ? "starred" : "")}
                aria-pressed={r.starred}
                aria-label={(r.starred ? "Unsave " : "Save ") + r.title}
                onClick={() =>
                  update((s) => ({
                    ...s,
                    resources: s.resources.map((x) =>
                      x.id === r.id ? { ...x, starred: !x.starred } : x,
                    ),
                  }))
                }
              >
                <Star size={19} fill={r.starred ? "currentColor" : "none"} />
              </button>
            </div>
            <span className="resource-kind">
              {kindLabels[r.kind]} · {r.program.toUpperCase()}
            </span>
            <button
              className="resource-title-button"
              onClick={() => {
                setSelected(r);
                setAnswers(false);
              }}
            >
              <h2>{r.title}</h2>
            </button>
            <p>{r.summary}</p>
            <div className="resource-tags">
              <span>{r.subject}</span>
              <span>
                {r.origin === "starter"
                  ? "Starter example"
                  : r.origin === "ai"
                    ? "AI draft"
                    : "Your resource"}
              </span>
            </div>
            <div className="resource-card-footer">
              <span>
                {r.cards.length
                  ? r.cards.length + " cards"
                  : r.questions.length
                    ? r.questions.length + " questions"
                    : r.level === "All"
                      ? "All levels"
                      : r.level}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  ["flashcards", "quiz"].includes(r.kind)
                    ? study(r)
                    : setSelected(r)
                }
              >
                {["flashcards", "quiz"].includes(r.kind) ? (
                  <>
                    <Play size={15} />
                    Practice
                  </>
                ) : (
                  <>
                    <BookOpen size={15} />
                    Open
                  </>
                )}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!resources.length && (
        <EmptyState
          title="Make room for your next idea."
          action={
            <Button
              onClick={() => create(teacher ? "presentation" : "flashcards")}
            >
              Create a resource
            </Button>
          }
        >
          No resources match these filters.
        </EmptyState>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(undefined);
        }}
      >
        <DialogContent className="resource-dialog">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.subject} · Independent practice resource
              {selected?.origin === "ai"
                ? ". AI draft: review before use."
                : "."}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <div className="button-row no-print">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelected(undefined);
                    edit(selected);
                  }}
                >
                  <Edit3 size={15} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadText(
                      resourceMarkdown(selected, answers),
                      safeFilename(selected.title) + ".md",
                      "text/markdown",
                    )
                  }
                >
                  <Download size={15} />
                  Markdown
                </Button>
                {!!selected.cards.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadText(
                        "Front,Back\r\n" +
                          selected.cards
                            .map((c) =>
                              [csvCell(c.front), csvCell(c.back)].join(","),
                            )
                            .join("\r\n"),
                        safeFilename(selected.title) + ".csv",
                        "text/csv",
                      )
                    }
                  >
                    <Download size={15} />
                    CSV / Anki
                  </Button>
                )}
                <ExportActions
                  title={selected.title}
                  markdown={resourceMarkdown(selected, answers)}
                  presentation={selected.presentation}
                />
                {selected.presentation && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setPresenting(selected);
                      setSelected(undefined);
                    }}
                  >
                    <Play size={15} />
                    Present slides
                  </Button>
                )}
                {teacher && selected.kind === "lesson-plan" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      edit(lessonToPresentation(selected));
                      setSelected(undefined);
                    }}
                  >
                    Make classroom slides
                  </Button>
                )}
                {selected.sequence && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      downloadText(
                        "Year,Unit,Weeks,Learning goals,Inquiry,ATL,Assessment,Connections,Created with\r\n" +
                          selected
                            .sequence!.units.map((u) =>
                              [
                                String(u.year),
                                u.title,
                                String(u.weeks),
                                u.goals,
                                u.inquiry,
                                u.skills,
                                u.assessment,
                                u.connections,
                                "https://IBgenie.com",
                              ]
                                .map(csvCell)
                                .join(","),
                            )
                            .join("\r\n"),
                        safeFilename(selected.title) + ".csv",
                        "text/csv",
                      )
                    }
                  >
                    Download sequence CSV
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelected(undefined);
                    setDeleting(selected);
                  }}
                >
                  <Trash2 size={15} />
                  Delete
                </Button>
              </div>
              {!!selected.questions.length && (
                <label className="inline-check no-print">
                  <input
                    type="checkbox"
                    checked={answers}
                    onChange={(e) => setAnswers(e.target.checked)}
                  />
                  Include answer key
                </label>
              )}
              <p className="muted-note">
                Downloads carry IBgenie.com branding. Print the downloaded PDF
                for a clean handout. Import PPTX into PowerPoint or Google
                Slides.
              </p>
              <div className="resource-print">
                <Markdown>{resourceMarkdown(selected, answers)}</Markdown>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {presenting?.presentation && (
        <PresentationPlayer
          title={presenting.title}
          presentation={presenting.presentation}
          onClose={() => setPresenting(undefined)}
        />
      )}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(v) => {
          if (!v) setDeleting(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.title} and its card review schedule will be removed
              from this device. Past quiz results will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep resource</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                update((s) => ({
                  ...s,
                  resources: s.resources.filter((r) => r.id !== deleting?.id),
                  reviews: s.reviews.filter(
                    (r) => r.resourceId !== deleting?.id,
                  ),
                }));
                setDeleting(undefined);
              }}
            >
              Delete resource
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
