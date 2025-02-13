import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { type StandardSchemaV1 } from "standard-schema";

const AllowedChars = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ".",
];

export class StringNumeralType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType: "stringnumeral" = "stringnumeral";

  constructor() {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, `${number}`> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value);
    }

    let dotCount = 0;

    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (!AllowedChars.includes(char)) {
        throw new ValidationError(path, this, value);
      }
      if (char === ".") {
        dotCount++;
      }
    }

    if (dotCount > 1 || value.length === 0) {
      throw new ValidationError(path, this, value);
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "string") {
      return false;
    }

    let dotCount = 0;

    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (!AllowedChars.includes(char)) {
        return false;
      }
      if (char === ".") {
        dotCount++;
      }
    }

    return dotCount <= 1 && value.length > 0;
  }
}
