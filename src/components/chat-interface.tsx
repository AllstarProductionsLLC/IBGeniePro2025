
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
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import {
  Copy,
  FileDown,
  MoreVertical,
  Upload,
  MessageSquare,
  Sparkles,
  Home,
  Edit,
  FileText,
} from "lucide-react";
import type { Role, Program } from "@/app/page";
import { IbGenieLogo } from "./ib-genie-logo";
import { ChatHistory } from "./chat-history";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { personalities } from "@/lib/personalities";
import { ChatMessageComponent } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ThinkingIndicator } from "./thinking-indicator";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { renderToString } from 'react-dom/server';
import { v4 as uuidv4 } from 'uuid';
import { Input } from "./ui/input";
import { PromptLibrary } from "./prompt-library";
import { StudentLearningPanel } from "./student-learning-panel";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  role: Role;
  program: Program;
  subject?: Subject;
  messages: ChatMessage[];
  createdAt: number;
  attachedFile?: {
    name: string;
    type: string;
    data: string; // base64 encoded
  }
}

import { Subject } from "@/lib/subjects";

interface ChatInterfaceProps {
  role: Role;
  program: Program;
  subject: Subject;
  setRole: (role: Role) => void;
  setProgram: (program: Program) => void;
  setSubject: (subject: Subject) => void;
  onReset: () => void;
  initialPrompt?: string;
}

export default function ChatInterface({
  role: initialRole,
  program: initialProgram,
  subject: initialSubject,
  setRole: setParentRole,
  setProgram: setParentProgram,
  setSubject: setParentSubject,
  onReset: onParentReset,
  initialPrompt,
}: ChatInterfaceProps) {
  const isMobile = useIsMobile();
  const [sidebarView, setSidebarView] = useState<'prompts' | 'history'>('prompts');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [learningMode, setLearningMode] = useState<'interactive' | 'advanced'>(
    initialRole === 'student' ? 'interactive' : 'advanced'
  );

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const { toast } = useToast();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleRenameValue, setTitleRenameValue] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const activeSession = chatHistory.find(s => s.id === activeSessionId);
  const role = activeSession?.role || initialRole;
  const program = activeSession?.program || initialProgram;
  const subject = activeSession?.subject || initialSubject;
  const messages = activeSession?.messages || [];
  const personality = personalities[role][program];

  useEffect(() => {
    setInput(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("ibGenieChatHistory");
      if (savedHistory) {
        const parsedHistory: ChatSession[] = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        const latestSession = parsedHistory.sort((a, b) => b.createdAt - a.createdAt)[0];
        if (latestSession) {
          setActiveSessionId(latestSession.id);
        } else {
          handleNewChat(initialRole, initialProgram, initialSubject);
        }
      } else {
        handleNewChat(initialRole, initialProgram, initialSubject);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage:", error);
      handleNewChat(initialRole, initialProgram, initialSubject);
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
      localStorage.removeItem("ibGenieChatHistory");
    }
  }, [chatHistory, toast]);

  const updateSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setChatHistory(prev => prev.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    ));
  };

  const updateMessages = (newMessages: ChatMessage[]) => {
    if (activeSessionId) {
      updateSession(activeSessionId, { messages: newMessages });
    }
  };

  const handleNewChat = (role: Role, program: Program, subject: Subject) => {
    const welcomeMessage = personalities[role][program].welcomeMessage;
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New Chat",
      role,
      program,
      subject,
      messages: [{ role: "assistant", content: welcomeMessage }],
      createdAt: Date.now(),
    };
    setChatHistory(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setParentRole(role);
    setParentProgram(program);
    setParentSubject(subject);
  };

  const handleDeleteChat = (sessionId: string) => {
    setChatHistory(prev => {
      const updatedHistory = prev.filter(session => session.id !== sessionId);
      if (activeSessionId === sessionId) {
        const nextSession = updatedHistory.sort((a, b) => b.createdAt - a.createdAt)[0];
        if (nextSession) {
          setActiveSessionId(nextSession.id);
        } else {
          handleNewChat(initialRole, initialProgram, initialSubject);
        }
      }
      if (updatedHistory.length === 0) {
        handleNewChat(initialRole, initialProgram);
        handleNewChat(initialRole, initialProgram, initialSubject);
      }
      return updatedHistory;
    });
  };

  const handleDeleteAllChats = () => {
    setChatHistory([]);
    setActiveSessionId(null);
    handleNewChat(initialRole, initialProgram, initialSubject);
    toast({
      title: "Chat History Cleared",
      description: "All conversations have been deleted.",
    });
  }

  const handleRenameChat = (sessionId: string, newTitle: string) => {
    setChatHistory(prev => prev.map(session =>
      session.id === sessionId ? { ...session, title: newTitle } : session
    ));
  };

  const handleStartTitleEdit = () => {
    if (activeSession && !isMobile) {
      setIsEditingTitle(true);
      setTitleRenameValue(activeSession.title);
    }
  }

  const handleRenameTitle = () => {
    if (activeSessionId && titleRenameValue.trim()) {
      handleRenameChat(activeSessionId, titleRenameValue.trim());
    }
    setIsEditingTitle(false);
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile && activeSessionId) {
      const fileData = await fileToBase64(selectedFile);
      const newFileAttachment = {
        name: selectedFile.name,
        type: selectedFile.type,
        data: fileData.split(',')[1] // remove the data URI prefix
      };
      updateSession(activeSessionId, { attachedFile: newFileAttachment });
      setFile(selectedFile); // Keep the file object for the current request
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
    if (activeSessionId) {
      updateSession(activeSessionId, { attachedFile: undefined });
    }
    setFile(null); // Clear the temporary file state
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
        .slice(0, -1)
        .filter((msg) => msg.role !== 'assistant' || msg.content !== personality.welcomeMessage)
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

      const formData = new FormData();
      formData.append("message", input);
      formData.append("role", role);
      formData.append("program", program);
      if (subject) {
        formData.append("subject", subject);
      }
      formData.append("history", JSON.stringify(history));

      const fileToSend = file || (activeSession.attachedFile ? new File([Buffer.from(activeSession.attachedFile.data, 'base64')], activeSession.attachedFile.name, { type: activeSession.attachedFile.type }) : null);

      if (fileToSend) {
        formData.append("file", fileToSend);
      }

      if (activeSession.title === "New Chat" && activeSession.messages.length <= 1) {
        const title = input.split(' ').slice(0, 5).join(' ') + '...';
        handleRenameChat(activeSession.id, title);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
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
      setFile(null); // Clear temporary file state after sending
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
            <div dangerouslySetInnerHTML={{ __html: renderToString(<ReactMarkdown>{msg.content}</ReactMarkdown>) }} />
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

  const renderHeaderTitle = () => {
    if (isMobile) {
      return (
        <h1 className="text-lg font-semibold tracking-tight md:text-xl font-headline whitespace-nowrap overflow-hidden text-ellipsis">
          IBGenie
        </h1>
      );
    }
    if (isEditingTitle) {
      return (
        <Input
          ref={titleInputRef}
          value={titleRenameValue}
          onChange={(e) => setTitleRenameValue(e.target.value)}
          onBlur={handleRenameTitle}
          onKeyDown={handleTitleKeyDown}
          className="h-8 text-lg font-semibold tracking-tight md:text-xl font-headline"
        />
      );
    }
    return (
      <div className="flex items-center gap-2 group/title" onClick={handleStartTitleEdit}>
        <h1 className="text-lg font-semibold tracking-tight md:text-xl font-headline whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer">
          {activeSession?.title || "IBGenie"}
        </h1>
        <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity" />
      </div>
    );
  }

  const renderDesktopHeaderActions = () => (
    <div className="ml-auto hidden items-center gap-2 md:flex">
      <Button variant="outline" size="sm" onClick={onParentReset}>
        <Home className="mr-2 h-4 w-4" />
        Home
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
    </div>
  )

  const renderMobileHeaderActions = () => (
    <div className="ml-auto flex items-center gap-2 md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onParentReset}>
            <Home className="mr-2 h-4 w-4" /> Home
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNewChat(initialRole, initialProgram, initialSubject)}>
            New Chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" /> Copy Chat
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportWord}>
            <FileDown className="mr-2 h-4 w-4" /> Export as Word
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportTxt}>
            <FileText className="mr-2 h-4 w-4" /> Export as Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPdf}>
            <FileDown className="mr-2 h-4 w-4" /> Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSidebarView('history')}>
            <MessageSquare className="mr-2 h-4 w-4" /> View History
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSidebarView('prompts')}>
            <Sparkles className="mr-2 h-4 w-4" /> View Prompts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="group hidden data-[state=expanded]:w-72 md:flex"
      >
        <SidebarContent className="p-0 flex flex-col">
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
              onUsePrompt={setInput}
              onNewChat={handleNewChat}
              currentRole={role}
              currentProgram={program}
              currentSubject={subject}
            />
          ) : (
            <ChatHistory
              sessions={chatHistory}
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSessionId}
              onDeleteSession={handleDeleteChat}
              onNewChat={() => handleNewChat(initialRole, initialProgram, initialSubject)}
              onRenameSession={handleRenameChat}
              onDeleteAllSessions={handleDeleteAllChats}
            />
          )}

        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen w-full flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <SidebarTrigger className="flex md:hidden" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={onParentReset}>
              <IbGenieLogo className="h-7 w-7 text-primary flex-shrink-0" />
            </div>
            <div className="flex flex-1 items-center gap-2 min-w-0">
              {renderHeaderTitle()}
            </div>
            {renderDesktopHeaderActions()}
            {renderMobileHeaderActions()}
          </header>

          <main className="flex flex-1 flex-col overflow-hidden">
            {role === 'student' && learningMode === 'interactive' ? (
              <StudentLearningPanel
                subject={subject}
                onToggleMode={() => setLearningMode('advanced')}
              />
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-4 md:p-6">
                    <div className="mx-auto max-w-4xl space-y-6">
                      {messages.map((message, index) => (
                        <ChatMessageComponent key={index} {...message} />
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
                  {isDragging && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-background/80 backdrop-blur-sm">
                      <Upload className="h-8 w-8 text-primary" />
                      <p className="mt-2 text-sm font-semibold text-primary">
                        Drop file to upload
                      </p>
                    </div>
                  )}
                  <ChatInput
                    input={input}
                    setInput={setInput}
                    isLoading={isLoading}
                    handleSend={handleSend}
                    handleFileUpload={handleFileUpload}
                    triggerFileUpload={triggerFileUpload}
                    fileInputRef={fileInputRef}
                    file={file}
                    attachedFile={activeSession?.attachedFile}
                    removeFile={removeFile}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}





