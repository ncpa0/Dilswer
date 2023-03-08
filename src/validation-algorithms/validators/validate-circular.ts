import type { Circular, CircularRef } from "@DataTypes/data-types";
import type { AnyDataType } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { validatedCircularValues } from "@Validation/validators/helper-validated-circ-values";
import { validatorsLookupMap } from "@Validation/validators/validate-type";

export const validateCircular = (path: Path, type: Circular, data: unknown) => {
  if (validatedCircularValues.has(data)) {
    return;
  }
  validatedCircularValues.add(data);

  const childType = type.type as AnyDataType;
  return validatorsLookupMap.get(childType.kind)!(path, childType, data);
};

export const validateCircularRef = (
  path: Path,
  type: CircularRef,
  data: unknown
) => {
  if (validatedCircularValues.has(data)) {
    return;
  }
  validatedCircularValues.add(data);

  const refType = type._getReferencedType() as AnyDataType;
  return validatorsLookupMap.get(refType.kind)!(path, refType, data);
};
