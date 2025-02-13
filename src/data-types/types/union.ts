import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyDataType, TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class UnionType<DT extends AnyDataType[] = any[]> extends BaseType {
  readonly kind = "union";
  constructor(public readonly oneOf: DT) {
    super();
    Object.freeze(this.oneOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.oneOf.length; i++) {
      children.push(this.oneOf[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    ReWrap<ParseDataType<DT[number]>>
  > {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (this.oneOf.length === 1) {
      const oneOfType = this.oneOf[0];
      return oneOfType["~validate"](path, value);
    }

    for (let i = 0; i < this.oneOf.length; i++) {
      const oneOfType = this.oneOf[i];
      if (oneOfType["~matches"](value)) {
        return;
      }
    }

    throw new ValidationError(path, this, value);
  }

  ["~matches"](value: any): boolean {
    if (this.oneOf.length === 1) {
      const oneOfType = this.oneOf[0];
      return oneOfType["~matches"](value);
    }

    for (let i = 0; i < this.oneOf.length; i++) {
      const oneOfType = this.oneOf[i];
      if (oneOfType["~matches"](value)) {
        return true;
      }
    }

    return false;
  }
}
