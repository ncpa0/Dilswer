import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

type NumberOptions = {
  min: number | null;
  max: number | null;
};

export class NumberType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType: "number" = "number";

  protected _options: NumberOptions = {
    min: null,
    max: null,
  };

  get options(): NumberOptions {
    return { ...this._options };
  }

  constructor() {
    super();
    Object.freeze(this);
  }

  min(min: number): ComplexNumberType {
    const t = new ComplexNumberType();
    t._options.min = min;
    return t;
  }

  max(max: number): ComplexNumberType {
    const t = new ComplexNumberType();
    t._options.max = max;
    return t;
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, number> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new ValidationError(path, this, value);
    }
  }

  ["~matches"](value: any): boolean {
    return typeof value === "number" && !Number.isNaN(value);
  }
}

export class ComplexNumberType extends NumberType {
  min(min: number): ComplexNumberType {
    const t = new ComplexNumberType();
    Object.assign(t._options, this._options);
    t._options.min = min;
    return t;
  }

  max(max: number): ComplexNumberType {
    const t = new ComplexNumberType();
    Object.assign(t._options, this._options);
    t._options.max = max;
    return t;
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new ValidationError(path, this, value);
    }

    if (this._options.min !== null && value < this._options.min) {
      throw new ValidationError(path, this, value);
    }

    if (this._options.max !== null && value > this._options.max) {
      throw new ValidationError(path, this, value);
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return false;
    }

    if (this._options.min !== null && value < this._options.min) {
      return false;
    }

    if (this._options.max !== null && value > this._options.max) {
      return false;
    }

    return true;
  }
}
