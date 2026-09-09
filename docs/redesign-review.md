# IBGenie Pro redesign review

Research snapshot: 8 September 2026.

## What was there

The original app was a Next.js 15.3.3 chat experience with role/programme onboarding, Gemini calls, browser-based chat history, sample learning games and a Firebase initializer. It had useful beginnings, but learning resources were scattered across dialogs. There was no coherent loop from creating material to practising it and deciding what to do next.

The README overstated offline, cloud and export capabilities. Prompt CRUD handlers tried to use localStorage on the server. Provider models were old preview or 1.5-era selections, and build type errors were ignored. A public, unmetered AI endpoint would have exposed the owner to avoidable usage costs.

## Product direction

The organising loop is simple: choose a topic, create a resource, practise, understand mistakes, and return to a manageable next step.

The new home gives students a due-card review, actual weekly activity, resource creation, their saved subjects and personal tasks. Teacher view prioritises lessons, quizzes, formative rubrics and exit tickets. The same library holds both manually authored and AI-drafted material, with explicit provenance and editing before use.

The design now follows the supplied IB Genie website: royal blue actions, navy navigation, a pale canvas, blush accents and an original pastel sky/sea SVG. The first-use screen introduces role, programme, year and subjects before the main workspace. A persistent location bar and mobile navigation keep the workspace navigable as its capabilities grow. Empty states use real next actions; statistics start from zero. There are no invented learners, testimonials, class results or paid-plan promises.

The branch implements the learning workspace and Wix access integration. Commercial performance and live deployment readiness still depend on real member testing and the configuration described in the deployment guide.

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

The current validation includes TypeScript, Jest, a production build, client bundle credential checks, and real Redis quota tests in GitHub CI. The normal CI build uses Node.js 22. A portable build is available for restricted environments where native SWC or Node memory counters are unavailable.

Live Gemini generation, OpenAI audio, the published Wix bridge, browser layout, keyboard navigation, mobile behaviour and printing have not been verified against the owner's deployment. Those checks are listed in [the Vercel and Wix setup guide](vercel-wix-setup.md).

## Launch sequence

1. Install the supplied Wix backend and page files, enter the Vercel values and actual paid plan IDs, and verify the published site using free and paid test members.
2. Verify provider access, microphone permission, interruptions, QStash delivery and actual server hangup. Set provider budgets and monitor failed jobs and costs.
3. Run a supervised pilot with teachers and students. Measure time to a useful resource, repeated study, resource edits and whether mistakes lead to later recall.
4. Maintain a curriculum editor workflow with licensed guides where required. Review session-specific changes before publishing revised summaries.
5. Add cloud persistence, school administration and classroom distribution only with appropriate data permissions and validated teacher workflows.

## Operational limits

Wix assertions bind a verified member and eligible paid plan IDs to a nonce, audience, issuer and short expiry. Redis consumes assertions once and stores revocable five-minute app sessions. Exact origin checks, bounded request bodies, validated output and sanitized errors protect the API routes. A browser Pro flag or selected teacher role cannot authorize a premium API request.

The default free allowance is 10 daily AI text requests. Pro allows 200 daily combined AI requests and 10 voice starts. Quotas are durable across sessions and devices, with separate workspace ceilings and a midnight UTC reset. Failed requests refund daily reservations. Per-minute rate limits remain in place.

Voice termination is scheduled on the server and uses OpenAI's hangup endpoint. Delayed delivery and provider outages can affect exact timing, so request limits and scheduled termination do not replace provider budget monitoring.

Learning data is stored in the browser. Member-specific keys prevent the normal interface from mixing workspaces, but are not encryption or cloud data isolation. Invalid backups are preserved and cross-tab conflicts stop overwriting. Conversations stay in memory unless exported; submitted content is still processed by the relevant AI provider.

## Supplied ZIP review

The old ZIP used `AUTH_STATUS` with a client-supplied `isPro` flag and a resettable browser usage counter. It did not include the Wix backend, private environment values or Firebase credentials. The new bridge uses server-verified current-member orders and preserves the existing `https://www.ibgenie.com/plans-pricing` upgrade destination. Installation details and primary API references are in the setup guide.
