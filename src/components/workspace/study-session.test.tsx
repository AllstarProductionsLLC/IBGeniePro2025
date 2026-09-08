import { fireEvent, render, screen } from "@testing-library/react";
import { StudySession } from "./study-session";
import { createWorkspace, starterResources } from "@/lib/starter-resources";
import type { WorkspaceState } from "@/lib/workspace";
jest.mock("./shared", () => ({
  Picker: ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
  }) => (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));
it("explains a missed answer, records one attempt and creates a targeted review deck", () => {
  let state = createWorkspace();
  const original = starterResources.find((r) => r.kind === "quiz")!;
  const resource = { ...original, questions: [original.questions[0]] };
  const update = jest.fn((fn: (s: WorkspaceState) => WorkspaceState) => {
    state = fn(state);
  });
  const onSave = jest.fn();
  render(
    <StudySession
      resource={resource}
      state={state}
      update={update}
      onClose={jest.fn()}
      onSave={onSave}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Start practice/ }));
  expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /A 4/ }));
  fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
  expect(
    screen.getByText(resource.questions[0].explanation),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /See my results/ }));
  expect(update).toHaveBeenCalledTimes(1);
  expect(state.attempts[0]).toMatchObject({
    correct: 0,
    total: 1,
    wrongIds: ["m1"],
  });
  fireEvent.click(
    screen.getByRole("button", { name: /Turn mistakes into flashcards/ }),
  );
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      kind: "flashcards",
      cards: [
        expect.objectContaining({
          front: resource.questions[0].question,
          back: expect.stringContaining(resource.questions[0].explanation),
        }),
      ],
    }),
  );
});
