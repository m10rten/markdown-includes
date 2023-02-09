import { read } from "./utils/file";
import { log } from "./utils/log";
import { getTabs, link } from "./utils/menu";

export type Command = "&|include" | "&|menu" | "&|no_comments";

export const parse = async (str: string, dir: string, md: string, nc: boolean) => {
  log("Parsing (sub)content...");
  const lines: Array<string> = [];
  let includeMenu = false;
  let menuDepth: number = parseInt(md as string);
  const noComments: boolean = nc;
  let removeComments = false;

  for await (const line of str.split("\n")) {
    const start: Command | undefined | null = line.trim().split(" ")[0] as Command | undefined | null;
    const args: Array<string> | null | undefined = line
      .trim()
      .split(" ")
      .slice(1)
      .map((arg) => arg.trim());

    switch (start) {
      case "&|include": {
        if (!args) throw new SyntaxError("No file path provided after `&|include`");
        if (args.length > 1) throw new SyntaxError("Too many arguments after `&|include`");
        const filePath = args[0]; // remove the `&|include` and trim the spaces.

        if (!filePath) throw new SyntaxError("No file path provided after `&|include`");
        const innerDir = dir + "/" + filePath.split("/").slice(0, -1).join("/");

        const fileName = filePath.split("/").slice(-1)[0];
        const path = innerDir + "/" + fileName;

        const fileContent = await read(path);
        const inner = await parse(fileContent, innerDir, md, nc);

        lines.push(...inner);
        break;
      }
      case "&|menu": {
        includeMenu = true;
        if (args.length > 0) menuDepth = parseInt(args[0]);
        lines.push(line);
        break;
      }
      case "&|no_comments": {
        removeComments = true;
        lines.push(line);
        break;
      }
      default: {
        lines.push(line);
        break;
      }
    }
  }

  if (noComments) {
    removeComments = true;
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
