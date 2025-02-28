import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";
import { StringFloatType } from "./string-float";
import { StringIntegerType } from "./string-integer";
import { StringMatchingType } from "./string-matching";

export class StringType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType: "string" = "string";

  constructor() {
    super();
    Object.freeze(this);
  }

  get Int() {
    return new StringIntegerType();
  }

  get Float() {
    return new StringFloatType();
  }

  matching<T extends string>(pattern: RegExp) {
    return new StringMatchingType<T>(pattern);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, string> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value);
    }
  }

  ["~matches"](value: any): boolean {
    return typeof value === "string";
  }
}
