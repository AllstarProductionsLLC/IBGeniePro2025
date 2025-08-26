
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { ChatSession } from "./chat-interface";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { Input } from "./ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
}

export function ChatHistory({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  onRenameSession,
}: ChatHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleStartEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setRenameValue(session.title);
  };

  const handleRename = () => {
    if (editingId && renameValue.trim()) {
      onRenameSession(editingId, renameValue.trim());
    }
    setEditingId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
        handleRename();
    } else if (e.key === "Escape") {
        setEditingId(null);
    }
  }

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  }

  return (
    <div className="flex h-full flex-col">
       <div className="p-2">
            <Button className="w-full" variant="outline" onClick={onNewChat}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                New Chat
            </Button>
       </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.id} className="relative group">
                 {editingId === session.id ? (
                   <Input
                        ref={inputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        className="h-auto py-1.5 px-2 text-sm"
                    />
                 ) : (
                    <Button
                    variant={session.id === activeSessionId ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto pr-14"
                    onClick={() => onSelectSession(session.id)}
                    >
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">{session.title}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {session.messages[0]?.content}
                        </span>
                    </div>
                    </Button>
                 )}
                
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStartEditing(session)}>
                        <Edit className="h-4 w-4"/>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this chat session.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={(e) => handleDelete(e, session.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No chat history yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
