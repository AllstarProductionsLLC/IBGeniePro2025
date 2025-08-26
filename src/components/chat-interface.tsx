
"use client";

import { useEffect, useState, useRef, ChangeEvent, DragEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  CircleUser,
  FileUp,
  Send,
  Trash2,
  X,
  Copy,
  FileDown,
  Wand2,
  Save,
  MoreVertical,
  Upload,
  MessageSquare,
  Sparkles,
  Home,
} from "lucide-react";
import type { Role, Program } from "@/app/page";
import { IbGenieLogo } from "./ib-genie-logo";
import { PromptLibrary } from "./prompt-library";
import { ChatHistory } from "./chat-history";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { personalities } from "@/lib/personalities";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { renderToString } from 'react-dom/server';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
    id: string;
    title: string;
    role: Role;
    program: Program;
    messages: ChatMessage[];
    createdAt: number;
}

interface ChatInterfaceProps {
  role: Role;
  program: Program;
  setRole: (role: Role) => void;
  setProgram: (program: Program) => void;
  onReset: () => void;
}

export default function ChatInterface({
  role: initialRole,
  program: initialProgram,
  setRole: setParentRole,
  setProgram: setParentProgram,
  onReset: onParentReset,
}: ChatInterfaceProps) {
  const isMobile = useIsMobile();
  const [sidebarView, setSidebarView] = useState<'prompts' | 'history'>('prompts');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const { toast } = useToast();

  const activeSession = chatHistory.find(s => s.id === activeSessionId);
  const role = activeSession?.role || initialRole;
  const program = activeSession?.program || initialProgram;
  const messages = activeSession?.messages || [];
  const personality = personalities[role][program];

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("ibGenieChatHistory");
      if (savedHistory) {
        const parsedHistory: ChatSession[] = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        const latestSession = parsedHistory.sort((a,b) => b.createdAt - a.createdAt)[0];
        if(latestSession) {
            setActiveSessionId(latestSession.id);
        } else {
            handleNewChat(initialRole, initialProgram);
        }
      } else {
        handleNewChat(initialRole, initialProgram);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage:", error);
      handleNewChat(initialRole, initialProgram);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Save to LocalStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      try {
        const historyString = JSON.stringify(chatHistory);
        localStorage.setItem("ibGenieChatHistory", historyString);
      } catch (error) {
        console.error("Failed to save chat history to localStorage:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save chat history. Your browser might be out of space.",
        });
      }
    } else {
        // If history is empty, remove it from local storage
        localStorage.removeItem("ibGenieChatHistory");
    }
  }, [chatHistory, toast]);

  const updateMessages = (newMessages: ChatMessage[]) => {
     setChatHistory(prev => prev.map(session => 
        session.id === activeSessionId ? { ...session, messages: newMessages } : session
     ));
  };

  const handleNewChat = (role: Role, program: Program) => {
    const welcomeMessage = personalities[role][program].welcomeMessage;
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New Chat",
      role,
      program,
      messages: [{ role: "assistant", content: welcomeMessage }],
      createdAt: Date.now(),
    };
    setChatHistory(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setParentRole(role);
    setParentProgram(program);
  };
  
  const handleDeleteChat = (sessionId: string) => {
    setChatHistory(prev => {
        const updatedHistory = prev.filter(session => session.id !== sessionId);
        if (activeSessionId === sessionId) {
            const nextSession = updatedHistory.sort((a,b) => b.createdAt - a.createdAt)[0];
            if (nextSession) {
                setActiveSessionId(nextSession.id);
            } else {
                // If no sessions are left, create a new one
                handleNewChat(initialRole, initialProgram);
            }
        }
        // If all chats are deleted, create a new one.
        if (updatedHistory.length === 0) {
            handleNewChat(initialRole, initialProgram);
        }
        return updatedHistory;
    });
  };

  const handleRenameChat = (sessionId: string, newTitle: string) => {
      setChatHistory(prev => prev.map(session => 
        session.id === sessionId ? { ...session, title: newTitle } : session
      ));
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile);
      setInput(
        `Attached file: ${selectedFile.name}. What should I do with this file?`
      );
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      handleFileSelect(uploadedFile);
    }
    if (event.target) event.target.value = "";
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  const removeFile = () => {
    setFile(null);
    if (input.includes("Attached file:")) {
      setInput("");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSession) return;

    const newUserMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, newUserMessage];
    updateMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const history = newMessages
        .slice(0, -1) // Exclude the latest user message
        .filter((msg) => msg.role !== 'assistant' || msg.content !== personality.welcomeMessage) // Filter out welcome message
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));
      
      const formData = new FormData();
      formData.append("message", input);
      formData.append("role", role);
      formData.append("program", program);
      formData.append("history", JSON.stringify(history));
      if (file) {
        formData.append("file", file);
      }
      
      // Update session title
      if(activeSession.title === "New Chat" && activeSession.messages.length <= 1) { // It's a new chat
        const title = input.split(' ').slice(0, 5).join(' ') + '...';
        setChatHistory(prev => prev.map(s => s.id === activeSessionId ? {...s, title} : s));
      }


      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({error: 'Unknown server error'}));
        throw new Error(errorData.error || "Error from server");
      }

      const { message } = await response.json();
      updateMessages([
        ...newMessages,
        { role: "assistant", content: message },
      ]);
    } catch (error) {
      console.error("Error calling API:", error);
      updateMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from AI.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  const handleCopy = () => {
    if (!activeSession) return;
    const plainText = messages
      .map(
        (msg) =>
          `${msg.role === 'assistant' ? 'IBGenie' : 'User'}:\n${msg.content}`
      )
      .join('\n\n');

    const htmlString = renderToString(
      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: 'bold' }}>
              {msg.role === 'assistant' ? 'IBGenie' : 'User'}:
            </p>
            <div
              dangerouslySetInnerHTML={{
                __html: renderToString(<ReactMarkdown>{msg.content}</ReactMarkdown>),
              }}
            />
          </div>
        ))}
      </div>
    );
  
    const blobHtml = new Blob([htmlString], { type: 'text/html' });
    const blobText = new Blob([plainText], { type: 'text/plain' });
    const clipboardItem = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
    });

    navigator.clipboard.write([clipboardItem]).then(
      () => {
        toast({
          title: "Copied!",
          description: "Chat copied to clipboard.",
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

  const getPlainTextChat = () => {
    return messages
      .map(
        (msg) =>
          `${msg.role === 'assistant' ? 'IBGenie' : 'User'}:\n${msg.content}`
      )
      .join('\n\n');
  };

  const getHtmlChat = () => {
    return renderToString(
      <html>
        <head>
          <title>IBGenie Chat Export</title>
          <style>
            {'body { font-family: sans-serif; } .message { margin-bottom: 16px; } .role { font-weight: bold; }'}
          </style>
        </head>
        <body>
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <p className="role">
                {msg.role === 'assistant' ? 'IBGenie' : 'User'}:
              </p>
              <div
                dangerouslySetInnerHTML={{
                  __html: renderToString(<ReactMarkdown>{msg.content}</ReactMarkdown>),
                }}
              />
            </div>
          ))}
        </body>
      </html>
    );
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  const handleExportWord = () => {
    const MimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Chat Export</title></head><body>`;
    const footer = "</body></html>";
    const htmlContent = renderToString(
       <div>
        <h1>IBGenie Chat Export</h1>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: 'bold' }}>
              {msg.role === 'assistant' ? 'IBGenie' : 'User'}:
            </p>
             <div dangerouslySetInnerHTML={{ __html: renderToString(<ReactMarkdown>{msg.content}</ReactMarkdown>)}} />
          </div>
        ))}
      </div>
    );
    const source = header + htmlContent + footer;
    const blob = new Blob([source], { type: MimeType });
    downloadFile(blob, 'ib-genie-chat.doc');
  };

  const handleExportTxt = () => {
    if (!activeSession) return;
    const plainText = getPlainTextChat();
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `${activeSession.title.replace(/ /g, '_')}.txt`);
  };
  
  const handleExportPdf = () => {
    const htmlContent = getHtmlChat();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "Could not open print window. Please disable your pop-up blocker.",
        });
    }
  };
  
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
  const identityText = `IB Genie ${capitalizedRole} Edition`;

  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="group hidden data-[state=expanded]:w-72 md:flex"
      >
        <SidebarContent className="p-0">
          <SidebarHeader className="p-2 pb-0">
            <h2 className="px-2 text-lg font-semibold tracking-tight font-headline">IBGenie</h2>
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md">
                 <Button
                    variant={sidebarView === 'prompts' ? 'primary' : 'ghost'}
                    size="sm"
                    className="h-8"
                    onClick={() => setSidebarView('prompts')}
                 >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Prompts
                </Button>
                <Button
                    variant={sidebarView === 'history' ? 'primary' : 'ghost'}
                    size="sm"
                    className="h-8"
                    onClick={() => setSidebarView('history')}
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    History
                </Button>
            </div>
          </SidebarHeader>

          {sidebarView === 'prompts' ? (
            <PromptLibrary
              role={role}
              program={program}
              onNewChat={handleNewChat}
              setInput={setInput}
            />
          ) : (
            <ChatHistory
              sessions={chatHistory}
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSessionId}
              onDeleteSession={handleDeleteChat}
              onNewChat={() => handleNewChat(initialRole, initialProgram)}
              onRenameSession={handleRenameChat}
            />
          )}

        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen w-full flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
             <SidebarTrigger className="flex md:hidden" />
            <div className="flex flex-1 items-center gap-2 min-w-0">
               <div className="flex items-center gap-2 cursor-pointer" onClick={onParentReset}>
                 <SidebarTrigger className="hidden md:flex" />
                 <IbGenieLogo className="h-7 w-7 text-primary flex-shrink-0" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight md:text-xl font-headline whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer" onClick={onParentReset}>
                {isMobile ? "IBGenie" : (activeSession?.title || identityText)}
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={onParentReset}>
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
              </Button>
               <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportWord}>
                    Word Document (.doc)
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={handleExportTxt}>
                    Plain Text (.txt)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf}>
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="outline" size="sm">
                    <MoreVertical className="mr-2 h-4 w-4" /> Chat Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                   <DropdownMenuItem onClick={() => handleNewChat(role, program)}>
                     <Trash2 className="mr-2 h-4 w-4" /> New Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportTxt}>
                    <Save className="mr-2 h-4 w-4" /> Save Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex flex-1 flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-4 md:p-6">
                  <div className="mx-auto max-w-4xl space-y-6">
                    {messages.map((message, index) => (
                      <ChatMessage key={index} {...message} />
                    ))}
                    {isLoading && <ThinkingIndicator />}
                  </div>
                </div>
              </ScrollArea>
              <div
                className="border-t bg-background p-4 md:p-6"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="mx-auto max-w-4xl relative">
                   {isDragging && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-background/80 backdrop-blur-sm">
                      <Upload className="h-8 w-8 text-primary" />
                      <p className="mt-2 text-sm font-semibold text-primary">
                        Drop file to upload
                      </p>
                    </div>
                  )}
                  {file && (
                    <div className="mb-2 flex items-center justify-center">
                      <Badge variant="secondary">
                        {file.name}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ChatMessage({ role, content }: { role: 'user' | 'assistant'; content: string }) {
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
        !isAssistant && "flex-row-reverse"
      )}
    >
      <Avatar>
        <AvatarFallback>
          {isAssistant ? (
            <IbGenieLogo className="h-6 w-6" />
          ) : (
            <CircleUser />
          )}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[75%] rounded-lg p-3 text-sm",
          isAssistant ? "bg-muted" : "bg-primary text-primary-foreground"
        )}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
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
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-2">
        <IbGenieLogo className="h-8 w-8 animate-pulse-glow text-primary" />
        <span className="font-semibold text-muted-foreground">
          IBGenie is thinking...
        </span>
      </div>
    </div>
  );
}
