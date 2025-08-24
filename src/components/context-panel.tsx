"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import type { Role, Program } from "@/app/page";
import { RubricFeedbackTool } from "./rubric-feedback-tool";
import {
  FileText,
  FileSpreadsheet,
  FileBarChart,
  FileImage,
} from "lucide-react";

interface ContextPanelProps {
  role: Role;
  program: Program;
}

export function ContextPanel({ role, program }: ContextPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold font-headline">Context & Tools</h2>
      </div>
      <Tabs defaultValue="resources" className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="flex-1">
          <TabsContent value="resources" className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium">IB-Aligned Templates</h3>
              {role === 'teacher' && <RubricFeedbackTool />}
              <Button variant="outline" className="w-full justify-start">
                Lesson Plan Generator
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Unit Planner
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="export" className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Export Options</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> Word
                </Button>
                <Button variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline">
                  <FileBarChart className="mr-2 h-4 w-4" /> PPT
                </Button>
                <Button variant="outline">
                  <FileImage className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>
              <h3 className="font-medium">Cloud Save</h3>
              <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline">Google Drive</Button>
                 <Button variant="outline">OneDrive</Button>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
