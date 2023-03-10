import { existsSync } from "fs";
import { appendFile, readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { slash } from "./clean";

export const read = async (path: string): Promise<string> => {
	const str = await readFile(path, "utf-8");
	return str;
};

export const write = async (path: string, data: string): Promise<void> => {
	if (!(await exists(path))) return appendFile(path, data, "utf-8");
	const written = await writeFile(path, data, "utf-8");
	return written;
};

export const exists = async (file: string): Promise<boolean> => {
	return new Promise<boolean>((resolve) => {
		const is = existsSync(file);
		if (is) return resolve(true);
		return resolve(false);
	});
};

export const merge = (oldData: any, newData: any) => {
	const merged = Array.isArray(oldData) ? oldData : [oldData];
	merged.push(newData);
	return merged;
};

export const save = async (fileName: string, newData: any): Promise<void> => {
	const old = await read(fileName);
	const merged = merge(toJson(old), newData);

	return await write(fileName, toString(merged));
};

export const toString = (json: any): string => {
	return JSON.stringify(json, null, 2);
};

export const toJson = (string: string) => {
	return JSON.parse(string);
};

export const getFiles = async (root: string, path: string): Promise<Set<string>> => {
	return new Promise<Set<string>>((resolve, reject) => {
		return glob(slash(path.includes(root) ? path : `${root}/${path}`), { root }, (err, files) => {
			if (err) reject(err);
			const set = new Set(files);
			if (set.size === 0) return reject(`No files found at ${path}`);
			return resolve(set);
		});
	});
};
