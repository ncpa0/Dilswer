import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/type-types";
import { Path } from "@Validation/path";
import type { StandardSchemaV1 } from "~/standard-schema";

export class UnknownType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType = "unknown" as const;

  constructor() {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    return visitor.visit(this, undefined, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, unknown> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](_: Path, __: any): void {}

  ["~matches"](): boolean {
    return true;
  }
}
