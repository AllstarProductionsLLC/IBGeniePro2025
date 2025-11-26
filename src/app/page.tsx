"use client";

import { useState } from "react";
import ChatInterface from "@/components/chat-interface";
import { LandingFlow } from "@/components/landing-flow";
import { Subject } from "@/lib/subjects";

export type Role = "student" | "teacher";
export type Program = "pyp" | "myp" | "dp";

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  const handleReset = () => {
    setRole(null);
    setProgram(null);
    setSubject(null);
  };

  if (!role || !program || !subject) {
    return (
      <LandingFlow
        role={role}
        program={program}
        onSelectRole={setRole}
        onSelectProgram={setProgram}
        onSelectSubject={setSubject}
      />
    );
  }

  return (
    <div style={{ height: '100vh' }}>
      <ChatInterface
        role={role}
        program={program}
        subject={subject}
        setRole={setRole}
        setProgram={setProgram}
        setSubject={setSubject}
        onReset={handleReset}
      />
    </div>
  );
}
