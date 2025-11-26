"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { IbGenieLogo } from "./ib-genie-logo";
import { CircleUser, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatMessageComponent({ role, content }: ChatMessage) {
    const { toast } = useToast();
    const isAssistant = role === "assistant";

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(
            () => {
                toast({
                    title: "Copied!",
                    description: "Message copied to clipboard.",
                });
            },
            (err) => {
                console.error("Failed to copy: ", err);
                toast({
                    variant: "destructive",
                    title: "Copy Failed",
                    description: "Could not copy to clipboard. Please try again.",
                });
            }
        );
    };

    return (
        <div
            className={cn(
                "group flex items-start gap-4",
                !isAssistant && "justify-end"
            )}
        >
            {isAssistant && (
                <Avatar className="flex-shrink-0">
                    <AvatarFallback>
                        <IbGenieLogo className="h-6 w-6" />
                    </AvatarFallback>
                </Avatar>
            )}
            <div
                className={cn(
                    "max-w-[85%] rounded-lg p-3 text-sm md:max-w-[75%]",
                    isAssistant
                        ? "bg-muted order-2"
                        : "bg-primary text-primary-foreground order-1"
                )}
            >
                <div className="prose prose-sm max-w-none text-current">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ node, ...props }) => (
                                <p className="mb-2 last:mb-0" {...props} />
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
            {!isAssistant && (
                <Avatar className="flex-shrink-0 order-2">
                    <AvatarFallback>
                        <CircleUser />
                    </AvatarFallback>
                </Avatar>
            )}
            <div className={cn("flex-shrink-0 self-center order-3", isAssistant ? "" : "-order-1")}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={handleCopy}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
