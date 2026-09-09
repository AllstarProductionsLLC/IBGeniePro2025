"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BRAND_DOMAIN,
  BRAND_URL,
  type Presentation,
} from "@/lib/learning-tools";
import { ErrorNote } from "./shared";
export function PresentationPlayer({
  title,
  presentation,
  onClose,
}: {
  title: string;
  presentation: Presentation;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0),
    [error, setError] = useState("");
  const stage = useRef<HTMLDivElement>(null);
  const slide = presentation.slides[index];
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (
        e.key === " " &&
        e.target instanceof HTMLElement &&
        e.target.closest("button,a")
      )
        return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, presentation.slides.length - 1));
      }
      if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === "Home") setIndex(0);
      if (e.key === "End") setIndex(presentation.slides.length - 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [presentation.slides.length]);
  const fullscreen = async () => {
    try {
      await stage.current?.requestFullscreen();
      setError("");
    } catch {
      setError(
        "Fullscreen is unavailable in this embed. Use Open app in a new tab, or download the PowerPoint.",
      );
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="presentation-dialog">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          Classroom slides. Use the previous and next buttons or arrow keys.
        </DialogDescription>
        <div
          className="presentation-stage"
          ref={stage}
          tabIndex={0}
          aria-label="Presentation"
        >
          <div className={"classroom-slide slide-" + slide.layout}>
            <h2>{slide.title}</h2>
            <ul>
              {slide.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {slide.prompt && <p className="slide-prompt">{slide.prompt}</p>}
            <footer>
              <a href={BRAND_URL} target="_blank" rel="noreferrer">
                {BRAND_DOMAIN}
              </a>
              <span>
                {index + 1} / {presentation.slides.length}
              </span>
            </footer>
          </div>
          <div className="presentation-controls">
            <Button
              variant="outline"
              onClick={() => setIndex((i) => i - 1)}
              disabled={index === 0}
              aria-label="Previous slide"
            >
              <ArrowLeft size={18} />
            </Button>
            <span aria-live="polite">
              Slide {index + 1} of {presentation.slides.length}
            </span>
            <Button
              variant="outline"
              onClick={() => setIndex((i) => i + 1)}
              disabled={index === presentation.slides.length - 1}
              aria-label="Next slide"
            >
              <ArrowRight size={18} />
            </Button>
            <Button variant="outline" onClick={() => void fullscreen()}>
              <Maximize size={16} />
              Fullscreen
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                onClose();
              }}
              aria-label="End presentation"
            >
              <X size={18} />
            </Button>
          </div>
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <details className="speaker-notes">
          <summary>Speaker notes and answers</summary>
          <p>{slide.notes || "No notes for this slide."}</p>
        </details>
      </DialogContent>
    </Dialog>
  );
}
