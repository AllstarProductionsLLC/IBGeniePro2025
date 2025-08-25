
"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Bot,
  CircleUser,
  FileUp,
  PanelLeft,
  Send,
  Trash2,
  X,
  Copy,
  FileDown,
} from "lucide-react";
import type { Role, Program } from "@/app/page";
import { IbGenieLogo } from "./ib-genie-logo";
import { PromptLibrary } from "./prompt-library";
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
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const personality = personalities[role][program];

  useEffect(() => {
    setMessages([{ role: "assistant", content: personality.welcomeMessage }]);
  }, [role, program, personality.welcomeMessage]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setInput(
        `Attached file: ${uploadedFile.name}. What should I do with this file?`
      );
    }
    if (event.target) event.target.value = "";
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  const removeFile = () => {
    setFile(null);
    if (input.includes("Attached file:")) {
      setInput("");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", input);
      formData.append("role", role);
      formData.append("program", program);
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error from server");
      }

      const { message } = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message },
      ]);
    } catch (error) {
      console.error("Error calling API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Failed to get response from AI.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  const handleReset = () => {
    setMessages([{ role: "assistant", content: personality.welcomeMessage }]);
    setFile(null);
    onReset();
  };

  const handleCopy = () => {
    // Plain text version
    const plainText = messages
      .map(
        (msg) =>
          `${msg.role === 'assistant' ? 'IBGenie' : 'User'}:\n${msg.content}`
      )
      .join('\n\n');

    // HTML version
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
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Chat Export</title></head><body>";
    const footer = "</body></html>";
    const htmlContent = renderToString(
       <div>
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
    const blob = new Blob([source], { type: 'application/vnd.ms-word' });
    downloadFile(blob, 'ib-genie-chat.doc');
  };

  const handleExportTxt = () => {
    const plainText = getPlainTextChat();
    const blob = new Blob([plainText], { type: 'text/plain' });
    downloadFile(blob, 'ib-genie-chat.txt');
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
        <SidebarContent className="p-2">
          <PromptLibrary
            role={role}
            program={program}
            setInput={setInput}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen w-full flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <SidebarTrigger className="flex md:hidden" />
            <div className="flex flex-1 items-center gap-2 min-w-0">
               <div className="flex items-center gap-2">
                 <SidebarTrigger className="hidden md:flex" />
                 <IbGenieLogo className="h-7 w-7 text-primary flex-shrink-0" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight md:text-xl font-headline whitespace-nowrap overflow-hidden text-ellipsis">
                {isMobile ? "IBGenie" : identityText}
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
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
              <Button variant="outline" size="sm" onClick={handleReset}>
                <Trash2 className="mr-2 h-4 w-4" /> New Session
              </Button>
            </div>
          </header>

          <main className="flex flex-1 flex-col overflow-hidden">
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
          "max-w-[75%] rounded-lg p-3 text-sm",
          isAssistant
            ? "bg-muted"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="prose prose-sm max-w-none">
           <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
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
