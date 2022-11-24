export const addIndentToLastLine = (str: string, indent: string): string => {
  const lastEOL = str.trimEnd().lastIndexOf("\n");
  if (lastEOL === -1) {
    return str;
  }
  return str.slice(0, lastEOL + 1) + indent + str.slice(lastEOL + 1);
};
