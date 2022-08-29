// src/utilities/is-field-descriptor.ts
import { dataTypeSymbol } from "../data-types/data-types.mjs";
var isFieldDescriptor = (v) => {
  const isObject = typeof v === "object";
  if (isObject) {
    const hasSymbol = dataTypeSymbol in v;
    if (!hasSymbol)
      return true;
  }
  return false;
};
export {
  isFieldDescriptor
};
