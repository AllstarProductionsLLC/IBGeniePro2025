"use client";
import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadDocx, downloadPdf, downloadPowerPoint } from "@/lib/resource-export";
import { type Presentation } from "@/lib/learning-tools";
import { ErrorNote } from "./shared";
export function ExportActions({title,markdown,presentation}:{title:string;markdown:string;presentation?:Presentation}) {
  const [busy,setBusy]=useState(""),[error,setError]=useState("");
  const run=async(kind:string)=>{setBusy(kind);setError("");try{if(kind==="PPTX" && presentation) await downloadPowerPoint(title,presentation);else if(kind==="Word") await downloadDocx(title,markdown);else await downloadPdf(title,markdown);}catch{setError("The download could not be created. Try again, or export Markdown.");}finally{setBusy("");}};
  return <><div className="button-row">{[...(presentation?["PPTX"]:[]),"PDF","Word"].map(kind=><Button key={kind} variant="outline" size="sm" disabled={!!busy} onClick={()=>void run(kind)}>{busy===kind?<LoaderCircle size={15} className="animate-spin"/>:<Download size={15}/>}Download {kind}</Button>)}</div>{error && <ErrorNote>{error}</ErrorNote>}</>;
}
