"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlashCard } from "@/lib/learning-data";
import { RotateCw, ChevronLeft, ChevronRight } from "lucide-react";

interface FlashCardGameProps {
    flashcards: FlashCard[];
}

export function FlashCardGame({ flashcards }: FlashCardGameProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<string>>(new Set());

    if (flashcards.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                No flashcards available for this subject yet!
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((knownCards.size / flashcards.length) * 100).toFixed(0);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    };

    const handleMarkKnown = () => {
        setKnownCards((prev) => new Set([...prev, currentCard.id]));
        setTimeout(handleNext, 300);
    };

    const handleMarkUnknown = () => {
        setKnownCards((prev) => {
            const newSet = new Set(prev);
            newSet.delete(currentCard.id);
            return newSet;
        });
        setTimeout(handleNext, 300);
    };

    const resetProgress = () => {
        setKnownCards(new Set());
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    return (
        <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{progress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Flashcard */}
            <div className="relative perspective-1000">
                <Card
                    className={`cursor-pointer transition-all duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""
                        } hover:shadow-lg min-h-[300px] flex items-center justify-center`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <CardContent className="p-8">
                        <div className={`text-center ${isFlipped ? "hidden" : "block"}`}>
                            <Badge className="mb-4" variant="secondary">
                                {currentCard.category}
                            </Badge>
                            <p className="text-2xl font-semibold">{currentCard.front}</p>
                            <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
                        </div>
                        <div className={`text-center ${isFlipped ? "block" : "hidden"}`}>
                            <Badge className="mb-4" variant="secondary">
                                Answer
                            </Badge>
                            <p className="text-xl">{currentCard.back}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {flashcards.length}
                </span>

                <Button variant="outline" size="sm" onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {/* Know/Don't Know Buttons */}
            {isFlipped && (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 border-red-200 hover:bg-red-50"
                        onClick={handleMarkUnknown}
                    >
                        😕 Need to review
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 border-green-200 hover:bg-green-50"
                        onClick={handleMarkKnown}
                    >
                        ✅ I know this!
                    </Button>
                </div>
            )}

            {/* Reset Button */}
            {knownCards.size > 0 && (
                <Button variant="ghost" size="sm" onClick={resetProgress} className="w-full">
                    <RotateCw className="h-4 w-4 mr-2" />
                    Reset Progress
                </Button>
            )}
        </div>
    );
}
