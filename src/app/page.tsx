"use client";

import { useState } from "react";
import ChatInterface from "@/components/chat-interface";
import { LandingFlow } from "@/components/landing-flow";

export type Role = "student" | "teacher";
export type Program = "pyp" | "myp" | "dp";

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [program, setProgram] = useState<Program | null>(null);

  const handleReset = () => {
    setRole(null);
    setProgram(null);
  };

  if (!role || !program) {
    return (
      <LandingFlow
        role={role}
        onSelectRole={setRole}
        onSelectProgram={setProgram}
      />
    );
  }

  return <ChatInterface role={role} program={program} onReset={handleReset} />;
}
