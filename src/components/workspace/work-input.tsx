"use client";
import { useRef, useState } from "react";
import { Upload, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { extractWork } from "@/lib/work-upload";
import { ErrorNote, Field } from "./shared";
export function WorkInput({
  value,
  onChange,
  disabled = false,
  max = 24000,
}: {
  value: string;
  onChange: (s: string) => void;
  disabled?: boolean;
  max?: number;
}) {
  const file = useRef<HTMLInputElement>(null),
    [reading, setReading] = useState(false),
    [error, setError] = useState("");
  const upload = async (f?: File) => {
    if (!f) return;
    setReading(true);
    setError("");
    try {
      onChange(await extractWork(f, max));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The document could not be read.",
      );
    } finally {
      setReading(false);
    }
  };
  return (
    <>
      <Field
        label="Work to review"
        hint="Remove names and personal details. Check the extracted text before sending it. Images, diagrams and handwriting are not analysed."
      >
        <Textarea
          value={value}
          maxLength={max}
          rows={10}
          disabled={disabled || reading}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your work here, or upload a document…"
        />
      </Field>
      <div className="button-row">
        <Button
          variant="outline"
          type="button"
          disabled={disabled || reading}
          onClick={() => file.current?.click()}
        >
          {reading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          Upload work
        </Button>
        <small>
          PDF, DOCX, TXT or MD · 2 MB · {value.length.toLocaleString()} /{" "}
          {max.toLocaleString()} characters
        </small>
      </div>
      <input
        className="sr-only"
        tabIndex={-1}
        ref={file}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && <ErrorNote>{error}</ErrorNote>}
    </>
  );
}
