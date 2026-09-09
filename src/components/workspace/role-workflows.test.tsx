import { fireEvent, render, screen } from "@testing-library/react";
import { Dashboard } from "./dashboard";
import { CoreWorkspace } from "./core-workspace";
import { createWorkspace } from "@/lib/starter-resources";
import { PracticeArcade } from "./practice-arcade";
jest.mock("./export-actions", () => ({ ExportActions: () => null }));
jest.mock("./shared", () => ({
  KindIcon: () => null,
  SourceLink: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Field: ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <label>
      {label}
      {children}
    </label>
  ),
  EmptyState: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div>
      {title}
      {children}
    </div>
  ),
  Picker: ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: (string | { value: string; label: string })[];
  }) => (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => {
        const v = typeof o === "string" ? { value: o, label: o } : o;
        return (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        );
      })}
    </select>
  ),
}));
it("gives teachers a presentation and assessment workflow without student quiz stats", () => {
  const state = createWorkspace();
  state.profile.role = "teacher";
  const create = jest.fn(),
    go = jest.fn();
  render(
    <Dashboard
      state={state}
      update={jest.fn()}
      go={go}
      create={create}
      study={jest.fn()}
      coach={jest.fn()}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: /Create classroom slides/ }),
  );
  expect(create).toHaveBeenCalledWith("presentation");
  fireEvent.click(screen.getByRole("button", { name: /Review student work/ }));
  expect(go).toHaveBeenCalledWith("assessment");
  expect(screen.queryByText("Quizzes completed")).not.toBeInTheDocument();
});
it.each(["pyp", "myp", "dp"] as const)(
  "keeps teaching tools out of the %s student dashboard",
  (program) => {
    const state = createWorkspace();
    state.profile.program = program;
    render(
      <Dashboard
        state={state}
        update={jest.fn()}
        go={jest.fn()}
        create={jest.fn()}
        study={jest.fn()}
        coach={jest.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", {
        name: /Lesson plan|Plan a lesson|Classroom slides/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /My writing lab/ }),
    ).toBeInTheDocument();
  },
);
it("shows PYP inquiry prompts instead of DP project requirements", () => {
  const state = createWorkspace();
  state.profile.program = "pyp";
  render(<CoreWorkspace state={state} update={jest.fn()} coach={jest.fn()} />);
  expect(screen.getByRole("tab", { name: "My inquiry" })).toBeInTheDocument();
  expect(
    screen.queryByRole("tab", { name: "Extended essay" }),
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("What I wonder about")).toBeInTheDocument();
});
it("lets a PYP learner complete a word match with feedback", () => {
  const state = createWorkspace();
  state.profile.program = "pyp";
  render(
    <PracticeArcade
      state={state}
      update={jest.fn()}
      study={jest.fn()}
      create={jest.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Start matching/ }));
  const words = screen.getByLabelText("Words and ideas");
  const first = words.querySelector("button")!;
  const definitions: Record<string, string> = {
    Observe: "Look closely and notice details.",
    Compare: "Find things that are alike and different.",
    Predict: "Say what you think might happen next.",
    Habitat: "The place where a plant or animal lives.",
    Reflect: "Think about what you learned and what to try next.",
    Community: "People who share a place or do things together.",
  };
  const meaning = definitions[first.textContent!.trim()];
  fireEvent.click(first);
  fireEvent.click(screen.getByRole("button", { name: meaning }));
  expect(screen.getByRole("status")).toHaveTextContent("1 / 4 connected");
  expect(first).toBeDisabled();
});
