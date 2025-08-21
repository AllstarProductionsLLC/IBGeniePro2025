"use client";

import { prompts } from "@/lib/prompts";
import type { Role, Program } from "@/app/page";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Lightbulb, BookOpen, FlaskConical } from "lucide-react";
import { RubricFeedbackTool } from "./rubric-feedback-tool";

interface PromptLibraryProps {
  role: Role;
  program: Program;
  setInput: (input: string) => void;
}

const icons: { [key: string]: React.ReactNode } = {
  default: <Lightbulb className="mr-2 h-4 w-4" />,
  pyp: <BookOpen className="mr-2 h-4 w-4" />,
  myp: <FlaskConical className="mr-2 h-4 w-4" />,
  dp: <Lightbulb className="mr-2 h-4 w-4" />,
};

export function PromptLibrary({ role, program, setInput }: PromptLibraryProps) {
  const rolePrompts = prompts[role];
  const programPrompts = rolePrompts[program];

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-2">
        <h2 className="px-2 text-lg font-semibold tracking-tight font-headline">Prompt Starters</h2>
        <p className="px-2 text-sm text-muted-foreground">
          For {program.toUpperCase()} {role}s
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-2">
          {programPrompts.map((group) => (
            <div key={group.category}>
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                {group.category}
              </h3>
              <div className="space-y-1">
                {group.prompts.map((prompt) => (
                  <Button
                    key={prompt.title}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto"
                    onClick={() => handlePromptClick(prompt.prompt)}
                  >
                    {icons[program] || icons.default}
                    <span>{prompt.title}</span>
                  </Button>
                ))}
                {group.isRubricTool && <RubricFeedbackTool />}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
