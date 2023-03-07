import type { Circular, CircularRef } from "@DataTypes/data-types";
import type { AnyDataType } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { validatorsLookupMap } from "@Validation/validators/validate-type";

export const validateCircular = (path: Path, type: Circular, data: unknown) => {
  const childType = type.type as AnyDataType;
  return validatorsLookupMap.get(childType.kind)!(path, childType, data);
};

export const validateCircularRef = (
  path: Path,
  type: CircularRef,
  data: unknown
) => {
  const refType = type._getReferencedType() as AnyDataType;
  return validatorsLookupMap.get(refType.kind)!(path, refType, data);
};
