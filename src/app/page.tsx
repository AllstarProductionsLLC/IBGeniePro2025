"use client";

import { useState } from "react";
import ChatInterface from "@/components/chat-interface";
import PromptLibrary from "@/components/PromptLibrary"; // Import the PromptLibrary component
import { LandingFlow } from "@/components/landing-flow";

export type Role = "student" | "teacher";
export type Program = "pyp" | "myp" | "dp";

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility
  const [promptText, setPromptText] = useState("");

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: isSidebarOpen ? '350px' : '0',
          backgroundColor: '#f0f0f0',
          transition: 'width 0.3s ease-in-out',
          overflow: 'hidden',
          padding: isSidebarOpen ? '20px' : '0',
          boxSizing: 'border-box'
        }}
      >
        {isSidebarOpen && <PromptLibrary onUsePrompt={setPromptText} />} {/* Render PromptLibrary in sidebar */}
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, position: 'relative' }}>
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: '#77B5FE', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
        >
          {isSidebarOpen ? '< Hide Prompts' : 'Show Prompts >'}
        </button>
        <ChatInterface role={role} program={program} setRole={setRole} setProgram={setProgram} onReset={handleReset} initialPrompt={promptText} />
      </div>
    </div>
  );
}
