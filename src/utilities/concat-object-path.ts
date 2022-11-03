export const concatPathSegments = (path: string, key: string) => {
  key = key.toString();

  if (/^[0-9]+$/.test(key)) {
    return `${path}[${key}]`;
  }

  if (/[^a-zA-Z0-9]/.test(key)) {
    return `${path}["${key.replace(/"/g, '\\"')}"]`;
  }

  return `${path}.${key}`;
};

export const concatPath = (segments: string[]) => {
  return segments.slice(1).reduce(concatPathSegments, segments[0] ?? "");
};
