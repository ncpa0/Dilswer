import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class LiteralType<
  DT extends string | number | boolean = string | number | boolean,
> extends BaseType {
  readonly kind = "literal";
  constructor(public readonly literal: DT) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, DT> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (this.literal === value) return;
    throw new ValidationError(path, this, value);
  }

  ["~matches"](value: any): boolean {
    return this.literal === value;
  }
}
