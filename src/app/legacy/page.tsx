"use client";
import { useState } from "react";
import Link from "next/link";
import ChatInterface from "@/components/chat-interface";
import { LandingFlow } from "@/components/landing-flow";
import type { Subject } from "@/lib/subjects";
import type { Role, Program } from "@/app/page";
export default function Legacy() {
  const [role, setRole] = useState<Role | null>(null),
    [program, setProgram] = useState<Program | null>(null),
    [subject, setSubject] = useState<Subject | null>(null);
  const reset = () => {
    setRole(null);
    setProgram(null);
    setSubject(null);
  };
  return (
    <>
      <div className="legacy-notice">
        <span>
          Classic IBGenie · Your earlier chats remain in this browser.
        </span>
        <Link href="/#settings">
          Return to the new workspace and AI access settings →
        </Link>
      </div>
      {!role || !program || !subject ? (
        <LandingFlow
          role={role}
          program={program}
          onSelectRole={setRole}
          onSelectProgram={setProgram}
          onSelectSubject={setSubject}
        />
      ) : (
        <div style={{ height: "calc(100vh - 60px)" }}>
          <ChatInterface
            role={role}
            program={program}
            subject={subject}
            setRole={setRole}
            setProgram={setProgram}
            setSubject={setSubject}
            onReset={reset}
          />
        </div>
      )}
    </>
  );
}
