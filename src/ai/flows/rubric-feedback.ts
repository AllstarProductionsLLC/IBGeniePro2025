'use server';

/**
 * @fileOverview A Genkit flow for generating criterion-linked feedback based on a rubric and student work.
 *
 * - rubricFeedback - A function that handles the rubric-based feedback generation process.
 * - RubricFeedbackInput - The input type for the rubricFeedback function.
 * - RubricFeedbackOutput - The return type for the rubricFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RubricFeedbackInputSchema = z.object({
  rubricText: z
    .string()
    .describe('The text content of the rubric, including criterion descriptors.'),
  studentWorkText: z
    .string()
    .describe('The text content of the student work to be evaluated.'),
  program: z
    .enum(['PYP', 'MYP', 'DP'])
    .describe('The IB program level (PYP, MYP, or DP).'),
  subject: z.string().describe('The subject area for the rubric.'),
});
export type RubricFeedbackInput = z.infer<typeof RubricFeedbackInputSchema>;

const RubricFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The generated criterion-linked feedback.'),
});
export type RubricFeedbackOutput = z.infer<typeof RubricFeedbackOutputSchema>;

export async function rubricFeedback(input: RubricFeedbackInput): Promise<RubricFeedbackOutput> {
  return rubricFeedbackFlow(input);
}

const rubricFeedbackPrompt = ai.definePrompt({
  name: 'rubricFeedbackPrompt',
  input: {schema: RubricFeedbackInputSchema},
  output: {schema: RubricFeedbackOutputSchema},
  prompt: `You are an expert IB teacher providing formative feedback to students based on a rubric.

You will be provided with the text of the rubric, the text of the student's work, the IB program, and subject.

Your task is to generate detailed, criterion-linked feedback that helps the student understand their strengths and areas for improvement.

Rubric Text: {{{rubricText}}}

Student Work Text: {{{studentWorkText}}}

IB Program: {{{program}}}

Subject: {{{subject}}}

Generate the feedback:
`,
});

const rubricFeedbackFlow = ai.defineFlow(
  {
    name: 'rubricFeedbackFlow',
    inputSchema: RubricFeedbackInputSchema,
    outputSchema: RubricFeedbackOutputSchema,
  },
  async input => {
    const {output} = await rubricFeedbackPrompt(input);
    return output!;
  }
);
