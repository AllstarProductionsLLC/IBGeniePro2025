"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuizQuestion } from "@/lib/learning-data";
import { CheckCircle2, XCircle, RotateCw } from "lucide-react";

interface QuickQuizProps {
    questions: QuizQuestion[];
}

export function QuickQuiz({ questions }: QuickQuizProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

    if (questions.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                No quiz questions available for this subject yet!
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isAnswered = answeredQuestions.has(currentQuestion.id);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const handleAnswerSelect = (answerIndex: number) => {
        if (isAnswered) return;

        setSelectedAnswer(answerIndex);
        setShowExplanation(true);
        setAnsweredQuestions((prev) => new Set([...prev, currentQuestion.id]));

        if (answerIndex === currentQuestion.correctAnswer) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setShowExplanation(false);
        setCurrentIndex((prev) => (prev + 1) % questions.length);
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setAnsweredQuestions(new Set());
    };

    const getButtonVariant = (answerIndex: number) => {
        if (!isAnswered) return "outline";
        if (answerIndex === currentQuestion.correctAnswer) return "default";
        if (answerIndex === selectedAnswer && !isCorrect) return "destructive";
        return "outline";
    };

    const getButtonIcon = (answerIndex: number) => {
        if (!isAnswered) return null;
        if (answerIndex === currentQuestion.correctAnswer) {
            return <CheckCircle2 className="h-4 w-4 ml-2" />;
        }
        if (answerIndex === selectedAnswer && !isCorrect) {
            return <XCircle className="h-4 w-4 ml-2" />;
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-lg px-4 py-1">
                    Score: {score} / {answeredQuestions.size}
                </Badge>
                <span className="text-sm text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                </span>
            </div>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Answer Options */}
                    {currentQuestion.options.map((option, index) => (
                        <Button
                            key={index}
                            variant={getButtonVariant(index)}
                            className="w-full justify-between text-left h-auto py-3 px-4"
                            onClick={() => handleAnswerSelect(index)}
                            disabled={isAnswered}
                        >
                            <span>{option}</span>
                            {getButtonIcon(index)}
                        </Button>
                    ))}

                    {/* Explanation */}
                    {showExplanation && (
                        <div
                            className={`p-4 rounded-lg border-2 ${isCorrect
                                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                    : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                                }`}
                        >
                            <p className="font-semibold mb-2">
                                {isCorrect ? "🎉 Correct!" : "📚 Not quite!"}
                            </p>
                            <p className="text-sm">{currentQuestion.explanation}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-2">
                {isAnswered && (
                    <Button onClick={handleNext} className="flex-1">
                        {currentIndex < questions.length - 1 ? "Next Question →" : "Review Quiz"}
                    </Button>
                )}
                {answeredQuestions.size === questions.length && (
                    <Button variant="outline" onClick={handleReset}>
                        <RotateCw className="h-4 w-4 mr-2" />
                        Restart Quiz
                    </Button>
                )}
            </div>

            {/* Completion Message */}
            {answeredQuestions.size === questions.length && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold mb-2">Quiz Complete! 🎊</p>
                        <p className="text-lg">
                            You scored {score} out of {questions.length}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {score === questions.length
                                ? "Perfect score! You're a star! ⭐"
                                : score >= questions.length / 2
                                    ? "Great job! Keep practicing! 💪"
                                    : "Keep learning! You'll get there! 📚"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
