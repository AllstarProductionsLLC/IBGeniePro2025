/** Files are read on the user's device. Only reviewed text is sent after consent. */
export async function extractWork(
  file: File,
  maxCharacters = 24000,
): Promise<string> {
  if (file.size > 2_000_000)
    throw new Error("Choose a file under 2 MB, or paste a shorter selection.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  let text = "";
  if (extension === "txt" || extension === "md") text = await file.text();
  else if (extension === "docx") {
    const { unzipSync, strFromU8 } = await import("fflate");
    let tooLarge = false;
    const files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
      filter: (f) => {
        if (f.name !== "word/document.xml") return false;
        if (f.originalSize > 2_000_000) {
          tooLarge = true;
          return false;
        }
        return true;
      },
    });
    if (tooLarge || !files["word/document.xml"])
      throw new Error(
        "This Word document is too large or cannot be read. Paste a text selection instead.",
      );
    const xml = new DOMParser().parseFromString(
      strFromU8(files["word/document.xml"]),
      "application/xml",
    );
    if (xml.querySelector("parsererror"))
      throw new Error(
        "This Word file could not be read. Try exporting it again.",
      );
    const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    text = Array.from(xml.getElementsByTagNameNS(ns, "p"))
      .map((p) =>
        Array.from(p.getElementsByTagNameNS(ns, "t"))
          .map((t) => t.textContent || "")
          .join(""),
      )
      .join("\n");
  } else if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
    const loading = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      useSystemFonts: false,
      disableFontFace: true,
    });
    const timeout = setTimeout(() => void loading.destroy(), 20000);
    try {
      const pdf = await loading.promise;
      if (pdf.numPages > 20)
        throw new Error(
          "Choose a PDF of up to 20 pages, or paste the section you want feedback on.",
        );
      for (let page = 1; page <= pdf.numPages; page++) {
        const p = await pdf.getPage(page),
          content = await p.getTextContent();
        text +=
          content.items
            .map((item) =>
              "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "",
            )
            .join("") + "\n";
        p.cleanup();
        if (text.length > maxCharacters) break;
      }
    } finally {
      clearTimeout(timeout);
      await loading.destroy();
    }
  } else throw new Error("Upload a PDF, Word (.docx), text or Markdown file.");
  if (!text.trim())
    throw new Error(
      "No readable text was found. Scans, images and handwriting need transcription before feedback.",
    );
  if (text.length > maxCharacters)
    throw new Error(
      `This file has more than ${maxCharacters.toLocaleString()} characters. Paste a shorter selection so nothing is silently left out.`,
    );
  return text.trim();
}
