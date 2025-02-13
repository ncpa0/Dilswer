import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import type { StandardSchemaV1 } from "standard-schema";

export class UnknownType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType: "unknown" = "unknown";

  constructor() {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, unknown> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](_: Path, __: any): void {}

  ["~matches"](value: any): boolean {
    return true;
  }
}
