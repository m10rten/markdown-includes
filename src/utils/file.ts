import { existsSync } from "fs";
import { appendFile, readFile, readdir, writeFile } from "fs/promises";

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
    resolve(false);
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

export const recursive = async (root: string, path: string | null | undefined, fileSet: Set<string>) => {
  const absolute = `${root}${path ? `/${path}` : ""}`;

  if (fileSet.has(absolute)) throw new Error("This file has already been parsed.");
  if (path?.endsWith(".md")) fileSet.add(absolute);
  else if (!path?.includes(".")) {
    // is a directory

    const files = await readdir(absolute);

    for (const file of files) {
      const resSet = await recursive(absolute, file, fileSet);

      if (!resSet) continue;

      for (const res of resSet) {
        fileSet.add(res);
      }
    }
  }

  // return the file set
  return fileSet;
};
