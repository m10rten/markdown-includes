/* eslint-disable no-console */
import { lstat, mkdir } from "fs/promises";
import { parse as standalone_parse } from "./parse";
import { exists, read, write } from "./utils/file";
import { create } from "./utils/log";
import { Config } from "./index";
import { slash } from "./utils/clean";

export const compile = async ({ path, extensions, menuDepth, ignore, noComments, root, output, debug }: Config) => {
  const log = create(debug);

  // validate the path
  if (!path) throw new Error("No file path provided");
  if (!path.endsWith(".md") || extensions?.includes(path.split(".").slice(-1)[0]))
    return log(`Skipping ${path} (not a markdown file or included in extension list)`);
  if (ignore?.includes(path.split("/").slice(-1)[0])) return log(`Skipping ${path} (ignored)`);
  if (path.includes("\\")) throw new Error("File path must be in unix format (use / instead of \\)");
  if (!(await exists(path))) throw new Error("File does not exist");

  log(`Reading file ${path}...`);
  const stat = await lstat(path);
  const [isDir, isFile] = [stat.isDirectory(), stat.isFile()];
  if (isDir) return;
  if (!isFile) throw new Error("Path is not a file");
  const content = await read(path);

  // for each `&|include` in content, import the file and replace it in the content.
  const dir = path.split("/").slice(0, -1).join("/");
  const rootPath = root ? root + "/" + dir : dir;

  const md: number = menuDepth ?? 3;
  const nc: boolean = noComments ?? false;

  const finalFile = await standalone_parse(content, slash(rootPath), md, nc, debug);

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

  const out: string | null = output ?? null;
  log("Creating output file...");
  const outPath: string = out ? `${out}/${path}` : `out/${path}`;
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
