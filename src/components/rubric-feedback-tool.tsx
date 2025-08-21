"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { rubricFeedback } from "@/ai/flows/rubric-feedback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";

export function RubricFeedbackTool() {
  const [rubric, setRubric] = useState("");
  const [studentWork, setStudentWork] = useState("");
  const [subject, setSubject] = useState("");
  const [program, setProgram] = useState<"PYP" | "MYP" | "DP">("DP");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerateFeedback = async () => {
    if (!rubric || !studentWork || !subject || !program) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to generate feedback.",
        });
        return;
    }

    setIsLoading(true);
    setFeedback("");
    try {
      const result = await rubricFeedback({
        rubricText: rubric,
        studentWorkText: studentWork,
        program: program,
        subject: subject,
      });
      setFeedback(result.feedback);
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "Could not generate feedback. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setRubric("");
    setStudentWork("");
    setSubject("");
    setProgram("DP");
    setFeedback("");
    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if(!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Wand2 className="mr-2 h-4 w-4" /> Formative Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Rubric-Based Formative Feedback
          </DialogTitle>
          <DialogDescription>
            Paste your rubric and the student's work to get criterion-linked
            feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 h-full overflow-hidden">
          <div className="space-y-4 flex flex-col">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="rubric">Rubric Text</Label>
              <Textarea
                placeholder="Paste rubric descriptors here."
                id="rubric"
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="student-work">Student Work Text</Label>
              <Textarea
                placeholder="Paste student work here."
                id="student-work"
                value={studentWork}
                onChange={(e) => setStudentWork(e.target.value)}
                className="flex-1"
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="program">Program</Label>
                    <Select value={program} onValueChange={(value: "PYP" | "MYP" | "DP") => setProgram(value)}>
                        <SelectTrigger id="program"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PYP">PYP</SelectItem>
                            <SelectItem value="MYP">MYP</SelectItem>
                            <SelectItem value="DP">DP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid w-full gap-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Textarea 
                    id="subject" 
                    placeholder="e.g. History"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="min-h-0 h-10"
                    />
                </div>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4 flex flex-col">
            <h3 className="font-semibold mb-2">Generated Feedback</h3>
            <ScrollArea className="flex-1 -m-4">
                <div className="p-4">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {feedback && (
                <Alert>
                  <AlertTitle>Feedback Generated</AlertTitle>
                  <AlertDescription className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {feedback}
                  </AlertDescription>
                </Alert>
              )}
              {!isLoading && !feedback && (
                <div className="text-center text-muted-foreground pt-16">
                    Your generated feedback will appear here.
                </div>
              )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          <Button onClick={handleGenerateFeedback} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
