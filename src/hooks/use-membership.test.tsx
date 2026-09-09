import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  MembershipProvider,
  useMembership,
  type AccessStatus,
} from "./use-membership";
const originalFetch = global.fetch;
const originalParent = Object.getOwnPropertyDescriptor(window, "parent")!;
const parentWindow = { postMessage: jest.fn() };
const guest: AccessStatus = {
  configured: true,
  authenticated: false,
  text: true,
  voice: true,
  tier: "guest",
  memberKey: null,
  expiresAt: null,
  allowedOrigins: ["https://www.ibgenie.com"],
  siteUrl: "https://www.ibgenie.com",
  upgradeUrl: "https://www.ibgenie.com/plans-pricing",
  freeLimit: 10,
  proLimit: 200,
  voiceLimit: 10,
  voiceMinutes: 10,
  usage: null,
};
function Probe() {
  const member = useMembership();
  return (
    <>
      <span>{member.status ? member.status.tier : "Loading"}</span>
      <button disabled={member.connecting} onClick={member.connect}>
        {member.connecting ? "Connecting" : "Connect"}
      </button>
    </>
  );
}
beforeEach(() => {
  jest.useFakeTimers();
  parentWindow.postMessage.mockClear();
  Object.defineProperty(window, "parent", {
    configurable: true,
    value: parentWindow,
  });
  global.fetch = jest.fn(
    async () =>
      ({ ok: true, status: 200, json: async () => guest }) as Response,
  );
});
afterEach(() => {
  jest.useRealTimers();
  global.fetch = originalFetch;
  Object.defineProperty(window, "parent", originalParent);
});
function message(data: object, origin = guest.allowedOrigins[0]) {
  window.dispatchEvent(
    new MessageEvent("message", {
      data,
      origin,
      source: parentWindow as unknown as Window,
    }),
  );
}
it("lets a member finish a slow Wix login without replacing its nonce on the refresh interval", async () => {
  await act(async () => {
    render(
      <MembershipProvider>
        <Probe />
      </MembershipProvider>,
    );
  });
  const initial = parentWindow.postMessage.mock.calls[0][0];
  act(() => message({ type: "IBGENIE_AUTH_REQUIRED", nonce: initial.nonce }));
  fireEvent.click(screen.getByRole("button", { name: "Connect" }));
  expect(parentWindow.postMessage.mock.calls[1][0].type).toBe(
    "IBGENIE_SIGN_IN_REQUEST",
  );
  await act(async () => {
    jest.advanceTimersByTime(60000);
  });
  expect(parentWindow.postMessage).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("button", { name: "Connecting" })).toBeDisabled();
});
it("ignores foreign origins, mismatched nonces and the old browser-supplied Pro flag", async () => {
  await act(async () => {
    render(
      <MembershipProvider>
        <Probe />
      </MembershipProvider>,
    );
  });
  const nonce = parentWindow.postMessage.mock.calls[0][0].nonce;
  await act(async () => {
    message(
      { type: "IBGENIE_AUTH_ASSERTION", nonce, assertion: "forged" },
      "https://attacker.test",
    );
    message({
      type: "IBGENIE_AUTH_ASSERTION",
      nonce: "wrong",
      assertion: "forged",
    });
    message({ type: "AUTH_STATUS", nonce, isPro: true });
  });
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByText("guest")).toBeInTheDocument();
});
it("opens a basic guest workspace when membership services are unavailable", async () => {
  global.fetch = jest.fn(async () => {
    throw new Error("Network unavailable");
  });
  await act(async () => {
    render(
      <MembershipProvider>
        <Probe />
      </MembershipProvider>,
    );
  });
  expect(screen.getByText("guest")).toBeInTheDocument();
});
