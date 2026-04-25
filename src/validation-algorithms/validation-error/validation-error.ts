import type { AnyType } from "@DataTypes/type-types";
import { concatPath } from "@Utilities/concat-object-path";
import type { Path } from "@Validation/path";
import dedent from "dedent";
import type { StandardSchemaV1 } from "~/standard-schema";

export class ValidationError extends TypeError {
  static isValidationError(e: unknown | ValidationError): e is ValidationError {
    return (
      typeof e === "object"
      && e !== null
      && e instanceof TypeError
      && "ValidationError" in e
      && e.ValidationError === true
    );
  }
  private readonly ValidationError = true;

  private path: Path;
  readonly isAggregate = false;
  expectedValueType: AnyType | string;
  receivedValue: unknown;

  /** @internal */
  originType?: AnyType;

  constructor(
    path: Path,
    expected: AnyType | string,
    value: unknown,
    customMessage?: string,
  ) {
    super(
      customMessage
        ?? "value does not conform the data type structure definition",
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

  details() {
    return dedent`
      ValidationError: ${this.message}
      Path: ${this.fieldPath}
      Expected: ${this.expectedValueType.toString()}
      Got: ${typeof this.receivedValue}
    `;
  }

  detailsJson(): ErrDetails {
    return {
      err: "ValidationError",
      message: this.message,
      path: this.fieldPath,
      expected: this.expectedValueType.toString(),
      gotType: typeof this.receivedValue,
      gotValue: this.receivedValue,
    };
  }
}

export type ErrDetails = {
  err: "ValidationError";
  message: string;
  path: string;
  expected: string;
  gotValue: any;
  gotType:
    | "string"
    | "bigint"
    | "boolean"
    | "function"
    | "number"
    | "object"
    | "string"
    | "symbol"
    | "undefined";
};

export class AggregateValidationError extends TypeError {
  static isAggregateValidationError(
    e: unknown | AggregateValidationError,
  ): e is AggregateValidationError {
    return (
      typeof e === "object"
      && e !== null
      && e instanceof TypeError
      && "AggregateValidationError" in e
      && e.AggregateValidationError === true
    );
  }
  private readonly AggregateValidationError = true;

  private path: Path;
  readonly isAggregate = true;

  constructor(
    path: Path,
    public errors: Array<ValidationError | AggregateValidationError>,
    customMessage?: string,
  ) {
    super(
      customMessage
        ?? "value does not conform the data type structure definition",
    );
    this.path = path;
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

  details(): string {
    const errorsDetails = this.errors.map(e => {
      let d = padLines(e.details(), "  ");
      if (
        ValidationError.isValidationError(e) && e.originType != null
        && e.expectedValueType !== e.originType
      ) {
        d = `  By: ${e.originType.toString()}\n` + d;
      }
      return d;
    });

    return dedent`
        AggregateValidationError: ${this.message}
        Path: ${this.fieldPath}
        Errors:
      ` + "\n" + errorsDetails.join("\n\n");
  }

  detailsJson(): AggregateErrDetails {
    return {
      err: "AggregateValidationError",
      message: this.message,
      path: this.fieldPath,
      errors: this.errors.map(e => e.detailsJson()),
    };
  }
}

export type AggregateErrDetails = {
  err: "AggregateValidationError";
  message: string;
  path: string;
  errors: Array<
    ErrDetails | AggregateErrDetails
  >;
};

function padLines(text: string, pad: string) {
  return text.split("\n").map(line => pad + line).join("\n");
}
