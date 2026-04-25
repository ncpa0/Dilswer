import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/type-types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

type IntOptions = {
  min: number | null;
  max: number | null;
};

export class IntegerType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType = "integer" as const;

  protected _options: IntOptions = {
    min: null,
    max: null,
  };

  get options(): IntOptions {
    return { ...this._options };
  }

  constructor() {
    super();
    Object.freeze(this);
  }

  min(min: number): ComplexIntegerType {
    const t = new ComplexIntegerType();
    t._options.min = min;
    return t;
  }

  max(max: number): ComplexIntegerType {
    const t = new ComplexIntegerType();
    t._options.max = max;
    return t;
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    return visitor.visit(this, undefined, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, number> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new ValidationError(path, this, value, "not a number");
    }
    if (!Number.isInteger(value)) {
      throw new ValidationError(path, this, value, "not an integer");
    }
  }

  ["~matches"](value: any): boolean {
    return (
      typeof value === "number" && !Number.isNaN(value)
      && Number.isInteger(value)
    );
  }

  toString(): string {
    return `PrimitiveSchema[ int ]`;
  }
}

export class ComplexIntegerType extends IntegerType {
  min(min: number): ComplexIntegerType {
    const t = new ComplexIntegerType();
    Object.assign(t._options, this._options);
    t._options.min = min;
    return t;
  }

  max(max: number): ComplexIntegerType {
    const t = new ComplexIntegerType();
    Object.assign(t._options, this._options);
    t._options.max = max;
    return t;
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new ValidationError(path, this, value, "not a number");
    }
    if (!Number.isInteger(value)) {
      throw new ValidationError(path, this, value, "not an integer");
    }

    if (this._options.min !== null && value < this._options.min) {
      throw new ValidationError(path, this, value, "integer less than min");
    }

    if (this._options.max !== null && value > this._options.max) {
      throw new ValidationError(path, this, value, "integer greater than max");
    }
  }

  ["~matches"](value: any): boolean {
    if (
      typeof value !== "number" || Number.isNaN(value)
      || !Number.isInteger(value)
    ) {
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

  toString(): string {
    return `PrimitiveSchema[ int ${JSON.stringify(this._options)} ]`;
  }
}
