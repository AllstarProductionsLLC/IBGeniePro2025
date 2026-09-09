"use client";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Brain,
  ClipboardCheck,
  FileText,
  Layers,
  Sparkles,
  Presentation,
  Route,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResourceKind, WorkspaceState } from "@/lib/workspace";
export type Update = (fn: (s: WorkspaceState) => WorkspaceState) => void;
export const icons = {
  flashcards: Layers,
  quiz: Brain,
  "study-guide": BookOpen,
  "lesson-plan": Sparkles,
  rubric: ClipboardCheck,
  "exit-ticket": FileText,
  presentation: Presentation,
  "scope-sequence": Route,
};
export function KindIcon({
  kind,
  size = 22,
}: {
  kind: ResourceKind;
  size?: number;
}) {
  const Icon = icons[kind];
  return <Icon size={size} aria-hidden="true" />;
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Picker({
  value,
  onChange,
  options,
  label,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  label: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => {
          const p = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div className="error-note" role="alert">
      <AlertCircle size={18} />
      <span>{children}</span>
    </div>
  );
}
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <BookOpen size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Markdown({ children }: { children: string }) {
  return (
    <div className="resource-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
export function SourceLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      className="source-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={15} />
      <span className="sr-only">Opens in a new tab</span>
    </a>
  );
}
