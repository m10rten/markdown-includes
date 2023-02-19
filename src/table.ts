import { toJson } from "./utils/file";
import { create } from "./utils/log";

const line = (arr: Array<any>) => `| ${arr.map(() => "---").join(" | ")} |`;
const isSelected = (key: string, selected?: Array<string>) => (selected ? selected.includes(key) : true);

export const table = async (str: string, selected?: Array<string>, debug?: boolean) => {
  const log = create(debug);

  log("Parsing table...");
  const parsed: Array<any> = toJson(str);
  const keyOrder = Object.keys(parsed[0]).filter((key) => isSelected(key, selected));

  const out = [
    `| ${Object.keys(parsed[0])
      .filter((key) => isSelected(key, selected))
      .join(" | ")} |`,
  ];

  const cols = selected && selected.length > 0 ? selected : Object.keys(parsed[0]);
  out.push(line(cols));

  for await (const row of parsed) {
    const values = keyOrder.filter((key) => isSelected(key, selected)).map((key) => row[key]);
    const line = `| ${values.join(" | ")} |`;
    out.push(line);
  }

  return out;
};
