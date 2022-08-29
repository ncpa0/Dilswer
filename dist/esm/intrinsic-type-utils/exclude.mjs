// src/intrinsic-type-utils/exclude.ts
import { dataTypeSymbol } from "../data-types/data-types.mjs";
var Exclude = (union, ...excludeTypes) => {
  return {
    [dataTypeSymbol]: true,
    oneOf: union.oneOf.filter((t) => !excludeTypes.includes(t))
  };
};
export {
  Exclude
};
