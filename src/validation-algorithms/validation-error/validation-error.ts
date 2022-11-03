import type { AnyDataType } from "@DataTypes/types";
import { concatPath } from "@Utilities/concat-object-path";

const ValidationErrorSymbol = Symbol("ValidationError");

export class ValidationError extends TypeError {
  static isValidationError(e: unknown | ValidationError): e is ValidationError {
    return (
      typeof e === "object" &&
      e !== null &&
      e instanceof Error &&
      ValidationErrorSymbol in e
    );
  }
  private readonly [ValidationErrorSymbol] = true;

  fieldPath: string;
  expectedValueType: AnyDataType | string;
  receivedValue: unknown;

  constructor(path: string[], expected: AnyDataType | string, value: unknown) {
    super("Value does not conform the data type structure definition.");
    this.expectedValueType = expected;
    this.fieldPath = concatPath(path);
    this.receivedValue = value;
  }
}
