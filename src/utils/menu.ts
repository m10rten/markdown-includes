export const getTabs = (hashtags: Array<string>): string => {
  let tabs = "";
  for (let i = 1; i < hashtags.length; i++) tabs += "  "; // start at 1 to ignore the first `#`
  return tabs;
};

export const item = (title: string): string =>
  title.toLowerCase().replaceAll("#", "").replaceAll(".", "").trim().replace(/ /g, "-");
export const link = (title: string): string => `- [${title.replaceAll("#", "").trim()}](#${item(title)})`;
