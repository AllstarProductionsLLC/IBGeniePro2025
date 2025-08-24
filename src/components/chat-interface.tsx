"use client";

import { useEffect, useState } from "react";
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Bot,
  CircleUser,
  FileUp,
  Mic,
  PanelLeft,
  Send,
  Settings2,
  Trash2,
} from "lucide-react";
import type { Role, Program } from "@/app/page";
import { IbGenieLogo } from "./ib-genie-logo";
import { PromptLibrary } from "./prompt-library";
import { ContextPanel } from "./context-panel";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { personalities } from "@/lib/personalities";

interface ChatInterfaceProps {
  role: Role;
  program: Program;
  onReset: () => void;
}

export default function ChatInterface({
  role,
  program,
  onReset,
}: ChatInterfaceProps) {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<ChatSession | null>(null);

  const personality = personalities[role][program];

  useEffect(() => {
    const initChat = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("GEMINI_API_KEY is not set.");
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: personality.systemPrompt,
        });
        const newChat = model.startChat({
          history: [],
        });
        setChat(newChat);
        setMessages([
          {
            role: "assistant",
            content: personality.welcomeMessage,
          },
        ]);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setMessages([
          {
            role: "assistant",
            content: "Error: Failed to initialize AI.",
          },
        ]);
      }
    };
    initChat();
  }, [role, program, personality.systemPrompt, personality.welcomeMessage]);

  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
  const identityText = `IB Genie ${capitalizedRole} Edition`;

  const handleSend = async () => {
    if (input.trim() && chat) {
      const newUserMessage = { role: "user", content: input };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const result = await chat.sendMessage(input);
        const response = await result.response;
        const text = response.text();

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: text },
        ]);
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: "Error: Failed to get response from AI.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: personality.welcomeMessage,
      },
    ]);
  };

  const handleReset = () => {
    handleClear();
    onReset();
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden">
            <PanelLeft />
          </SidebarTrigger>
          <div className="flex items-center gap-2">
            <IbGenieLogo className="h-7 w-7 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight md:text-xl font-headline">
              {isMobile ? "IBGenie" : identityText}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Trash2 className="mr-2 h-4 w-4" />
              New Session
            </Button>
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings2 className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60dvh]">
                  <ContextPanel role={role} program={program} />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="group hidden data-[state=expanded]:w-72 md:flex"
          >
            <SidebarContent className="p-2">
              <PromptLibrary
                role={role}
                program={program}
                setInput={setInput}
              />
            </SidebarContent>
          </Sidebar>
          <main className="flex flex-1 flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 md:p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                  {messages.map((message, index) => (
                    <ChatMessage key={index} {...message} />
                  ))}
                  {isLoading && <Thinking />}
                </div>
              </div>
            </ScrollArea>
            <div className="border-t bg-background p-4 md:p-6">
              <div className="mx-auto max-w-4xl">
                <div className="relative">
                  <Textarea
                    placeholder="Ask IBGenie anything..."
                    className="min-h-12 resize-none pr-32"
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
                    <Button variant="ghost" size="icon">
                      <FileUp className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Mic className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={handleSend}
                      size="icon"
                      disabled={isLoading}
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
            </div>
          </main>
          {!isMobile && (
            <div className="hidden w-80 border-l lg:block">
              <ContextPanel role={role} program={program} />
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

function ChatMessage({ role, content }: { role: string; content: string }) {
  const isAssistant = role === "assistant";
  return (
    <div
      className={cn(
        "flex items-start gap-4",
        !isAssistant && "flex-row-reverse"
      )}
    >
      <Avatar>
        <AvatarFallback>
          {isAssistant ? <Bot /> : <CircleUser />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[75%] rounded-lg p-3 text-.sm",
          isAssistant ? "bg-muted" : "bg-primary text-primary-foreground"
        )}
      >
        {isAssistant ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-start gap-4">
      <Avatar>
        <AvatarFallback>
          <Bot />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[75%] rounded-lg p-3 text-sm bg-muted">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
