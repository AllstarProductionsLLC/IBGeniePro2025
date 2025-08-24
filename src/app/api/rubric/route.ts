import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const MODEL_NAME = "gemini-1.5-flash";

const rubricFeedbackPrompt = `
You are an expert IB teacher with deep knowledge of IB rubrics and assessment. 
Your task is to provide formative feedback on student work based on a provided rubric.

Here is the rubric:
{rubricText}

Here is the student's work:
{studentWorkText}

Your feedback should:
1.  Be encouraging and constructive.
2.  Directly reference specific phrases and descriptors from the rubric.
3.  Provide concrete examples from the student's work to illustrate your points.
4.  Suggest specific, actionable steps for improvement.
5.  Be formatted using markdown for clarity.

Generate the feedback now for a student in the {program} {subject} course.
`;

export async function POST(request: NextRequest) {
  const { rubricText, studentWorkText, program, subject } = await request.json();

  if (!rubricText || !studentWorkText || !program || !subject) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key is not set" }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = rubricFeedbackPrompt
      .replace("{rubricText}", rubricText)
      .replace("{studentWorkText}", studentWorkText)
      .replace("{program}", program)
      .replace("{subject}", subject);

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();
    
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error: "Failed to get response from AI" }, { status: 500 });
  }
}
