import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { RepackTuple } from "@DataTypes/type-utils";
import type { AnyDataType, TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class TupleType<DT extends AnyDataType[] = any[]> extends BaseType {
  readonly kind = "tuple";
  constructor(public readonly tuple: DT) {
    super();
    Object.freeze(this.tuple);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.tuple.length; i++) {
      children.push(this.tuple[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, RepackTuple<DT>> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (!Array.isArray(value) || value.length !== this.tuple.length) {
      throw new ValidationError(path, this, value);
    }

    for (let index = 0; index < this.tuple.length; index++) {
      const elem = value[index];
      const elemtType = this.tuple[index];
      elemtType["~validate"](
        path.concat(index),
        elem,
      );
    }
  }

  ["~matches"](value: any): boolean {
    if (!Array.isArray(value) || value.length !== this.tuple.length) {
      return false;
    }

    for (let index = 0; index < this.tuple.length; index++) {
      const elem = value[index];
      const elemtType = this.tuple[index];
      if (!elemtType["~matches"](elem)) {
        return false;
      }
    }

    return true;
  }
}
