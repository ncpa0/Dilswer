import type { AllDataTypes } from "../../types";

export class ValidationError extends Error {
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
    super("Invalid Data");
    this.expectedValueType = expected;
    this.fieldPath = path;
    this.receivedValue = value;
  }
}
