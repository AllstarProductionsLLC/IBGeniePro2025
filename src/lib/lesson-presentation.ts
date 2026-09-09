import { type Resource, uid } from "./workspace";
import { type ClassroomSlide } from "./learning-tools";
export function lessonToPresentation(lesson:Resource):Resource {
  const slides:ClassroomSlide[]=[{id:uid(),layout:"title",title:lesson.title.slice(0,90),bullets:[],prompt:lesson.summary.slice(0,240),notes:lesson.summary}];
  for (const section of lesson.body.split(/(?=^#{1,3} )/m)) {
    const [heading,...lines]=section.trim().split("\n");if(!heading)continue;
    const text=lines.join("\n").trim(), chunks=text.match(/[\s\S]{1,3600}/g)||[""];
    for(const [index,chunk] of chunks.entries()) {
      if(slides.length>=24) break;
      slides.push({id:uid(),layout:/ticket|check|assess/i.test(heading)?"check":/apply|explore|investig|discuss|practice/i.test(heading)?"activity":"explain",title:(heading.replace(/^#+\s*/,"")+(index?" (continued)":"")).slice(0,90),bullets:chunk.split(/\n+/).filter(Boolean).slice(0,5).map(l=>l.replace(/^[-*]\s*/,"").slice(0,157)+(l.length>157?"…":"")),prompt:"",notes:chunk});
    }
  }
  return {...lesson,id:uid(),title:(lesson.title+" · classroom slides").slice(0,150),kind:"presentation",body:"",cards:[],questions:[],presentation:{slides},sequence:undefined,sourceNotes:lesson.body.slice(0,24000),origin:"manual",starred:false,createdAt:new Date().toISOString()};
}
