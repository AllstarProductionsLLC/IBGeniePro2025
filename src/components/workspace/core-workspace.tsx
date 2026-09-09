"use client";
import { useState } from "react";
import { Compass, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadText, type WorkspaceState } from "@/lib/workspace";
import { ExportActions } from "./export-actions";
import { BRAND_URL } from "@/lib/learning-tools";
import { Field, SourceLink, type Update } from "./shared";
const projects = {
  "pyp-inquiry": {
    label: "My inquiry",
    subject: "Inquiry",
    title: "Start with a wonder.",
    description: "Notice, ask, explore and share what you discover.",
    url: "https://ibo.org/programmes/primary-years-programme/curriculum/the-learner/",
    fields: [
      "What I wonder about",
      "What I already notice",
      "How I could find out more",
      "What I tried or discovered",
      "A new question I have",
      "How I can share my learning",
    ],
  },
  "pyp-action": {
    label: "My action",
    subject: "Inquiry",
    title: "A small action can make a difference.",
    description:
      "Think about how your learning connects to people and places around you.",
    url: "https://ibo.org/programmes/primary-years-programme/curriculum/the-learner/",
    fields: [
      "Something I care about",
      "An action I could take",
      "Who could help me",
      "What I actually did",
      "What I noticed afterwards",
      "What I might do next",
    ],
  },
  "myp-project": {
    label: "Personal project",
    subject: "Personal project",
    title: "Learn something. Make something. Reflect.",
    description:
      "Keep your learning goal, evidence and thinking together. Confirm the project requirements with your supervisor.",
    url: "https://ibo.org/programmes/middle-years-programme/curriculum/myp-projects/",
    fields: [
      "My learning goal and personal interest",
      "My intended product and success criteria",
      "My action plan",
      "ATL skills I am applying",
      "Evidence of my progress",
      "What I learned and how I would improve",
    ],
  },
  "myp-inquiry": {
    label: "Inquiry and service",
    subject: "Inquiry",
    title: "Connect learning with your community.",
    description:
      "Explore a meaningful question and reflect on your contribution.",
    url: "https://ibo.org/programmes/middle-years-programme/curriculum/",
    fields: [
      "My question and its context",
      "What I need to investigate",
      "Different perspectives to consider",
      "My contribution or action",
      "Evidence and feedback",
      "What I will try next",
    ],
  },
  ee: {
    label: "Extended essay",
    subject: "Extended essay",
    title: "A question worth exploring.",
    description: "Shape your research and keep the thinking your own.",
    url: "https://ibo.org/programmes/diploma-programme/curriculum/dp-core/extended-essay/",
    fields: [
      "My working research question",
      "Why this question matters",
      "Sources and methods to explore",
      "Alternative explanations or counterarguments",
      "Notes from my supervisor meeting",
      "My next manageable step",
    ],
  },
  tok: {
    label: "TOK",
    subject: "TOK",
    title: "Get curious about how we know.",
    description: "Make room for different perspectives and better questions.",
    url: "https://ibo.org/programmes/diploma-programme/curriculum/dp-core/theory-of-knowledge/",
    fields: [
      "The knowledge question I am exploring",
      "My claim and supporting example",
      "A different perspective",
      "What makes this evidence convincing?",
      "Implications and limitations",
      "What I will investigate next",
    ],
  },
  cas: {
    label: "CAS",
    subject: "CAS",
    title: "Experience. Reflect. Grow.",
    description:
      "Record what you actually did and what it helped you understand.",
    url: "https://ibo.org/programmes/diploma-programme/curriculum/dp-core/creativity-activity-and-service/",
    fields: [
      "My experience and dates",
      "Creativity, activity or service",
      "My intention and contribution",
      "Evidence of what actually happened",
      "What I learned and what changed",
      "Questions for my CAS coordinator",
    ],
  },
  ia: {
    label: "Internal assessment",
    subject: "Internal assessment",
    title: "Make your investigation your own.",
    description:
      "Use your subject guide and teacher feedback to plan your next step.",
    url: "https://ibo.org/programmes/diploma-programme/curriculum/",
    fields: [
      "Subject and working question",
      "Variables, sources or material",
      "My proposed method",
      "Ethics, uncertainty and limitations",
      "Evidence I have collected",
      "Teacher feedback and next steps",
    ],
  },
} as const;
export function CoreWorkspace({
  state,
  update,
  coach,
}: {
  state: WorkspaceState;
  update: Update;
  coach: (s: string) => void;
}) {
  const [tab, setTab] = useState<keyof typeof projects>(
    state.profile.program === "pyp"
      ? "pyp-inquiry"
      : state.profile.program === "myp"
        ? state.profile.yearGroup === "Year 5"
          ? "myp-project"
          : "myp-inquiry"
        : "ee",
  );
  const project = projects[tab];
  const markdown =
    "# " +
    project.label +
    "\n\n" +
    project.fields
      .map((f, i) => "## " + f + "\n\n" + (state.core[tab + "-" + i] || ""))
      .join("\n\n") +
    "\n\n" +
    BRAND_URL;
  const visible = Object.entries(projects).filter(([key]) =>
    state.profile.program === "dp"
      ? !key.includes("-")
      : key.startsWith(state.profile.program + "-"),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR IDEAS. YOUR VOICE.</span>
          <h1>Give your bigger projects room to grow.</h1>
          <p>A notebook for questions, evidence and honest reflection.</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            downloadText(
              markdown,
              "ibgenie-" + tab + "-notes.md",
              "text/markdown",
            )
          }
        >
          <Download size={17} />
          Export notes
        </Button>
      </div>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as keyof typeof projects)}
      >
        <TabsList className="project-tabs">
          {visible.map(([key, p]) => (
            <TabsTrigger key={key} value={key}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="core-intro panel">
        <span className="tool-icon">
          <Compass size={25} />
        </span>
        <div>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          {tab === "ee" && (
            <p>
              {state.profile.examYear >= 2027
                ? "From May 2027, the revised EE offers subject-focused and interdisciplinary pathways, with a 30-mark assessment model. Confirm your guide with your supervisor."
                : "Use the EE guide for your examination session. The revised 2027 assessment does not apply to earlier cohorts."}
            </p>
          )}
          <SourceLink href={project.url}>Official IB guidance</SourceLink>
        </div>
      </div>
      <div className="button-row">
        <ExportActions title={project.label + " notes"} markdown={markdown} />
      </div>
      <div className="core-fields">
        {project.fields.map((label, i) => (
          <div className="panel" key={tab + "-" + i}>
            <Field label={label}>
              <Textarea
                rows={6}
                maxLength={12000}
                value={state.core[tab + "-" + i] || ""}
                placeholder="Start with your own thoughts…"
                onChange={(e) => {
                  const value = e.target.value;
                  update((s) => ({
                    ...s,
                    core: { ...s.core, [tab + "-" + i]: value },
                  }));
                }}
              />
            </Field>
          </div>
        ))}
      </div>
      <div className="coach-callout">
        <MessageCircle size={26} />
        <div>
          <h3>Stuck on the next question?</h3>
          <p>
            Ask a coach to challenge your reasoning. Your notes stay yours until
            you choose to share them.
          </p>
        </div>
        <Button variant="outline" onClick={() => coach(project.subject)}>
          Open a coach
        </Button>
      </div>
      <p className="muted-note">
        These notes are saved on this device. They do not submit work, certify
        CAS completion or predict an official mark.
      </p>
    </>
  );
}
