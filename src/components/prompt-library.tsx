
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { personalities } from "@/lib/personalities";

interface PromptLibraryProps {
  onUsePrompt: (prompt: string) => void;
  onNewChat: (role: Role, program: Program) => void;
}

const icons: { [key: string]: React.ReactNode } = {
  default: <Lightbulb className="mr-2 h-4 w-4" />,
  pyp: <BookOpen className="mr-2 h-4 w-4" />,
  myp: <FlaskConical className="mr-2 h-4 w-4" />,
  dp: <Lightbulb className="mr-2 h-4 w-4" />,
};

export function PromptLibrary({ onNewChat, onUsePrompt }: PromptLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // We need local state for role and program to show the correct prompts
  // without switching the actual chat session until the user clicks an item.
  const [viewRole, setViewRole] = useState<Role>('student');
  const [viewProgram, setViewProgram] = useState<Program>('dp');

  const rolePrompts = prompts[viewRole];
  const programPrompts = rolePrompts[viewProgram];
  
  const personality = personalities[viewRole][viewProgram];

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

  const handleSelection = (role: Role, program: Program) => {
    onNewChat(role, program);
    // After creating a new chat, also update the local view state
    setViewRole(role);
    setViewProgram(program);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-2">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 text-muted-foreground w-full justify-start h-auto text-left -ml-1">
                    <div className="flex flex-col items-start">
                      <span>Showing prompts for:</span>
                      <span className="font-semibold text-foreground">{programDisplay[viewProgram]} {roleDisplay[viewRole]}s</span>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Student</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {allPrograms.map(p => (
                        <DropdownMenuItem key={`student-${p}`} onClick={() => handleSelection('student', p)}>
                            For {programDisplay[p]} Students
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                 <DropdownMenuLabel>Teacher</DropdownMenuLabel>
                 <DropdownMenuGroup>
                    {allPrograms.map(p => (
                        <DropdownMenuItem key={`teacher-${p}`} onClick={() => handleSelection('teacher', p)}>
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
        <Accordion type="multiple" defaultValue={filteredPrompts.map(g => g.category)} className="w-full px-2">
            {filteredPrompts.map((group) => (
                <AccordionItem value={group.category} key={group.category}>
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">{group.category}</AccordionTrigger>
                    <AccordionContent className="pb-1">
                        <div className="space-y-1">
                            {group.isRubricTool && viewRole === 'teacher' && <RubricFeedbackTool />}
                            {group.prompts.map((prompt) => (
                                <Button
                                    key={prompt.title}
                                    variant="ghost"
                                    className="w-full justify-start text-left h-auto"
                                    onClick={() => onUsePrompt(prompt.prompt)}
                                >
                                    {icons[viewProgram] || icons.default} {prompt.title}
                                </Button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
         {filteredPrompts.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No matching prompts found.
            </div>
        )}
      </ScrollArea>
    </div>
  );
}
