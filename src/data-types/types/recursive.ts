import type { CircularType } from "@DataTypes/circular-type-utils";
import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { ReWrap } from "@DataTypes/type-utils";
import type { AnyDataType, TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import type { StandardSchemaV1 } from "standard-schema";

/**
 * Collection of values that have been ran through the validator
 * already, and were expected to possibly contain circular
 * references.
 *
 * Tracking these values via this collection allows the
 * validators to skip a value if it was encountered more than
 * once. This prevents infinite recursion that would cause
 * `Maximum call stack size exceeded` errors.
 *
 * This Set should be cleared after each validation pass.
 */
export const validatedCircularValues = new Map<AnyDataType, Set<any>>();

export const wasCircValidated = (type: AnyDataType, data: unknown) => {
  let set = validatedCircularValues.get(type);

  if (!set) {
    set = new Set([data]);
    validatedCircularValues.set(type, set);
    return false;
  }

  if (set.has(data)) {
    return true;
  }

  set.add(data);
  return false;
};

export class RecursiveTypeReference extends BaseType {
  readonly kind = "circularRef";

  /** This is the type this reference points to. */
  get type(): AnyDataType {
    return this.parent.type;
  }

  constructor(private parent: RecursiveType) {
    super();
  }

  /** @internal */
  _getReferencedType(): AnyDataType {
    return this.parent.type;
  }

  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (wasCircValidated(this._getReferencedType(), value)) {
      return;
    }

    const refType = this._getReferencedType();
    return refType["~validate"](path, value);
  }

  ["~matches"](value: any): boolean {
    if (wasCircValidated(this._getReferencedType(), value)) {
      return true;
    }

    const refType = this._getReferencedType();
    return refType["~matches"](value);
  }
}

export class RecursiveType<DT extends AnyDataType = any> extends BaseType {
  readonly kind = "circular";
  readonly type: DT;

  constructor(getDataType: (ref: RecursiveTypeReference) => DT) {
    super();
    this.type = getDataType(new RecursiveTypeReference(this));
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    const c = this.type._acceptVisitor(visitor);
    return visitor.visit(this, [c]);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    ReWrap<CircularType<DT>>
  > {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (wasCircValidated(this, value)) {
      return;
    }

    return this.type["~validate"](path, value);
  }

  ["~matches"](value: any): boolean {
    if (wasCircValidated(this, value)) {
      return true;
    }

    return this.type["~matches"](value);
  }
}
