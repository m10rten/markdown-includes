import { read } from "./utils/file";
import { log } from "./utils/log";
import { getTabs, link } from "./utils/menu";

export const parse = async (str: string, dir: string, md: string, nc: boolean) => {
  log("Parsing (sub)content...");
  const lines: Array<string> = [];
  let includeMenu = false;
  let menuDepth: number = parseInt(md as string);
  const noComments: boolean = nc;
  let removeComments = false;

  for await (const line of str.split("\n")) {
    if (line.startsWith("&|include")) {
      const filePath = line.slice("&|include".length).trim(); // remove the `&|include` and trim the spaces.

      if (!filePath) throw new SyntaxError("No file path provided after `&|include`");
      const innerDir = dir + "/" + filePath.split("/").slice(0, -1).join("/");

      const fileName = filePath.split("/").slice(-1)[0];
      const path = innerDir + "/" + fileName;

      const fileContent = await read(path);
      const inner = await parse(fileContent, innerDir, md, nc);

      lines.push(...inner);
    } else if (line.startsWith("&|menu")) {
      includeMenu = true;
      if (line.trim().split(" ").length > 1) menuDepth = parseInt(line.split(" ")[1]);
      lines.push(line);
    } else if (line.startsWith("&|no_comments") || noComments) {
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
          line.startsWith("#") &&
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
