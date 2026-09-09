import { zipSync, strToU8 } from "fflate";
import { extractWork } from "./work-upload";
const fake = (name: string, text: string): File =>
  ({ name, size: text.length, text: async () => text }) as File;
it("reads text locally and rejects oversize files instead of truncating the work", async () => {
  expect(await extractWork(fake("essay.txt", "My own argument."))).toBe(
    "My own argument.",
  );
  await expect(
    extractWork(fake("long.txt", "x".repeat(24001))),
  ).rejects.toThrow("nothing is silently left out");
  await expect(
    extractWork({ name: "essay.pdf", size: 2000001 } as File),
  ).rejects.toThrow("2 MB");
});
it("extracts native DOCX paragraphs as plain text without rendering embedded markup", async () => {
  const xml =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Evidence &amp; inquiry</w:t></w:r></w:p><w:p><w:r><w:t>My conclusion.</w:t></w:r></w:p></w:body></w:document>';
  const bytes = zipSync({
    "word/document.xml": strToU8(xml),
    "word/evil.html": strToU8("<script>alert(1)</script>"),
  });
  const file = {
    name: "essay.docx",
    size: bytes.length,
    arrayBuffer: async () => bytes.buffer,
  } as File;
  expect(await extractWork(file)).toBe("Evidence & inquiry\nMy conclusion.");
});
it("rejects unsupported and unreadable work before an AI request can be made", async () => {
  await expect(extractWork(fake("scan.png", "data"))).rejects.toThrow(
    "Upload a PDF",
  );
  await expect(extractWork(fake("empty.txt", "   "))).rejects.toThrow(
    "No readable text",
  );
});
