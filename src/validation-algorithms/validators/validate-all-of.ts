import type { AllOf, AnyDataType } from "@DataTypes/types";
import { validateType } from "@Validation/validators/validate-type";

export const validateAllOf = (
  path: string[],
  type: AllOf<AnyDataType[]>,
  data: unknown
) => {
  for (let i = 0; i < type.allOf.length; i++) {
    const dataType = type.allOf[i];
    validateType(path, dataType, data);
  }
};
