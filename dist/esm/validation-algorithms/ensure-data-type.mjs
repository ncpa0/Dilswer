// src/validation-algorithms/ensure-data-type.ts
import { validateType } from "./validators/validate-type.mjs";
var ensureDataType = (dataType, data) => validateType("$", dataType, data);
export {
  ensureDataType
};
