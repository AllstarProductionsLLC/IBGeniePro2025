"use client";
import { useState } from "react";
import {
  Archive,
  Check,
  Download,
  ExternalLink,
  LockKeyhole,
  Save,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { SUBJECTS } from "@/lib/subjects";
import {
  downloadText,
  dpSubjects,
  localDate,
  profileSchema,
  yearGroups,
  workspaceSchema,
  type Profile,
  type WorkspaceState,
} from "@/lib/workspace";
import { AccessGate, useAIStatus } from "./access-gate";
import { ErrorNote, Field, Picker, type Update } from "./shared";
export function SettingsPanel({
  state,
  update,
  restore,
  rawBackup,
  storageError,
}: {
  state: WorkspaceState;
  update: Update;
  restore: (v: unknown) => void;
  rawBackup: () => string;
  storageError: string;
}) {
  const [profile, setProfile] = useState(state.profile),
    [subjects, setSubjects] = useState(state.profile.subjects.join("\n")),
    [pending, setPending] = useState<WorkspaceState>(),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const ai = useAIStatus();
  const patch = (p: Partial<Profile>) => setProfile((v) => ({ ...v, ...p }));
  function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse({
      ...profile,
      subjects: Array.from(
        new Set(
          subjects
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ),
    });
    if (!parsed.success) {
      setError(
        "Use a name up to 60 characters and up to 12 subjects, one per line.",
      );
      return;
    }
    update((s) => ({ ...s, profile: parsed.data, onboardingComplete: true }));
    setError("");
    setNotice("Preferences saved on this device.");
  }
  async function readBackup(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (file.size > 8 * 1024 * 1024)
        throw new Error("Choose a workspace backup under 8 MB.");
      const parsed = workspaceSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success)
        throw new Error("This file is not a valid IBGenie workspace backup.");
      setPending(parsed.data);
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "The backup file could not be read."
          : e instanceof Error
            ? e.message
            : "The backup could not be opened.",
      );
    }
  }
  function confirmRestore() {
    if (!pending) return;
    try {
      restore(pending);
      setProfile(pending.profile);
      setSubjects(pending.profile.subjects.join("\n"));
      setPending(undefined);
      setNotice("Backup restored on this device.");
    } catch {
      setError(
        "The browser could not save this backup. Your current workspace has been kept.",
      );
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE THIS SPACE YOURS</span>
          <h1>A workspace that fits you.</h1>
          <p>
            Choose your context, look after your work, and manage AI access.
          </p>
        </div>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && (
        <div className="info-note" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
      <div className="settings-grid">
        <form className="panel form-stack" onSubmit={save}>
          <div className="section-heading">
            <h2>Your learning context</h2>
          </div>
          <Field
            label="What should we call you?"
            hint="A first name or nickname is enough."
          >
            <Input
              value={profile.name}
              maxLength={60}
              onChange={(e) => patch({ name: e.target.value })}
              autoComplete="off"
              placeholder="Your name (optional)"
            />
          </Field>
          <div className="form-grid">
            <Field label="Your role">
              <Picker
                label="Your role"
                value={profile.role}
                options={[
                  { value: "student", label: "Student" },
                  { value: "teacher", label: "Teacher" },
                ]}
                onChange={(v) =>
                  patch({
                    role: v as Profile["role"],
                    yearGroup: yearGroups(
                      profile.program,
                      v as Profile["role"],
                    ).includes(profile.yearGroup)
                      ? profile.yearGroup
                      : "Year 1",
                  })
                }
              />
            </Field>
            <Field label="Programme">
              <Picker
                label="Programme"
                value={profile.program}
                options={[
                  { value: "dp", label: "Diploma Programme" },
                  { value: "myp", label: "Middle Years Programme" },
                  { value: "pyp", label: "Primary Years Programme" },
                ]}
                onChange={(v) => {
                  patch({ program: v as Profile["program"] });
                  setSubjects(
                    (v === "dp"
                      ? dpSubjects.slice(0, 6)
                      : SUBJECTS[v as Profile["program"]]
                    ).join("\n"),
                  );
                }}
              />
            </Field>
          </div>
          <Field
            label={profile.role === "teacher" ? "Year you teach" : "Your year"}
          >
            <Picker
              label="Programme year"
              value={profile.yearGroup}
              options={yearGroups(profile.program, profile.role)}
              onChange={(yearGroup) => patch({ yearGroup })}
            />
          </Field>
          {profile.program === "dp" && (
            <div className="form-three">
              <Field label="Examination year">
                <Picker
                  label="Examination year"
                  value={String(profile.examYear)}
                  options={Array.from({ length: 15 }, (_, i) =>
                    String(2026 + i),
                  )}
                  onChange={(v) => patch({ examYear: Number(v) })}
                />
              </Field>
              <Field label="Session">
                <Picker
                  label="Examination session"
                  value={profile.examSession}
                  options={["May", "November"]}
                  onChange={(v) =>
                    patch({ examSession: v as Profile["examSession"] })
                  }
                />
              </Field>
              <Field label="Default level">
                <Picker
                  label="Default subject level"
                  value={profile.level}
                  options={["SL", "HL"]}
                  onChange={(v) => patch({ level: v as Profile["level"] })}
                />
              </Field>
            </div>
          )}
          <Field
            label="Your subjects"
            hint="One subject per line, up to 12. You can set each resource’s level in the studio."
          >
            <Textarea
              value={subjects}
              rows={7}
              maxLength={1212}
              onChange={(e) => setSubjects(e.target.value)}
            />
          </Field>
          <Button type="submit">
            <Save size={17} />
            Save preferences
          </Button>
        </form>
        <div className="settings-side">
          <section className="panel">
            <div className="section-heading">
              <h2>Your work, in your hands</h2>
              <Archive size={21} />
            </div>
            <p>
              Resources, review schedules, tasks and notes live in this browser.
              They do not sync between devices. Anyone using this browser
              profile may be able to see them.
            </p>
            <p>
              Export a backup regularly, especially before clearing browser data
              or using a shared computer.
            </p>
            <div className="form-stack">
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    JSON.stringify(state, null, 2),
                    "ibgenie-backup-" + localDate() + ".json",
                    "application/json",
                  )
                }
              >
                <Download size={17} />
                Export workspace backup
              </Button>
              <label className="upload-backup">
                <Upload size={17} />
                Choose a backup to restore
                <input
                  type="file"
                  accept=".json,application/json"
                  aria-label="Choose workspace backup"
                  onChange={(e) => {
                    void readBackup(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {storageError && (
                <Button
                  variant="outline"
                  onClick={() => {
                    try {
                      downloadText(
                        rawBackup(),
                        "ibgenie-original-backup.json",
                        "application/json",
                      );
                    } catch {
                      setError(
                        "The browser could not read the original saved copy.",
                      );
                    }
                  }}
                >
                  Export original saved copy
                </Button>
              )}
            </div>
          </section>
          <section className="panel">
            <h2>AI connection</h2>
            <p>
              AI conversations stay in the current tab unless you export them.
              Submitted text goes to the text provider; live voice goes to the
              voice provider.
            </p>
            <AccessGate {...ai} />
            {ai.status?.authenticated && (
              <Button
                className="mt-4"
                variant="outline"
                onClick={async () => {
                  try {
                    await ai.signOut();
                    setNotice("Your Wix account is disconnected from this tab.");
                  } catch {
                    setError("Could not disconnect. Please try again.");
                  }
                }}
              >
                <LockKeyhole size={16} />
                Disconnect Wix
              </Button>
            )}
          </section>
          <section className="panel">
            <h2>Looking for your earlier chats?</h2>
            <p>
              The classic interface is still available for conversations saved
              by the old app in this browser.
            </p>
            <a className="source-link" href="/legacy">
              Open classic IBGenie <ExternalLink size={16} />
            </a>
          </section>
        </div>
      </div>
      <AlertDialog
        open={!!pending}
        onOpenChange={(v) => {
          if (!v) setPending(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Replace this workspace with your backup?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the resources, tasks, settings and review
              history on this device with {pending?.resources.length} resources
              and {pending?.tasks.length} tasks from the selected file. Export
              your current work first if you want to keep it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current workspace</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Restore backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
