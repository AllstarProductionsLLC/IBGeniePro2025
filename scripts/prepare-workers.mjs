import { mkdir, copyFile } from "node:fs/promises";
await mkdir(new URL("../public/workers/", import.meta.url), {
  recursive: true,
});
await copyFile(
  new URL(
    "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ),
  new URL("../public/workers/pdf.worker.min.mjs", import.meta.url),
);
await copyFile(
  new URL("../node_modules/pdfjs-dist/LICENSE", import.meta.url),
  new URL("../public/workers/PDFJS-LICENSE.txt", import.meta.url),
);
