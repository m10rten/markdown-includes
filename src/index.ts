#! /usr/bin/env ts-node-script
/* eslint-disable no-console */

import { mkdir } from "fs/promises";
import { exists, read, write } from "./utils/file";
import { log } from "./utils/log";
import { getKeyValue, hasKey } from "./utils/cli";
import watch from "node-watch";

const main = async () => {
  if (hasKey(process.argv, "--version") || hasKey(process.argv, "-v")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    console.info(require("../package.json").version);
    return process.exit(0);
  }

  log("Starting compiler...");
  const args = process.argv.slice(2);
  if (args.length < 1 || !args[0] || hasKey(process.argv, "--help") || hasKey(process.argv, "-h")) {
    console.info(`
    Usage: mdi <file> [options]
    Options:
      --out <file>    Output file path.
      --watch, -w     Watch for changes.
      --debug         Show debug messages.
      --help, -h      Show this help message.
      --version, -v   Show version.
    `);
    console.log(`To get started, run \`mdi <file>\`.`);

    return process.exit(0);
  }
  const path = args[0];
  const content = await read(path);

  // for each `&|>` in content, import the file and replace it in the content.
  const root = path.split("/").slice(0, -1).join("/");

  const parse = async (str: string, dir: string) => {
    log("Parsing (sub)content...");
    const lines: Array<string> = [];
    for await (const line of str.split("\n")) {
      if (line.startsWith("&|>")) {
        const filePath = line.slice(3).trim(); // remove the `&|>` and trim the spaces.
        if (!filePath) throw new SyntaxError("No file path provided after `&|>`");
        const innerDir = dir + "/" + filePath.split("/").slice(0, -1).join("/");

        const fileName = filePath.split("/").slice(-1)[0];
        const path = innerDir + "/" + fileName;

        const fileContent = await read(path);
        const inner = await parse(fileContent, innerDir);

        lines.push(...inner);
      } else {
        lines.push(line);
      }
    }
    return lines;
  };

  const finalFile = await parse(content, root);
  const cleaned =
    finalFile
      .join("\n")
      .trim()
      .replace(/^\s*[\r]|^\s+| +(?= )| +$|\s+$(?![^])/gm, "\n") + "\n";

  const out: string | null = getKeyValue(args, "--out") ?? null;
  log("Creating output file...");
  const outPath: string = out ?? `out/${path}`;
  let stacked = "";
  log(`Creating directories for ${outPath}...`);

  for (const dir of outPath.split("/").slice(0, -1)) {
    stacked += dir + "/";
    if (!(await exists(stacked))) await mkdir(stacked);
  }

  await write(outPath, cleaned);
  console.info(`Output at: ${outPath}`);
  return;
};

console.info(`Thanks for using markdown-includes!💗`);
if (hasKey(process.argv, "--watch") || hasKey(process.argv, "-w")) {
  const path = process.argv.slice(2)[0];
  const root = path.split("/").slice(0, -1).join("/");
  console.info("Watching for changes...");
  watch(root, { recursive: true }, async (event, name) => {
    console.info("File changed, recompiling...", event, name);
    await main();
  });
} else {
  main();
  log("Done!");
}
