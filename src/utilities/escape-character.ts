export const escapeCharacter = (str: string, charToEscape: string): string => {
  let result = "";
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === "\\") {
      isEscaped = !isEscaped;
    } else {
      if (!isEscaped && char === charToEscape) {
        result += "\\";
      }
      isEscaped = false;
    }

    result += char;
  }

  return result;
};
