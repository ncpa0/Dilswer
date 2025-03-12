import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { type StandardSchemaV1 } from "standard-schema";
import { UnionType } from "./union";

type StringFloatOptions = {
  positive: boolean;
  negative: boolean;
  zero: boolean;
};

export class StringFloatType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType: "stringnumeral" = "stringnumeral";

  protected _options: StringFloatOptions = {
    positive: true,
    negative: true,
    zero: true,
  };

  get options(): Readonly<StringFloatOptions> {
    return { ...this._options };
  }

  constructor() {
    super();
    Object.freeze(this);
  }

  positive() {
    return new PositiveStringFloatType();
  }

  negative() {
    return new NegativeStringFloatType();
  }

  zero() {
    return new ZeroStringFloatType();
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
      throw new ValidationError(path, this, value, "not a string");
    }

    let i = 0;
    if (value[0] === "-") {
      i++;
    }
    let dotCount = 0;
    for (; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 48 && charCode <= 57) {
        continue;
      }
      if (charCode === 46) {
        dotCount++;
        continue;
      }
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid float",
      );
    }

    if (dotCount > 1 || value.length === 0) {
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid float",
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
    let dotCount = 0;
    for (; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 48 && charCode <= 57) {
        continue;
      }
      if (charCode === 46) {
        dotCount++;
        continue;
      }
      return false;
    }

    return dotCount <= 1 && value.length > 0;
  }
}

export class ZeroStringFloatType extends StringFloatType {
  constructor() {
    super();
    this._options.negative = false;
    this._options.positive = false;
    Object.freeze(this);
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
    return new UnionType<[ZeroStringFloatType, PositiveStringFloatType]>([
      this,
      new PositiveStringFloatType(),
    ]);
  }

  orNegative() {
    return new UnionType<[ZeroStringFloatType, NegativeStringFloatType]>([
      this,
      new NegativeStringFloatType(),
    ]);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }
    let i = 0;
    if (value[0] === "-") {
      i++;
    }
    let dotCount = 0;
    for (; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode == 48) {
        continue;
      }
      if (charCode === 46) {
        dotCount++;
        continue;
      }
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a zero",
      );
    }

    if (dotCount > 1 || value.length === 0) {
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid float",
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
    let dotCount = 0;
    for (; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode == 48) {
        continue;
      }
      if (charCode === 46) {
        dotCount++;
        continue;
      }
      return false;
    }

    return dotCount <= 1 && value.length > 0;
  }
}

export class PositiveStringFloatType extends StringFloatType {
  constructor() {
    super();
    this._options.negative = false;
    this._options.zero = false;
    Object.freeze(this);
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
    return new UnionType<[PositiveStringFloatType, ZeroStringFloatType]>([
      this,
      new ZeroStringFloatType(),
    ]);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }

    let hasNonZeroDigit = false;
    let dotCount = 0;
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 49 && charCode <= 57) {
        hasNonZeroDigit = true;
        continue;
      }
      if (charCode === 48) {
        continue;
      }
      if (charCode === 46) {
        dotCount++;
        continue;
      }
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid float",
      );
    }

    if (dotCount > 1) {
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid float",
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
    let dotCount = 0;
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 49 && charCode <= 57) {
        hasNonZeroDigit = true;
        continue;
      }
      if (charCode === 48) {
        continue;
      }
      if (charCode === 46) {
        dotCount++;
        continue;
      }
      return false;
    }

    return dotCount <= 1 && hasNonZeroDigit;
  }
}

export class NegativeStringFloatType extends StringFloatType {
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
    return new UnionType<[NegativeStringFloatType, ZeroStringFloatType]>([
      this,
      new ZeroStringFloatType(),
    ]);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
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
    let dotCount = 0;
    for (let i = 1; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 49 && charCode <= 57) {
        hasNonZeroDigit = true;
        continue;
      }
      if (charCode === 48) {
        continue;
      }
      if (charCode === 46) {
        dotCount++;
        continue;
      }
      throw new ValidationError(
        path,
        this,
        value,
        "value contained by the string is not a valid float",
      );
    }

    if (dotCount > 1) {
      throw new ValidationError(path, this, value, "not a valid float");
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
    let dotCount = 0;
    for (let i = 1; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      if (charCode >= 49 && charCode <= 57) {
        hasNonZeroDigit = true;
        continue;
      }
      if (charCode === 48) {
        continue;
      }
      if (charCode === 46) {
        dotCount++;
        continue;
      }
      return false;
    }

    return dotCount <= 1 && hasNonZeroDigit;
  }
}
