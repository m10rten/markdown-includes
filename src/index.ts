#! /usr/bin/env node

import { mkdir } from "fs/promises";
import { exists, read, write } from "./utils/file";
import { log } from "./utils/log";

const main = async () => {
  log("Starting compiler...");
  const args = process.argv.slice(2);
  if (args.length < 1) {
    throw new Error("No file name provided");
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

  const outPath = `out/${path}`;
  let stacked = "";
  log("Creating subdirectories...");
  for (const dir of outPath.split("/").slice(0, -1)) {
    stacked += dir + "/";

    if (!(await exists(stacked))) await mkdir(stacked);
  }

  await write(outPath, cleaned);
};

main();
