import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { AnyType, TypeVisitor } from "@DataTypes/type-types";
import type {
  ParseDataTypeIntersectionTuple,
  ReWrap,
} from "@DataTypes/type-utils";
import { Path } from "@Validation/path";
import type { StandardSchemaV1 } from "~/standard-schema";

export class IntersectionType<DT extends AnyType[] = any[]> extends BaseType {
  readonly kind = "intersection";
  constructor(public readonly allOf: DT) {
    super();
    Object.freeze(this.allOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    const children: R[] = [];

    for (let i = 0; i < this.allOf.length; i++) {
      children.push(this.allOf[i]._acceptVisitor(visitor, depth + 1));
    }

    return visitor.visit(this, children, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    ReWrap<ParseDataTypeIntersectionTuple<DT>>
  > {
    return getStandardSchemaProps<any>(this);
  }

  ["~validate"](path: Path, value: any): void {
    for (let i = 0; i < this.allOf.length; i++) {
      const dataType = this.allOf[i];
      dataType["~validate"](path, value);
    }
  }

  ["~matches"](value: any): boolean {
    for (let i = 0; i < this.allOf.length; i++) {
      const dataType = this.allOf[i];
      if (!dataType["~matches"](value)) {
        return false;
      }
    }
    return true;
  }
}
