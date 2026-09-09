# Teaching and learning tools

The teacher studio and student workspace share the IB Genie brand and remembered onboarding. Their navigation, home actions, creation tools and programme prompts are different. Changing the role is a learning preference; it never grants Wix Pro or school administration rights.

## Teacher workflows

1. **Prepare a classroom presentation.** Choose Classroom presentation, subject and level. Enter your learning goals and source notes, then request an AI draft or write slides yourself. Edit titles, short points, classroom prompts, order and speaker notes. Save to the teaching library, choose Present slides or download PPTX. AI decks include teaching content, guided practice, application and a check for understanding. Content is a draft to review before teaching.
2. **Start from a lesson plan.** Open a saved lesson and choose Make classroom slides. Its sections become editable slides and its full text is retained in speaker notes, including longer plans. The AI tab can then draft a more developed classroom narrative from the source selection. Speaker notes can contain answers and source URLs; they are hidden on the fullscreen slide surface.
3. **Map a scope and sequence.** DP defaults to two years, MYP to five. PYP uses adjustable school years. Edit units, weeks, learning goals, inquiry, ATL practice, assessment evidence and connections. The generator drafts three substantial units per selected year; it is a starting framework, not a complete official syllabus. Verify coverage, progression and available teaching time against the current guide and your school's calendar. Export PDF/Word for discussion or CSV for a planning sheet.
4. **Review work and draft comments.** Add learner aliases or class codes to the local list. Enter a task, upload work and check the extracted text. Supply the applicable rubric if you want criterion feedback. Review the AI's evidence, comments and tentative marks, then edit the report comment and record your own grade or qualitative judgement. Mark the record teacher-reviewed and save or export it. Use Task and rubric for next learner to repeat the workflow without re-entering the criteria.
5. **Create a lesson kit.** Pair a deck with an exit ticket, quiz, vocabulary cards or original formative rubric. Resources can be edited manually and exported without an AI call.

## Student workflows

- **PYP:** word matching, short discovery questions, concrete reflection prompts and inquiry/action notebooks. Practice has no forced timer and feedback stays qualitative.
- **MYP:** concept matching, evidence/reasoning challenges, transfer prompts, inquiry/service notes and a personal-project notebook. The year-five context opens the personal-project notebook first; other years open inquiry.
- **DP:** retrieval and reasoning challenges using the student's resources, optional timed quiz practice, criteria-based formative self-checks and EE/TOK/CAS/IA notebooks. Transfer prompts ask learners to explain limitations and evidence.
- Students create flashcards, quizzes and study guides. Lesson planning, classroom presentation creation and long-term teaching plans are absent from student navigation and creation choices.
- **Writing lab:** both roles can review grammar, spelling, punctuation and clarity. Each proposed edit has a reason and can be accepted individually. Ambiguous repeated phrases need manual editing. A notice identifies when the text has changed since the review. The tool preserves the learner's argument rather than writing an assessed submission.

## Rubrics and grades

The app does not ship a universal official IB rubric. A current subject/year/component rubric must come from the school's licensed materials or the learner's teacher. Record its source/version and paste the relevant descriptors. The tool never invents grade boundaries or automatically converts one task's marks into a final subject grade.

- PYP uses goals, success criteria and narrative next steps. Numerical suggestions are disabled.
- MYP feedback uses the selected subject-group criteria and year-specific descriptors, or the correct project rubric. Only assess criteria relevant to the task. [IB MYP assessment](https://ibo.org/programmes/middle-years-programme/assessment-and-exams/)
- DP tasks use the applicable subject, SL/HL level, component and examination-session rubric. The DP combines different assessment components; a task result alone is not a course grade. [IB DP assessment](https://ibo.org/programmes/diploma-programme/assessment-and-exams/understanding-ib-assessment/)

Server validation rejects invented criterion IDs and out-of-range marks. A suggested mark must have a quotation found verbatim in the submitted work; otherwise the quotation and mark are removed. This verifies that the excerpt exists, not that the AI's interpretation is correct. Teachers retain the final judgement. Students receive formative self-checks, with optional tentative criterion marks when a rubric is supplied. Saved and exported records identify AI drafts and teacher-reviewed feedback.

Without criteria, the tool gives general feedback only. The separate Formative rubric creator makes original teaching criteria, not an official mark scheme. Use PYP learner agency, reflection and inquiry as context for feedback. [IB PYP learner guidance](https://ibo.org/programmes/primary-years-programme/curriculum/the-learner/)

The public guidance was checked on 9 September 2026. The separate curriculum hub's dated snapshot and review workflow remain in place. No live licensed-guide feed has been added.

## Uploads and local data

PDF, DOCX, TXT and Markdown files are parsed on the device, up to 2 MB. PDF files are limited to 20 pages. Feedback accepts 24,000 text characters; grammar accepts 12,000. Larger work is rejected with a request for a shorter selection rather than silently truncated. Scans, handwriting, diagrams and images are not assessed, and formatting or formula layout may not survive extraction. Review the extracted text before sending it.

AI requests require explicit consent and a verified Pro membership. The payload contains the reviewed text, task, programme context and supplied criteria. Learner aliases are not sent. Raw uploaded files and full submissions are not persisted. Explicitly saved feedback records include short evidence excerpts, comments, teacher judgement and rubric descriptors; they are stored in the member's local workspace and included in its backup. The learner list is also local. Delete saved records or export a backup in the app. There is no cloud gradebook, classroom distribution or encrypted school records store.

## Exports and printing

| Format       | Use                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------- |
| PPTX         | Native editable classroom slides and speaker notes; open in PowerPoint or import into Google Slides |
| PDF          | A4 handouts or feedback reports with embedded fonts and an IBgenie.com footer                       |
| Word (.docx) | Editable text, headings, lists and tables with a branded footer                                     |
| Markdown     | Portable source text and notes                                                                      |
| CSV          | Flashcards for Anki, scope-and-sequence rows or the teacher feedback register                       |

The app does not attach its deployment URL to document exports. Print the generated PDF for a clean handout. The browser's separate Print command can still include its actual page URL when browser headers/footers are enabled. Connecting the real custom app domain is a Vercel/DNS setup action described in the deployment guide.

## Verification

Automated checks cover role-specific actions, PYP project prompts and matching, schema migration, rubric evidence and mark bounds, free-member rejection at the new APIs, DOCX/text extraction, size limits, native PowerPoint text/notes, Word tables, PDF fonts and branding. The existing membership, quota, voice and storage tests remain. Generated PDF text and a rendered page were also inspected locally. Live AI responses, real Wix membership state, browser layouts/fullscreen and imports in the user's classroom software need verification on the configured deployment.
