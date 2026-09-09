"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  School,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  dpSubjects,
  profileSchema,
  yearGroups,
  type Profile,
} from "@/lib/workspace";
import { SUBJECTS } from "@/lib/subjects";
import { ErrorNote, Field, Picker } from "./shared";
export function WelcomeFlow({
  initial,
  onComplete,
  storageError,
}: {
  initial: Profile;
  onComplete: (profile: Profile) => void;
  storageError?: string;
}) {
  const [step, setStep] = useState(0),
    [profile, setProfile] = useState<Profile>(initial),
    [error, setError] = useState("");
  const patch = (value: Partial<Profile>) =>
    setProfile((p) => ({ ...p, ...value }));
  const available = Array.from(
    new Set([
      ...(profile.program === "dp" ? dpSubjects : SUBJECTS[profile.program]),
      ...profile.subjects,
    ]),
  );
  function next() {
    setError("");
    if (step === 2) {
      const parsed = profileSchema.safeParse(profile);
      if (!parsed.success || !profile.subjects.length) {
        setError("Choose at least one subject to make this workspace yours.");
        return;
      }
      onComplete(parsed.data);
    } else setStep((s) => s + 1);
  }
  return (
    <div className="welcome-shell">
      <div className="welcome-art">
        <img src="/brand/ibgenie-sky.svg" alt="" width={1000} height={1200} />
        <a
          className="welcome-brand"
          href="https://www.ibgenie.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GraduationCap size={29} />
          IB Genie
        </a>
        <div className="welcome-art-copy">
          <span className="eyebrow">
            A LITTLE CURIOSITY. A WORLD OF POSSIBILITY.
          </span>
          <h1>
            Your IB journey,
            <br />
            made a little brighter.
          </h1>
          <p>A space to understand, create and grow.</p>
        </div>
        <span className="welcome-art-credit">
          Designed for students. Inspired by great teaching.
        </span>
      </div>
      <main className="welcome-panel">
        <div
          className="welcome-progress"
          aria-label={"Step " + (step + 1) + " of 3"}
        >
          {["About you", "Your course", "Your subjects"].map((label, i) => (
            <div
              className={i === step ? "current" : i < step ? "complete" : ""}
              key={label}
            >
              <span>{i < step ? <Check size={15} /> : i + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <div className="welcome-form">
          <span className="eyebrow">WELCOME TO IB GENIE</span>
          <h2>
            {
              [
                "Let’s make this space yours.",
                "Meet your course where you are.",
                "What are you exploring?",
              ][step]
            }
          </h2>
          <p className="welcome-description">
            {
              [
                "A quick introduction, then you’re ready to go.",
                "We’ll use this context to guide your resources and coaching.",
                "Choose the subjects you study or teach. You can change these in Settings.",
              ][step]
            }
          </p>
          {step === 0 && (
            <>
              <Field
                label="What should we call you?"
                hint="A first name or nickname is enough."
              >
                <Input
                  value={profile.name}
                  maxLength={60}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Your name (optional)"
                  autoComplete="given-name"
                />
              </Field>
              <fieldset className="welcome-role">
                <legend>I’m here as a</legend>
                <div>
                  {(["student", "teacher"] as const).map((role) => (
                    <button
                      type="button"
                      key={role}
                      className={profile.role === role ? "selected" : ""}
                      aria-pressed={profile.role === role}
                      onClick={() =>
                        patch({
                          role,
                          yearGroup: yearGroups(profile.program, role).includes(
                            profile.yearGroup,
                          )
                            ? profile.yearGroup
                            : "Year 1",
                        })
                      }
                    >
                      {role === "student" ? (
                        <GraduationCap size={28} />
                      ) : (
                        <School size={28} />
                      )}
                      <strong>
                        {role === "student" ? "Student" : "Teacher"}
                      </strong>
                      <small>
                        {role === "student"
                          ? "Build understanding and confidence"
                          : "Create resources and inspire learning"}
                      </small>
                      {profile.role === role && (
                        <Check className="choice-check" size={17} />
                      )}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          {step === 1 && (
            <>
              <Field label="IB programme">
                <Picker
                  label="IB programme"
                  value={profile.program}
                  options={[
                    { value: "dp", label: "Diploma Programme (DP)" },
                    { value: "myp", label: "Middle Years Programme (MYP)" },
                    { value: "pyp", label: "Primary Years Programme (PYP)" },
                  ]}
                  onChange={(v) => {
                    const program = v as Profile["program"];
                    patch({ program, yearGroup: "Year 1", subjects: [] });
                  }}
                />
              </Field>
              <Field
                label={
                  profile.role === "teacher" ? "Year you teach" : "Your year"
                }
              >
                <Picker
                  label="Programme year"
                  value={profile.yearGroup}
                  options={yearGroups(profile.program, profile.role)}
                  onChange={(yearGroup) => patch({ yearGroup })}
                />
              </Field>
              {profile.program === "dp" && (
                <>
                  <div className="form-grid">
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
                    <Field label="Examination session">
                      <Picker
                        label="Examination session"
                        value={profile.examSession}
                        options={["May", "November"]}
                        onChange={(v) =>
                          patch({ examSession: v as Profile["examSession"] })
                        }
                      />
                    </Field>
                  </div>
                  <Field
                    label="Default subject level"
                    hint="Choose a different level in each resource or coaching session."
                  >
                    <Picker
                      label="Default level"
                      value={profile.level}
                      options={["SL", "HL"]}
                      onChange={(v) => patch({ level: v as Profile["level"] })}
                    />
                  </Field>
                </>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <div className="subject-choice-header">
                <strong>{profile.subjects.length} selected</strong>
                <span>Choose up to 12</span>
              </div>
              <div className="welcome-subjects">
                {available.map((subject) => (
                  <label
                    key={subject}
                    className={
                      profile.subjects.includes(subject) ? "selected" : ""
                    }
                  >
                    <Checkbox
                      checked={profile.subjects.includes(subject)}
                      disabled={
                        !profile.subjects.includes(subject) &&
                        profile.subjects.length >= 12
                      }
                      onCheckedChange={(v) =>
                        patch({
                          subjects: v
                            ? [...profile.subjects, subject]
                            : profile.subjects.filter((s) => s !== subject),
                        })
                      }
                    />
                    {subject}
                  </label>
                ))}
              </div>
              <div className="welcome-summary">
                <Sparkles size={18} />
                <span>
                  {profile.program.toUpperCase()} · {profile.yearGroup}
                  {profile.program === "dp"
                    ? " · " + profile.examSession + " " + profile.examYear
                    : ""}
                </span>
              </div>
            </>
          )}
          {error && <ErrorNote>{error}</ErrorNote>}
          {storageError && <ErrorNote>{storageError}</ErrorNote>}
          <div className="welcome-actions">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={17} />
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={next}>
              {step === 2 ? "Open my workspace" : "Continue"}
              <ArrowRight size={17} />
            </Button>
          </div>
          <p className="welcome-save-note">
            Your choices are remembered in this browser. Update them anytime in
            Profile & settings.
          </p>
        </div>
        <footer className="welcome-footer">
          Independent of the International Baccalaureate Organization.
        </footer>
      </main>
    </div>
  );
}
