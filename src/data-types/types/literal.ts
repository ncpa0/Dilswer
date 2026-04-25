import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/type-types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

export class LiteralType<
  DT extends string | number | boolean = string | number | boolean,
> extends BaseType {
  readonly kind = "literal";
  constructor(public readonly literal: DT) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    return visitor.visit(this, undefined, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, DT> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (this.literal === value) return;
    throw new ValidationError(
      path,
      this,
      value,
      `not equal to the expected literal value`,
    );
  }

  ["~matches"](value: any): boolean {
    return this.literal === value;
  }

  toString(): string {
    return `LiteralSchema[ ${this.literal} ]`;
  }
}
