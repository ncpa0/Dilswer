import type { AllOf, AnyDataType } from "@DataTypes/types";
import { validatorsLookupMap } from "@Validation/validators/validate-type";
import type { Path } from "../path";

export const validateAllOf = (
  path: Path,
  type: AllOf<AnyDataType[]>,
  data: unknown
) => {
  for (let i = 0; i < type.allOf.length; i++) {
    const dataType = type.allOf[i];
    validatorsLookupMap.get(dataType.kind)!(path, dataType, data);
  }
};
