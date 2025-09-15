# **IB Genie AI Assistant**

This is a Next.js starter project for an AI assistant tailored for the International Baccalaureate (IB) program, built to run in an IDE-based environment. IBGenie is designed to support both students and teachers within the IB framework.

## Core Features:

*   **Role and Program Selection:** Allows users to select their role (Student/Teacher) and IB program (PYP/MYP/DP), tailoring the app's UI and routing.
*   **Chat Interface:** Provides a core chat UI with features like text input, streaming AI responses, safety reminders, and file uploads.
*   **Rubric-Based Formative Feedback:** Generates AI-powered, criterion-linked feedback based on uploaded rubrics, utilizing AI reasoning to extract key information.
*   **Document Export:** Enables exporting chat contents in various formats including Word, Excel, PPT, and PDF.
*   **Context-Aware Text Generation:** Offers AI assistance for text input, incorporating context such as the current time and information from voice dictation or text uploads.
*   **Chat History Management:** Manages chat history locally using IndexedDB, with an option for cloud storage configurable via user settings.
*   **Progressive Web App Support:** Includes PWA capabilities for offline access and mobile installation, adhering to data protection and privacy standards.

## Style Guidelines:

*   **Primary Color:** Soft blue (#77B5FE) - a calming and reliable color for study.
*   **Background Color:** Very light blue (#F0F8FF) - offers a gentle contrast.
*   **Accent Color:** Periwinkle (#CCCCFF) - provides subtle highlighting.
*   **Headings Font:** 'Poppins' - a contemporary, geometric sans-serif.
*   **Body Text Font:** 'Inter' - a modern, grotesque-style sans-serif.
*   **Icons:** Consistent and clear icons from libraries like Material UI, focusing on a clear and geometric visual style.
*   **Layout:** Responsive design with a single-column view on mobile, and left/right panels or a bottom drawer on larger screens.

---



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
