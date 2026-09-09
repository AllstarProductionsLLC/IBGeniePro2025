import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BRAND_DOMAIN, BRAND_NAME, BRAND_URL, type Presentation } from "./learning-tools";
import { safeFilename } from "./workspace";

export type DocumentBlock = { kind: "heading" | "paragraph" | "bullet"; text: string; level?: number } | { kind: "table"; rows: string[][] };
const plain = (s:string) => s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,"$1 ($2)").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/`([^`]+)`/g,"$1").replace(/^>\s?/,"");
export function documentBlocks(markdown:string):DocumentBlock[] {
  const lines=markdown.split(/\r?\n/), blocks:DocumentBlock[]=[];
  for(let i=0;i<lines.length;i++) {
    const line=lines[i].trim();
    if(!line || /^([-*_])\1{2,}$/.test(line) || /^```/.test(line)) continue;
    if(line.includes("|") && /^\s*\|?\s*:?-{3,}/.test(lines[i+1] || "")) {
      const cells=(s:string)=>s.replace(/^\s*\||\|\s*$/g,"").split("|").map(x=>plain(x.trim()));
      const rows=[cells(line)]; i+=2;
      while(i<lines.length && lines[i].includes("|") && lines[i].trim()) {rows.push(cells(lines[i]));i++;}
      i--; const cols=rows[0].length;blocks.push({kind:"table",rows:rows.map(r=>Array.from({length:cols},(_,n)=>r[n]||""))});continue;
    }
    const h=line.match(/^(#{1,6})\s+(.+)$/);
    if(h) blocks.push({kind:"heading",text:plain(h[2]),level:h[1].length});
    else if(/^[-*]\s+/.test(line)) blocks.push({kind:"bullet",text:plain(line.replace(/^[-*]\s+/,""))});
    else blocks.push({kind:"paragraph",text:plain(line)});
  }
  return blocks;
}
export function pdfDefinition(title:string, markdown:string):TDocumentDefinitions {
  const content:Content[]=documentBlocks(markdown).map(b=>b.kind==="table" ? {
    table:{headerRows:1,widths:b.rows[0].map(()=>"*"),body:b.rows.map((r,i)=>r.map(text=>({text,bold:i===0,fillColor:i===0?"#E9EEFF":undefined,margin:[4,5,4,5]})))},layout:"lightHorizontalLines",margin:[0,8,0,12]
  } : {text:(b.kind==="bullet"?"• ":"")+b.text,style:b.kind==="heading"?(b.level===1?"title":"heading"):"body",keepWithNext:b.kind==="heading",margin:b.kind==="heading"?[0,b.level===1?0:16,0,8]:[0,0,0,6]});
  return {
    info:{title,author:BRAND_NAME,creator:BRAND_DOMAIN,subject:"Independent learning resource"},
    pageSize:"A4",pageMargins:[46,50,46,54],defaultStyle:{font:"Roboto",fontSize:11,lineHeight:1.25,color:"#263454"},
    styles:{title:{fontSize:25,bold:true,color:"#365FFF"},heading:{fontSize:15,bold:true,color:"#263454"},body:{fontSize:11}},
    footer:(page,total)=>({columns:[{text:BRAND_DOMAIN,link:BRAND_URL,color:"#365FFF"},{text:`${page} / ${total}`,alignment:"right"}],fontSize:9,margin:[46,18,46,0]}),content,
  };
}
export async function pdfBlob(title:string,markdown:string):Promise<Blob> {
  const [{default:pdfMake},{default:fonts}]=await Promise.all([import("pdfmake/build/pdfmake"),import("pdfmake/build/vfs_fonts")]);
  return new Promise((resolve,reject)=>{try{pdfMake.createPdf(pdfDefinition(title,markdown),undefined,undefined,fonts).getBlob(resolve);}catch(e){reject(e);}});
}
export function downloadBlob(blob:Blob,filename:string) {
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function downloadPdf(title:string,markdown:string) {downloadBlob(await pdfBlob(title,markdown),safeFilename(title)+".pdf");}
export async function docxBlob(title:string,markdown:string) {
  const {Document,Packer,Paragraph,TextRun,HeadingLevel,Footer,ExternalHyperlink,Table,TableRow,TableCell,WidthType}=await import("docx");
  const blocks=documentBlocks(markdown).map(b=>b.kind==="table"?new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:b.rows.map((row,i)=>new TableRow({tableHeader:i===0,children:row.map(text=>new TableCell({children:[new Paragraph({children:[new TextRun({text,bold:i===0})]})]}))}))}):new Paragraph({
    children:[new TextRun({text:b.text})],
    ...(b.kind==="heading"?{heading:b.level===1?HeadingLevel.TITLE:HeadingLevel.HEADING_2,keepNext:true}:{}),
    ...(b.kind==="bullet"?{bullet:{level:0}}:{}),spacing:{after:120},
  }));
  return Packer.toBlob(new Document({creator:BRAND_NAME,title,description:"Learning resource from "+BRAND_URL,styles:{default:{document:{run:{font:"Arial",size:22,color:"263454"}}}},sections:[{properties:{},footers:{default:new Footer({children:[new Paragraph({children:[new ExternalHyperlink({link:BRAND_URL,children:[new TextRun({text:BRAND_DOMAIN,style:"Hyperlink"})]})]})]})},children:blocks}]}));
}
export async function downloadDocx(title:string,markdown:string) {downloadBlob(await docxBlob(title,markdown),safeFilename(title)+".docx");}
export async function buildPowerPoint(title:string, presentation:Presentation) {
  const {default:PptxGenJS}=await import("pptxgenjs");
  const deck=new PptxGenJS();deck.layout="LAYOUT_WIDE";deck.author=BRAND_NAME;deck.subject="Classroom presentation from "+BRAND_URL;deck.title=title;deck.company=BRAND_DOMAIN;deck.theme={headFontFace:"Arial",bodyFontFace:"Arial"};
  const backgrounds={title:"EAF1FF",explain:"FFFFFF",activity:"FFF0E8",check:"EEEAFE"};
  presentation.slides.forEach((s,i)=>{
    const slide=deck.addSlide();slide.background={color:backgrounds[s.layout]};
    slide.addText(s.title,{x:.72,y:.58,w:11.9,h:1.32,fontSize:32,bold:true,color:"263454",margin:0,breakLine:false,valign:"middle"});
    s.bullets.forEach((b,n)=>slide.addText(b,{x:.78,y:2.12+n*.67,w:11.72,h:.62,fontSize:19,color:"263454",margin:0,bullet:{indent:14},paraSpaceAfter:4,breakLine:false,valign:"top"}));
    if(s.prompt) slide.addText(s.prompt,{x:.78,y:5.83,w:11.72,h:.9,fontSize:21,bold:true,color:"365FFF",margin:0,valign:"middle"});
    slide.addText(BRAND_DOMAIN,{x:.78,y:7.05,w:5,h:.2,fontSize:10,color:"365FFF",margin:0,hyperlink:{url:BRAND_URL}});
    slide.addText(`${i+1} / ${presentation.slides.length}`,{x:11.3,y:7.05,w:1.2,h:.2,fontSize:10,color:"55627A",margin:0,align:"right"});
    slide.addNotes(`${s.notes}\n\n${BRAND_URL}\nIndependent classroom resource. Review content before teaching.`);
  });
  return deck;
}
export async function downloadPowerPoint(title:string,presentation:Presentation) {const deck=await buildPowerPoint(title,presentation);await deck.writeFile({fileName:safeFilename(title)+".pptx",compression:true});}
