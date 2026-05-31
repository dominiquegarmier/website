import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const source = "website";
const output = "dist";

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });

const files = await readdir(source);

for (const file of files) {
  const from = path.join(source, file);
  const to = path.join(output, file);

  if (file.endsWith(".js")) {
    const result = await Bun.build({
      entrypoints: [from],
      minify: true,
      naming: "[dir]/[name].[ext]",
      outdir: output,
      target: "browser",
    });

    if (!result.success) {
      for (const log of result.logs) console.error(log);
      process.exit(1);
    }

    continue;
  }

  const content = await readFile(from, "utf8");

  if (file.endsWith(".css")) {
    await writeFile(to, minifyCss(content));
  } else if (file.endsWith(".html")) {
    await writeFile(to, minifyHtml(content));
  } else {
    await writeFile(to, content);
  }
}

function minifyHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<style>([\s\S]*?)<\/style>/g,
      (_, css) => `<style>${minifyCss(css)}</style>`,
    )
    .replace(/>\s+</g, "><")
    .trim();
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}
