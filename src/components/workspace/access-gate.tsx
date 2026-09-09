"use client";
import {
  ArrowUpRight,
  Crown,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/use-membership";
import { ErrorNote } from "./shared";
export const useAIStatus = useMembership;
export function AccessGate({
  status,
  statusError,
  refresh,
  connect,
  openStandalone,
  connecting,
  capability = "text",
}: ReturnType<typeof useAIStatus> & {
  capability?: "text" | "voice" | "resources" | "rubric";
}) {
  if (!status)
    return (
      <div className="info-note">
        <LoaderCircle size={16} className="animate-spin" />
        Checking your membership…
      </div>
    );
  const premium = capability !== "text",
    connected = capability === "voice" ? status.voice : status.text;
  return (
    <>
      {statusError && (
        <ErrorNote>
          {statusError}{" "}
          <button className="text-button" onClick={refresh}>
            Retry
          </button>
        </ErrorNote>
      )}
      <div className="account-card">
        <strong>
          {status.tier === "pro" ? (
            <Crown size={18} />
          ) : (
            <UserRound size={18} />
          )}{" "}
          {status.tier === "pro"
            ? "IB Genie Pro"
            : status.tier === "free"
              ? "IB Genie Free"
              : "Your IB Genie account"}
        </strong>
        {!status.configured ? (
          <p>
            Account access is being connected. Your resource library, manual
            creation and study tools are available now.
          </p>
        ) : !status.authenticated ? (
          <>
            <p>
              Sign in through IB Genie for {status.freeLimit} free AI messages
              each day. Your Wix Pro subscription unlocks AI resources and live
              voice.
            </p>
            <div className="button-row">
              <Button onClick={connect} disabled={connecting}>
                {connecting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}{" "}
                {connecting ? "Connecting…" : "Connect my Wix account"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="account-usage">
              <span>
                {status.usage?.aiRemaining ?? 0} / {status.usage?.aiLimit ?? 0}{" "}
                AI requests left today
              </span>
              {status.tier === "pro" && (
                <span>
                  {status.usage?.voiceRemaining ?? 0} voice sessions left
                </span>
              )}
            </div>
            {premium && status.tier !== "pro" && (
              <p>
                {capability === "voice"
                  ? "Live voice coaching"
                  : "AI resource and feedback tools"}{" "}
                is included with an active Pro plan. Your free messages work in
                text coaching.
              </p>
            )}
            {!connected && (
              <p>
                {capability === "voice" ? "Live voice" : "The text provider"} is
                not connected yet. Please check back after the workspace owner
                enables it.
              </p>
            )}
            {status.tier !== "pro" && (
              <div className="button-row">
                <Button variant="outline" asChild>
                  <a
                    href={status.upgradeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore Pro plans <ArrowUpRight size={16} />
                  </a>
                </Button>
              </div>
            )}
            {capability === "voice" && status.tier === "pro" && (
              <div className="button-row">
                <Button variant="outline" size="sm" onClick={openStandalone}>
                  <ExternalLink size={15} />
                  Open in a new tab
                </Button>
                <small>
                  If Wix blocks the microphone. A new tab needs reconnection
                  through Wix after five minutes.
                </small>
              </div>
            )}
            <p className="muted-note">
              Daily allowances reset at midnight UTC. Membership is checked
              again while you use the Wix page.
            </p>
          </>
        )}
      </div>
    </>
  );
}
