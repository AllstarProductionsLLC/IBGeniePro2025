"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VocabularyWord } from "@/lib/learning-data";
import { Volume2, CheckCircle2 } from "lucide-react";

interface VocabularyGameProps {
    vocabulary: VocabularyWord[];
}

export function VocabularyGame({ vocabulary }: VocabularyGameProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDefinition, setShowDefinition] = useState(false);
    const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());

    if (vocabulary.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                No vocabulary available for this subject yet!
            </div>
        );
    }

    const currentWord = vocabulary[currentIndex];
    const isMastered = masteredWords.has(currentWord.word);

    const handleNext = () => {
        setShowDefinition(false);
        setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
    };

    const handlePrevious = () => {
        setShowDefinition(false);
        setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
    };

    const toggleMastered = () => {
        setMasteredWords((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(currentWord.word)) {
                newSet.delete(currentWord.word);
            } else {
                newSet.add(currentWord.word);
            }
            return newSet;
        });
    };

    const speakWord = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentWord.word);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    Word {currentIndex + 1} of {vocabulary.length}
                </span>
                <Badge variant="secondary">
                    {masteredWords.size} mastered
                </Badge>
            </div>

            {/* Vocabulary Card */}
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {currentWord.word}
                            </span>
                            {isMastered && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        </div>
                        <Button variant="ghost" size="icon" onClick={speakWord}>
                            <Volume2 className="h-5 w-5" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Definition */}
                    <div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDefinition(!showDefinition)}
                            className="mb-2"
                        >
                            {showDefinition ? "Hide" : "Show"} Definition
                        </Button>
                        {showDefinition && (
                            <div className="p-4 bg-secondary/50 rounded-lg">
                                <p className="text-lg">{currentWord.definition}</p>
                            </div>
                        )}
                    </div>

                    {/* Example */}
                    {currentWord.example && showDefinition && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Example:
                            </p>
                            <p className="text-sm italic text-blue-800 dark:text-blue-200">
                                "{currentWord.example}"
                            </p>
                        </div>
                    )}

                    {/* Synonyms */}
                    {currentWord.synonyms && currentWord.synonyms.length > 0 && showDefinition && (
                        <div>
                            <p className="text-sm font-semibold mb-2">Similar words:</p>
                            <div className="flex flex-wrap gap-2">
                                {currentWord.synonyms.map((synonym, idx) => (
                                    <Badge key={idx} variant="outline">
                                        {synonym}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrevious} className="flex-1">
                    ← Previous
                </Button>
                <Button
                    variant={isMastered ? "default" : "outline"}
                    onClick={toggleMastered}
                    className="flex-1"
                >
                    {isMastered ? "✓ Mastered" : "Mark as Mastered"}
                </Button>
                <Button variant="outline" onClick={handleNext} className="flex-1">
                    Next →
                </Button>
            </div>
        </div>
    );
}
