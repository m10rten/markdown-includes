/* eslint-disable no-console */
import { hasKey } from "./cli";

export const create =
	(active?: boolean) =>
	(...data: any) => {
		const date = new Date().toISOString();
		if (active) return console.log(`~ [${date}]:`, ...data);
		return;
	};

export const log = (...data: any) => {
	const active = hasKey(process.argv, "--debug");
	const date = new Date().toISOString();
	if (active) return console.log(`~ [${date}]:`, ...data);
	return;
};
