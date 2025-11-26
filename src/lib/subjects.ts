import { Program } from "@/app/page";

export type Subject = string;

export const SUBJECTS: Record<Program, Subject[]> = {
    pyp: [
        "Mathematics",
        "Language",
        "Science",
        "Social Studies",
        "Arts",
        "PSPE (Personal, Social and Physical Education)",
    ],
    myp: [
        "Language and Literature",
        "Language Acquisition",
        "Individuals and Societies",
        "Sciences",
        "Mathematics",
        "Arts",
        "Physical and Health Education",
        "Design",
    ],
    dp: [
        "Studies in Language and Literature",
        "Language Acquisition",
        "Individuals and Societies",
        "Sciences",
        "Mathematics",
        "The Arts",
        "Core (TOK, EE, CAS)",
    ],
};
