# IBGenie Pro redesign review

Research snapshot: 8 September 2026.

## What was there

The original app was a Next.js 15.3.3 chat experience with role/programme onboarding, Gemini calls, browser-based chat history, sample learning games and a Firebase initializer. It had useful beginnings, but learning resources were scattered across dialogs. There was no coherent loop from creating material to practising it and deciding what to do next.

The README overstated offline, cloud and export capabilities. Prompt CRUD handlers tried to use localStorage on the server. Provider models were old preview or 1.5-era selections, and build type errors were ignored. A public, unmetered AI endpoint would have exposed the owner to avoidable usage costs.

## Product direction

The organising loop is simple: choose a topic, create a resource, practise, understand mistakes, and return to a manageable next step.

The new home gives students a due-card review, actual weekly activity, resource creation, their saved subjects and personal tasks. Teacher view prioritises lessons, quizzes, formative rubrics and exit tickets. The same library holds both manually authored and AI-drafted material, with explicit provenance and editing before use.

The design uses an evergreen navigation rail, a light canvas, restrained subject colours, generous spacing and readable type. A persistent location bar and mobile navigation keep the workspace navigable as its capabilities grow. Empty states use real next actions; statistics start from zero. There are no invented learners, testimonials, class results or paid-plan promises.

The result is an implemented pilot application, not a guarantee of commercial success.

## Research translated into features

| Primary source                                                                                                                                                                              | Useful pattern                                      | Implementation                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Quizlet spaced repetition](https://quizlet.com/features/spaced-repetition) and [study guidance](https://help.quizlet.com/hc/en-us/articles/48324742264077-Studying-with-Spaced-Repetition) | Revisit knowledge over time                         | Recall ratings schedule the next review; missed quiz questions become a targeted deck. This is a transparent simple interval scheduler, not a claim to reproduce Quizlet’s algorithm. |
| [Khanmigo](https://www.khanmigo.ai/) and [teacher tools](https://support.khanacademy.org/hc/en-us/articles/14799047733645-What-teacher-tools-are-available-on-Khanmigo)                     | Guided reasoning and practical preparation          | Coaching asks questions and gives hints; teachers get editable lesson, rubric and exit-ticket drafts.                                                                                 |
| [IB curriculum updates](https://ibo.org/university-admission/latest-curriculum-updates/)                                                                                                    | Curriculum changes depend on cohort                 | First-teaching and first-assessment dates appear separately; future changes are labelled.                                                                                             |
| [IB academic integrity and AI](https://ibo.org/programmes/artificial-intelligence-ai-in-learning-teaching-and-assessment/)                                                                  | Learners retain responsibility for their own work   | Clear AI identity, draft review, authentic reflections and prompts that scaffold reasoning.                                                                                           |
| [OpenAI WebRTC guide](https://developers.openai.com/api/docs/guides/realtime-webrtc)                                                                                                        | Low-latency live audio with server-held credentials | SDP exchange through the server, real peer connection, mute/end controls, transcript events and cancellation cleanup.                                                                 |
| [Gemini models](https://ai.google.dev/gemini-api/docs/models)                                                                                                                               | Explicit, maintainable provider configuration       | Server-only model configuration, bounded requests, validated drafts and actionable errors.                                                                                            |

No competitor assets, question banks, paid content or proprietary syllabuses were copied. Starter questions and activities are original examples.

## IB source decisions

The public directory identifies revised ESS, global politics and SEHS courses first assessed in 2026; computer science, design technology, psychology, visual arts and the extended essay in 2027; history in 2028; and further mathematics, language acquisition and dance changes in 2029.

Subject detail sources:

- [Extended essay changes](https://ibo.org/university-admission/latest-curriculum-updates/dp-extended-essay-updates/): subject-focused and interdisciplinary pathways, with a revised assessment total of 30 marks from May 2027.
- [Computer science changes](https://ibo.org/university-admission/latest-curriculum-updates/computer-science-updates/): computing concepts, computational thinking and problem-solving, including machine learning.
- [Psychology changes](https://ibo.org/university-admission/latest-curriculum-updates/psychology-updates/): research-proposal internal assessment.
- [History changes](https://ibo.org/university-admission/latest-curriculum-updates/history-updates/): revised structure and assessment from May 2028.

A discrepancy between prose and tabular assessment weight information on the public computer science page was a reason to omit numeric paper weights. The product links to the official source and asks the school to confirm the guide instead of choosing an unsupported number.

The curriculum snapshot is intentionally bounded. Public pages are not complete licensed guides, and there is no automatic retrieval pipeline claiming to know every syllabus. The maintenance workflow flags review needs and leaves publication of revised summaries to a human editor.

## Implementation and validation

The work retains Next.js and the original UI primitives, adds a structured learning domain and a responsive workspace, upgrades Next.js to 15.5.25, and makes TypeScript errors fail the build. Existing classic chat remains available.

Validation completed on the recovered app:

- TypeScript checks passed.
- Four Jest suites, 21 tests passed, including a quiz interaction that verifies the complete mistake-to-flashcard flow.
- Optimized production build passed using the documented portable WebAssembly build in this environment.
- No production deployment or merge was performed.

The normal build remains the CI default on Node.js 22. The portable path is necessary here because native SWC and Node memory counters hit runtime restrictions. It does not change the deployed AI logic.

Live Gemini generation, OpenAI audio, browser layout, keyboard navigation, mobile device behaviour and printing have not been verified in a real browser during this implementation. Those are explicit launch checks, not claimed successes.

## Launch sequence

1. Run a supervised pilot with a few teachers and students. Verify first useful resource time, repeated study sessions, resource edits, abandoned AI requests and whether mistakes lead to later recall. Validate usefulness before expanding the feature count.
2. Add individual school accounts, tenant isolation, role authorization, cloud persistence, backups, retention/deletion controls and appropriate consent flows. The shared access code is not an identity system.
3. Establish a curriculum editor workflow with licensed content where required, subject/session/version metadata and reviewed retrieval sources. Never present generated content as official IB material.
4. Verify live provider behaviour, supported browsers, microphone denial, interrupted calls, text and voice moderation, accessibility, exports and recovery. Establish account-level metering and server-enforced call termination.
5. Add classroom assignment distribution, teacher review and LMS integration once identity and data permissions exist. Validate those workflows with teachers before building broad dashboards.
6. Introduce subscriptions after measuring real provider and support costs. Implement actual billing, entitlements and cancellation flows; avoid decorative pricing or unconnected checkout.

## Operational limits

Server protections include same-origin checks, signed HttpOnly cookies, bounded request streams, schema validation, sanitized provider errors and durable Redis-backed request limits in production. Text requests are limited to 15/minute per session and 300/workspace/24-hour window; voice starts to 3/minute per session and 30/workspace/24-hour window.

These do not create a hard currency budget or a mature abuse-prevention system. A client can bypass the ten-minute UI cutoff, so a paid public launch needs server-enforced voice duration and provider spending controls. Sharing a pilot code also allows new sessions; it is not per-person enforcement. Prompt instructions support academic integrity but are not a complete moderation or safeguarding system.

The app stores learning data in this browser only. It handles invalid backups and storage errors visibly, keeps an original corrupt saved copy, and stops overwriting when another tab changes the workspace. It does not encrypt localStorage or isolate users sharing a browser profile. AI conversations stay in memory unless exported, and provider processing still applies to submitted data.
