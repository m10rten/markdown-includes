#! /usr/bin/env ts-node-script
/* eslint-disable no-console */

import { mkdir } from "fs/promises";
import { exists, read, write } from "./utils/file";
import { log } from "./utils/log";
import { getKeyValue, hasKey } from "./utils/cli";
import watch from "node-watch";
import { parse } from "./parse";

const main = async () => {
  log("Starting compiler...");
  const args = process.argv.slice(2);
  const path = args[0];

  // validate the path
  if (!path) throw new Error("No file path provided");
  if (!path.endsWith(".md")) throw new Error("File must be a markdown file (.md)");
  if (path.includes("\\")) throw new Error("File path must be in unix format (use / instead of \\)");
  if (!(await exists(path))) throw new Error("File does not exist");

  const content = await read(path);

  // for each `&|include` in content, import the file and replace it in the content.
  const root = path.split("/").slice(0, -1).join("/");

  const md: string = getKeyValue(args, "--menu-depth") ?? "3";
  const nc: boolean = hasKey(args, "--no-comments") ?? false;
  const finalFile = await parse(content, root, md, nc);

  log("Removing empty lines...");
  for (let i = 0; i < finalFile.length; i++) {
    // remove empty lines
    if (!finalFile[i] || !finalFile[i + 1]) continue;
    if (finalFile[i].trim() === "" && finalFile[i + 1].trim() === "") {
      finalFile.splice(i, 1);
      i--;
    }
  }

  log("Cleaning up...");
  const cleaned = finalFile.join("\n").trim() + "\n";

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

(async () => {
  try {
    if (hasKey(process.argv, "--version") || hasKey(process.argv, "-v")) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      console.info(require("../package.json").version);
      process.exit(0);
    }

    console.info(`Thanks for using markdown-includes!💗`);
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
      --menu-depth    Set the depth of the menu. (default: 3)
      --no-comments   Remove comments from the output.
    `);
      console.log(`To get started, run \`mdi <file>\`.`);

      process.exit(0);
    }

    if (hasKey(process.argv, "--watch") || hasKey(process.argv, "-w")) {
      const path = process.argv.slice(2)[0];
      const root = path.split("/").slice(0, -1).join("/");
      await main();
      console.info("Watching for changes...");
      watch(root, { recursive: true }, async (event, name: string) => {
        console.info("File changed, recompiling...", event, name);
        await main();
      });
    } else {
      await main();
      log("Done!");
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
