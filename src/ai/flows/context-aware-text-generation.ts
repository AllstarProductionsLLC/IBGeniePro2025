'use server';
/**
 * @fileOverview An AI agent that summarizes user input with context awareness.
 *
 * - summarizeInput - A function that handles the input summarization process.
 * - SummarizeInputInput - The input type for the summarizeInput function.
 * - SummarizeInputOutput - The return type for the summarizeInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInputInputSchema = z.object({
  inputText: z
    .string()
    .describe('The text input from the user, either from voice dictation or file upload.'),
});
export type SummarizeInputInput = z.infer<typeof SummarizeInputInputSchema>;

const SummarizeInputOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the user input, incorporating the current time and relevant context.'),
});
export type SummarizeInputOutput = z.infer<typeof SummarizeInputOutputSchema>;

export async function summarizeInput(input: SummarizeInputInput): Promise<SummarizeInputOutput> {
  return summarizeInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeInputPrompt',
  input: {schema: SummarizeInputInputSchema},
  output: {schema: SummarizeInputOutputSchema},
  prompt: `You are an AI assistant that summarizes user input, incorporating the current time and any available context to provide a concise summary.

Current Time: {{currentTime}}

User Input: {{{inputText}}}

Summary:`,
});

const summarizeInputFlow = ai.defineFlow(
  {
    name: 'summarizeInputFlow',
    inputSchema: SummarizeInputInputSchema,
    outputSchema: SummarizeInputOutputSchema,
  },
  async input => {
    const currentTime = new Date().toLocaleString();
    const {output} = await prompt({
      ...input,
      currentTime,
    });
    return output!;
  }
);
