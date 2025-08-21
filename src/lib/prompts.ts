export const prompts = {
  student: {
    pyp: [
      {
        category: "Unit of Inquiry",
        prompts: [
          {
            title: "Inquiry Cycle Planner",
            prompt:
              "Create an inquiry cycle planner for the transdisciplinary theme '[THEME]' with links to the learner profile attributes.",
          },
          {
            title: "Brainstorm Exhibition Idea",
            prompt:
              "Help me brainstorm a central idea and lines of inquiry for my PYP Exhibition. My area of interest is [INTEREST].",
          },
        ],
      },
    ],
    myp: [
      {
        category: "Interdisciplinary Understanding",
        prompts: [
          {
            title: "Build a Statement of Inquiry",
            prompt:
              "Build a statement of inquiry from the key concept '[Key Concept]', related concepts '[Related Concept 1], [Related Concept 2]', and the global context '[Global Context]'.",
          },
          {
            title: "Criterion A Practice",
            prompt:
              "Generate some practice questions for Criterion A (Knowing and understanding) for MYP [Subject] on the topic of [Topic].",
          },
        ],
      },
    ],
    dp: [
      {
        category: "Extended Essay (EE)",
        prompts: [
          {
            title: "Draft EE Research Question",
            prompt:
              "Help me draft an EE research question and a working outline for the subject [Subject] on the topic of [Topic].",
          },
          {
            title: "Refine EE Introduction",
            prompt:
              "Review this draft of my EE introduction and provide feedback on its clarity, focus, and engagement. [PASTE INTRODUCTION HERE]",
          },
        ],
      },
      {
        category: "Theory of Knowledge (TOK)",
        prompts: [
          {
            title: "TOK Prompt Analysis",
            prompt:
              "Analyze the TOK prescribed title '[PRESCRIBED TITLE]' by identifying key concepts, underlying assumptions, and different perspectives.",
          },
          {
            title: "Find Real-World Examples",
            prompt:
              "Find three diverse real-world examples that I can use to explore the TOK prompt '[PRESCRIBED TITLE]'.",
          },
        ],
      },
      {
        category: "Internal Assessment (IA)",
        prompts: [
          {
            title: "IA Experiment Design Checklist",
            prompt:
              "Create a checklist for designing my IA experiment in [Science Subject], including variables, controls, materials, and ethical considerations.",
          },
        ],
      },
    ],
  },
  teacher: {
    pyp: [
      {
        category: "Planning",
        prompts: [
          {
            title: "Unit Planner Generator",
            prompt:
              "Generate a PYP unit planner for the transdisciplinary theme '[THEME]' and central idea '[CENTRAL IDEA]'. Include lines of inquiry, key concepts, learner profile attributes, and assessment ideas.",
          },
          {
            title: "Lesson Plan Idea",
            prompt:
              "Give me a creative lesson plan idea for a PYP [Age Group] class exploring the concept of [Concept] through play-based learning.",
          },
        ],
      },
    ],
    myp: [
      {
        category: "Planning & Assessment",
        prompts: [
          {
            title: "Interdisciplinary Unit Planner",
            prompt:
              "Design an MYP interdisciplinary unit planner connecting [Subject 1] and [Subject 2] through the statement of inquiry: [STATEMENT OF INQUIRY]. Include learning objectives, activities, and assessment tasks.",
          },
          {
            title: "Create Rubric from Descriptors",
            prompt:
              "Create a four-level rubric for MYP [Subject] Criterion [A/B/C/D] using these strand descriptors: [PASTE STRANDS HERE]",
          },
        ],
      },
    ],
    dp: [
      {
        category: "Planning & Feedback",
        isRubricTool: true,
        prompts: [
          {
            title: "Scope and Sequence Scaffold",
            prompt:
              "Generate a five-year scope and sequence scaffold for IB DP [Subject] SL/HL, showing how skills and content could be layered from Year 1 to Year 2. The output should be in a table format.",
          },
          {
            title: "Lesson Plan Generator",
            prompt:
              "Create a lesson plan for an IB DP [Subject] class on the topic of [Topic], including learning objectives, ATL skills, differentiation strategies, and a formative check.",
          },
        ],
      },
    ],
  },
};
