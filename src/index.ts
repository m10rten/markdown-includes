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

    for (const file of files) {
      if (fileSet.has(file)) continue;
      fileSet.add(file);
    }
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
    console.info(`Thanks for using markdown-includes!💗`);

    if (hasKey(process.argv, "--version") || hasKey(process.argv, "-v")) {
      console.info(require("../package.json").version);
      process.exit(0);
    }

    const args = process.argv.slice(2);

    if (args.length < 1 || !args[0] || hasKey(process.argv, "--help") || hasKey(process.argv, "-h")) {
      console.info(`
    Usage: mdi <file> [options]
      <file>         The file to compile.
        Can be a single file, multiple files seperated by comma or a wildcard (e.g. \`examples/*\`).
        If a wildcard is used, the \`--folder\` option can be used to set the root folder.
        When using a wildcard, it is required to use a directory: \`examples/*\` or \`./*\`.

    Options:
      --out <file>    Output file path.
      --watch, -w     Watch for changes.
      --debug         Show debug messages.
      --help, -h      Show this help message.
      --version, -v   Show version.
      --menu-depth    Set the depth of the menu. (default: 3)
      --no-comments   Remove comments from the output.
      --folder <dir>  Set the folder to act as the root.
    `);
      console.log(`To get started, run \`mdi <file>\`.`);

      process.exit(0);
    }

    if (hasKey(process.argv, "--watch") || hasKey(process.argv, "-w")) {
      const path = process.argv.slice(2)[0];
      const root = getKeyValue(args, "--folder") ?? path.split("/").slice(0, -1).join("/");
      await main();
      console.info(`Watching ${root} for changes...`);
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
