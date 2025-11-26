import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { personalities, getPersonality } from "@/lib/personalities";
import type { Role, Program } from "@/app/page";

const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

// Assuming getPersonality is defined elsewhere or needs to be added.
// For the purpose of this edit, we'll assume it's available.
// Example placeholder if not defined:
// function getPersonality(role: Role, program: Program, subject?: string) {
//   // Implement your logic to select personality based on role, program, and subject
//   // For now, fallback to existing logic if subject is not used
//   return personalities[role][program];
// }

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const role = formData.get("role") as Role;
  const program = formData.get("program") as Program;
  const subject = formData.get("subject") as string | undefined;
  const file = formData.get("file") as File | null;
  const historyStr = formData.get("history") as string;
  const history = JSON.parse(historyStr) as { role: "user" | "model"; parts: { text: string }[] }[];

  if (!message || !role || !program) { // historyStr check removed as history is parsed directly
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key is not set" }, { status: 500 });
  }

  try {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey); // Use apiKey directly
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Get personality based on role, program, and subject
    const personality = getPersonality(role, program, subject);

    // Build the chat history with personality context
    const chatHistory = [
      {
        role: "user" as const,
        parts: [{ text: personality.systemPrompt }],
      },
      {
        role: "model" as const,
        parts: [{ text: personality.welcomeMessage }],
      },
      ...history.map((msg) => ({
        role: msg.role,
        parts: msg.parts, // parts is already an array of {text: string}
      })),
    ];

    // Initialize the chat session
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 50000,
      },
    });

    // Prepare the message parts
    const messageParts: any[] = [{ text: message }];

    // Add file part if a file is provided
    if (file) {
      const filePart = {
        inlineData: {
          data: Buffer.from(await file.arrayBuffer()).toString("base64"),
          mimeType: file.type,
        },
      };
      messageParts.push(filePart);
    }

    // Send the message and get response
    const result = await chat.sendMessage(messageParts);
    const responseText = result.response.text();

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (errorMessage.includes("API key")) {
        statusCode = 401;
      } else if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        statusCode = 429;
      }
    }

    return NextResponse.json({ error: `Failed to get response from AI: ${errorMessage}` }, { status: statusCode });
  }
}
