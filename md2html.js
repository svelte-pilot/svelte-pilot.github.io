import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import fs from "node:fs/promises";
import path from "path";
import shiki from "shiki";

const highlighter = await shiki.getHighlighter({});

const marked = new Marked(
  markedHighlight({
    highlight: (code, lang) => highlighter.codeToHtml(code, { lang }),
  })
);

async function md2html(dir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        await md2html(fullPath);
      } else if (file.isFile() && path.extname(file.name) === ".md") {
        const content = await fs.readFile(fullPath, "utf-8");
        const htmlContent = await marked.parse(content);
        const outputDir = path.join(".html", path.relative("docs", dir));
        const outputPath = path.join(
          outputDir,
          path.basename(file.name, ".md") + ".html"
        );

        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(outputPath, htmlContent);
      }
    }
  } catch (error) {
    console.error("Error converting markdown files:", error);
  }
}

md2html("docs");
