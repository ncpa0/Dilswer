import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyDataType, TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";
import { UnionType } from "./union";

export class ArrayType<DT extends AnyDataType[] = any[]> extends BaseType {
  readonly kind = "array";
  private readonly union;

  constructor(public readonly arrayOf: DT) {
    super();
    this.union = new UnionType(this.arrayOf);
    Object.freeze(this.arrayOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.arrayOf.length; i++) {
      children.push(this.arrayOf[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    Array<ReWrap<ParseDataType<DT[number]>>>
  > {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (!Array.isArray(value)) throw new ValidationError(path, this, value);

    for (let index = 0; index < value.length; index++) {
      this.union["~validate"](path.concat(index), value[index]);
    }
  }

  ["~matches"](value: any): boolean {
    if (!Array.isArray(value)) return false;

    for (let index = 0; index < value.length; index++) {
      const match = this.union["~matches"](value[index]);
      if (!match) return false;
    }
    return true;
  }
}
