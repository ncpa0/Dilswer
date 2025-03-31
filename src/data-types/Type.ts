import type {
  AnyType,
  OptionalField,
  RecordTypeSchema,
} from "@DataTypes/type-types";
import { ArrayType } from "@DataTypes/types/array";
import { BooleanType } from "@DataTypes/types/boolean";
import { CustomType } from "@DataTypes/types/custom";
import { DictType } from "@DataTypes/types/dict";
import { EnumType } from "@DataTypes/types/enum";
import { EnumMemberType } from "@DataTypes/types/enum-member";
import { FunctionType } from "@DataTypes/types/function";
import { InstanceOfType } from "@DataTypes/types/instance";
import { IntegerType } from "@DataTypes/types/integer";
import { IntersectionType } from "@DataTypes/types/intersection";
import { LiteralType } from "@DataTypes/types/literal";
import { NullType } from "@DataTypes/types/null";
import { NumberType } from "@DataTypes/types/number";
import { RecordType } from "@DataTypes/types/record";
import {
  RecursiveType,
  RecursiveTypeReference,
} from "@DataTypes/types/recursive";
import { SetType } from "@DataTypes/types/set";
import { StringType } from "@DataTypes/types/string";
import { SymbolType } from "@DataTypes/types/symbol";
import { TupleType } from "@DataTypes/types/tuple";
import { UndefinedType } from "@DataTypes/types/undefined";
import { UnionType } from "@DataTypes/types/union";
import { UnknownType } from "@DataTypes/types/unknown";

export const Type = {
  get Unknown() {
    return new UnknownType();
  },
  get String() {
    return new StringType();
  },
  get Number() {
    return new NumberType();
  },
  get Int() {
    return new IntegerType();
  },
  get Boolean() {
    return new BooleanType();
  },
  get Symbol() {
    return new SymbolType();
  },
  get Function() {
    return new FunctionType();
  },
  get Null() {
    return new NullType();
  },
  get Undefined() {
    return new UndefinedType();
  },
  Record<TS extends RecordTypeSchema>(args: TS) {
    return new RecordType(args);
  },
  Dict<DT extends AnyType[]>(...args: DT) {
    return new DictType(args);
  },
  Array<DT extends AnyType[]>(...args: DT) {
    return new ArrayType(args);
  },
  Tuple<DT extends AnyType[]>(...args: DT) {
    return new TupleType(args);
  },
  Set<DT extends AnyType[]>(...args: DT) {
    return new SetType(args);
  },
  OneOf<DT extends AnyType[]>(...args: DT) {
    return new UnionType(args);
  },
  AllOf<DT extends AnyType[]>(...args: DT) {
    return new IntersectionType(args);
  },
  Literal<V extends string | number | boolean>(value: V) {
    return new LiteralType(value);
  },
  EnumMember<M extends number | string>(enumMember: M) {
    return new EnumMemberType(enumMember);
  },
  Enum<T extends string, TEnumValue extends string | number>(
    enumInstance: {
      [key in T]: TEnumValue;
    },
  ) {
    return new EnumType<TEnumValue>(enumInstance);
  },
  InstanceOf<DT>(instanceOf: new(...args: any[]) => DT) {
    return new InstanceOfType(instanceOf);
  },
  Custom<VF extends (v: any) => v is any>(validateFunction: VF) {
    return new CustomType(validateFunction);
  },
  Recursive<DT extends AnyType>(
    getDataType: (ref: RecursiveTypeReference) => DT,
  ) {
    return new RecursiveType(getDataType);
  },
  Option<DT extends AnyType>(type: DT): OptionalField<DT> {
    return {
      type,
      required: false,
    };
  },
};
