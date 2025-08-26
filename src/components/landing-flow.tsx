"use client";

import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { School, User, ArrowLeft } from "lucide-react";
import type { Role, Program } from "@/app/page";
import { IbGenieLogo } from "./ib-genie-logo";
import { cn } from "@/lib/utils";

interface LandingFlowProps {
  role: Role | null;
  onSelectRole: Dispatch<SetStateAction<Role | null>>;
  onSelectProgram: Dispatch<SetStateAction<Program | null>>;
}

export function LandingFlow({ role, onSelectRole, onSelectProgram }: LandingFlowProps) {
  const handleGoBack = () => {
    onSelectRole(null);
  }

  const renderContent = () => {
    if (!role) {
      return <RoleSelection onSelectRole={onSelectRole} />;
    }
    return <ProgramSelection onSelectProgram={onSelectProgram} onBack={handleGoBack} />;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
}

function RoleSelection({ onSelectRole }: { onSelectRole: (role: Role) => void }) {
  return (
    <div className="text-center">
      <div className="mb-8 flex items-center justify-center gap-3">
        <IbGenieLogo className="h-12 w-12 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-tight">IBGenie</h1>
      </div>
      <p className="mb-8 text-lg text-muted-foreground">Your AI partner for the International Baccalaureate</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="transform cursor-pointer transition-transform hover:scale-105 hover:shadow-xl" onClick={() => onSelectRole("student")}>
          <CardHeader className="items-center">
            <User className="h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-2xl">I am a Student</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Get help with your assignments, research, and exam preparation.</p>
          </CardContent>
        </Card>
        <Card className="transform cursor-pointer transition-transform hover:scale-105 hover:shadow-xl" onClick={() => onSelectRole("teacher")}>
          <CardHeader className="items-center">
            <School className="h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-2xl">I am a Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Access tools for lesson planning, assessment, and feedback.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProgramSelection({ onSelectProgram, onBack }: { onSelectProgram: (program: Program) => void, onBack: () => void }) {
  const programs: { id: Program; name: string; description: string }[] = [
    { id: "pyp", name: "PYP", description: "Primary Years Programme" },
    { id: "myp", name: "MYP", description: "Middle Years Programme" },
    { id: "dp", name: "DP", description: "Diploma Programme" },
  ];

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Select Your Program</CardTitle>
        <CardDescription>This helps me tailor my assistance for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {programs.map((program) => (
          <Button
            key={program.id}
            variant="outline"
            className="w-full justify-start h-14 text-left"
            onClick={() => onSelectProgram(program.id)}
          >
            <div className="flex flex-col">
              <span className="font-bold">{program.name}</span>
              <span className="text-sm text-muted-foreground">{program.description}</span>
            </div>
          </Button>
        ))}
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </CardContent>
    </Card>
  );
}
