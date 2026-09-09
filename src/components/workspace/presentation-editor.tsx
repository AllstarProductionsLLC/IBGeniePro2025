"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type ClassroomSlide,
  type Presentation,
  type Sequence,
  type SequenceUnit,
} from "@/lib/learning-tools";
import { uid } from "@/lib/workspace";
import { Field, Picker } from "./shared";
export function blankSlide(): ClassroomSlide {
  return {
    id: uid(),
    layout: "explain",
    title: "",
    bullets: [],
    prompt: "",
    notes: "",
  };
}
export function PresentationEditor({
  value,
  onChange,
}: {
  value: Presentation;
  onChange: (v: Presentation) => void;
}) {
  const [index, setIndex] = useState(0);
  const at = Math.min(index, value.slides.length - 1),
    slide = value.slides[at];
  const patch = (change: Partial<ClassroomSlide>) =>
    onChange({
      slides: value.slides.map((s, i) => (i === at ? { ...s, ...change } : s)),
    });
  const move = (delta: number) => {
    const slides = [...value.slides];
    [slides[at], slides[at + delta]] = [slides[at + delta], slides[at]];
    onChange({ slides });
    setIndex(at + delta);
  };
  return (
    <div className="deck-editor">
      <div className="slide-rail" aria-label="Slides">
        {value.slides.map((s, i) => (
          <button
            key={s.id}
            className={at === i ? "selected" : ""}
            aria-current={at === i ? "step" : undefined}
            onClick={() => setIndex(i)}
          >
            <span>{i + 1}</span>
            <strong>{s.title || "Untitled slide"}</strong>
            <small>{s.layout}</small>
          </button>
        ))}
        <Button
          variant="outline"
          disabled={value.slides.length >= 24}
          onClick={() => {
            onChange({ slides: [...value.slides, blankSlide()] });
            setIndex(value.slides.length);
          }}
        >
          <Plus size={15} />
          Add slide
        </Button>
      </div>
      {slide && (
        <div className="slide-fields">
          <div className="section-heading">
            <h3>
              Slide {at + 1} of {value.slides.length}
            </h3>
            <div className="button-row">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move slide earlier"
                disabled={at === 0}
                onClick={() => move(-1)}
              >
                <ChevronUp size={17} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move slide later"
                disabled={at === value.slides.length - 1}
                onClick={() => move(1)}
              >
                <ChevronDown size={17} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove slide"
                disabled={value.slides.length === 1}
                onClick={() => {
                  onChange({ slides: value.slides.filter((_, i) => i !== at) });
                  setIndex(Math.max(0, at - 1));
                }}
              >
                <Trash2 size={17} />
              </Button>
            </div>
          </div>
          <Field label="Slide type">
            <Picker
              value={slide.layout}
              onChange={(v) => patch({ layout: v as ClassroomSlide["layout"] })}
              options={[
                { value: "title", label: "Opening / big idea" },
                { value: "explain", label: "Explain and model" },
                { value: "activity", label: "Try it together" },
                { value: "check", label: "Check understanding" },
              ]}
              label="Slide type"
            />
          </Field>
          <Field label="Slide title">
            <Input
              maxLength={90}
              value={slide.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </Field>
          <Field
            label="On-screen points"
            hint="Up to 5 short points, one per line. Keep each under 160 characters."
          >
            <Textarea
              rows={6}
              maxLength={804}
              value={slide.bullets.join("\n")}
              onChange={(e) => patch({ bullets: e.target.value.split("\n") })}
            />
          </Field>
          <Field label="Question or activity prompt">
            <Textarea
              rows={2}
              maxLength={240}
              value={slide.prompt}
              onChange={(e) => patch({ prompt: e.target.value })}
            />
          </Field>
          <Field
            label="Speaker notes, answers and sources"
            hint="Included in PowerPoint notes. Hidden during presentation."
          >
            <Textarea
              rows={5}
              maxLength={4000}
              value={slide.notes}
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </Field>
        </div>
      )}
    </div>
  );
}
export function blankUnit(year = 1): SequenceUnit {
  return {
    id: uid(),
    year,
    title: "",
    weeks: 10,
    goals: "",
    inquiry: "",
    skills: "",
    assessment: "",
    connections: "",
  };
}
export function SequenceEditor({
  value,
  onChange,
}: {
  value: Sequence;
  onChange: (v: Sequence) => void;
}) {
  const [year, setYear] = useState("1");
  const active = Math.min(Number(year), value.years);
  const patch = (id: string, change: Partial<SequenceUnit>) =>
    onChange({
      ...value,
      units: value.units.map((u) => (u.id === id ? { ...u, ...change } : u)),
    });
  return (
    <div className="sequence-editor">
      <div className="section-heading">
        <h3>
          Build progression across {value.years}{" "}
          {value.years === 1 ? "year" : "years"}
        </h3>
        <Picker
          label="Sequence year"
          value={String(active)}
          onChange={setYear}
          options={Array.from({ length: value.years }, (_, i) => ({
            value: String(i + 1),
            label: "Year " + (i + 1),
          }))}
        />
      </div>
      <p className="muted">
        Year {active}:{" "}
        {value.units
          .filter((u) => u.year === active)
          .reduce((n, u) => n + u.weeks, 0)}{" "}
        planned weeks. Adjust for your school's calendar and course guide.
      </p>
      {value.units
        .filter((u) => u.year === active)
        .map((u, i) => (
          <section className="sequence-unit" key={u.id}>
            <div className="section-heading">
              <h3>Unit {i + 1}</h3>
              <Button
                variant="ghost"
                size="icon"
                aria-label={"Remove unit " + (i + 1)}
                disabled={
                  value.units.filter((x) => x.year === active).length === 1
                }
                onClick={() =>
                  onChange({
                    ...value,
                    units: value.units.filter((x) => x.id !== u.id),
                  })
                }
              >
                <Trash2 size={16} />
              </Button>
            </div>
            <div className="form-two">
              <Field label="Unit title">
                <Input
                  value={u.title}
                  maxLength={120}
                  onChange={(e) => patch(u.id, { title: e.target.value })}
                />
              </Field>
              <Field label="Teaching weeks">
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={u.weeks}
                  onChange={(e) =>
                    patch(u.id, { weeks: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            {(
              [
                ["goals", "Learning goals"],
                ["inquiry", "Inquiry and concepts"],
                ["skills", "Approaches to learning"],
                ["assessment", "Assessment evidence"],
                ["connections", "Connections and progression"],
              ] as const
            ).map(([key, label]) => (
              <Field label={label} key={key}>
                <Textarea
                  rows={3}
                  value={u[key]}
                  maxLength={
                    key === "goals" ? 1400 : key === "assessment" ? 1200 : 800
                  }
                  onChange={(e) => patch(u.id, { [key]: e.target.value })}
                />
              </Field>
            ))}
          </section>
        ))}
      <Button
        variant="outline"
        disabled={value.units.length >= 36}
        onClick={() =>
          onChange({ ...value, units: [...value.units, blankUnit(active)] })
        }
      >
        <Plus size={16} />
        Add unit to year {active}
      </Button>
    </div>
  );
}
