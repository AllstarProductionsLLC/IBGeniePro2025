import curriculum from "@/data/curriculum.json";
import type {Profile} from "./workspace";
export {curriculum};
export const officialLinks=[
{title:"DP curriculum and subject briefs",description:"Subject groups, SL and HL, and public course summaries.",url:"https://ibo.org/programmes/diploma-programme/curriculum/"},
{title:"Curriculum update directory",description:"First teaching and assessment dates with subject update links.",url:"https://ibo.org/university-admission/latest-curriculum-updates/"},
{title:"Theory of knowledge",description:"An exhibition and a 1,600-word essay explore the nature of knowledge.",url:"https://ibo.org/programmes/diploma-programme/curriculum/dp-core/theory-of-knowledge/"},
{title:"Extended essay",description:"Independent research culminating in a paper of up to 4,000 words.",url:"https://ibo.org/programmes/diploma-programme/curriculum/dp-core/extended-essay/"},
{title:"Creativity, activity, service",description:"Experiences, reflection and a CAS project. Your coordinator confirms completion.",url:"https://ibo.org/programmes/diploma-programme/curriculum/dp-core/creativity-activity-and-service/"},
{title:"Academic integrity and AI",description:"Read the IB position on AI and your school’s attribution rules.",url:"https://ibo.org/programmes/artificial-intelligence-ai-in-learning-teaching-and-assessment/"},
{title:"Middle Years Programme",description:"MYP subject groups, curriculum and the personal project.",url:"https://ibo.org/programmes/middle-years-programme/curriculum/"},
{title:"Primary Years Programme",description:"Inquiry, agency and the PYP curriculum framework.",url:"https://ibo.org/programmes/primary-years-programme/curriculum/"}];
export function curriculumIsStale(now=new Date()){return now.getTime()-new Date(curriculum.checkedAt+"T00:00:00Z").getTime()>curriculum.reviewIntervalDays*86400000;}
export function cohortUpdates(year:number){return curriculum.updates.map(u=>({...u,applies:year>=u.firstAssessment}));}
export function curriculumContext(p:Pick<Profile,"program"|"examYear"|"examSession">,subject:string){if(p.program!=="dp")return p.program.toUpperCase()+": do not apply DP assessment rules. Ask for the school’s current unit plan and rubric.";return "Exam session: "+p.examSession+" "+p.examYear+". Source snapshot checked "+curriculum.checkedAt+". "+(curriculumIsStale()?"Review overdue. Verify assessment claims.":"Not a live syllabus feed.")+"\n"+cohortUpdates(p.examYear).filter(u=>u.subjects.includes(subject)||u.id==="ee-2027").map(u=>u.title+": "+(u.applies?"Revised course applies":"Future change: do not apply to this cohort")+" from May "+u.firstAssessment+". "+u.summary+" Source: "+u.url).join("\n")+"\nPublic summaries are not full licensed guides. Never invent paper weights, official criteria, assessment titles, deadlines or quotations. Ask for the current guide or school rubric where information is missing.";}
