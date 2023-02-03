#! /usr/bin/env ts-node-script
/* eslint-disable no-console */

import { mkdir } from "fs/promises";
import { exists, read, write } from "./utils/file";
import { log } from "./utils/log";
import { getKeyValue, hasKey } from "./utils/cli";
import watch from "node-watch";
import { getTabs, link } from "./utils/menu";

const main = async () => {
  log("Starting compiler...");
  const args = process.argv.slice(2);
  const path = args[0];
  const content = await read(path);

  // for each `&|include` in content, import the file and replace it in the content.
  const root = path.split("/").slice(0, -1).join("/");

  const md = getKeyValue(args, "--menu-depth") ?? "3";

  const parse = async (str: string, dir: string) => {
    log("Parsing (sub)content...");
    const lines: Array<string> = [];
    let includeMenu = false;
    let menuDepth: number = parseInt(md as string);
    let removeComments = false;

    for await (const line of str.split("\n")) {
      if (line.startsWith("&|include")) {
        const filePath = line.slice("&|include".length).trim(); // remove the `&|include` and trim the spaces.

        if (!filePath) throw new SyntaxError("No file path provided after `&|include`");
        const innerDir = dir + "/" + filePath.split("/").slice(0, -1).join("/");

        const fileName = filePath.split("/").slice(-1)[0];
        const path = innerDir + "/" + fileName;

        const fileContent = await read(path);
        const inner = await parse(fileContent, innerDir);

        lines.push(...inner);
      } else if (line.startsWith("&|menu")) {
        includeMenu = true;
        if (line.trim().split(" ").length > 1) menuDepth = parseInt(line.split(" ")[1]);
        lines.push(line);
      } else if (line.startsWith("&|no_comments")) {
        removeComments = true;
        lines.push(line);
      } else {
        lines.push(line);
      }
    }

    if (includeMenu) {
      log("Adding menu...");
      const menuPosition = lines.findIndex((line) => line.trim().startsWith("&|menu"));
      if (menuPosition === -1) throw new Error("Menu position not found");

      const titles = lines
        .filter(
          (line) =>
            line.split("").filter((char) => char === "#").length > 0 &&
            line.split("").filter((char) => char === "#").length <= menuDepth,
        )
        .map((line) => line.trim());
      // this will filter out all lines that don't have a `#` or have more than n `#`,
      // titles with `#` after the title are not supported.

      log("Creating menu...");

      const hashed = titles.map((title) => {
        return { hashes: title.split(" ")[0].split(""), title: title.split(" ").slice(1).join(" ") };
      });

      const menu = hashed.map((title) => `${getTabs(title.hashes)}${link(title.title)}`).join("\n");
      lines.splice(menuPosition + 1, 0, menu);

      // remove the `&|menu` line.
      lines.splice(menuPosition, 1);
    }

    if (removeComments) {
      const preMerged = lines.join("\n");
      const merged = preMerged.replaceAll(/<!--[^]*?-->/gm, "");
      const noCommand = merged.replaceAll(/&\|no_comments/gm, "");
      return noCommand.split("\n");
    }

    return lines;
  };

  const finalFile = await parse(content, root);

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
