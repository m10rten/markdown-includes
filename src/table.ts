import { log } from "./utils/log";

const line = (arr: Array<any>) =>
  `| ${Object.keys(arr[0])
    .map(() => "---")
    .join(" | ")} |`;

export const table = async (str: string) => {
  log("Parsing table...");
  const parsed = JSON.parse(str);
  const keyOrder = Object.keys(parsed[0]);

  const out = [`| ${Object.keys(parsed[0]).join(" | ")} |`];

  out.push(line(parsed));

  for await (const row of parsed) {
    const values = keyOrder.map((key) => row[key]);
    const line = `| ${values.join(" | ")} |`;
    out.push(line);
  }

  return out;
};
