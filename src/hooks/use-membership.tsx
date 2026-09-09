"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  apiFetch,
  setSession,
  getSessionExpiry,
  getSessionVersion,
} from "@/lib/api-client";
export type AccessStatus = {
  configured: boolean;
  authenticated: boolean;
  text: boolean;
  voice: boolean;
  tier: "guest" | "free" | "pro";
  memberKey: string | null;
  expiresAt: number | null;
  allowedOrigins: string[];
  siteUrl: string;
  upgradeUrl: string;
  freeLimit: number;
  proLimit: number;
  voiceLimit: number;
  voiceMinutes: number;
  usage: null | {
    aiUsed: number;
    aiLimit: number;
    aiRemaining: number;
    voiceUsed: number;
    voiceLimit: number;
    voiceRemaining: number;
    resetsAt: string;
  };
};
type Membership = {
  status?: AccessStatus;
  statusError: string;
  refresh: () => Promise<void>;
  connect: () => void;
  signOut: () => Promise<void>;
  openStandalone: () => Promise<void>;
  connecting: boolean;
};
const Context = createContext<Membership | null>(null);
const offlineStatus: AccessStatus = {
  configured: false,
  authenticated: false,
  text: false,
  voice: false,
  tier: "guest",
  memberKey: null,
  expiresAt: null,
  allowedOrigins: [],
  siteUrl: "https://www.ibgenie.com",
  upgradeUrl: "https://www.ibgenie.com/plans-pricing",
  freeLimit: 10,
  proLimit: 200,
  voiceLimit: 10,
  voiceMinutes: 10,
  usage: null,
};
export function MembershipProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccessStatus>(),
    [statusError, setError] = useState(""),
    [connecting, setConnecting] = useState(false);
  const config = useRef<AccessStatus>(),
    nonce = useRef(""),
    lastRequest = useRef(0),
    pending = useRef(false),
    waitingForWix = useRef(false),
    disconnected = useRef(false),
    timeout = useRef<ReturnType<typeof setTimeout>>(),
    mounted = useRef(true);
  const refresh = useCallback(async () => {
    let revision = getSessionVersion();
    try {
      const r = await apiFetch("/api/access");
      const data = await r.json();
      if (revision !== getSessionVersion()) return;
      if (!r.ok) {
        if (r.status === 401) {
          setSession();
          revision = getSessionVersion();
          const fallback = await fetch("/api/access", { cache: "no-store" });
          if (fallback.ok) {
            const value = await fallback.json();
            if (revision !== getSessionVersion()) return;
            config.current = value;
            if (mounted.current) setStatus(value);
          }
        }
        throw new Error(data.error || "Could not check your membership.");
      }
      config.current = data;
      if (mounted.current) {
        setStatus(data);
        setError("");
      }
    } catch (e) {
      if (mounted.current && revision === getSessionVersion()) {
        setError(
          e instanceof Error ? e.message : "Could not check your membership.",
        );
        setStatus((previous) => previous || offlineStatus);
      }
    }
  }, []);
  const requestConnection = useCallback((login = false) => {
    if (
      window.parent === window ||
      waitingForWix.current ||
      (disconnected.current && !login)
    )
      return;
    if (login) disconnected.current = false;
    if (Date.now() - lastRequest.current < 2500 && !login) return;
    const origins = config.current?.allowedOrigins || [];
    if (!origins.length) return;
    lastRequest.current = Date.now();
    waitingForWix.current = true;
    nonce.current = Array.from(
      crypto.getRandomValues(new Uint8Array(24)),
      (b) => b.toString(16).padStart(2, "0"),
    ).join("");
    setConnecting(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(
      () => {
        waitingForWix.current = false;
        setConnecting(false);
        if (!config.current?.authenticated)
          setError(
            "The Wix connection did not respond. Open this app from the published IB Genie page and try again.",
          );
      },
      login ? 120000 : 18000,
    );
    for (const origin of origins)
      window.parent.postMessage(
        {
          type: login ? "IBGENIE_SIGN_IN_REQUEST" : "IBGENIE_AUTH_REQUEST",
          nonce: nonce.current,
          version: 1,
        },
        origin,
      );
  }, []);
  const signOut = useCallback(
    async (disconnect = true) => {
      if (disconnect) {
        disconnected.current = true;
        waitingForWix.current = false;
        if (timeout.current) clearTimeout(timeout.current);
        setConnecting(false);
        nonce.current = "";
      }
      try {
        await apiFetch("/api/access", { method: "DELETE" });
      } catch {
      } finally {
        setSession();
        const guest = {
          ...(config.current || offlineStatus),
          authenticated: false,
          tier: "guest" as const,
          memberKey: null,
          expiresAt: null,
          usage: null,
        };
        config.current = guest;
        setStatus(guest);
        await refresh();
      }
    },
    [refresh],
  );
  useEffect(() => {
    mounted.current = true;
    let active = true;
    const start = async () => {
      const hash = window.location.hash;
      if (hash.startsWith("#connect=")) {
        const code = hash.slice(9);
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search + "#today",
        );
        try {
          const r = await fetch("/api/access/handoff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "redeem", code }),
          });
          const data = await r.json();
          if (!r.ok) throw new Error(data.error);
          setSession(data.token, data.expiresAt);
        } catch (e) {
          if (active)
            setError(
              e instanceof Error
                ? e.message
                : "This connection link could not be opened.",
            );
        }
      }
      await refresh();
      if (active) requestConnection();
    };
    void start();
    const listener = async (event: MessageEvent) => {
      if (
        event.source !== window.parent ||
        window.parent === window ||
        !config.current?.allowedOrigins.includes(event.origin)
      )
        return;
      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || data.nonce !== nonce.current || !nonce.current) return;
      if (data.type === "IBGENIE_AUTH_REQUIRED") {
        waitingForWix.current = false;
        if (timeout.current) clearTimeout(timeout.current);
        setConnecting(false);
        if (config.current?.authenticated) void signOut(false);
        return;
      }
      if (data.type === "IBGENIE_AUTH_ERROR") {
        waitingForWix.current = false;
        if (timeout.current) clearTimeout(timeout.current);
        setConnecting(false);
        setError(
          "Wix could not confirm your membership. Please try again shortly.",
        );
        return;
      }
      if (
        data.type !== "IBGENIE_AUTH_ASSERTION" ||
        typeof data.assertion !== "string" ||
        pending.current
      )
        return;
      pending.current = true;
      const expected = nonce.current;
      try {
        const r = await fetch("/api/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assertion: data.assertion, nonce: expected }),
        });
        const value = await r.json();
        if (!r.ok) throw new Error(value.error);
        if (!active || nonce.current !== expected) return;
        setSession(value.token, value.expiresAt);
        await refresh();
      } catch (e) {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "Could not connect your Wix account.",
          );
      } finally {
        pending.current = false;
        waitingForWix.current = false;
        if (timeout.current) clearTimeout(timeout.current);
        if (active) setConnecting(false);
      }
    };
    window.addEventListener("message", listener);
    const expired = () => {
      setSession();
      void refresh().then(() => requestConnection());
    };
    const usage = () => {
      void refresh();
    };
    window.addEventListener("ibgenie:session-expired", expired);
    window.addEventListener("ibgenie:usage-changed", usage);
    const timer = setInterval(() => {
      if (getSessionExpiry() && getSessionExpiry() <= Date.now()) {
        setSession();
        void refresh().then(() => requestConnection());
      } else if (window.parent !== window) {
        requestConnection();
      }
    }, 60000);
    return () => {
      active = false;
      waitingForWix.current = false;
      mounted.current = false;
      if (timeout.current) clearTimeout(timeout.current);
      clearInterval(timer);
      window.removeEventListener("message", listener);
      window.removeEventListener("ibgenie:session-expired", expired);
      window.removeEventListener("ibgenie:usage-changed", usage);
      setSession();
    };
  }, [refresh, requestConnection, signOut]);
  const connect = () => {
    if (window.parent !== window) {
      setError("");
      requestConnection(true);
    } else {
      window.open(
        config.current?.siteUrl || "https://www.ibgenie.com",
        "_blank",
        "noopener,noreferrer",
      );
    }
  };
  const openStandalone = async () => {
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      setError("Allow pop-ups to open your secure workspace in a new tab.");
      return;
    }
    popup.opener = null;
    try {
      const r = await apiFetch("/api/access/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      const url = new URL(data.url);
      if (url.origin !== window.location.origin)
        throw new Error("The workspace link was invalid.");
      popup.location.href = data.url;
    } catch (e) {
      popup.close();
      setError(e instanceof Error ? e.message : "Could not open a new tab.");
    }
  };
  return (
    <Context.Provider
      value={{
        status,
        statusError,
        refresh,
        connect,
        signOut,
        openStandalone,
        connecting,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useMembership() {
  const value = useContext(Context);
  if (!value) throw new Error("MembershipProvider is required.");
  return value;
}
