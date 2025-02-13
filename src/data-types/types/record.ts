import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { ParseRecordType, ReWrap } from "@DataTypes/type-utils";
import type {
  FieldDescriptor,
  RecordTypeSchema,
  RecordVisitChild,
  TypeVisitor,
} from "@DataTypes/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class RecordType<
  TS extends RecordTypeSchema = RecordTypeSchema,
> extends BaseType {
  /** @internal */
  readonly keys: string[];
  readonly kind = "record";
  private readonly fieldDescriptors: [
    fieldName: string,
    descriptor: FieldDescriptor,
  ][] = [];

  constructor(public readonly recordOf: TS) {
    super();
    this.keys = Object.keys(this.recordOf);

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      let entry = this.recordOf[key];
      Object.freeze(entry);

      if (isFieldDescriptor(entry)) {
        if (entry.required == null) {
          entry = { ...entry, required: true };
        }
        Object.freeze(entry);
        this.fieldDescriptors.push([key, entry]);
      } else {
        const descriptor: FieldDescriptor = { type: entry, required: true };
        Object.freeze(descriptor);
        this.fieldDescriptors.push([key, descriptor]);
      }
    }

    Object.freeze(this.keys);
    Object.freeze(this.recordOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    const children: RecordVisitChild<R>[] = [];

    for (let i = 0; i < this.fieldDescriptors.length; i++) {
      const [key, descriptor] = this.fieldDescriptors[i];
      children.push({
        _isRecordOfVisitChild: true,
        child: descriptor.type._acceptVisitor(visitor),
        propertyName: key,
        required: !!descriptor.required,
      });
    }

    return visitor.visit(this, children);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    ReWrap<ParseRecordType<TS>>
  > {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: unknown): void {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new ValidationError(path, this, value);
    }

    for (let i = 0; i < this.fieldDescriptors.length; i++) {
      const [key, descriptor] = this.fieldDescriptors[i];

      if (!(key in value)) {
        if (descriptor.required !== true) {
          continue;
        } else {
          throw new ValidationError(path.concat(key), this, undefined);
        }
      }

      // @ts-expect-error
      const fieldValue: unknown = value[key];

      if (fieldValue === undefined && descriptor.required !== true) {
        continue;
      }

      descriptor.type["~validate"](path.concat(key), fieldValue);
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }

    for (let i = 0; i < this.fieldDescriptors.length; i++) {
      const [key, descriptor] = this.fieldDescriptors[i];

      if (!(key in value)) {
        if (descriptor.required !== true) {
          continue;
        } else {
          return false;
        }
      }

      const fieldValue: unknown = value[key];

      if (fieldValue === undefined && descriptor.required !== true) {
        continue;
      }

      const matches = descriptor.type["~matches"](fieldValue);
      if (!matches) return false;
    }

    return true;
  }
}
