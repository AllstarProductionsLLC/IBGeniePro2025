"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Compass,
  GraduationCap,
  Home,
  Layers,
  Lightbulb,
  MessageCircle,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Gamepad2,
  ClipboardCheck,
  SpellCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import type { Profile, Resource, ResourceKind } from "@/lib/workspace";
import { ErrorNote, Picker } from "./shared";
import { Dashboard } from "./dashboard";
import { ResourceStudio } from "./resource-studio";
import { ResourceLibrary } from "./resource-library";
import { StudySession } from "./study-session";
import { Planner } from "./planner";
import { CoachRoom } from "./coach-room";
import { CurriculumHub } from "./curriculum-hub";
import { CoreWorkspace } from "./core-workspace";
import { SettingsPanel } from "./settings-panel";
import { WelcomeFlow } from "./welcome-flow";
import { AssessmentWorkspace } from "./assessment-workspace";
import { GrammarWorkspace } from "./grammar-workspace";
import { PracticeArcade } from "./practice-arcade";
import { canUseResource } from "@/lib/learning-tools";
export type View =
  | "assessment"
  | "grammar"
  | "practice"
  | "today"
  | "library"
  | "studio"
  | "coach"
  | "planner"
  | "core"
  | "curriculum"
  | "settings";
const nav = [
  { id: "today", label: "My workspace", icon: Home },
  { id: "library", label: "Resource library", icon: Layers },
  { id: "studio", label: "Create a resource", icon: Sparkles },
  { id: "practice", label: "Practice challenges", icon: Gamepad2 },
  { id: "assessment", label: "Check my work", icon: ClipboardCheck },
  { id: "grammar", label: "Writing lab", icon: SpellCheck },
  { id: "coach", label: "AI subject coaches", icon: MessageCircle },
  { id: "planner", label: "Study planner", icon: CalendarDays },
  { id: "core", label: "Projects & reflections", icon: Compass },
  { id: "curriculum", label: "IB curriculum hub", icon: BookOpen },
] as const;
function roleNav(profile: Profile) {
  return nav.filter(n=>profile.role!=="teacher" || n.id!=="practice").map(n=>({...n,label:n.id==="today"?(profile.role==="teacher"?"Teaching studio":profile.program==="pyp"?"My discovery space":"My workspace"):n.id==="assessment"?(profile.role==="teacher"?"Assessment desk":"Check my work"):n.id==="planner"&&profile.role==="teacher"?"Teaching calendar":n.id==="library"&&profile.role==="teacher"?"Teaching library":n.id==="practice"&&profile.program==="pyp"?"Play and discover":n.label}));
}
function Navigation({ view, go, profile }: { view: View; go: (v: View) => void; profile: Profile }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {roleNav(profile).map((n) => (
        <SidebarMenuItem key={n.id}>
          <SidebarMenuButton asChild isActive={view === n.id}>
            <a
              href={"#" + n.id}
              onClick={() => {
                go(n.id);
                setOpenMobile(false);
              }}
              aria-current={view === n.id ? "page" : undefined}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.id === "coach" && <span className="nav-pill">VOICE</span>}
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
export function Workspace() {
  const store = useWorkspace();
  const { state, update } = store;
  const [view, setView] = useState<View>("today");
  const [kind, setKind] = useState<ResourceKind>("flashcards");
  const [editing, setEditing] = useState<Resource>();
  const [study, setStudy] = useState<Resource>();
  const [coachSubject, setCoachSubject] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(()=>{setEditing(undefined);setStudy(undefined);setKind(state.profile.role === "teacher" ? "presentation" : "flashcards");},[state.profile.role,state.profile.program]);
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.slice(1);
      if ([...nav.map((n) => n.id), "settings"].includes(id))
        setView(id as View);
      setStudy(undefined);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  const go = (v: View) => {
    setStudy(undefined);
    setView(v);
    window.location.hash = v;
  };
  const create = (k: ResourceKind = "flashcards") => {
    setEditing(undefined);
    setKind(canUseResource(state.profile.role,k)?k:"flashcards");
    go("studio");
  };
  const save = (r: Resource) => {
    if (
      state.resources.length >= 500 &&
      !state.resources.some((x) => x.id === r.id)
    ) {
      setNotice("Export or remove a resource before adding more.");
      return;
    }
    update((s) => ({
      ...s,
      resources: [r, ...s.resources.filter((x) => x.id !== r.id)],
    }));
    setEditing(undefined);
    go("library");
    setNotice("Resource saved on this device.");
  };
  const edit = (r: Resource) => {
    setEditing(r);
    setKind(r.kind);
    go("studio");
  };
  const coach = (s: string) => {
    setCoachSubject(s);
    go("coach");
  };
  if (!store.ready)
    return (
      <div className="workspace-loading">
        <GraduationCap size={36} />
        <p>Opening your workspace…</p>
      </div>
    );
  if (!state.onboardingComplete)
    return (
      <WelcomeFlow
        initial={state.profile}
        storageError={store.storageError}
        onComplete={(profile) =>
          update((s) => ({ ...s, profile, onboardingComplete: true }))
        }
      />
    );
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "256px" } as React.CSSProperties}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar className="genie-sidebar" collapsible="offcanvas">
        <SidebarHeader>
          <a className="brand" href="#today" onClick={() => go("today")}>
            <span className="brand-mark">
              <GraduationCap size={25} />
            </span>
            <span>
              ibgenie<span className="brand-pro">PRO</span>
            </span>
          </a>
          <div className="sidebar-space">
            <span className="eyebrow">YOUR LEARNING SPACE</span>
            <strong>
              {state.profile.program.toUpperCase()}{" "}
              {state.profile.role === "teacher"
                ? "Teacher studio"
                : "Student workspace"}
            </strong>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Navigation view={view} go={go} profile={state.profile} />
          <div className="sidebar-note">
            <Lightbulb size={20} />
            <strong>Understanding comes first.</strong>
            <p>Ask better questions. Make connections. Build your own ideas.</p>
            <button onClick={() => coach(state.profile.subjects[0] || "Inquiry")}>
              Explore with a coach <ArrowRight size={15} />
            </button>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <button className="sidebar-settings" onClick={() => go("settings")}>
            <Settings size={18} />
            Settings & backup
          </button>
          <div className="sidebar-person">
            <span className="avatar-initial">
              {state.profile.name?.slice(0, 1).toUpperCase() || "G"}
            </span>
            <div>
              <strong>{state.profile.name || "Your workspace"}</strong>
              <small>Saved on this device</small>
            </div>
            <ShieldCheck size={18} />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="workspace-inset">
        <header className="topbar">
          <div className="topbar-location">
            <SidebarTrigger />
            <span>Workspace /</span>
            <strong>
              {roleNav(state.profile).find((n) => n.id === view)?.label || "Settings"}
            </strong>
          </div>
          <div className="topbar-controls">
            <Picker
              label="Workspace role"
              value={state.profile.role}
              options={[
                { value: "student", label: "Student view" },
                { value: "teacher", label: "Teacher view" },
              ]}
              onChange={(v) =>
                update((s) => ({
                  ...s,
                  profile: { ...s.profile, role: v as "student" | "teacher" },
                }))
              }
            />
            <Button
              size="sm"
              className="topbar-create"
              onClick={() => create(state.profile.role === "teacher" ? "presentation" : "flashcards")}
            >
              <Plus size={16} />
              Create
            </Button>
          </div>
        </header>
        <main id="main-content" className={"workspace-main role-"+state.profile.role+" programme-"+state.profile.program} tabIndex={-1}>
          {store.storageError && <ErrorNote>{store.storageError}</ErrorNote>}
          {study ? (
            <StudySession
              key={study.id}
              resource={study}
              state={state}
              update={update}
              onClose={() => setStudy(undefined)}
              onSave={save}
            />
          ) : (
            <>
              {view === "today" && (
                <Dashboard
                  state={state}
                  update={update}
                  go={go}
                  create={create}
                  study={setStudy}
                  coach={coach}
                />
              )}
              {view === "library" && (
                <ResourceLibrary
                  key={state.profile.role+state.profile.program}
                  state={state}
                  update={update}
                  create={create}
                  study={setStudy}
                  edit={edit}
                />
              )}
              {view === "studio" && (
                <ResourceStudio
                  key={(editing?.id || "new") + kind + state.profile.role + state.profile.program}
                  profile={state.profile}
                  initialKind={canUseResource(state.profile.role,kind)?kind:"flashcards"}
                  editing={editing && canUseResource(state.profile.role,editing.kind)?editing:undefined}
                  onSave={save}
                />
              )}
              {view === "assessment" && <AssessmentWorkspace key={state.profile.role+state.profile.program} state={state} update={update}/>}
              {view === "grammar" && <GrammarWorkspace key={state.profile.role+state.profile.program} profile={state.profile}/>}
              {view === "practice" && <PracticeArcade key={state.profile.program} state={state} update={update} study={setStudy} create={()=>create("flashcards")}/>}
              {view === "planner" && <Planner key={state.profile.role+state.profile.program} state={state} update={update} />}
              {view === "coach" && (
                <CoachRoom
                  key={
                    state.profile.role +
                    state.profile.program +
                    state.profile.examYear +
                    coachSubject
                  }
                  profile={state.profile}
                  initialSubject={
                    coachSubject || state.profile.subjects[0] || "Biology"
                  }
                />
              )}
              {view === "curriculum" && (
                <CurriculumHub profile={state.profile} update={update} />
              )}
              {view === "core" && (
                <CoreWorkspace key={state.profile.program} state={state} update={update} coach={coach} />
              )}
              {view === "settings" && <SettingsPanel {...store} />}
            </>
          )}
          <footer className="workspace-footer">
            <span>Made for curious minds.</span>
            <span>
              Independent of the International Baccalaureate Organization.
            </span>
          </footer>
        </main>
        {notice && (
          <div className="success-toast" role="status">
            <Check size={18} />
            {notice}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
