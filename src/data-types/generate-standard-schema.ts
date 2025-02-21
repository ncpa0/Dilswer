import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";
import type { Infer } from "./type-utils";
import type { AnyType } from "./types";

export function getStandardSchemaProps<Self extends AnyType>(
  type: AnyType,
): StandardSchemaV1.Props<
  any,
  Infer<Self>
> {
  const root = Path.init("$");

  let validate = type["compiledValidatorRef"].fn ?? ((value: any) => {
    try {
      type["~validate"](root, value);
      return { value: value as any };
    } catch (error) {
      if (ValidationError.isValidationError(error)) {
        return {
          issues: [{ path: error.pathSegments, message: error.message }],
        };
      }
      throw error;
    }
  });

  return {
    version: 1,
    vendor: "Dilswer",
    validate,
  };
}
