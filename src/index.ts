#! /usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import watch from "node-watch";
import { compile } from "./compile";
import { getKeyValue, hasKey } from "./utils/cli";
import { recursive } from "./utils/file";
import { log } from "./utils/log";

const main = async () => {
  log("Starting compiler...");
  const args = process.argv.slice(2);
  const path = args[0];
  const paths = path.split(",");
  const fileSet = new Set<string>();
  if (!paths || paths.length < 1) throw new Error("No file path provided");

  if (path.includes("\\")) throw new Error("File path must be in unix format (use / instead of \\)");
  if (path.includes("*") || hasKey(args, "--folder")) {
    const folder = getKeyValue(args, "--folder") ?? null;
    const root = folder ?? path.split("/").slice(0, -1).join("/");
    const files = await recursive(root, null, fileSet);
    if (!files) throw new Error("No files found");
  } else {
    for (const path of paths) {
      fileSet.add(path);
    }
  }

  for (const file of fileSet) {
    log(`Compiling ${file}...`);
    await compile(file, args);
  }

  return;
};

(async () => {
  try {
    if (hasKey(process.argv, "--version") || hasKey(process.argv, "-v")) {
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
