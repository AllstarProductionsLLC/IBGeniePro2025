# IBGenie Pro

An independent learning workspace for IB students and teachers. The redesign brings resource creation, active recall, planning and AI coaching into one consistent interface.

## What works

- A branded first-use welcome flow for students and teachers, with programme, year, exam session, level and subject choices remembered in this browser and editable in Profile & settings.
- Royal blue, navy, pastel sky and blush colours inspired by the IB Genie website, with an original SVG welcome illustration.
- Distinct teacher and student workspaces. Teachers see classroom planning, presentations and assessment; students see practice, formative self-checks and writing support. PYP, MYP and DP have different prompts, project notebooks and practice activities.
- Classroom presentations with editable slides, activities, speaker notes, an in-app fullscreen presenter and real PowerPoint (.pptx) download. Saved lesson plans can become slide decks. Import the downloaded PPTX into Google Slides.
- An editable scope and sequence with two DP years or five MYP years by default, plus adjustable PYP school years. Plan units, teaching weeks, inquiry, ATL, assessment evidence and progression.
- An assessment desk with learner aliases, PDF/DOCX/text uploads, current user-supplied task rubrics, evidence-linked draft comments and tentative criterion marks. Teachers review comments and record their own judgement. Students have a separate formative self-check. PYP feedback stays qualitative.
- A writing lab for both roles with explained grammar, spelling, punctuation and clarity suggestions. Accept individual edits while preserving authorship.
- A resource studio for flashcards, quizzes, study guides, lesson plans, formative rubrics and exit tickets. Students only see study-resource creation tools.
- A programme-filtered resource library with favourites, generated PDF, editable Word, Markdown, flashcard CSV for Anki and scope-and-sequence CSV exports. Downloads use IBgenie.com branding instead of the deployment URL. Quiz handouts can omit the answer key. Print the downloaded PDF for a clean handout.
- Flashcard review scheduling based on recall ratings. Quizzes support immediate feedback or timed practice, explain answers, record attempts and turn mistakes into review cards.
- A task planner, all-day calendar export and a 25-minute focus timer. Dashboard statistics come from recorded activity.
- DP EE, TOK, CAS and IA notebooks, MYP inquiry/service and personal-project notebooks, and PYP inquiry/action prompts, with PDF, Word and Markdown export.
- Text coaching through Gemini and live WebRTC voice coaching through OpenAI. Voice includes explicit microphone consent, mute, end-session controls and transcript export.
- A curriculum hub with public IB sources and examination-year transitions. The source snapshot was checked on 8 September 2026.
- Validated browser storage, JSON backup and restore, corruption protection and a warning when another tab changes the workspace.
- The classic interface at /legacy preserves access to earlier chats in the same browser.

Six original DP resources and four PYP/MYP practice examples demonstrate the learning tools. They are illustrative practice, not a complete subject library or official IB questions.

## Run locally

Use Node.js 22.13 or newer (22.x recommended on Vercel) and npm. Installation copies the pinned PDF reader worker into public assets; do not disable install scripts.

    npm ci
    cp .env.example .env.local
    npm run dev

Open http://localhost:9002. Manual creation, review, quizzes, planning and backups work without AI credentials. AI controls explain when a connection has not been configured.

## Connect Wix and deploy on Vercel

Follow [the Vercel and Wix installation guide](docs/vercel-wix-setup.md). It lists the exact environment variables, Wix Secrets Manager entries, backend modules, page code and deployment-specific acceptance checks. Never put server credentials in `NEXT_PUBLIC_` variables or in Wix page code.

The app verifies signed Wix member assertions and approved paid plan IDs. Free members receive 10 AI text messages per UTC day by default. Pro members can use resource generation, presentations, scope and sequence, formative feedback, grammar review and realtime voice within configurable allowances. Downloads, manual resource editing and practice games work without paid AI calls. Redis enforces per-member and workspace quotas across sessions and devices. A shared pilot code is no longer used.

Voice uses server-held OpenAI credentials and a signed QStash job to schedule server termination. Both services must be configured before voice is enabled. See the guide for embedded microphone permissions, the five-minute new-tab handoff, delivery monitoring and provider budget controls.

## Curriculum accuracy

The app distinguishes first teaching from first assessment. Its snapshot covers selected DP changes for assessment in 2026, 2027, 2028 and 2029, and links to the official directory and programme guidance. Future changes are labelled for earlier examination cohorts.

This is not a live syllabus feed, a complete licensed guide repository, or a guarantee that every assessment claim is current. Teachers and coordinators must confirm the guide for the learner’s session, level and any retake arrangement. AI instructions ask for the current school rubric or guide when public information is incomplete.

    npm run curriculum:check

The maintenance script flags stale snapshots, newer published update dates, inaccessible sources and unexpected source hosts. It cannot detect every page change or certify completeness. A human editor must read the sources and update the snapshot. The weekly GitHub workflow becomes scheduled when merged into the default branch; it does not automatically rewrite curriculum content.

## Validation

    npm run typecheck
    npm test -- --runInBand
    npm run build

Tests cover native PPTX/Word/PDF output and branding, rubric-bound marks and evidence checks, upload parsing and size limits, distinct role workflows, programme-specific notebooks and matching games, resource validation, recall scheduling, cohort transitions, the mistake-to-review-card interaction, signed Wix assertions, order eligibility, forged Pro claims, replay protection, session revocation, voice termination and account-scoped onboarding. CI also runs real Redis Lua and concurrent quota tests using a disposable Redis service. Run `node scripts/check-client-secrets.mjs` after building to inspect client assets for server credential references.

In restricted environments where native SWC or /proc memory counters are unavailable:

    npm run build:portable

This uses the pinned SWC WebAssembly package and a build-only memory compatibility fallback. Normal CI uses the standard build on Node.js 22. The fallback reports peak RSS, so it must not be used for memory benchmarking. Build linting remains disabled because the inherited repository has no configured ESLint setup; type errors are now build failures.

Browser layout, fullscreen/iframe interaction and live AI testing remain to be completed before launch. PowerPoint and Google Slides import should also be checked in the actual classroom software. Passing unit tests and a build does not establish that all browser or provider paths have been verified.

See [the teaching and learning tools guide](docs/teaching-learning-tools.md) for classroom workflows, rubric assumptions and export details.

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

Wix supplies member identity, checkout and subscription records; the app verifies access on its server. Learning data remains device-local and uses separate keys for verified members. Learner aliases and explicitly saved feedback reports (including evidence excerpts) are part of the local backup. Uploaded files and full submission text are not persisted. Only reviewed text, task details and criteria go to Gemini after consent; files are parsed locally. Firebase is not needed for this integration; the original initializer remains unused. Cloud sync, classroom assignment distribution and school administration are not implemented. The learner list is a local convenience, not a school records system. Text extraction supports PDF, DOCX, TXT and Markdown up to 2 MB; PDF is limited to 20 pages. Scans, handwriting, drawings and diagrams are not analysed. Local storage is not encrypted, and anyone with access to the browser profile can inspect it, including classic chat history. Export backups before clearing browser data.

IBGenie Pro is independent of the International Baccalaureate Organization. AI output and starter activities are formative resources, not official IB assessments or predicted grades.
