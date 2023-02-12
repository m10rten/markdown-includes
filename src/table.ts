import { log } from "./utils/log";

const line = (arr: Array<any>) =>
  `| ${Object.keys(arr[0])
    .map(() => "---")
    .join(" | ")} |`;

export const table = async (str: string) => {
  log("Parsing table...");
  const parsed = JSON.parse(str);

  const out = [`| ${Object.keys(parsed[0]).join(" | ")} |`];

  out.push(line(parsed));

  for await (const row of parsed) {
    const values = Object.values(row);
    const line = `| ${values.join(" | ")} |`;
    out.push(line);
  }

  return out;
};
