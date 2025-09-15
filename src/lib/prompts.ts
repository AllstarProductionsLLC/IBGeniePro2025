
export const prompts = {
  student: {
    pyp: [
      {
        category: "Let's Inquire!",
        prompts: [
          {
            title: "Ask Big Questions",
            prompt:
              "I'm learning about [TOPIC]. Help me think of some big, interesting questions to ask about it. What makes it special?",
          },
          {
            title: "Explore My Interests",
            prompt:
              "I'm really interested in [TOPIC OF INTEREST]. Can you help me brainstorm some fun project ideas or things I can create to share my learning with my class?",
          },
          {
            title: "Learner Profile Power",
            prompt:
              "I want to practice being more [LEARNER PROFILE ATTRIBUTE, e.g., caring, courageous]. Can you give me a fun and simple mission to do today?",
          },
        ],
      },
      {
        category: "Taking Action",
        prompts: [
          {
            title: "Be a Helper",
            prompt:
              "I learned about [PROBLEM, e.g., litter in the park]. What's a small, kind action I can take in my school or at home to help solve this problem?",
          },
          {
            title: "Share What I Learned",
            prompt:
              "I want to share what I learned about [TOPIC]. Can you help me think of a fun way to do it? Maybe a story, a drawing, or a short play?",
          },
        ],
      },
       {
        category: "Creative Thinking",
        prompts: [
          {
            title: "Imagine a Story",
            prompt: "Let's write a short story together! Give me a fun character, a magical setting, and a problem they need to solve. I'll start the story."
          },
          {
            title: "Think Like an Inventor",
            prompt: "I want to invent something to help with [DAILY TASK, e.g., cleaning my room]. Help me brainstorm a silly and creative invention. What would it look like? What would it do?"
          }
        ]
      },
      {
        category: "Being a Good Communicator",
        prompts: [
            {
                title: "Practice My Writing",
                prompt: "Can you check this sentence for me? I want to make sure it makes sense. Here it is: [PASTE SENTENCE HERE]"
            },
            {
                title: "Draft a Friendly Message",
                prompt: "Help me write a kind and clear message to [PERSON, e.g., my friend] to say [YOUR MESSAGE, e.g., thank you for playing with me]."
            }
        ]
      }
    ],
    myp: [
      {
        category: "Interdisciplinary Understanding",
        prompts: [
          {
            title: "Build a Statement of Inquiry",
            prompt:
              "Create a powerful Statement of Inquiry using the key concept '[Key Concept]', related concepts '[Related Concept 1], [Related Concept 2]', and the global context '[Global Context]'. Explain how they connect.",
          },
          {
            title: "Connect Subjects",
            prompt:
              "How can I connect what I'm learning in MYP [Subject 1] about [Topic 1] with what I'm learning in MYP [Subject 2] about [Topic 2]?",
          },
        ],
      },
      {
        category: "Approaches to Learning (ATL)",
        prompts: [
          {
            title: "Develop an ATL Skill",
            prompt: "I need to work on my [SPECIFIC ATL SKILL, e.g., time management, critical thinking]. Give me three practical strategies I can use this week to improve this skill for my [Subject] class."
          },
          {
            title: "Criterion A Practice",
            prompt:
              "Generate some practice questions for Criterion A (Knowing and understanding) for MYP [Subject] on the topic of [Topic].",
          },
        ],
      },
      {
        category: "Personal Project",
        prompts: [
            {
                title: "Brainstorm Personal Project Idea",
                prompt: "Help me brainstorm a challenging and interesting goal for my MYP Personal Project. I am passionate about [YOUR INTERESTS]. Suggest some ideas that connect to a Global Context."
            },
            {
                title: "Outline Project Report",
                prompt: "Create a structured outline for my MYP Personal Project report based on my goal: [STATE YOUR PROJECT GOAL]. Include all the required sections and criterion strands."
            }
        ]
      },
       {
        category: "Productivity",
        prompts: [
          {
            title: "Act as a Writing Coach",
            prompt: "Review the following text and act as a writing coach. Provide feedback on its clarity, tone, and impact. Suggest specific improvements to make it more effective. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Check Grammar and Spelling",
            prompt: "Please check the following text for any grammatical errors, spelling mistakes, or typos. List the corrections needed. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Draft a Communication",
            prompt: "Help me draft a polite and clear email to [RECIPIENT, e.g., my teacher] about [PURPOSE OF EMAIL, e.g., asking for an extension on my assignment]."
          }
        ]
      }
    ],
    dp: [
      {
        category: "Extended Essay (EE)",
        prompts: [
          {
            title: "Draft EE Research Question",
            prompt:
              "Help me draft a focused, arguable, and researchable EE research question for the subject [Subject] on the broader topic of [Topic].",
          },
          {
            title: "Structure EE Argument",
            prompt:
              "Provide a potential structure or outline for my Extended Essay on the research question: '[PASTE RQ HERE]'. Suggest key points for the main body paragraphs.",
          },
        ],
      },
      {
        category: "Theory of Knowledge (TOK)",
        prompts: [
          {
            title: "Deconstruct TOK Prompt",
            prompt:
              "Deconstruct the TOK prescribed title '[PRESCRIBED TITLE]' by identifying key concepts, underlying assumptions, and potential knowledge questions.",
          },
          {
            title: "Find Contrasting Real-World Examples",
            prompt:
              "Find two strong, contrasting real-world examples that I can use to explore the TOK prompt '[PRESCRIBED TITLE]'. Explain how they offer different perspectives.",
          },
        ],
      },
      {
        category: "Internal Assessment (IA)",
        prompts: [
          {
            title: "IA Design Checklist",
            prompt:
              "Create a comprehensive checklist for designing my IA in [Subject], covering the research question, methodology, variables, materials, and ethical considerations.",
          },
          {
            title: "Analyze IA Data",
             prompt: "I have collected the following data for my [Subject] IA: [PASTE OR DESCRIBE DATA]. Suggest appropriate methods for processing and presenting this data, and what initial conclusions might be drawn."
          }
        ],
      },
       {
        category: "Productivity",
        prompts: [
          {
            title: "Act as a Writing Coach",
            prompt: "Review the following text and act as a writing coach. Provide feedback on its clarity, tone, and impact. Suggest specific improvements to make it more effective. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Check Grammar and Spelling",
            prompt: "Please check the following text for any grammatical errors, spelling mistakes, or typos. List the corrections needed. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Draft a Communication",
            prompt: "Help me draft a polite and clear email to [RECIPIENT, e.g., my teacher] about [PURPOSE OF EMAIL, e.g., asking for an extension on my assignment]."
          }
        ]
      }
    ],
  },
  teacher: {
    pyp: [
      {
        category: "Planning & Collaboration",
        prompts: [
          {
            title: "Unit of Inquiry Planner",
            prompt:
              "Generate a PYP unit of inquiry planner for the transdisciplinary theme '[THEME]' and central idea '[CENTRAL IDEA]'. Include suggested lines of inquiry, key concepts, learner profile attributes, and authentic assessment ideas.",
          },
          {
            title: "Provocation Idea",
            prompt:
              "Suggest a powerful and engaging provocation to launch a new unit on '[CENTRAL IDEA]'. The provocation should spark curiosity and student questions for a [Age Group] class.",
          },
        ],
      },
       {
        category: "Classroom Resources",
        prompts: [
          {
            title: "Create Differentiated Reading List",
            prompt: "Create a differentiated list of 5-7 age-appropriate resources (books, websites, videos) for a PYP [Age Group] class exploring the topic of [Topic]."
          },
          {
            title: "Design a Learning Center",
            prompt: "Design a play-based learning center for a PYP classroom focused on the concept of [Concept]. Describe the materials needed and the learning engagements."
          }
        ]
      },
       {
        category: "Productivity",
        prompts: [
          {
            title: "Act as a Writing Coach",
            prompt: "Review the following text and act as a writing coach. Provide feedback on its clarity, tone, and impact. Suggest specific improvements to make it more effective. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Check Grammar and Spelling",
            prompt: "Please check the following text for any grammatical errors, spelling mistakes, or typos. List the corrections needed. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Draft a Communication",
            prompt: "Help me draft a polite and clear email to [RECIPIENT, e.g., my teacher] about [PURPOSE OF EMAIL, e.g., asking for an extension on my assignment]."
          }
        ]
      }
    ],
    myp: [
      {
        category: "Planning & Assessment",
        isRubricTool: true,
        prompts: [
          {
            title: "Interdisciplinary Unit Planner",
            prompt:
              "Design an MYP interdisciplinary unit planner connecting [Subject 1] and [Subject 2] through the statement of inquiry: '[STATEMENT OF INQUIRY]'. Include summative assessment ideas and ATL skill connections.",
          },
          {
            title: "GRASPS Task Generator",
            prompt:
              "Create a GRASPS (Goal, Role, Audience, Situation, Product, Standards) performance-based assessment task for an MYP [Subject] unit on [Topic].",
          },
        ],
      },
      {
        category: "Instructional Strategies",
        prompts: [
           {
            title: "Concept-Based Learning Activity",
            prompt: "Design a concept-based learning activity for MYP [Subject] to help students move from factual knowledge of [Topic] to a conceptual understanding of [Key Concept]."
           },
           {
             title: "ATL Skill Integration",
             prompt: "Suggest three specific activities to explicitly teach and practice the ATL skill of '[SPECIFIC ATL SKILL]' within a unit on [Unit Topic] in [Subject]."
           }
        ]
      },
       {
        category: "Productivity",
        prompts: [
          {
            title: "Act as a Writing Coach",
            prompt: "Review the following text and act as a writing coach. Provide feedback on its clarity, tone, and impact. Suggest specific improvements to make it more effective. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Check Grammar and Spelling",
            prompt: "Please check the following text for any grammatical errors, spelling mistakes, or typos. List the corrections needed. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Draft a Communication",
            prompt: "Help me draft a polite and clear email to [RECIPIENT, e.g., my teacher] about [PURPOSE OF EMAIL, e.g., asking for an extension on my assignment]."
          }
        ]
      }
    ],
    dp: [
      {
        category: "Planning & Feedback",
        isRubricTool: true,
        prompts: [
          {
            title: "Lesson Plan Generator",
            prompt:
              "Create a detailed lesson plan for a 90-minute IB DP [Subject] class on the topic of [Topic]. Include learning objectives, teaching activities, differentiation strategies, and a formative assessment check.",
          },
          {
            title: "Generate Essay Questions",
            prompt:
              "Generate three challenging, DP-style essay questions for [Subject] on the topic of [Topic]. Ensure the questions require critical analysis and evaluation.",
          },
        ],
      },
       {
        category: "Curriculum & Resources",
        prompts: [
          {
            title: "TOK Integration Ideas",
            prompt: "Suggest three authentic opportunities to integrate Theory of Knowledge (TOK) discussions into my DP [Subject] unit on [Topic]."
          },
          {
            title: "Case Study Generator",
            prompt: "Generate a detailed, fictional case study relevant to the IB DP [Subject] syllabus area of [Syllabus Area]. Include data and context for analysis."
          }
        ]
      },
       {
        category: "Productivity",
        prompts: [
          {
            title: "Act as a Writing Coach",
            prompt: "Review the following text and act as a writing coach. Provide feedback on its clarity, tone, and impact. Suggest specific improvements to make it more effective. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Check Grammar and Spelling",
            prompt: "Please check the following text for any grammatical errors, spelling mistakes, or typos. List the corrections needed. Here is the text: [PASTE TEXT HERE]"
          },
          {
            title: "Draft a Communication",
            prompt: "Help me draft a polite and clear email to [RECIPIENT, e.g., my teacher] about [PURPOSE OF EMAIL, e.g., asking for an extension on my assignment]."
          }
        ]
      }
    ],
  },
};
