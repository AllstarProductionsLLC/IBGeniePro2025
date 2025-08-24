# IB Genie AI Assistant

This is a Next.js starter project for an AI assistant tailored for the International Baccalaureate (IB) program, built to run in an IDE-based environment.

## Getting Started

To get started with this project, take a look at the main application file: `src/app/page.tsx`.

---

## Configuration

### Setting Your API Key

To use the AI functionalities, you need to set your API key as an environment variable.

1.  **Open the Secrets Manager**: In the left sidebar of your IDE, you will find a "Secrets" tab (often marked with a key icon). Click on it.
2.  **Add a New Secret**: Create a new secret with the following name:
    `NEXT_PUBLIC_GEMINI_API_KEY`
3.  **Set the Value**: Paste your API key into the "Value" field.
4.  **Save**: Save the new secret. The IDE will automatically make this key available to your application.

### Changing the AI Model

The AI model can be easily changed in the backend.

1.  **Open the Chat Interface File**: Navigate to the file located at `src/components/chat-interface.tsx`.
2.  **Find the `MODEL_NAME` Constant**: At the top of the file, you will find a constant named `MODEL_NAME`.
    ```typescript
    const MODEL_NAME = "gemini-1.5-flash";
    ```
3.  **Update the Model**: To change the model, simply replace the current value (e.g., `"gemini-1.5-flash"`) with the name of the model you want to use. You can find a list of available models in the official documentation for your AI provider (e.g., Google's Gemini documentation).

    For example, to switch to Gemini 2.5 Pro, you would change the line to:
    ```typescript
    const MODEL_NAME = "gemini-2.5-pro";
    ```
4.  **Using a Different Provider (e.g., ChatGPT)**: If you want to switch to a different AI provider, you will need to install their client library and update the code in `src/components/chat-interface.tsx` to use the new library for initializing the model and sending messages. You will also need to set a new secret for the corresponding API key (e.g., `OPENAI_API_KEY`).
