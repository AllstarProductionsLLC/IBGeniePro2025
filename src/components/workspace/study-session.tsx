"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Layers,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  isDue,
  localDate,
  scheduleReview,
  uid,
  type Resource,
  type WorkspaceState,
} from "@/lib/workspace";
import { Picker, type Update } from "./shared";
type Props = {
  resource: Resource;
  state: WorkspaceState;
  update: Update;
  onClose: () => void;
  onSave: (r: Resource) => void;
};
export function StudySession(props: Props) {
  return (
    <>
      <div className="study-heading">
        <button className="text-button" onClick={props.onClose}>
          <ArrowLeft size={17} />
          Back to workspace
        </button>
        <span>{props.resource.subject} · Independent practice</span>
      </div>
      {props.resource.kind === "flashcards" ? (
        <FlashcardSession {...props} />
      ) : (
        <QuizSession {...props} />
      )}
    </>
  );
}
function FlashcardSession({ resource, state, update, onClose }: Props) {
  const initial = resource.cards.filter((c) =>
    isDue(
      state.reviews.find(
        (r) => r.resourceId === resource.id && r.cardId === c.id,
      ),
    ),
  );
  const [queue, setQueue] = useState(initial),
    [flipped, setFlipped] = useState(false),
    [reviewed, setReviewed] = useState<string[]>([]);
  const card = queue[0];
  function rate(rating: "again" | "hard" | "good" | "easy") {
    if (!card || !flipped) return;
    update((s) => ({
      ...s,
      reviews: [
        ...s.reviews.filter(
          (r) => r.resourceId !== resource.id || r.cardId !== card.id,
        ),
        scheduleReview(
          s.reviews.find(
            (r) => r.resourceId === resource.id && r.cardId === card.id,
          ),
          rating,
          resource.id,
          card.id,
        ),
      ].slice(-10000),
      activity: Array.from(new Set([...s.activity, localDate()])).slice(-366),
    }));
    setReviewed((v) => Array.from(new Set([...v, card.id])));
    setQueue((q) => (rating === "again" ? [...q.slice(1), card] : q.slice(1)));
    setFlipped(false);
  }
  return (
    <div className="study-container">
      <div className="center-heading">
        <span className="eyebrow">RECALL, REFLECT, REPEAT</span>
        <h1>{resource.title}</h1>
        <p>Say your answer before you turn the card.</p>
      </div>
      {card ? (
        <>
          <div className="study-progress">
            <span>{reviewed.length} cards reviewed</span>
            <span>{queue.length} left in this session</span>
          </div>
          <Progress
            value={(reviewed.length / Math.max(1, resource.cards.length)) * 100}
          />
          <button
            className={"flashcard " + (flipped ? "is-flipped" : "")}
            onClick={() => setFlipped(!flipped)}
            aria-label={flipped ? "Show question" : "Reveal answer"}
          >
            <span className="eyebrow">
              {flipped ? "THE EXPLANATION" : "YOUR QUESTION"}
            </span>
            <span className="flashcard-copy">
              {flipped ? card.back : card.front}
            </span>
            <span className="flashcard-hint">
              <RotateCcw size={16} />
              {flipped
                ? "Click to see the question"
                : "Click or press Enter to reveal"}
            </span>
          </button>
          {flipped ? (
            <div className="recall-ratings">
              <p>How well did you remember?</p>
              <div>
                {(["again", "hard", "good", "easy"] as const).map((r, i) => (
                  <Button key={r} variant="outline" onClick={() => rate(r)}>
                    <span>{["Again", "Hard", "Good", "Easy"][i]}</span>
                    <small>
                      {r === "again"
                        ? "Repeat this session"
                        : r === "hard"
                          ? "A little sooner"
                          : r === "good"
                            ? "Build the interval"
                            : "A longer break"}
                    </small>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <Button className="reveal-button" onClick={() => setFlipped(true)}>
              Reveal answer <ArrowRight size={17} />
            </Button>
          )}
          <p className="muted-note center-text">
            Your ratings set the next review date. There is no official grade
            here.
          </p>
        </>
      ) : (
        <div className="panel session-complete">
          <span className="completion-icon">
            <Check size={30} />
          </span>
          <h2>
            {reviewed.length
              ? "A little more confident."
              : "You’re up to date."}
          </h2>
          <p>
            {reviewed.length
              ? reviewed.length +
                " cards reviewed. Your next reviews are scheduled."
              : "There are no cards due in this deck right now."}
          </p>
          <div className="button-row">
            <Button onClick={onClose}>Back to workspace</Button>
            <Button
              variant="outline"
              onClick={() => {
                setQueue(resource.cards);
                setReviewed([]);
                setFlipped(false);
              }}
            >
              Practice all cards
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
function QuizSession({ resource, update, onSave }: Props) {
  const [mode, setMode] = useState("practice"),
    [duration, setDuration] = useState("10"),
    [started, setStarted] = useState(false),
    [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [checked, setChecked] = useState<Record<string, boolean>>({}),
    [result, setResult] = useState<{ correct: number; wrongIds: string[] }>(),
    [remaining, setRemaining] = useState(0);
  const answerRef = useRef(answers),
    submitted = useRef(false),
    deadline = useRef(0);
  answerRef.current = answers;
  const finish = () => {
    if (submitted.current) return;
    submitted.current = true;
    const wrongIds = resource.questions
      .filter((q) => answerRef.current[q.id] !== q.correctAnswer)
      .map((q) => q.id);
    const correct = resource.questions.length - wrongIds.length;
    setResult({ correct, wrongIds });
    update((s) => ({
      ...s,
      attempts: [
        ...s.attempts,
        {
          id: uid(),
          resourceId: resource.id,
          subject: resource.subject,
          date: new Date().toISOString(),
          correct,
          total: resource.questions.length,
          wrongIds,
        },
      ].slice(-2000),
    }));
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;
  useEffect(() => {
    if (!started || mode !== "timed" || result) return;
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(seconds);
      if (!seconds) finishRef.current();
    };
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [started, mode, result]);
  const q = resource.questions[index];
  const selected = answers[q.id];
  const revealed = mode === "practice" && checked[q.id];
  function start() {
    submitted.current = false;
    setAnswers({});
    answerRef.current = {};
    setChecked({});
    setResult(undefined);
    setIndex(0);
    deadline.current = Date.now() + Number(duration) * 60000;
    setRemaining(Number(duration) * 60);
    setStarted(true);
  }
  function makeDeck() {
    if (!result) return;
    onSave({
      ...resource,
      id: uid(),
      kind: "flashcards",
      title: ("Review: " + resource.title).slice(0, 150),
      summary: "Practice the ideas from your missed quiz questions.",
      createdAt: new Date().toISOString(),
      origin: "manual",
      starred: false,
      questions: [],
      body: "",
      cards: resource.questions
        .filter((q) => result.wrongIds.includes(q.id))
        .map((q) => ({
          id: uid(),
          front: q.question,
          back: q.options[q.correctAnswer] + "\n\n" + q.explanation,
        })),
    });
  }
  return (
    <div className="study-container">
      <div className="center-heading">
        <span className="eyebrow">MAKE UNDERSTANDING VISIBLE</span>
        <h1>{resource.title}</h1>
        <p>{resource.summary}</p>
      </div>
      {!started ? (
        <div className="panel quiz-start">
          <span className="completion-icon">
            <Layers size={30} />
          </span>
          <h2>A small check. A useful next step.</h2>
          <p>
            {resource.questions.length} original practice questions with
            explanations.
          </p>
          <div className="form-grid">
            <Picker
              value={mode}
              onChange={setMode}
              label="Quiz mode"
              options={[
                { value: "practice", label: "Practice with feedback" },
                { value: "timed", label: "Timed practice" },
              ]}
            />
            {mode === "timed" && (
              <Picker
                value={duration}
                onChange={setDuration}
                label="Time limit"
                options={["5", "10", "20", "30"].map((v) => ({
                  value: v,
                  label: v + " minutes",
                }))}
              />
            )}
          </div>
          <p className="muted-note">
            {mode === "practice"
              ? "Check each answer as you go."
              : "Feedback appears at the end. Unanswered questions count as missed."}
          </p>
          <Button onClick={start}>
            Start practice <ArrowRight size={17} />
          </Button>
        </div>
      ) : result ? (
        <>
          <div className="panel session-complete">
            <span className="completion-icon">
              <Trophy size={30} />
            </span>
            <h2>
              {result.correct} / {resource.questions.length}
            </h2>
            <p>
              That’s a practice result, not a predicted IB grade. Use it to
              choose what to revisit.
            </p>
            <div className="button-row">
              {result.wrongIds.length > 0 && (
                <Button onClick={makeDeck}>
                  <Layers size={17} />
                  Turn mistakes into flashcards
                </Button>
              )}
              <Button variant="outline" onClick={start}>
                <RotateCcw size={17} />
                Try again
              </Button>
            </div>
          </div>
          <div className="answer-review">
            {resource.questions.map((item, i) => (
              <article className="panel" key={item.id}>
                <div className="answer-review-title">
                  {result.wrongIds.includes(item.id) ? (
                    <X size={20} />
                  ) : (
                    <Check size={20} />
                  )}
                  <h3>
                    {i + 1}. {item.question}
                  </h3>
                </div>
                <p>
                  Your answer:{" "}
                  {answers[item.id] === undefined
                    ? "Not answered"
                    : item.options[answers[item.id]]}
                </p>
                <p>
                  <strong>Correct answer:</strong>{" "}
                  {item.options[item.correctAnswer]}
                </p>
                <p>{item.explanation}</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="study-progress">
            <span>
              Question {index + 1} of {resource.questions.length}
            </span>
            {mode === "timed" && (
              <span role="timer">
                <Clock3 size={15} />
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, "0")}
              </span>
            )}
          </div>
          <Progress value={((index + 1) / resource.questions.length) * 100} />
          <div className="panel question-panel">
            <h2>{q.question}</h2>
            <div
              className="quiz-options"
              role="group"
              aria-label="Answer options"
            >
              {q.options.map((o, i) => (
                <button
                  key={i}
                  aria-pressed={selected === i}
                  disabled={!!revealed}
                  className={
                    "quiz-option " +
                    (selected === i ? "selected " : "") +
                    (revealed && i === q.correctAnswer ? "correct " : "") +
                    (revealed && selected === i && i !== q.correctAnswer
                      ? "incorrect"
                      : "")
                  }
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  {o}
                </button>
              ))}
            </div>
            {revealed && (
              <div
                className={
                  "quiz-feedback " +
                  (selected === q.correctAnswer ? "correct" : "")
                }
                role="status"
              >
                <strong>
                  {selected === q.correctAnswer
                    ? "That’s right."
                    : "Here’s the idea to revisit."}
                </strong>
                <p>{q.explanation}</p>
              </div>
            )}
            <div className="question-actions">
              {mode === "timed" && (
                <Button
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => i - 1)}
                >
                  Previous
                </Button>
              )}
              {mode === "practice" && !revealed ? (
                <Button
                  disabled={selected === undefined}
                  onClick={() => setChecked((c) => ({ ...c, [q.id]: true }))}
                >
                  Check answer
                </Button>
              ) : (
                <Button
                  disabled={selected === undefined}
                  onClick={() =>
                    index === resource.questions.length - 1
                      ? finish()
                      : setIndex((i) => i + 1)
                  }
                >
                  {index === resource.questions.length - 1
                    ? "See my results"
                    : "Next question"}
                  <ArrowRight size={17} />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
