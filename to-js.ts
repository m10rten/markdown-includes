/* eslint-disable no-console */
import { readFileSync, writeFileSync } from "fs";

try {
	const indexFile = readFileSync("./dist/cli/index.js", "utf8");
	const newFile = indexFile.replace("ts-node-script", "node");
	// write the new file to the same location
	writeFileSync("./dist/cli/index.js", newFile);
	process.exit(0);
} catch (error) {
	console.error(error);
	process.exit(1);
}
