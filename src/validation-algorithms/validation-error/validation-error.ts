import type { AnyDataType } from "@DataTypes/types";
import { concatPath } from "@Utilities/concat-object-path";
import type { Path } from "@Validation/path";
import { StandardSchemaV1 } from "standard-schema";

const ValidationErrorSymbol = Symbol("ValidationError");

export class ValidationError extends TypeError {
  static isValidationError(e: unknown | ValidationError): e is ValidationError {
    return (
      typeof e === "object"
      && e !== null
      && e instanceof Error
      && ValidationErrorSymbol in e
    );
  }
  private readonly [ValidationErrorSymbol] = true;

  private path: Path;
  expectedValueType: AnyDataType | string;
  receivedValue: unknown;

  constructor(
    path: Path,
    expected: AnyDataType | string,
    value: unknown,
    customMessage?: string,
  ) {
    super(
      customMessage
        ?? "Value does not conform the data type structure definition.",
    );
    this.expectedValueType = expected;
    this.path = path;
    this.receivedValue = value;
  }

  private fieldPathCache: string | null = null;

  get fieldPath(): string {
    if (this.fieldPathCache == null) {
      this.fieldPathCache = concatPath(this.path.flatten());
    }
    return this.fieldPathCache;
  }

  get pathSegments(): StandardSchemaV1.PathSegment[] {
    return this.path.flatten().map(p => ({ key: p }));
  }
}
