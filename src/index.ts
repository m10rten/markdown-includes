/* eslint-disable no-console */
import { compile as standalone_compile } from "./compile";
import { table as standalone_table } from "./table";
import { parse as standalone_parse } from "./parse";

import { slash } from "./utils/clean";
import { exists, getFiles, read } from "./utils/file";
import { create } from "./utils/log";
import watch from "node-watch";

/**
 * @typedef {Object} Config
 * @property {string} [path] - The path to the (config) file
 * @property {boolean} [noComments] - Whether to remove comments from the output
 * @property {number} [menuDepth] - The depth of the menu
 * @property {string[]} [ignore] - The folders to ignore
 * @property {string[]} [extensions] - The extensions to compile
 * @property {string} [root] - The root path to use
 * @property {string} [output] - The output path to use
 * @property {boolean} [debug] - Whether to enable debug mode
 */
export declare type Config = {
	config?: string; // path to config file, default.
	path?: string; // path to compile, default.
	noComments?: boolean;
	menuDepth?: number;
	ignore?: Array<string>;
	extensions?: Array<string>;
	root?: string;
	output?: string;
	debug?: boolean;
};

/**
 * The creation function for the markdown-includes compiler
 * @param {Config} config - The configuration object
 * @param {string} [config.config] - The path to the (config) file, default: `./mdi.config.js`
 * @returns
 */
export default async function ({
	config,
	debug,
	extensions,
	ignore,
	menuDepth,
	noComments,
	output,
	path,
	root,
}: Config = {}): Promise<MarkdownIncludes> {
	const configPath = slash(process.cwd() + "/" + config ?? "./mdi.config.js");
	const { default: configContent }: { default: Config } =
		config && (await exists(configPath)) && (config?.endsWith(".js") || config?.endsWith(".ts"))
			? await import(configPath)
			: config && (await exists(configPath))
			? { default: await read(configPath) }
			: { default: {} };

	return new MarkdownIncludes({
		config: config ?? configContent.config,
		debug: debug ?? configContent.debug,
		extensions: extensions ?? configContent.extensions,
		ignore: ignore ?? configContent.ignore,
		menuDepth: menuDepth ?? configContent.menuDepth,
		noComments: noComments ?? configContent.noComments,
		output: output ?? configContent.output,
		path: path ?? configContent.path,
		root: root ?? configContent.root,
	});
}

/**
 * @class MarkdownIncludes
 * @classdesc The main class for the markdown-includes compiler
 * @param {Config} config - The configuration object
 */
export class MarkdownIncludes {
	private config: Config;
	constructor(config: Config) {
		this.config = {
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

	/**
	 * Compiles the file(s) provided, seperated by a comma
	 * @param path string
	 * @returns Promise<void>
	 */
	public async compile(path?: string) {
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

	/**
	 * Creates a table from the provided JSON-Array string
	 * @param {string} str - The JSON-Array string
	 * @param {string[]} [selected] - The selected columns to include in the table
	 * @param {boolean} [debug] - Whether to enable debug mode
	 * @returns {Promise<string[]>} The table as an array of strings
	 */
	public table = standalone_table;

	/**
	 * Parses the provided string and returns the result as an array of lines.
	 * @param {string} str - The content-string to parse
	 * @param {string} [dir] - The dir to the file, this is used to resolve relative paths and recursive includes
	 * @param {boolean} [noComments] - Whether to remove comments from the output
	 * @param {number} [menuDepth] - The depth of the menu
	 * @param {boolean} [debug] - Whether to enable debug mode
	 */
	public parse = standalone_parse;

	/**
	 * Watches the provided file(s) for changes and recompiles them
	 * @param {string} path - The path to the file(s) to watch
	 * @param {boolean} [debug] - Whether to enable debug mode
	 */
	public async watch(path: string, debug?: boolean) {
		const log = create(debug);
		log("Starting watcher...");

		const paths = path.split(",");
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
			log(`Watching ${file} ...`);
			await standalone_compile({
				...this.config,
				path: file,
			});
			watch(file, { recursive: true }, async (name) => {
				log(`File ${name} changed, recompiling...`);
				await standalone_compile({
					...this.config,
					path: name,
				});
			});
		}

		return;
	}
}
