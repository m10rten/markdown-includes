/* eslint-disable no-console */
import { compile as standalone_compile } from "./compile";
import { slash } from "./utils/clean";
import { getFiles } from "./utils/file";
import { create } from "./utils/log";

export declare type Config = {
  path?: string;
  noComments?: boolean;
  menuDepth?: number;
  ignore?: Array<string>;
  extensions?: Array<string>;
  root?: string;
  output?: string;
  debug?: boolean;
};

class MarkdownIncludes {
  private config: Config;
  constructor(config?: {
    path?: string;
    noComments?: boolean;
    menuDepth?: number;
    ignore?: Array<string>;
    extensions?: Array<string>;
    root?: string;
    output?: string;
    debug?: boolean;
  }) {
    this.config = {
      path: config?.path ?? "mdi.config.js",
      root: config?.root ?? "./",
      noComments: config?.noComments ?? false,
      menuDepth: config?.menuDepth ?? 3,
      ignore: config?.ignore ?? ["node_modules", ".git"],
      extensions: config?.extensions ?? [".md", ".mdx"],
      output: config?.output ?? "./out",
      debug: config?.debug ?? false,
    };
    return;
  }

  async compile(path?: string) {
    const log = create(this.config.debug);
    console.time("Compile time");
    log("Starting compiler...");

    const paths = path ? path.split(",") : this.config?.path?.split(",") ?? null;
    const fileSet = new Set<string>();

    if (!paths || paths.length < 1) throw new Error("No file path provided");

    const root: string | null = this.config?.root ?? null;
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
      await standalone_compile({
        ...this.config,
        path: file,
      });
    }

    console.timeEnd("Compile time");
    return;
  }
}

export default MarkdownIncludes;
