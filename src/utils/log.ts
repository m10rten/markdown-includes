/* eslint-disable no-console */
import { hasKey } from "./cli";

export const log = (...data: any) => {
  const active = hasKey(process.argv, "--debug");
  const date = new Date().toISOString();
  if (active) console.log(`~ [${date}]:`, ...data);
};
