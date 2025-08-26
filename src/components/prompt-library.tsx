
"use client";

import { useState } from "react";
import { prompts } from "@/lib/prompts";
import type { Role, Program } from "@/app/page";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Lightbulb, BookOpen, FlaskConical, ChevronDown, Search } from "lucide-react";
import { RubricFeedbackTool } from "./rubric-feedback-tool";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PromptLibraryProps {
  role: Role;
  program: Program;
  setInput: (input: string) => void;
  onNewChat: (role: Role, program: Program) => void;
}

const icons: { [key: string]: React.ReactNode } = {
  default: <Lightbulb className="mr-2 h-4 w-4" />,
  pyp: <BookOpen className="mr-2 h-4 w-4" />,
  myp: <FlaskConical className="mr-2 h-4 w-4" />,
  dp: <Lightbulb className="mr-2 h-4 w-4" />,
};

export function PromptLibrary({ role, program, setInput, onNewChat }: PromptLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const rolePrompts = prompts[role];
  const programPrompts = rolePrompts[program];

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };
  
  const roleDisplay: Record<Role, string> = {
    student: "Student",
    teacher: "Teacher",
  }

  const programDisplay: Record<Program, string> = {
    pyp: "PYP",
    myp: "MYP",
    dp: "DP",
  }

  const allRoles: Role[] = ["student", "teacher"];
  const allPrograms: Program[] = ["pyp", "myp", "dp"];

  const filteredPrompts = programPrompts
    .map((group) => ({
      ...group,
      prompts: group.prompts.filter((prompt) =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.prompts.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="p-2">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 text-muted-foreground w-full justify-start -ml-1">
                    For {program.toUpperCase()} {roleDisplay[role]}s
                    <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Student</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {allPrograms.map(p => (
                        <DropdownMenuItem key={`student-${p}`} onClick={() => onNewChat('student', p)}>
                            For {programDisplay[p]} Students
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                 <DropdownMenuLabel>Teacher</DropdownMenuLabel>
                 <DropdownMenuGroup>
                    {allPrograms.map(p => (
                        <DropdownMenuItem key={`teacher-${p}`} onClick={() => onNewChat('teacher', p)}>
                            For {programDisplay[p]} Teachers
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search prompts..."
            className="w-full rounded-lg bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-2">
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((group) => (
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
            ))
          ) : (
            <p className="p-2 text-center text-sm text-muted-foreground">
              No prompts found.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
