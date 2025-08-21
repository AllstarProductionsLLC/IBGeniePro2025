# **App Name**: IBGenie

## Core Features:

- Role and Program Selection: Landing page with role (Student/Teacher) and program (PYP/MYP/DP) selection. Role selection defines UI and routing differences throughout the rest of the app.
- Chat Interface: Core chat UI with input, streaming responses, safety reminders, and file uploads
- Rubric-Based Formative Feedback: AI-powered generation of criterion-linked comments based on uploaded rubrics, with the AI reasoning as a tool to extract salient material to incorporate in the generated feedback.
- Document Export: UI controls for exporting chat contents as Word, Excel, PPT, and PDF documents.
- Context Aware Text generation: AI-powered text input with access to current time, to summarize what a user is trying to convey through voice dictation or text uploads.
- Chat history Management: Local chat history stored in IndexedDB with clear all function, with local or cloud storage controlled via the users setting.
- Progressive Web App Support: PWA capabilities for offline access and mobile installation using service workers, in compliance with data protection and privacy legislation.

## Style Guidelines:

- Primary color: Soft blue (#77B5FE). A calming yet reliable color, suitable for study. It is vibrant enough to attract attention, but not distracting.
- Background color: Very light blue (#F0F8FF). Offers a gentle contrast with other elements, is perceptibly of the same hue as the primary, but far more subdued.
- Accent color: Periwinkle (#CCCCFF). Provides subtle but clear highlighting and accents.
- Headings: 'Poppins', a geometric sans-serif, offers a contemporary and fashionable feel.
- Body text: 'Inter', a grotesque-style sans-serif with a modern, objective, neutral look.
- Consistent and clear icons from Material UI or a similar library.  The visual style should be clear and geometric. Leverage common associations like folders, drives, document types.
- Responsive layout with a single-column mobile view. Use of left/right panels on larger screens and a bottom drawer for smaller screens.