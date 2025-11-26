"use client";

import { ChangeEvent, RefObject } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { FileUp, Send, X } from "lucide-react";

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    handleSend: () => void;
    handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
    triggerFileUpload: () => void;
    fileInputRef: RefObject<HTMLInputElement>;
    file: File | null;
    attachedFile?: { name: string };
    removeFile: () => void;
}

export function ChatInput({
    input,
    setInput,
    isLoading,
    handleSend,
    handleFileUpload,
    triggerFileUpload,
    fileInputRef,
    file,
    attachedFile,
    removeFile
}: ChatInputProps) {
    return (
        <div className="mx-auto max-w-4xl relative">
            {(file || attachedFile) && (
                <div className="mb-2 flex items-center justify-center">
                    <Badge variant="secondary">
                        {file?.name || attachedFile?.name}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-4 w-4"
                            onClick={removeFile}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                </div>
            )}
            <div className="relative">
                <Textarea
                    placeholder="Ask IBGenie anything..."
                    className="min-h-12 resize-none pr-24 md:pr-32"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={isLoading}
                />
                <div className="absolute bottom-2.5 right-3 flex items-center gap-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={triggerFileUpload}
                        disabled={isLoading}
                    >
                        <FileUp className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={handleSend}
                        size="icon"
                        disabled={isLoading || !input?.trim()}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
                Use AI responsibly. Acknowledge where AI assisted you. Follow
                your school’s IB academic integrity policy.
            </p>
        </div>
    );
}
