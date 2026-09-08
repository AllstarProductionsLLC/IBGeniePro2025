# IBGenie Pro

An independent learning workspace for IB students and teachers. The redesign brings resource creation, active recall, planning and AI coaching into one consistent interface.

## What works

- Student and teacher workspaces, with DP, MYP and PYP context and editable subject preferences.
- A resource studio for flashcards, quizzes, study guides, lesson plans, formative rubrics and exit tickets. Create manually or generate an editable AI draft from your topic and notes.
- A searchable resource library with favourites, Markdown export, flashcard CSV for Anki, and print-to-PDF through the browser. Quiz exports can omit the answer key.
- Flashcard review scheduling based on recall ratings. Quizzes support immediate feedback or timed practice, explain answers, record attempts and turn mistakes into review cards.
- A task planner, all-day calendar export and a 25-minute focus timer. Dashboard statistics come from recorded activity.
- Personal EE, TOK, CAS and IA planning notes with export.
- Text coaching through Gemini and live WebRTC voice coaching through OpenAI. Voice includes explicit microphone consent, mute, end-session controls and transcript export.
- A curriculum hub with public IB sources and examination-year transitions. The source snapshot was checked on 8 September 2026.
- Validated browser storage, JSON backup and restore, corruption protection and a warning when another tab changes the workspace.
- The classic interface at /legacy preserves access to earlier chats in the same browser.

Six original starter resources demonstrate the learning tools. They are illustrative practice, not a complete subject library or official IB questions.

## Run locally

Use Node.js 22 and npm.

    npm ci
    cp .env.example .env.local
    npm run dev

Open http://localhost:9002. Manual creation, review, quizzes, planning and backups work without AI credentials. AI controls explain when a connection has not been configured.

## Connect AI for a supervised pilot

All settings below belong on the server. Never put secrets in NEXT_PUBLIC_ variables or commit .env.local.

| Variable                 | Purpose                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| GEMINI_API_KEY           | Enables text coaching and resource generation                               |
| GEMINI_MODEL             | Defaults to gemini-3.8-flash; choose a model your provider account can use  |
| OPENAI_API_KEY           | Enables realtime voice                                                      |
| OPENAI_REALTIME_MODEL    | Defaults to gpt-realtime-2.1; requires account access                       |
| AI_ACCESS_CODE           | A pilot access code of at least 12 characters                               |
| SESSION_SECRET           | At least 32 cryptographically random characters for signing session cookies |
| APP_ORIGIN               | Exact production HTTPS origin, without a trailing slash                     |
| UPSTASH_REDIS_REST_URL   | HTTPS Redis REST endpoint for shared rate limits                            |
| UPSTASH_REDIS_REST_TOKEN | Server credential for that endpoint                                         |

Enter the pilot code in Settings or an AI tool. Access uses a signed, HttpOnly, SameSite=Strict cookie lasting eight hours. This is a shared pilot gate, not an individual school identity or subscription system.

Production AI fails closed unless APP_ORIGIN and both Redis settings are configured. Development and tests can use an in-memory limiter. Text requests are limited to 15 per minute per session and 300 per 24-hour workspace window; voice starts are limited to 3 per minute per session and 30 per 24-hour workspace window. Limits are shared across server instances when Redis is configured.

These are request limits, not a spending guarantee. The ten-minute voice cutoff is enforced by the client interface and is not a tamper-proof server cost cap. Configure provider budgets and implement account-level metering and server-enforced call termination before a public paid launch.

Voice requires HTTPS (or localhost), a supported browser, microphone permission and a configured OpenAI account. The server exchanges the SDP offer with OpenAI; the long-lived API key never reaches the browser. Audio is sent to OpenAI. Text, selected notes and course context are sent to Google. Conversations are not automatically stored in the new workspace; users can export the visible transcript.

No live provider or microphone call was made during this implementation. Verify model access, latency, interruption, transcription, permission denial, disconnection and actual usage in your deployment.

## Curriculum accuracy

The app distinguishes first teaching from first assessment. Its snapshot covers selected DP changes for assessment in 2026, 2027, 2028 and 2029, and links to the official directory and programme guidance. Future changes are labelled for earlier examination cohorts.

This is not a live syllabus feed, a complete licensed guide repository, or a guarantee that every assessment claim is current. Teachers and coordinators must confirm the guide for the learner’s session, level and any retake arrangement. AI instructions ask for the current school rubric or guide when public information is incomplete.

    npm run curriculum:check

The maintenance script flags stale snapshots, newer published update dates, inaccessible sources and unexpected source hosts. It cannot detect every page change or certify completeness. A human editor must read the sources and update the snapshot. The weekly GitHub workflow becomes scheduled when merged into the default branch; it does not automatically rewrite curriculum content.

## Validation

    npm run typecheck
    npm test -- --runInBand
    npm run build

The recovered implementation passed TypeScript checks, 21 tests and an optimized production build. Tests cover resource validation, CSV formula handling, quiz answer-key export, recall scheduling, cohort transitions, AI access boundaries and the mistake-to-review-card interaction.

In restricted environments where native SWC or /proc memory counters are unavailable:

    npm run build:portable

This uses the pinned SWC WebAssembly package and a build-only memory compatibility fallback. Normal CI uses the standard build on Node.js 22. The fallback reports peak RSS, so it must not be used for memory benchmarking. Build linting remains disabled because the inherited repository has no configured ESLint setup; type errors are now build failures.

Browser layout and live AI testing remain to be completed before launch. Passing unit tests and a build does not establish that all browser or provider paths have been verified.

## Architecture and boundaries

The existing Next.js App Router, TypeScript, React, Tailwind and Radix foundation is retained; Next.js is updated from 15.3.3 to 15.5.25.

- src/components/workspace: the redesigned app.
- src/lib/workspace.ts: validated data model, review scheduling and exports.
- src/hooks/use-workspace.ts: device-local persistence and backup recovery.
- src/lib/server: AI instructions, provider transport, access control and rate limiting.
- src/app/api: protected generation, chat, rubric feedback and realtime endpoints.
- src/data/curriculum.json: dated, source-linked curriculum transitions.
- docs/redesign-review.md: product research, design decisions and launch work.

The old prompt CRUD endpoints returned data from browser storage inside server handlers. They now return 410; the new resource library replaces that broken path. Classic chat remains available, with its AI requests passing through the protected server route.

The repository’s Firebase initialization is retained, but individual accounts, tenant isolation, cloud sync, classroom assignment distribution, subscriptions, billing and administrative controls are not implemented by this redesign. Device-local resources are accessible to anyone using the same browser profile. Export backups before clearing browser data. Do not place identifying student information in shared-device workspaces or AI prompts.

IBGenie Pro is independent of the International Baccalaureate Organization. AI output and starter activities are formative resources, not official IB assessments or predicted grades.
