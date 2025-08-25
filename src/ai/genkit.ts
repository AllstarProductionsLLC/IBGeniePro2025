/**
 * @fileoverview This file initializes the Genkit AI instance with necessary plugins.
 * It configures the Google AI plugin with the Gemini Pro model and a specific API version.
 * The configured 'ai' object is then exported for use throughout the application.
 */
import {genkit} from 'genkit';
import {googleAI} from 'genkit/plugins/googleai';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
});
