export const concatObjectPath = (path: string, key: string | number) => {
  key = key.toString();

  if (/^[0-9]+$/.test(key)) {
    return `${path}[${key}]`;
  }

  if (/[^a-zA-Z0-9]/.test(key)) {
    return `${path}["${key.replace(/"/g, '\\"')}"]`;
  }

  return `${path}.${key}`;
};
