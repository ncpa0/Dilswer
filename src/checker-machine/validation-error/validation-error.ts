import type { AllDataTypes } from "../../types";

export class ValidationError extends TypeError {
  static isValidationError(e: unknown | ValidationError): e is ValidationError {
    return (
      typeof e === "object" &&
      e !== null &&
      e instanceof Error &&
      "_validation_error" in e
    );
  }
  private readonly _validation_error = true;

  fieldPath: string;
  expectedValueType: AllDataTypes;
  receivedValue: unknown;

  constructor(path: string, expected: AllDataTypes, value: unknown) {
    super("Value does not conform the data type structure definition.");
    this.expectedValueType = expected;
    this.fieldPath = path;
    this.receivedValue = value;
  }
}
