#! /usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import watch from "node-watch";
import { log } from "../utils/log";
import { slash } from "../utils/clean";
import { getKeyValue, hasKey } from "../utils/cli";
import { getFiles } from "../utils/file";
import { default as create_compiler, Config } from "../index";

if (require.main !== module) {
	throw new Error("This file should not be imported");
}

(async () => {
	try {
		console.info(`Thanks for using markdown-includes!💗`);

		if (hasKey(process.argv, "--version") || hasKey(process.argv, "-v")) {
			console.info(require("../../package.json").version);
			process.exit(0);
		}

		const args = process.argv.slice(2);

		if (args.length < 1 || !args[0] || hasKey(process.argv, "--help") || hasKey(process.argv, "-h")) {
			console.info(`
    Usage: mdi <file> [options]
      <file>         The file to compile.
        Can be a single file, multiple files seperated by comma or a wildcard (e.g. \`examples/*\`).
        If a wildcard is used, the \`--root\` option can be used to set the root folder.
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

		const upperToDash = (str: string) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);

		log(upperToDash("menuDepth"));

		const get = (key: keyof Config, isOwnValue: boolean) => {
			const dashed = "--" + upperToDash(key);
			const value = isOwnValue ? hasKey(args, dashed) : (getKeyValue(args, dashed) || config[key]) ?? undefined;
			if (value !== undefined) {
				return value;
			}
			return undefined;
		};

		const markdownIncludes = await create_compiler({
			...config,
			config: configStr,
			menuDepth: get("menuDepth", false) as number | undefined,
			noComments: get("noComments", true) as boolean | undefined,
			debug: get("debug", true) as boolean | undefined,
			extensions: get("extensions", false) as string[] | undefined,
			ignore: get("ignore", false) as string[] | undefined,
			output: get("output", false) as string | undefined,
			root: get("root", false) as string | undefined,
			path: get("path", false) as string | undefined,
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
