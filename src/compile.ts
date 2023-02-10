/* eslint-disable no-console */
import { mkdir } from "fs/promises";
import { parse } from "./parse";
import { getKeyValue, hasKey } from "./utils/cli";
import { exists, read, write } from "./utils/file";
import { log } from "./utils/log";

export const compile = async (path: string, args: Array<string>) => {
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
