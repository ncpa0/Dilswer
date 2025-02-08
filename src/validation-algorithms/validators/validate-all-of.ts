import type { AllOf, AnyDataType } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { getValidator } from "@Validation/validators/validate-type";

export const validateAllOf = (
  path: Path,
  type: AllOf<AnyDataType[]>,
  data: unknown,
) => {
  for (let i = 0; i < type.allOf.length; i++) {
    const dataType = type.allOf[i];
    getValidator(dataType.kind)!(path, dataType, data);
  }
};
