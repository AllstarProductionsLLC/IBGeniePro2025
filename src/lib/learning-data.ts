import { Subject } from "./subjects";

export interface FlashCard {
    id: string;
    front: string;
    back: string;
    category: string;
}

export interface VocabularyWord {
    word: string;
    definition: string;
    example?: string;
    synonyms?: string[];
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface ConceptMap {
    id: string;
    title: string;
    nodes: {
        id: string;
        label: string;
        description: string;
    }[];
    connections: {
        from: string;
        to: string;
        label?: string;
    }[];
}

// Flashcards by subject
export const flashcardsBySubject: Record<string, FlashCard[]> = {
    "Design": [
        {
            id: "design-1",
            front: "What is the Design Cycle?",
            back: "A cyclical process of Inquiring & Analyzing, Developing Ideas, Creating the Solution, and Evaluating.",
            category: "Design Cycle"
        },
        {
            id: "design-2",
            front: "What is Criterion A in MYP Design?",
            back: "Inquiring and Analyzing - researching the problem and analyzing existing solutions.",
            category: "Assessment"
        },
        {
            id: "design-3",
            front: "What is a design specification?",
            back: "A detailed list of requirements that a successful solution must meet.",
            category: "Design Process"
        },
        {
            id: "design-4",
            front: "What is iteration in design?",
            back: "The process of repeatedly refining and improving a design based on testing and feedback.",
            category: "Design Process"
        },
        {
            id: "design-5",
            front: "What is Criterion B in MYP Design?",
            back: "Developing Ideas - creating and presenting feasible design ideas.",
            category: "Assessment"
        },
        {
            id: "design-6",
            front: "What is Criterion C in MYP Design?",
            back: "Creating the Solution - planning, constructing, and following the design plan.",
            category: "Assessment"
        },
        {
            id: "design-7",
            front: "What is Criterion D in MYP Design?",
            back: "Evaluating - testing and evaluating the success of the solution.",
            category: "Assessment"
        },
        {
            id: "design-8",
            front: "What is a prototype?",
            back: "An early sample or model built to test a concept or process.",
            category: "Design Process"
        },
        {
            id: "design-9",
            front: "What is user-centered design?",
            back: "A design philosophy that places the user's needs, wants, and limitations at the center of each stage.",
            category: "Design Philosophy"
        },
        {
            id: "design-10",
            front: "What is a design brief?",
            back: "A written document that outlines the problem, target audience, and requirements for a design project.",
            category: "Design Process"
        },
        {
            id: "design-11",
            front: "What is sustainability in design?",
            back: "Creating products that minimize environmental impact and can be maintained long-term.",
            category: "Design Philosophy"
        },
        {
            id: "design-12",
            front: "What is formative evaluation?",
            back: "Testing and feedback during the design process to improve the solution before final creation.",
            category: "Evaluation"
        },
    ],
    "Mathematics": [
        {
            id: "math-1",
            front: "What is a variable?",
            back: "A symbol (usually a letter) that represents an unknown or changing value.",
            category: "Algebra"
        },
        {
            id: "math-2",
            front: "What is the Pythagorean Theorem?",
            back: "a² + b² = c², where c is the hypotenuse of a right triangle.",
            category: "Geometry"
        },
        {
            id: "math-3",
            front: "What is a function?",
            back: "A relationship where each input has exactly one output.",
            category: "Functions"
        },
        {
            id: "math-4",
            front: "What is the slope of a line?",
            back: "The rate of change, calculated as rise over run (change in y / change in x).",
            category: "Algebra"
        },
        {
            id: "math-5",
            front: "What is the area of a circle?",
            back: "πr², where r is the radius of the circle.",
            category: "Geometry"
        },
        {
            id: "math-6",
            front: "What is a prime number?",
            back: "A number greater than 1 that has only two factors: 1 and itself.",
            category: "Number Theory"
        },
        {
            id: "math-7",
            front: "What is the quadratic formula?",
            back: "x = (-b ± √(b² - 4ac)) / 2a, used to solve equations of the form ax² + bx + c = 0.",
            category: "Algebra"
        },
        {
            id: "math-8",
            front: "What is probability?",
            back: "The likelihood of an event occurring, expressed as a number between 0 and 1.",
            category: "Statistics"
        },
        {
            id: "math-9",
            front: "What is the mean?",
            back: "The average of a set of numbers, found by adding all values and dividing by the count.",
            category: "Statistics"
        },
        {
            id: "math-10",
            front: "What is a polygon?",
            back: "A closed 2D shape made up of straight line segments.",
            category: "Geometry"
        },
        {
            id: "math-11",
            front: "What is an exponent?",
            back: "A number that shows how many times to multiply the base by itself (e.g., 2³ = 2×2×2 = 8).",
            category: "Algebra"
        },
        {
            id: "math-12",
            front: "What is the volume of a rectangular prism?",
            back: "Length × Width × Height.",
            category: "Geometry"
        },
    ],
    "Sciences": [
        {
            id: "science-1",
            front: "What is the scientific method?",
            back: "A systematic approach: Question, Hypothesis, Experiment, Analysis, Conclusion.",
            category: "Scientific Inquiry"
        },
        {
            id: "science-2",
            front: "What is a hypothesis?",
            back: "A testable prediction about the relationship between variables.",
            category: "Scientific Inquiry"
        },
        {
            id: "science-3",
            front: "What is a control variable?",
            back: "A variable that is kept constant to ensure a fair test.",
            category: "Experiments"
        },
        {
            id: "science-4",
            front: "What is photosynthesis?",
            back: "The process by which plants convert light energy into chemical energy (glucose).",
            category: "Biology"
        },
        {
            id: "science-5",
            front: "What is an atom?",
            back: "The smallest unit of matter that retains the properties of an element.",
            category: "Chemistry"
        },
        {
            id: "science-6",
            front: "What is Newton's First Law?",
            back: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force.",
            category: "Physics"
        },
        {
            id: "science-7",
            front: "What is a cell?",
            back: "The basic structural and functional unit of all living organisms.",
            category: "Biology"
        },
        {
            id: "science-8",
            front: "What is the water cycle?",
            back: "The continuous movement of water through evaporation, condensation, precipitation, and collection.",
            category: "Earth Science"
        },
        {
            id: "science-9",
            front: "What is energy?",
            back: "The ability to do work or cause change.",
            category: "Physics"
        },
        {
            id: "science-10",
            front: "What is an ecosystem?",
            back: "A community of living organisms interacting with their physical environment.",
            category: "Biology"
        },
        {
            id: "science-11",
            front: "What is a chemical reaction?",
            back: "A process where substances are transformed into different substances.",
            category: "Chemistry"
        },
        {
            id: "science-12",
            front: "What is gravity?",
            back: "A force that attracts objects with mass toward each other.",
            category: "Physics"
        },
    ],
};

// Vocabulary by subject
export const vocabularyBySubject: Record<string, VocabularyWord[]> = {
    "Design": [
        { word: "Prototype", definition: "An early model of a product used for testing", example: "We built a cardboard prototype of our app interface.", synonyms: ["Model", "Mock-up"] },
        { word: "Ergonomics", definition: "The study of designing products for human use and comfort", example: "Good ergonomics makes the chair comfortable for long periods.", synonyms: ["Human factors"] },
        { word: "Sustainability", definition: "Meeting present needs without compromising future generations", example: "Using recycled materials improves the sustainability of our design.", synonyms: ["Eco-friendly", "Green"] },
        { word: "User-centered", definition: "Design that focuses on the needs and preferences of users", example: "A user-centered approach involves interviewing potential users.", synonyms: ["Human-centered"] },
        { word: "Iteration", definition: "Repeated refinement and improvement of a design", example: "Through iteration, we made the app easier to use.", synonyms: ["Refinement", "Revision"] },
        { word: "Aesthetics", definition: "The visual appeal and beauty of a design", example: "The aesthetics of the website attracted many visitors.", synonyms: ["Appearance", "Visual design"] },
        { word: "Functionality", definition: "How well a product performs its intended purpose", example: "The functionality of the tool exceeded our expectations.", synonyms: ["Usability", "Performance"] },
        { word: "Innovation", definition: "Creating new and original ideas or methods", example: "The innovation in smartphone design changed how we communicate.", synonyms: ["Creativity", "Invention"] },
        { word: "Constraint", definition: "A limitation or restriction in the design process", example: "Budget constraints limited our material choices.", synonyms: ["Limitation", "Restriction"] },
        { word: "Stakeholder", definition: "A person with an interest or concern in the design project", example: "We interviewed stakeholders to understand their needs.", synonyms: ["Interested party"] },
        { word: "Feasibility", definition: "Whether a design idea is practical and achievable", example: "We tested the feasibility of using solar panels.", synonyms: ["Practicality", "Viability"] },
        { word: "Specification", definition: "Detailed requirements that a design must meet", example: "The specification required the product to be waterproof.", synonyms: ["Requirement", "Criteria"] },
    ],
    "Mathematics": [
        { word: "Integer", definition: "A whole number (positive, negative, or zero)", example: "-3, 0, and 7 are all integers.", synonyms: ["Whole number"] },
        { word: "Coefficient", definition: "A number multiplied by a variable", example: "In 5x, the coefficient is 5.", synonyms: ["Multiplier"] },
        { word: "Perimeter", definition: "The total distance around a shape", example: "The perimeter of a square is 4 times its side length.", synonyms: ["Boundary"] },
        { word: "Equation", definition: "A mathematical statement showing two expressions are equal", example: "2x + 3 = 7 is an equation.", synonyms: ["Formula"] },
        { word: "Ratio", definition: "A comparison of two quantities", example: "The ratio of boys to girls is 3:2.", synonyms: ["Proportion"] },
        { word: "Fraction", definition: "A part of a whole expressed as a numerator over a denominator", example: "1/2 represents one half.", synonyms: ["Portion"] },
        { word: "Hypotenuse", definition: "The longest side of a right triangle", example: "Use the Pythagorean theorem to find the hypotenuse.", synonyms: [] },
        { word: "Median", definition: "The middle value in an ordered set of numbers", example: "The median of 1, 3, 5 is 3.", synonyms: ["Middle value"] },
        { word: "Denominator", definition: "The bottom number in a fraction", example: "In 3/4, the denominator is 4.", synonyms: [] },
        { word: "Parallel", definition: "Lines that never intersect and stay the same distance apart", example: "Railroad tracks are parallel lines.", synonyms: [] },
        { word: "Vertex", definition: "A point where two or more lines meet", example: "A triangle has three vertices.", synonyms: ["Corner", "Point"] },
        { word: "Circumference", definition: "The distance around a circle", example: "The circumference equals 2πr.", synonyms: ["Perimeter of a circle"] },
    ],
    "Sciences": [
        { word: "Photosynthesis", definition: "The process plants use to convert light into energy", example: "Plants perform photosynthesis using chlorophyll.", synonyms: [] },
        { word: "Molecule", definition: "Two or more atoms bonded together", example: "Water (H₂O) is a molecule made of hydrogen and oxygen.", synonyms: [] },
        { word: "Ecosystem", definition: "A community of living organisms and their environment", example: "A forest ecosystem includes trees, animals, and soil.", synonyms: ["Biome"] },
        { word: "Hypothesis", definition: "A testable prediction or educated guess", example: "My hypothesis is that plants grow faster with more sunlight.", synonyms: ["Prediction", "Theory"] },
        { word: "Variable", definition: "A factor that can change in an experiment", example: "Temperature is an important variable in this experiment.", synonyms: ["Factor"] },
        { word: "Organism", definition: "Any living thing", example: "Bacteria are single-celled organisms.", synonyms: ["Life form", "Being"] },
        { word: "Evaporation", definition: "The process of liquid turning into gas", example: "Evaporation occurs when water is heated.", synonyms: ["Vaporization"] },
        { word: "Gravity", definition: "The force that attracts objects toward each other", example: "Gravity keeps us on Earth's surface.", synonyms: ["Gravitational force"] },
        { word: "Adaptation", definition: "A characteristic that helps an organism survive", example: "Thick fur is an adaptation for cold climates.", synonyms: ["Adjustment"] },
        { word: "Conductor", definition: "A material that allows heat or electricity to pass through", example: "Copper is a good conductor of electricity.", synonyms: [] },
        { word: "Renewable", definition: "A resource that can be replenished naturally", example: "Solar energy is a renewable resource.", synonyms: ["Sustainable"] },
        { word: "Density", definition: "The amount of mass in a given volume", example: "Ice has a lower density than water.", synonyms: [] },
    ],
};

// Quiz questions by subject
export const quizzesBySubject: Record<string, QuizQuestion[]> = {
    "Design": [
        {
            id: "design-q1",
            question: "Which criterion focuses on creating the solution?",
            options: ["Criterion A", "Criterion B", "Criterion C", "Criterion D"],
            correctAnswer: 2,
            explanation: "Criterion C is 'Creating the Solution' where you make your design."
        },
        {
            id: "design-q2",
            question: "What should you do FIRST in the design cycle?",
            options: ["Create a prototype", "Inquire and analyze", "Evaluate the solution", "Develop ideas"],
            correctAnswer: 1,
            explanation: "The design cycle starts with Inquiring and Analyzing to understand the problem."
        },
        {
            id: "design-q3",
            question: "What is a design specification?",
            options: ["A drawing of the product", "A list of requirements the solution must meet", "The final product", "A budget plan"],
            correctAnswer: 1,
            explanation: "A design specification is a detailed list of requirements that guide the design process."
        },
        {
            id: "design-q4",
            question: "Which of these is an example of sustainable design?",
            options: ["Using single-use plastics", "Designing for planned obsolescence", "Using recycled materials", "Ignoring environmental impact"],
            correctAnswer: 2,
            explanation: "Using recycled materials reduces environmental impact and promotes sustainability."
        },
        {
            id: "design-q5",
            question: "What is the purpose of a prototype?",
            options: ["To sell the product", "To test and refine ideas", "To replace the final product", "To impress clients"],
            correctAnswer: 1,
            explanation: "Prototypes are used to test concepts and gather feedback before creating the final solution."
        },
        {
            id: "design-q6",
            question: "What does 'user-centered design' mean?",
            options: ["Design focused on aesthetics", "Design focused on user needs", "Design focused on cost", "Design focused on technology"],
            correctAnswer: 1,
            explanation: "User-centered design prioritizes the needs, wants, and limitations of the end user."
        },
        {
            id: "design-q7",
            question: "Which criterion involves evaluating your solution?",
            options: ["Criterion A", "Criterion B", "Criterion C", "Criterion D"],
            correctAnswer: 3,
            explanation: "Criterion D is 'Evaluating' where you test and assess your solution's success."
        },
        {
            id: "design-q8",
            question: "What is iteration in design?",
            options: ["Making one final version", "Repeating and refining the design", "Copying someone else's design", "Giving up on a design"],
            correctAnswer: 1,
            explanation: "Iteration involves repeatedly refining and improving a design based on feedback and testing."
        },
        {
            id: "design-q9",
            question: "What is ergonomics concerned with?",
            options: ["Product cost", "User comfort and efficiency", "Product color", "Marketing strategy"],
            correctAnswer: 1,
            explanation: "Ergonomics focuses on designing products that are comfortable and efficient for human use."
        },
        {
            id: "design-q10",
            question: "What is a design brief?",
            options: ["A short meeting", "A document outlining the design problem and requirements", "A quick sketch", "The final presentation"],
            correctAnswer: 1,
            explanation: "A design brief is a written document that outlines the problem, audience, and project requirements."
        },
    ],
    "Mathematics": [
        {
            id: "math-q1",
            question: "What is 3² + 4²?",
            options: ["7", "12", "25", "49"],
            correctAnswer: 2,
            explanation: "3² = 9 and 4² = 16, so 9 + 16 = 25"
        },
        {
            id: "math-q2",
            question: "What is the area of a rectangle with length 5 and width 3?",
            options: ["8", "15", "16", "30"],
            correctAnswer: 1,
            explanation: "Area of a rectangle = length × width = 5 × 3 = 15"
        },
        {
            id: "math-q3",
            question: "Which of these is a prime number?",
            options: ["4", "6", "7", "9"],
            correctAnswer: 2,
            explanation: "7 is prime because it only has two factors: 1 and 7."
        },
        {
            id: "math-q4",
            question: "What is 1/2 + 1/4?",
            options: ["1/6", "2/6", "3/4", "1/8"],
            correctAnswer: 2,
            explanation: "1/2 = 2/4, so 2/4 + 1/4 = 3/4"
        },
        {
            id: "math-q5",
            question: "What is the perimeter of a square with side length 6?",
            options: ["12", "18", "24", "36"],
            correctAnswer: 2,
            explanation: "Perimeter of a square = 4 × side = 4 × 6 = 24"
        },
        {
            id: "math-q6",
            question: "If x + 5 = 12, what is x?",
            options: ["5", "7", "12", "17"],
            correctAnswer: 1,
            explanation: "x = 12 - 5 = 7"
        },
        {
            id: "math-q7",
            question: "What is 20% of 50?",
            options: ["5", "10", "15", "20"],
            correctAnswer: 1,
            explanation: "20% of 50 = 0.20 × 50 = 10"
        },
        {
            id: "math-q8",
            question: "How many degrees are in a right angle?",
            options: ["45°", "60°", "90°", "180°"],
            correctAnswer: 2,
            explanation: "A right angle measures exactly 90 degrees."
        },
        {
            id: "math-q9",
            question: "What is the median of 2, 5, 8, 11, 14?",
            options: ["5", "8", "11", "14"],
            correctAnswer: 1,
            explanation: "The median is the middle value when ordered: 8"
        },
        {
            id: "math-q10",
            question: "What is 6 × 7?",
            options: ["36", "42", "48", "54"],
            correctAnswer: 1,
            explanation: "6 × 7 = 42"
        },
    ],
    "Sciences": [
        {
            id: "science-q1",
            question: "What is the powerhouse of the cell?",
            options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
            correctAnswer: 1,
            explanation: "Mitochondria produce energy (ATP) for the cell."
        },
        {
            id: "science-q2",
            question: "What gas do plants absorb during photosynthesis?",
            options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
            correctAnswer: 2,
            explanation: "Plants absorb carbon dioxide (CO₂) and release oxygen during photosynthesis."
        },
        {
            id: "science-q3",
            question: "What is the center of an atom called?",
            options: ["Electron", "Proton", "Nucleus", "Neutron"],
            correctAnswer: 2,
            explanation: "The nucleus is the center of an atom, containing protons and neutrons."
        },
        {
            id: "science-q4",
            question: "Which state of matter has a definite volume but no definite shape?",
            options: ["Solid", "Liquid", "Gas", "Plasma"],
            correctAnswer: 1,
            explanation: "Liquids have a definite volume but take the shape of their container."
        },
        {
            id: "science-q5",
            question: "What is the process of water turning into vapor called?",
            options: ["Condensation", "Evaporation", "Precipitation", "Freezing"],
            correctAnswer: 1,
            explanation: "Evaporation is when liquid water turns into water vapor (gas)."
        },
        {
            id: "science-q6",
            question: "What force pulls objects toward Earth?",
            options: ["Magnetism", "Friction", "Gravity", "Electricity"],
            correctAnswer: 2,
            explanation: "Gravity is the force that attracts objects with mass toward each other."
        },
        {
            id: "science-q7",
            question: "What do we call animals that eat only plants?",
            options: ["Carnivores", "Herbivores", "Omnivores", "Decomposers"],
            correctAnswer: 1,
            explanation: "Herbivores are animals that eat only plants."
        },
        {
            id: "science-q8",
            question: "How many planets are in our solar system?",
            options: ["7", "8", "9", "10"],
            correctAnswer: 1,
            explanation: "There are 8 planets in our solar system (Pluto is now classified as a dwarf planet)."
        },
        {
            id: "science-q9",
            question: "What is the chemical symbol for water?",
            options: ["H₂O", "CO₂", "O₂", "NaCl"],
            correctAnswer: 0,
            explanation: "H₂O represents water - two hydrogen atoms and one oxygen atom."
        },
        {
            id: "science-q10",
            question: "Which organ pumps blood through the body?",
            options: ["Brain", "Lungs", "Heart", "Liver"],
            correctAnswer: 2,
            explanation: "The heart pumps blood throughout the body to deliver oxygen and nutrients."
        },
    ],
};

// Helper function to get learning content by subject
export function getLearningContent(subject: string) {
    return {
        flashcards: flashcardsBySubject[subject] || [],
        vocabulary: vocabularyBySubject[subject] || [],
        quizzes: quizzesBySubject[subject] || [],
    };
}
