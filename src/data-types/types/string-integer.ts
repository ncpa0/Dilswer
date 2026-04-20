import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/type-types";
import { UnionType } from "@DataTypes/types/union";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

type StringIntegerOptions = {
  positive: boolean;
  negative: boolean;
  zero: boolean;
};

export class StringIntegerType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType: "stringinteger" = "stringinteger";

  protected _options: StringIntegerOptions = {
    positive: true,
    negative: true,
    zero: true,
  };

  get options(): Readonly<StringIntegerOptions> {
    return { ...this._options };
  }

  constructor() {
    super();
    Object.freeze(this);
  }

  positive() {
    return new PositiveStringIntegerType();
  }

  negative() {
    return new NegativeStringIntegerType();
  }

  zero() {
    return new ZeroStringIntegerType();
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    return visitor.visit(this, undefined, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, `${number}`> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }

    if (value.length === 0) {
      throw new ValidationError(path, this, value, "empty string");
    }

    let i = 0;
    if (value[0] === "-") {
      i++;
    }
    for (; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 48 && charCode <= 57) {
        continue;
      }
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid integer",
      );
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "string") {
      return false;
    }

    let i = 0;
    if (value[0] === "-") {
      i++;
    }
    for (; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 48 && charCode <= 57) {
        continue;
      }
      return false;
    }

    return value.length > 0;
  }
}

export class ZeroStringIntegerType extends StringIntegerType {
  constructor() {
    super();
    this._options.negative = false;
    this._options.positive = false;
  }

  positive(): never {
    throw new Error("This type already has a zero constraint");
  }

  negative(): never {
    throw new Error("This type already has a zero constraint");
  }

  zero(): never {
    throw new Error("This type already has a zero constraint");
  }

  orPositive() {
    return new UnionType<[ZeroStringIntegerType, PositiveStringIntegerType]>([
      this,
      new PositiveStringIntegerType(),
    ]);
  }

  orNegative() {
    return new UnionType<[ZeroStringIntegerType, NegativeStringIntegerType]>([
      this,
      new NegativeStringIntegerType(),
    ]);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }

    if (value.length === 0) {
      throw new ValidationError(path, this, value, "empty string");
    }

    let i = 0;
    if (value[0] === "-") {
      i++;
    }
    for (; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode === 48) {
        continue;
      }
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not equalt to zero",
      );
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "string") {
      return false;
    }

    let i = 0;
    if (value[0] === "-") {
      i++;
    }
    for (; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode === 48) {
        continue;
      }
      return false;
    }

    return value.length > 0;
  }
}

export class PositiveStringIntegerType extends StringIntegerType {
  constructor() {
    super();
    this._options.negative = false;
    this._options.zero = false;
  }

  positive(): never {
    throw new Error("This type already has a positive constraint");
  }

  negative(): never {
    throw new Error("This type already has a positive constraint");
  }

  zero(): never {
    throw new Error("This type already has a positive constraint");
  }

  orZero() {
    return new UnionType<[PositiveStringIntegerType, ZeroStringIntegerType]>([
      this,
      new ZeroStringIntegerType(),
    ]);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }

    if (value.length === 0) {
      throw new ValidationError(path, this, value, "empty string");
    }

    let hasNonZeroDigit = false;
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 49 && charCode <= 57) {
        hasNonZeroDigit = true;
        continue;
      }
      if (charCode === 48) {
        continue;
      }

      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid integer",
      );
    }

    if (!hasNonZeroDigit) {
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not positive",
      );
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "string") {
      return false;
    }
    let hasNonZeroDigit = false;
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 49 && charCode <= 57) {
        hasNonZeroDigit = true;
        continue;
      }
      if (charCode === 48) {
        continue;
      }
      return false;
    }

    return hasNonZeroDigit;
  }
}

export class NegativeStringIntegerType extends StringIntegerType {
  constructor() {
    super();
    this._options.positive = false;
    this._options.zero = false;
    Object.freeze(this);
  }

  positive(): never {
    throw new Error("This type already has a negative constraint");
  }

  negative(): never {
    throw new Error("This type already has a negative constraint");
  }

  zero(): never {
    throw new Error("This type already has a negative constraint");
  }

  orZero() {
    return new UnionType<[NegativeStringIntegerType, ZeroStringIntegerType]>([
      this,
      new ZeroStringIntegerType(),
    ]);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }

    if (value.length === 0) {
      throw new ValidationError(path, this, value, "empty string");
    }

    if (value[0] !== "-") {
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not negative",
      );
    }

    let hasNonZeroDigit = false;
    for (let i = 1; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 49 && charCode <= 57) {
        hasNonZeroDigit = true;
        continue;
      }
      if (charCode === 48) {
        continue;
      }
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid integer",
      );
    }

    if (!hasNonZeroDigit) {
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not negative",
      );
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "string") {
      return false;
    }

    if (value[0] !== "-") {
      return false;
    }

    let hasNonZeroDigit = false;
    for (let i = 1; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 49 && charCode <= 57) {
        hasNonZeroDigit = true;
        continue;
      }
      if (charCode === 48) {
        continue;
      }
      return false;
    }

    return hasNonZeroDigit;
  }
}
