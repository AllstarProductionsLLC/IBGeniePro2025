import { act, renderHook, waitFor } from "@testing-library/react";
import { useWorkspace } from "./use-workspace";
import { createWorkspace } from "@/lib/starter-resources";
let mockMemberKey: string | null = null;
jest.mock("./use-membership", () => ({
  useMembership: () => ({ status: { memberKey: mockMemberKey } }),
}));
beforeEach(() => {
  localStorage.clear();
  mockMemberKey = null;
});
it("remembers completed onboarding and edited course choices after reopening", async () => {
  const first = renderHook(() => useWorkspace());
  await waitFor(() => expect(first.result.current.ready).toBe(true));
  act(() =>
    first.result.current.update((s) => ({
      ...s,
      onboardingComplete: true,
      profile: {
        ...s.profile,
        name: "JD",
        role: "teacher",
        program: "myp",
        yearGroup: "Year 4",
        subjects: ["Sciences"],
      },
    })),
  );
  first.unmount();
  const reopened = renderHook(() => useWorkspace());
  await waitFor(() => expect(reopened.result.current.ready).toBe(true));
  expect(reopened.result.current.state.onboardingComplete).toBe(true);
  expect(reopened.result.current.state.profile).toMatchObject({
    name: "JD",
    role: "teacher",
    program: "myp",
    yearGroup: "Year 4",
    subjects: ["Sciences"],
  });
});
it("switches accounts without overwriting another member's workspace", async () => {
  const a = {
      ...createWorkspace(),
      onboardingComplete: true,
      profile: { ...createWorkspace().profile, name: "Student A" },
    },
    b = {
      ...createWorkspace(),
      onboardingComplete: true,
      profile: {
        ...createWorkspace().profile,
        name: "Teacher B",
        role: "teacher",
      },
    },
    base = "ibgenie.workspace.v1:";
  localStorage.setItem(base + "member-a", JSON.stringify(a));
  localStorage.setItem(base + "member-b", JSON.stringify(b));
  mockMemberKey = "member-a";
  const hook = renderHook(() => useWorkspace());
  await waitFor(() =>
    expect(hook.result.current.state.profile.name).toBe("Student A"),
  );
  mockMemberKey = "member-b";
  hook.rerender();
  await waitFor(() =>
    expect(hook.result.current.state.profile.name).toBe("Teacher B"),
  );
  act(() =>
    hook.result.current.update((s) => ({
      ...s,
      profile: { ...s.profile, yearGroup: "Year 2" },
    })),
  );
  expect(
    JSON.parse(localStorage.getItem(base + "member-a")!).profile.name,
  ).toBe("Student A");
  expect(
    JSON.parse(localStorage.getItem(base + "member-b")!).profile,
  ).toMatchObject({ name: "Teacher B", yearGroup: "Year 2" });
  mockMemberKey = null;
  hook.rerender();
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  expect(hook.result.current.state.onboardingComplete).toBe(false);
});
it("preserves unreadable data instead of overwriting it in onboarding", async () => {
  localStorage.setItem("ibgenie.workspace.v1", "{broken");
  const hook = renderHook(() => useWorkspace());
  await waitFor(() => expect(hook.result.current.storageError).not.toBe(""));
  act(() =>
    hook.result.current.update((s) => ({ ...s, onboardingComplete: true })),
  );
  expect(localStorage.getItem("ibgenie.workspace.v1")).toBe("{broken");
});
