import type { AnyType, OptionalField, RecordTypeSchema } from "./types";
import { ArrayType } from "./types/array";
import { BooleanType } from "./types/boolean";
import { CustomType } from "./types/custom";
import { DictType } from "./types/dict";
import { EnumType } from "./types/enum";
import { EnumMemberType } from "./types/enum-member";
import { FunctionType } from "./types/function";
import { InstanceOfType } from "./types/instance";
import { IntegerType } from "./types/integer";
import { IntersectionType } from "./types/intersection";
import { LiteralType } from "./types/literal";
import { NullType } from "./types/null";
import { NumberType } from "./types/number";
import { RecordType } from "./types/record";
import { RecursiveType, RecursiveTypeReference } from "./types/recursive";
import { SetType } from "./types/set";
import { StringType } from "./types/string";
import { StringIntegerType } from "./types/string-integer";
import { StringMatchingType } from "./types/string-matching";
import { StringNumeralType } from "./types/string-numberal";
import { SymbolType } from "./types/symbol";
import { TupleType } from "./types/tuple";
import { UndefinedType } from "./types/undefined";
import { UnionType } from "./types/union";
import { UnknownType } from "./types/unknown";

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
  get StringNumeral() {
    return new StringNumeralType();
  },
  get StringInt() {
    return new StringIntegerType();
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
  StringMatching<T extends string>(pattern: RegExp) {
    return new StringMatchingType<T>(pattern);
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
