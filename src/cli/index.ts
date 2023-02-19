#! /usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import watch from "node-watch";
import { log } from "../utils/log";
import { slash } from "../utils/clean";
import { getKeyValue, hasKey } from "../utils/cli";
import { exists, getFiles, read } from "../utils/file";
import MarkdownIncludes, { Config } from "../index";

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
      --root <dir>    Set the folder to act as the root.
      --extensions    Set the extensions to include. (default: .md,.mdx)
      --ignore        Set the folders to ignore. (default: node_modules,.git)
      --config, -c    Set the config file to use. (default: mdi.config.js)
    `);
      console.log(`To get started, run \`mdi <file>\`.`);

      return process.exit(0);
    }

    const config: Config = {};
    const configStr = getKeyValue(args, "-c") || getKeyValue(args, "--config") || "mdi.config.js";

    if (configStr && (await exists(configStr))) {
      const configPath = slash(process.cwd() + "/" + configStr);
      log(`Using config file: ${configPath}`);
      if (configPath.endsWith(".js") || configPath.endsWith(".ts")) {
        const configContent = require(configPath);
        Object.assign(config, configContent);
      } else {
        const configContent = await read(configPath);
        const parsedConfig: Config = JSON.parse(configContent);
        Object.assign(config, parsedConfig);
      }
    }

    const markdownIncludes = new MarkdownIncludes({
      ...config,
      menuDepth: config?.menuDepth ?? parseInt(getKeyValue(args, "--menu-depth") as string),
      noComments: config?.noComments ?? hasKey(args, "--no-comments"),
      debug: config?.debug ?? hasKey(args, "--debug"),
      extensions:
        config?.extensions ??
        getKeyValue(args, "--extensions")
          ?.split(",")
          .map((ext) => ext.trim()),
      ignore:
        config?.ignore ??
        getKeyValue(args, "--ignore")
          ?.split(",")
          .map((ext) => ext.trim()),
      output: config?.output ?? (getKeyValue(args, "--out") as string | undefined),
      root: config?.root ?? (getKeyValue(args, "--root") as string | undefined),
    });

    await markdownIncludes.compile(args[0]);

    log("Done compiling!");

    if (hasKey(process.argv, "--watch") || hasKey(process.argv, "-w")) {
      const path = process.argv.slice(2)[0];
      const paths = path.split(",");
      const rootPath = getKeyValue(args, "--root") ? slash(getKeyValue(args, "--root") as string) : null;
      const dir = slash(path).split("/").slice(0, -1).join("/");
      const root = rootPath ? rootPath + "/" + dir : dir;

      for (const path of paths) {
        const cleanedPath = slash(path);
        if (cleanedPath.includes("*")) {
          const files = await getFiles(root, cleanedPath);
          for (const file of files) {
            console.info(`Watching ${file} for changes...`);
            watch(file, async () => {
              console.info("File changed, recompiling...", file);
              await markdownIncludes.compile(file);
            });
          }
        } else {
          console.info(`Watching ${cleanedPath} for changes...`);
          watch(cleanedPath, async () => {
            console.info("File changed, recompiling...", cleanedPath);
            await markdownIncludes.compile(cleanedPath);
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
