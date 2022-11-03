import type { AllOf, AnyDataType } from "@DataTypes/types";
import { validateType } from "@Validation/validators/validate-type";

export const validateAllOf = (
  path: string[],
  type: AllOf<AnyDataType[]>,
  data: unknown
) => {
  for (const dataType of type.allOf) {
    validateType(path, dataType, data);
  }
};
