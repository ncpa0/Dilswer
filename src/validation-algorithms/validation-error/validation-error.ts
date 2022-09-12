import type { AnyDataType } from "@DataTypes/types";

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
  expectedValueType: AnyDataType;
  receivedValue: unknown;

  constructor(path: string, expected: AnyDataType, value: unknown) {
    super("Value does not conform the data type structure definition.");
    this.expectedValueType = expected;
    this.fieldPath = path;
    this.receivedValue = value;
  }
}
