export const slash = (str: string): string => {
  return str?.replace(/\\/g, "/").replace(/\/\//g, "/").replaceAll("./", "");
};
