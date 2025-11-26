"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FlashCardGame } from "./learning/flashcard-game";
import { VocabularyGame } from "./learning/vocabulary-game";
import { QuickQuiz } from "./learning/quick-quiz";
import { getLearningContent } from "@/lib/learning-data";
import { BookOpen, Sparkles, Brain, Gamepad2 } from "lucide-react";

interface StudentLearningPanelProps {
    subject: string;
    onToggleMode: () => void;
}

export function StudentLearningPanel({ subject, onToggleMode }: StudentLearningPanelProps) {
    const learningContent = getLearningContent(subject);
    const [activeTab, setActiveTab] = useState("flashcards");

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            {/* Header */}
            <div className="p-4 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-purple-500" />
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Learning Zone
                        </h2>
                    </div>
                    <Button variant="outline" size="sm" onClick={onToggleMode}>
                        Switch to Advanced Mode
                    </Button>
                </div>
                <Badge variant="secondary" className="text-sm">
                    {subject}
                </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="flashcards" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Flashcards</span>
                        </TabsTrigger>
                        <TabsTrigger value="vocabulary" className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <span className="hidden sm:inline">Vocabulary</span>
                        </TabsTrigger>
                        <TabsTrigger value="quiz" className="flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Quiz</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="flashcards" className="mt-0">
                        <Card className="border-2 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    Flashcards
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Test your knowledge with interactive flashcards!
                                </p>
                            </CardHeader>
                            <CardContent>
                                <FlashCardGame flashcards={learningContent.flashcards} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vocabulary" className="mt-0">
                        <Card className="border-2 border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-purple-500" />
                                    Vocabulary Builder
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Master important terms and concepts!
                                </p>
                            </CardHeader>
                            <CardContent>
                                <VocabularyGame vocabulary={learningContent.vocabulary} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="quiz" className="mt-0">
                        <Card className="border-2 border-pink-200 dark:border-pink-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gamepad2 className="h-5 w-5 text-pink-500" />
                                    Quick Quiz
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Challenge yourself with fun questions!
                                </p>
                            </CardHeader>
                            <CardContent>
                                <QuickQuiz questions={learningContent.quizzes} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Fun Footer */}
            <div className="p-4 border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-center">
                <p className="text-sm text-muted-foreground">
                    🌟 Keep learning and have fun! You're doing great! 🌟
                </p>
            </div>
        </div>
    );
}
