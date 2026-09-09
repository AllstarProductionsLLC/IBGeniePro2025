"use client";
import { apiFetch } from "@/lib/api-client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Download,
  Headphones,
  LoaderCircle,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUBJECTS } from "@/lib/subjects";
import {
  downloadText,
  dpSubjects,
  localDate,
  uid,
  type Profile,
} from "@/lib/workspace";
import { AccessGate, useAIStatus } from "./access-gate";
import { ErrorNote, Field, Markdown, Picker } from "./shared";
const modes = [
  "Understand a concept",
  "Socratic practice",
  "Oral rehearsal",
  "Plan a lesson",
  "Feedback on my reasoning",
];
type Message = { id: string; role: "user" | "assistant"; text: string };
type Connection = "idle" | "connecting" | "connected";
export function CoachRoom({
  profile,
  initialSubject,
}: {
  profile: Profile;
  initialSubject: string;
}) {
  const [subject, setSubject] = useState(initialSubject),
    [mode, setMode] = useState(modes[0]),
    [level, setLevel] = useState(profile.level),
    [tab, setTab] = useState("text"),
    [messages, setMessages] = useState<Message[]>([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [connection, setConnection] = useState<Connection>("idle"),
    [consent, setConsent] = useState(false),
    [muted, setMuted] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [audioBlocked, setAudioBlocked] = useState(false);
  const ai = useAIStatus();
  const stopToken = useRef<string>();
  const voiceMaxSeconds = useRef(600);
  const audio = useRef<HTMLAudioElement>(null),
    peer = useRef<RTCPeerConnection>(),
    media = useRef<MediaStream>(),
    channel = useRef<RTCDataChannel>(),
    request = useRef<AbortController>(),
    voiceRequest = useRef<AbortController>(),
    epoch = useRef(0),
    textEpoch = useRef(0),
    timeout = useRef<ReturnType<typeof setTimeout>>(),
    connectedAt = useRef(0),
    seen = useRef(new Set<string>()),
    log = useRef<HTMLDivElement>(null);
  const stopVoice = useCallback(() => {
    const token = stopToken.current;
    stopToken.current = undefined;
    if (token)
      void fetch("/api/realtime/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        keepalive: true,
      }).catch(() => {});
    epoch.current++;
    voiceRequest.current?.abort();
    if (timeout.current) clearTimeout(timeout.current);
    if (channel.current) {
      channel.current.onmessage = null;
      channel.current.onopen = null;
      channel.current.close();
      channel.current = undefined;
    }
    if (peer.current) {
      peer.current.onconnectionstatechange = null;
      peer.current.ontrack = null;
      peer.current.close();
      peer.current = undefined;
    }
    media.current?.getTracks().forEach((t) => t.stop());
    media.current = undefined;
    if (audio.current) audio.current.srcObject = null;
    setConnection("idle");
    setMuted(false);
    setAudioBlocked(false);
  }, []);
  useEffect(
    () => () => {
      textEpoch.current++;
      request.current?.abort();
      stopVoice();
    },
    [stopVoice],
  );
  useEffect(() => {
    request.current?.abort();
    textEpoch.current++;
    setBusy(false);
    stopVoice();
    setMessages([]);
    setError("");
    seen.current.clear();
  }, [
    subject,
    mode,
    level,
    profile.program,
    profile.role,
    profile.examYear,
    profile.examSession,
    profile.yearGroup,
    stopVoice,
  ]);
  useEffect(() => {
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
  useEffect(() => {
    if (connection !== "connected") return;
    const t = setInterval(() => {
      const seconds = Math.floor((Date.now() - connectedAt.current) / 1000);
      setElapsed(seconds);
      if (seconds >= voiceMaxSeconds.current) {
        stopVoice();
        setError(
          "This voice session has ended. Take a moment to reflect before starting another.",
        );
      }
    }, 1000);
    return () => clearInterval(t);
  }, [connection, stopVoice]);
  const subjects = Array.from(
    new Set([
      subject,
      ...profile.subjects,
      ...(profile.program === "dp" ? dpSubjects : SUBJECTS[profile.program]),
    ]),
  );
  const canText = ai.status?.authenticated && ai.status.text;
  const canVoice =
    ai.status?.authenticated && ai.status.tier === "pro" && ai.status.voice;
  useEffect(() => {
    if (ai.status && !canVoice) stopVoice();
  }, [canVoice, !!ai.status, stopVoice]);
  const locked = busy || connection !== "idle";
  function switchTab(value: string) {
    request.current?.abort();
    textEpoch.current++;
    setBusy(false);
    stopVoice();
    setError("");
    setTab(value);
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy || !canText) return;
    setBusy(true);
    setError("");
    const attempt = ++textEpoch.current;
    request.current = new AbortController();
    const message = input.trim();
    const history = messages.slice(-12).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text.slice(0, 4000) }],
    }));
    try {
      const r = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: request.current.signal,
        body: JSON.stringify({
          profile: { ...profile, level },
          subject,
          mode,
          message,
          history,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "The coach could not respond.");
      if (attempt !== textEpoch.current) return;
      setMessages((m) => [
        ...m,
        { id: uid(), role: "user", text: message },
        { id: uid(), role: "assistant", text: d.message },
      ]);
      setInput("");
    } catch (e) {
      if (
        attempt === textEpoch.current &&
        !(e instanceof DOMException && e.name === "AbortError")
      )
        setError(
          e instanceof Error ? e.message : "The coach could not respond.",
        );
    } finally {
      if (attempt === textEpoch.current) setBusy(false);
    }
  }
  async function startVoice() {
    if (!canVoice || !consent || connection !== "idle") return;
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof RTCPeerConnection === "undefined"
    ) {
      setError(
        "Live voice needs a supported browser and a secure HTTPS connection. Text coaching is available here.",
      );
      return;
    }
    setError("");
    setConnection("connecting");
    setElapsed(0);
    const attempt = ++epoch.current;
    voiceRequest.current = new AbortController();
    timeout.current = setTimeout(() => {
      if (attempt === epoch.current) {
        stopVoice();
        setError(
          "The voice connection timed out. Check microphone access and try again.",
        );
      }
    }, 35000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (attempt !== epoch.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      media.current = stream;
      const pc = new RTCPeerConnection();
      peer.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.ontrack = (e) => {
        if (audio.current) {
          audio.current.srcObject = e.streams[0] || new MediaStream([e.track]);
          void audio.current.play().catch(() => setAudioBlocked(true));
        }
      };
      pc.onconnectionstatechange = () => {
        if (attempt !== epoch.current) return;
        if (pc.connectionState === "connected") {
          if (timeout.current) clearTimeout(timeout.current);
          connectedAt.current = Date.now();
          setConnection("connected");
        } else if (["failed", "disconnected"].includes(pc.connectionState)) {
          stopVoice();
          setError(
            "The voice connection ended. You can reconnect or use text.",
          );
        }
      };
      const dc = pc.createDataChannel("oai-events");
      channel.current = dc;
      dc.onopen = () => {
        if (attempt === epoch.current)
          dc.send(
            JSON.stringify({
              type: "response.create",
              response: {
                instructions:
                  "Briefly introduce yourself as an AI learning coach. Ask what the learner would like to work on in " +
                  subject +
                  ".",
              },
            }),
          );
      };
      dc.onmessage = (e) => {
        if (attempt !== epoch.current) return;
        try {
          const event = JSON.parse(e.data);
          const user =
            event.type ===
            "conversation.item.input_audio_transcription.completed";
          const assistant =
            event.type === "response.output_audio_transcript.done";
          if ((user || assistant) && typeof event.transcript === "string") {
            const id = String(event.item_id || event.event_id || uid());
            if (!seen.current.has(id)) {
              seen.current.add(id);
              setMessages((m) => [
                ...m,
                {
                  id,
                  role: user ? "user" : "assistant",
                  text: event.transcript.slice(0, 20000),
                },
              ]);
            }
          }
          if (event.type === "error") {
            stopVoice();
            setError(
              "The voice service could not continue. Reconnect or use text coaching.",
            );
          }
        } catch {
          /* Ignore unsupported data-channel messages. */
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (attempt !== epoch.current) return;
      const r = await apiFetch("/api/realtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: voiceRequest.current.signal,
        body: JSON.stringify({
          profile: { ...profile, level },
          subject,
          mode,
          sdp: offer.sdp,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || "Voice could not connect.");
      }
      const voiceSession = await r.json();
      if (attempt !== epoch.current) {
        void fetch("/api/realtime/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: voiceSession.stopToken }),
          keepalive: true,
        }).catch(() => {});
        return;
      }
      stopToken.current = voiceSession.stopToken;
      voiceMaxSeconds.current = voiceSession.maxSeconds;
      await pc.setRemoteDescription({ type: "answer", sdp: voiceSession.sdp });
    } catch (e) {
      if (attempt !== epoch.current) return;
      stopVoice();
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Microphone access was not granted. Allow it in your browser or use text."
          : e instanceof Error
            ? e.message
            : "Voice could not connect.",
      );
    }
  }
  function clearConversation() {
    request.current?.abort();
    textEpoch.current++;
    setBusy(false);
    setMessages([]);
    seen.current.clear();
    setError("");
  }
  function exportChat() {
    downloadText(
      "# " +
        subject +
        " · AI coaching\n\n" +
        messages
          .map(
            (m) =>
              "## " +
              (m.role === "user" ? "You" : "AI coach") +
              "\n\n" +
              m.text,
          )
          .join("\n\n") +
        "\n\nIndependent AI coaching; review factual claims with your course materials.\n",
      "ibgenie-coaching-" + localDate() + ".md",
      "text/markdown",
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">A LITTLE HELP THINKING IT THROUGH</span>
          <h1>Great questions start good conversations.</h1>
          <p>
            Explore ideas, rehearse aloud, or work through the next step with an
            AI subject coach.
          </p>
        </div>
        <span className="soft-badge">
          <Sparkles size={15} />
          AI coaches, built for learning
        </span>
      </div>
      <div className="coach-layout">
        <aside className="panel coach-settings">
          <span className="coach-avatar">
            <Headphones size={36} />
          </span>
          <h2>Your subject coach</h2>
          <p>
            A patient thinking partner. Ask for a hint, an example, or a
            question that challenges you.
          </p>
          <Field label="What are we exploring?">
            <Picker
              label="Coaching subject"
              value={subject}
              options={subjects}
              onChange={setSubject}
              disabled={locked}
            />
          </Field>
          <Field label="How would you like to work?">
            <Picker
              label="Coaching mode"
              value={mode}
              options={modes.filter(
                (m) => profile.role === "teacher" || m !== "Plan a lesson",
              )}
              onChange={setMode}
              disabled={locked}
            />
          </Field>
          {profile.program === "dp" && (
            <Field label="Subject level">
              <Picker
                label="Coaching level"
                value={level}
                options={["SL", "HL"]}
                onChange={(v) => setLevel(v as Profile["level"])}
                disabled={locked}
              />
            </Field>
          )}
          <div className="coach-boundary">
            <strong>Your thinking takes the lead.</strong>
            <p>
              Coaches explain and ask questions. They can make mistakes and do
              not provide official IB marks or write assessed submissions for
              you.
            </p>
          </div>
        </aside>
        <section className="panel conversation-panel">
          <Tabs value={tab} onValueChange={switchTab}>
            <div className="conversation-top">
              <TabsList>
                <TabsTrigger value="text">
                  <MessageCircle size={16} />
                  Text
                </TabsTrigger>
                <TabsTrigger value="voice">
                  <Mic size={16} />
                  Live voice
                </TabsTrigger>
              </TabsList>
              <div className="button-row">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!messages.length || connection !== "idle"}
                  aria-label="Clear conversation"
                  onClick={clearConversation}
                >
                  <RotateCcw size={17} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!messages.length}
                  aria-label="Export conversation"
                  onClick={exportChat}
                >
                  <Download size={17} />
                </Button>
              </div>
            </div>
            <TabsContent value="text">
              <AccessGate {...ai} />
            </TabsContent>
            <TabsContent value="voice">
              <AccessGate {...ai} capability="voice" />
              <div
                className={
                  "voice-stage " +
                  (connection === "connected" ? "connected" : "")
                }
              >
                <div className="voice-orb">
                  <Headphones size={42} />
                </div>
                <h2>
                  {connection === "connected"
                    ? "You’re connected. Take your time."
                    : connection === "connecting"
                      ? "Connecting your AI coach…"
                      : "Some ideas are easier to talk through."}
                </h2>
                <p>
                  {connection === "connected"
                    ? Math.floor(elapsed / 60) +
                      ":" +
                      String(elapsed % 60).padStart(2, "0") +
                      " · AI voice session"
                    : "Practice an explanation, explore a concept, or rehearse an oral conversation."}
                </p>
                {connection === "idle" ? (
                  <>
                    <label className="inline-check voice-consent">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      I understand this is an AI coach, my audio is sent to
                      OpenAI, and I have permission to use live voice under my
                      school’s rules.
                    </label>
                    <Button
                      disabled={!canVoice || !consent}
                      onClick={startVoice}
                    >
                      <Mic size={17} />
                      Start voice conversation
                    </Button>
                  </>
                ) : (
                  <div className="button-row">
                    {connection === "connected" && (
                      <Button
                        variant="outline"
                        aria-pressed={muted}
                        onClick={() => {
                          media.current?.getAudioTracks().forEach((t) => {
                            t.enabled = muted;
                          });
                          setMuted(!muted);
                        }}
                      >
                        {muted ? <MicOff size={17} /> : <Mic size={17} />}
                        {muted ? "Unmute" : "Mute"}
                      </Button>
                    )}
                    <Button variant="destructive" onClick={stopVoice}>
                      <PhoneOff size={17} />
                      {connection === "connecting" ? "Cancel" : "End session"}
                    </Button>
                  </div>
                )}
                {audioBlocked && (
                  <Button
                    className="mt-3"
                    variant="outline"
                    onClick={() => {
                      void audio.current
                        ?.play()
                        .then(() => setAudioBlocked(false))
                        .catch(() =>
                          setError(
                            "Audio playback is blocked. Check the browser’s sound settings.",
                          ),
                        );
                    }}
                  >
                    <Volume2 size={17} />
                    Enable coach audio
                  </Button>
                )}
                <small>
                  Microphone access is requested when you start. Sessions end
                  after {ai.status?.voiceMinutes || 10} minutes.
                </small>
              </div>
            </TabsContent>
          </Tabs>
          <audio ref={audio} autoPlay />
          <div
            ref={log}
            className="conversation-log"
            role="log"
            aria-label="AI coaching conversation"
            aria-live="polite"
          >
            {messages.length
              ? messages.map((m) => (
                  <article key={m.id} className={"message message-" + m.role}>
                    <span className="message-label">
                      {m.role === "user" ? "You" : "AI subject coach"}
                    </span>
                    <Markdown>{m.text}</Markdown>
                  </article>
                ))
              : tab === "text" && (
                  <div className="conversation-empty">
                    <span className="tool-icon">
                      <Sparkles size={27} />
                    </span>
                    <h2>What would you like to make sense of?</h2>
                    <p>
                      Bring a question, a half-formed idea, or the bit that
                      isn’t clicking yet.
                    </p>
                    <div className="suggestion-grid">
                      {[
                        "Help me understand a difficult concept in " +
                          subject +
                          ".",
                        "Ask me one question at a time to check my understanding.",
                        "Help me plan an inquiry activity for " + subject + ".",
                      ].map((s) => (
                        <button key={s} onClick={() => setInput(s)}>
                          {s}
                          <ArrowUp size={15} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            {busy && (
              <div className="thinking-indicator" role="status">
                <LoaderCircle size={16} className="animate-spin" />
                Your coach is thinking…
              </div>
            )}
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
          {tab === "text" && (
            <form className="chat-composer" onSubmit={send}>
              <Textarea
                aria-label="Message your AI coach"
                maxLength={12000}
                rows={2}
                placeholder="Start with what you know, or ask what you’re wondering…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    void send(e);
                  }
                }}
              />
              <Button
                size="icon"
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || busy || !canText}
              >
                <ArrowUp size={19} />
              </Button>
            </form>
          )}
          <p className="conversation-privacy">
            {tab === "text"
              ? "Messages and course context are sent to Google’s AI service."
              : "Audio is sent to OpenAI. Transcription may be imperfect."}{" "}
            Leave personal student information out. This conversation is not
            saved automatically; export it before leaving.
          </p>
        </section>
      </div>
    </>
  );
}
