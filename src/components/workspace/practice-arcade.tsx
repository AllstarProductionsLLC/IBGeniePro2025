"use client";
import { useState } from "react";
import { ArrowRight, Check, Gamepad2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  matchingCards,
  programmeStarters,
  shuffled,
} from "@/lib/practice-games";
import {
  localDate,
  type Card,
  type Resource,
  type WorkspaceState,
} from "@/lib/workspace";
import { EmptyState, Picker, type Update } from "./shared";
export function PracticeArcade({
  state,
  update,
  study,
  create,
}: {
  state: WorkspaceState;
  update: Update;
  study: (r: Resource) => void;
  create: () => void;
}) {
  const p = state.profile.program;
  const resources = [
    ...state.resources,
    ...programmeStarters.filter(
      (r) => !state.resources.some((s) => s.id === r.id),
    ),
  ].filter((r) => r.program === p);
  const decks = resources.filter(
      (r) => r.kind === "flashcards" && r.cards.length >= 2,
    ),
    quizzes = resources.filter((r) => r.kind === "quiz");
  const [deck, setDeck] = useState(decks[0]?.id || ""),
    [pairs, setPairs] = useState<Card[]>([]),
    [answers, setAnswers] = useState<Card[]>([]),
    [chosen, setChosen] = useState<string>(),
    [matched, setMatched] = useState<string[]>([]),
    [message, setMessage] = useState(""),
    [tries, setTries] = useState(0),
    [reflection, setReflection] = useState("");
  const start = () => {
    const source = decks.find((d) => d.id === deck);
    if (!source) return;
    const cards = matchingCards(source.cards, p);
    if (cards.length < 2) {
      setMessage(
        "Add at least two different words and meanings to make a matching round.",
      );
      return;
    }
    setPairs(cards);
    setAnswers(shuffled(cards));
    setChosen(undefined);
    setMatched([]);
    setTries(0);
    setMessage("");
    setReflection("");
  };
  const chooseAnswer = (id: string) => {
    if (!chosen) return;
    setTries((t) => t + 1);
    if (id === chosen) {
      const next = [...matched, id];
      setMatched(next);
      setChosen(undefined);
      setMessage(
        next.length === pairs.length
          ? "All connected! Now try the transfer challenge below."
          : "That's a connection. Find the next pair.",
      );
      if (next.length === pairs.length)
        update((s) => ({
          ...s,
          activity: Array.from(new Set([...s.activity, localDate()])).slice(
            -366,
          ),
        }));
    } else setMessage("Take another look at the meaning. You can try again.");
  };
  const beginQuiz = (r: Resource) => {
    if (
      !state.resources.some((x) => x.id === r.id) &&
      state.resources.length < 500
    )
      update((s) => ({ ...s, resources: [r, ...s.resources] }));
    study(r);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {p === "pyp"
              ? "PLAY. NOTICE. WONDER."
              : p === "myp"
                ? "CONNECT. EXPLAIN. APPLY."
                : "RETRIEVE. REASON. TRANSFER."}
          </span>
          <h1>
            {p === "pyp"
              ? "A little play. A new discovery."
              : p === "myp"
                ? "Put your understanding into play."
                : "Practise beyond memorising."}
          </h1>
          <p>
            {p === "pyp"
              ? "Try word matches and small discoveries. Take your time."
              : "Use your own resources for a quick challenge, then explain the idea in a new context."}
          </p>
        </div>
        <Gamepad2 size={34} />
      </div>
      <section className={"panel match-game programme-" + p}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              01 · {p === "pyp" ? "WORD MATCH" : "CONCEPT CONNECTIONS"}
            </span>
            <h2>Which ideas belong together?</h2>
          </div>
          <Sparkles size={24} />
        </div>
        {decks.length ? (
          <>
            <div className="game-setup">
              <Picker
                label="Practice deck"
                value={deck}
                options={decks.map((d) => ({ value: d.id, label: d.title }))}
                onChange={(v) => {
                  setDeck(v);
                  setPairs([]);
                  setMessage("");
                }}
              />
              <Button onClick={start}>
                {pairs.length ? (
                  <RotateCcw size={16} />
                ) : (
                  <Gamepad2 size={16} />
                )}{" "}
                {pairs.length ? "New round" : "Start matching"}
              </Button>
            </div>
            {!pairs.length && message && <p role="status">{message}</p>}
            {pairs.length > 0 && (
              <>
                <p>
                  Choose a word or idea on the left, then its meaning on the
                  right. No timer.
                </p>
                <div className="matching-board">
                  <div aria-label="Words and ideas">
                    {pairs.map((c) => (
                      <button
                        className={
                          (matched.includes(c.id) ? "matched " : "") +
                          (chosen === c.id ? "selected" : "")
                        }
                        key={c.id}
                        disabled={matched.includes(c.id)}
                        aria-pressed={chosen === c.id}
                        onClick={() => setChosen(c.id)}
                      >
                        {matched.includes(c.id) && <Check size={18} />}{" "}
                        {c.front}
                      </button>
                    ))}
                  </div>
                  <div aria-label="Meanings">
                    {answers.map((c) => (
                      <button
                        className={matched.includes(c.id) ? "matched" : ""}
                        key={c.id}
                        disabled={matched.includes(c.id) || !chosen}
                        onClick={() => chooseAnswer(c.id)}
                      >
                        {matched.includes(c.id) && <Check size={18} />} {c.back}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="game-status" role="status">
                  <strong>
                    {matched.length} / {pairs.length} connected
                  </strong>
                  <span>{message}</span>
                </div>
                {matched.length === pairs.length && (
                  <div className="transfer-challenge">
                    <h3>
                      {p === "pyp"
                        ? "Make it yours"
                        : p === "myp"
                          ? "Transfer challenge"
                          : "Explain a limitation"}
                    </h3>
                    <p>
                      {p === "pyp"
                        ? "Pick a word. Say a sentence or draw an example of what it means."
                        : p === "myp"
                          ? "Choose one idea and explain where you could use it outside this lesson."
                          : "Choose one concept. Describe a case where a simple definition is not enough, and explain what further evidence or reasoning you need."}
                    </p>
                    <textarea
                      aria-label="My practice reflection"
                      maxLength={2000}
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="My own example…"
                    />
                    <small>
                      {tries} attempts. This is practice, not a grade. Your
                      reflection stays in this session.
                    </small>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <EmptyState
            title="Make a deck to start playing."
            action={<Button onClick={create}>Create flashcards</Button>}
          >
            Add at least two different cards in your programme.
          </EmptyState>
        )}
      </section>
      <section className="practice-quizzes">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              02 ·{" "}
              {p === "pyp" ? "DISCOVERY QUESTIONS" : "REASONING CHALLENGES"}
            </span>
            <h2>
              {p === "dp"
                ? "Check your reasoning, then review the gaps."
                : "What do you think, and why?"}
            </h2>
          </div>
        </div>
        <div className="library-grid">
          {quizzes.map((q) => (
            <article className="panel" key={q.id}>
              <h3>{q.title}</h3>
              <p>{q.summary}</p>
              <small>
                {q.subject} · {q.questions.length} questions
              </small>
              <Button variant="outline" onClick={() => beginQuiz(q)}>
                Try this challenge <ArrowRight size={16} />
              </Button>
            </article>
          ))}
        </div>
        {!quizzes.length && (
          <p>Create a quiz in the resource studio to practise here.</p>
        )}
      </section>
    </>
  );
}
