import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { personalities } from "@/lib/personalities";
import type { Role, Program } from "@/app/page";

const MODEL_NAME = "gemini-1.5-flash";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const role = formData.get("role") as Role;
  const program = formData.get("program") as Program;
  const file = formData.get("file") as File | null;

  if (!message || !role || !program) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key is not set" }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const personality = personalities[role][program];
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: personality.systemPrompt,
    });

    let responseText;

    if (file) {
      const imagePart = {
        inlineData: {
          data: Buffer.from(await file.arrayBuffer()).toString("base64"),
          mimeType: file.type,
        },
      };
      const result = await model.generateContent([message, imagePart]);
      responseText = result.response.text();
    } else {
      const chat = model.startChat();
      const result = await chat.sendMessage(message);
      responseText = result.response.text();
    }
    
    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error: "Failed to get response from AI" }, { status: 500 });
  }
}
