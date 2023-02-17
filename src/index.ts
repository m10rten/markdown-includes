#! /usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import watch from "node-watch";
import { compile } from "./compile";
import { slash } from "./utils/clean";
import { getKeyValue, hasKey } from "./utils/cli";
import { getFiles } from "./utils/file";
import { log } from "./utils/log";

const main = async () => {
  console.time("Compile time");
  log("Starting compiler...");

  const args = process.argv.slice(2);
  const path = args[0];
  const paths = path.split(",");
  const fileSet = new Set<string>();

  if (!paths || paths.length < 1) throw new Error("No file path provided");

  const root: string | null = slash(getKeyValue(args, "--root") as string) ?? null;
  for (const path of paths) {
    const folder: string = root ?? slash(path).split("/").slice(0, -1).join("/");
    const cleanedPath = slash(path);
    const files = await getFiles(folder, cleanedPath);

    for (const file of files) {
      fileSet.add(file);
    }
  }

  for (const file of fileSet) {
    log(`Compiling ${file} ...`);
    await compile(file, args);
  }

  console.timeEnd("Compile time");
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

      return process.exit(0);
    }

    await main();
    log("Done compiling!");

    if (hasKey(process.argv, "--watch") || hasKey(process.argv, "-w")) {
      const path = process.argv.slice(2)[0];
      const paths = path.split(",");

      const root = slash(getKeyValue(args, "--folder") ?? slash(path).split("/").slice(0, -1).join("/"));

      for (const path of paths) {
        const cleanedPath = slash(path);
        if (cleanedPath.includes("*")) {
          const files = await getFiles(root, cleanedPath);
          for (const file of files) {
            console.info(`Watching ${file} for changes...`);
            watch(file, async () => {
              console.info("File changed, recompiling...", file);
              await main();
            });
          }
        } else {
          console.info(`Watching ${cleanedPath} for changes...`);
          watch(cleanedPath, async () => {
            console.info("File changed, recompiling...", cleanedPath);
            await main();
          });
        }
      }
    }
    return;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
