import { Workspace } from "@/components/workspace/workspace";
export type Role = "student" | "teacher";
export type Program = "pyp" | "myp" | "dp";
export default function Home() {
  return <Workspace />;
}
