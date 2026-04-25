import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/type-types";
import { StringFloatType } from "@DataTypes/types/string-float";
import { StringIntegerType } from "@DataTypes/types/string-integer";
import { StringMatchingType } from "@DataTypes/types/string-matching";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

type StringOptions = {
  /** Minimum length of the string */
  min: number | null;
  /** Maximum length of the string */
  max: number | null;
};

export class StringType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType = "string" as const;

  protected _options: StringOptions = {
    min: null,
    max: null,
  };

  get options(): Readonly<StringOptions> {
    return { ...this._options };
  }

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

  len(constraints: Partial<StringOptions>) {
    const t = new ComplexStringType();
    Object.assign(t._options, constraints);
    return t;
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    return visitor.visit(this, undefined, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, string> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }
  }

  ["~matches"](value: any): boolean {
    return typeof value === "string";
  }

  toString(): string {
    return `PrimitiveSchema[ string ]`;
  }
}

export class ComplexStringType extends StringType {
  len(constraints: Partial<StringOptions>) {
    const t = new ComplexStringType();
    Object.assign(t._options, this._options);
    Object.assign(t._options, constraints);
    return t;
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }

    if (
      this._options.min !== null && value.length < this._options.min
    ) {
      throw new ValidationError(path, this, value, "string shorter than min");
    }

    if (
      this._options.max !== null && value.length > this._options.max
    ) {
      throw new ValidationError(path, this, value, "string longer than max");
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "string") {
      return false;
    }

    if (
      this._options.min !== null && value.length < this._options.min
    ) {
      return false;
    }

    if (
      this._options.max !== null && value.length > this._options.max
    ) {
      return false;
    }

    return true;
  }

  toString(): string {
    return `PrimitiveSchema[ string ${JSON.stringify(this._options)} ]`;
  }
}
