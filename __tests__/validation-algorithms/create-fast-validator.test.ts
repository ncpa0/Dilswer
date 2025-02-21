import type {
  Infer,
  ParseDataType,
  ReWrap,
  UnknownFunction,
} from "@DataTypes/type-utils";
import { AnyDataType, compileFastValidator, Type } from "../../src";

const TRUE_SYM = Symbol("true");
type True = typeof TRUE_SYM;

class AssertionFailed<Reason, Values = never> {
  private _reason!: Reason;
}

type AssertEqual<T, U> = [T] extends [U]
  ? [U] extends [T] ? T extends object ? AssertEqual<keyof T, keyof U>
    : True
  : AssertionFailed<"Values are not equal", { T: T; U: U }>
  : AssertionFailed<"Values are not equal", { T: T; U: U }>;

type AssertType<T, U extends AnyDataType> = AssertEqual<
  T,
  ReWrap<ParseDataType<U>>
>;

type AssertValidator<T, V extends (data: unknown) => data is any> = V extends (
  data: unknown,
) => data is infer R ? AssertEqual<T, R>
  : AssertionFailed<"Given type is not a assertion function", { T: T; V: V }>;

/**
 * A dummy function for asserting the type T provided is equal to
 * `true`
 */
const assert = <V extends True>() => {};

describe("createFastValidator", () => {
  describe("for primitives", () => {
    it("should validate against a string", () => {
      const typeDef = Type.String;

      type ExpectedType = string;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      assert<AssertValidator<string, typeof validate>>();

      expect(validate("foo")).toEqual(true);

      expect(validate(null)).toEqual(false);
      expect(validate(undefined)).toEqual(false);
      expect(validate(1)).toEqual(false);
      expect(validate(false)).toEqual(false);
      expect(validate(Symbol())).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });

    it("should validate against a number", () => {
      const typeDef = Type.Number;

      type ExpectedType = number;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate(1)).toEqual(true);
      expect(validate(1.1805916207174113e21)).toEqual(true);
      expect(validate(0xff)).toEqual(true);

      expect(validate(null)).toEqual(false);
      expect(validate(NaN)).toEqual(false);
      expect(validate(undefined)).toEqual(false);
      expect(validate("foo")).toEqual(false);
      expect(validate(false)).toEqual(false);
      expect(validate(Symbol())).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });

    it("should validate against a integer", () => {
      const typeDef = Type.Int;

      type ExpectedType = number;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate(1)).toEqual(true);
      expect(validate(543.0)).toEqual(true);
      expect(validate(1.1805916207174113e21)).toEqual(true);
      expect(validate(0xff)).toEqual(true);

      expect(validate(1.2)).toEqual(false);
      expect(validate(0.9)).toEqual(false);
      expect(validate(NaN)).toEqual(false);
      expect(validate(null)).toEqual(false);
      expect(validate(undefined)).toEqual(false);
      expect(validate("foo")).toEqual(false);
      expect(validate(false)).toEqual(false);
      expect(validate(Symbol())).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });

    it("should validate against a boolean", () => {
      const typeDef = Type.Boolean;

      type ExpectedType = boolean;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate(false)).toEqual(true);
      expect(validate(true)).toEqual(true);

      expect(validate(null)).toEqual(false);
      expect(validate(undefined)).toEqual(false);
      expect(validate(1)).toEqual(false);
      expect(validate("foo")).toEqual(false);
      expect(validate(Symbol())).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });

    it("should validate against a symbol", () => {
      const typeDef = Type.Symbol;

      type ExpectedType = symbol;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate(Symbol())).toEqual(true);

      expect(validate(null)).toEqual(false);
      expect(validate(undefined)).toEqual(false);
      expect(validate(1)).toEqual(false);
      expect(validate("foo")).toEqual(false);
      expect(validate(false)).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });

    it("should validate against a null", () => {
      const typeDef = Type.Null;

      type ExpectedType = null;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate(null)).toEqual(true);

      expect(validate(undefined)).toEqual(false);
      expect(validate("foo")).toEqual(false);
      expect(validate(1)).toEqual(false);
      expect(validate(false)).toEqual(false);
      expect(validate(Symbol())).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });

    it("should validate against a undefined", () => {
      const typeDef = Type.Undefined;

      type ExpectedType = undefined;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate(undefined)).toEqual(true);

      expect(validate(null)).toEqual(false);
      expect(validate("foo")).toEqual(false);
      expect(validate(1)).toEqual(false);
      expect(validate(false)).toEqual(false);
      expect(validate(Symbol())).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });

    it("should validate against unknown", () => {
      const typeDef = Type.Unknown;

      type ExpectedType = unknown;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate(null)).toEqual(true);
      expect(validate(undefined)).toEqual(true);
      expect(validate(Symbol())).toEqual(true);
      expect(validate(1)).toEqual(true);
      expect(validate("foo")).toEqual(true);
      expect(validate(false)).toEqual(true);
      expect(validate(() => ["foo"])).toEqual(true);
      expect(validate(["foo"])).toEqual(true);
      expect(validate({ foo: "foo" })).toEqual(true);
      expect(validate(new Set(["foo"]))).toEqual(true);
    });

    it("should validate against a string numeral", () => {
      const typeDef = Type.StringNumeral;

      type ExpectedType = `${number}`;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate("1")).toEqual(true);
      expect(validate("6.12")).toEqual(true);
      expect(validate(".0")).toEqual(true);
      expect(validate(".5")).toEqual(true);
      expect(validate("0.")).toEqual(true);
      expect(validate("2.")).toEqual(true);

      expect(validate(1)).toEqual(false);
      expect(validate(12345)).toEqual(false);
      expect(validate(1.1)).toEqual(false);
      expect(validate(0.1)).toEqual(false);
      expect(validate(1)).toEqual(false);
      expect(validate(1.1805916207174113e21)).toEqual(false);
      expect(validate("1.1805916207174113e+21")).toEqual(false);
      expect(validate("FFF")).toEqual(false);
      expect(validate("A10")).toEqual(false);
      expect(validate(null)).toEqual(false);
      expect(validate(undefined)).toEqual(false);
      expect(validate("foo")).toEqual(false);
      expect(validate(false)).toEqual(false);
      expect(validate(Symbol())).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });

    it("should validate against a string integer", () => {
      const typeDef = Type.StringInt;

      type ExpectedType = `${number}`;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = compileFastValidator(typeDef);

      assert<AssertValidator<ExpectedType, typeof validate>>();

      expect(validate("1")).toEqual(true);
      expect(validate("612")).toEqual(true);

      expect(validate(".0")).toEqual(false);
      expect(validate("8.5")).toEqual(false);
      expect(validate("0.")).toEqual(false);
      expect(validate("2.7")).toEqual(false);
      expect(validate(1)).toEqual(false);
      expect(validate(12345)).toEqual(false);
      expect(validate(1.1)).toEqual(false);
      expect(validate(0.1)).toEqual(false);
      expect(validate(1)).toEqual(false);
      expect(validate(1.1805916207174113e21)).toEqual(false);
      expect(validate("1.1805916207174113e+21")).toEqual(false);
      expect(validate("FFF")).toEqual(false);
      expect(validate("A10")).toEqual(false);
      expect(validate(null)).toEqual(false);
      expect(validate(undefined)).toEqual(false);
      expect(validate("foo")).toEqual(false);
      expect(validate(false)).toEqual(false);
      expect(validate(Symbol())).toEqual(false);
      expect(validate(() => ["foo"])).toEqual(false);
      expect(validate(["foo"])).toEqual(false);
      expect(validate({ foo: "foo" })).toEqual(false);
      expect(validate(new Set(["foo"]))).toEqual(false);
    });
  });

  describe("for complex types", () => {
    describe("for literals", () => {
      it("should validate against a string literal", () => {
        const typeDef = Type.Literal("foo");

        type ExpectedType = "foo";
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("foo")).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate("f")).toEqual(false);
        expect(validate("fo")).toEqual(false);
        expect(validate("fooo")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate(["foo"])).toEqual(false);
        expect(validate(() => "foo")).toEqual(false);
      });

      it("should validate against a numeric literal", () => {
        const typeDef = Type.Literal(69);

        type ExpectedType = 69;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(69)).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(6)).toEqual(false);
        expect(validate(9)).toEqual(false);
        expect(validate(6.9)).toEqual(false);
        expect(validate(0.69)).toEqual(false);
        expect(validate(69.01)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate([69])).toEqual(false);
        expect(validate(() => 69)).toEqual(false);
      });

      it("should validate against a boolean literal", () => {
        const typeDef = Type.Literal(false);

        type ExpectedType = false;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(false)).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(0)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate([false])).toEqual(false);
        expect(validate(() => false)).toEqual(false);
      });
    });

    describe("for unions", () => {
      it("should validate a union of string type", () => {
        const typeDef = Type.OneOf(Type.String);

        type ExpectedType = string;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("foobarbaz")).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate a union of number type", () => {
        const typeDef = Type.OneOf(Type.Number);

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(1)).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate("foobarbaz")).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate a union of boolean type", () => {
        const typeDef = Type.OneOf(Type.Boolean);

        type ExpectedType = boolean;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(true)).toEqual(true);
        expect(validate(false)).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate("foobarbaz")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(0)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate a union of string and numbers", () => {
        const typeDef = Type.OneOf(Type.String, Type.Number);

        type ExpectedType = string | number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("foo")).toEqual(true);
        expect(validate(123)).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
      });

      it("should validate a union of boolean and null", () => {
        const typeDef = Type.OneOf(Type.Boolean, Type.Null);

        type ExpectedType = boolean | null;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(null)).toEqual(true);
        expect(validate(true)).toEqual(true);
        expect(validate(false)).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(123)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
      });

      it("should validate a union of booleans and symbols", () => {
        const typeDef = Type.OneOf(Type.Boolean, Type.Symbol);

        type ExpectedType = boolean | symbol;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(false)).toEqual(true);
        expect(validate(true)).toEqual(true);
        expect(validate(Symbol())).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(123)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate a union of enum value and symbol", () => {
        enum T {
          FOO = "FOO",
          BAR = "BAR",
        }

        const typeDef = Type.OneOf(Type.Enum(T), Type.Symbol);

        type ExpectedType = T | symbol;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(T.FOO)).toEqual(true);
        expect(validate(T.BAR)).toEqual(true);
        expect(validate("FOO")).toEqual(true);
        expect(validate("BAR")).toEqual(true);
        expect(validate(Symbol())).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(123)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate a union of functions, string and numbers", () => {
        const typeDef = Type.OneOf(
          Type.Function,
          Type.String,
          Type.Number,
        );

        type ExpectedType = UnknownFunction | string | number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("foo")).toEqual(true);
        expect(validate(123)).toEqual(true);
        expect(validate(() => {})).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
      });

      it("should validate a union of functions, string and arrays of objects with foo property", () => {
        const typeDef = Type.OneOf(
          Type.Function,
          Type.String,
          Type.Array(
            Type.Record({
              foo: { type: Type.String },
            }),
          ),
        );

        type ExpectedType = UnknownFunction | string | { foo: string }[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("foo")).toEqual(true);
        expect(validate(() => {})).toEqual(true);
        expect(validate([])).toEqual(true);
        expect(validate([{ foo: "foo" }])).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(123)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([[]])).toEqual(false);
        expect(validate([{}])).toEqual(false);
        expect(validate([{ foo: 1 }])).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
      });

      it("should validate for an array of string or array of number", () => {
        const typeDef = Type.OneOf(
          Type.Array(Type.String),
          Type.Array(Type.Number),
        );

        type ExpectedType = string[] | number[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate([])).toEqual(true);
        expect(validate(["foo", "bar", "baz"])).toEqual(true);
        expect(validate([1, 2, 3, 4])).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(["foo", 1])).toEqual(false);
        expect(validate([1, 23, 4, 5, 6, 6, ""])).toEqual(false);
      });

      it("should validate against a union of similar records", () => {
        const typeDef = Type.OneOf(
          Type.Record({
            id: { type: Type.Literal("1") },
            value: { type: Type.Number },
          }),
          Type.Record({
            id: { type: Type.Literal("2") },
            value: { type: Type.String },
          }),
          Type.Record({
            id: { type: Type.Literal("3") },
            value: { type: Type.Boolean },
            otherValue: { type: Type.Null },
          }),
        );

        type ExpectedType =
          | { id: "1"; value: number }
          | { id: "2"; value: string }
          | { id: "3"; value: boolean; otherValue: null };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ id: "1", value: 1 })).toEqual(true);
        expect(validate({ id: "2", value: "2" })).toEqual(true);
        expect(validate({ id: "1", value: 1, otherValue: 123 })).toEqual(true);
        expect(validate({ id: "3", value: true, otherValue: null })).toEqual(
          true,
        );

        expect(validate({ id: "1", value: "2" })).toEqual(false);
        expect(validate({ id: "2", value: 2 })).toEqual(false);
        expect(validate({ id: "3", value: true })).toEqual(false);
        expect(
          validate({ id: "3", value: true, otherValue: undefined }),
        ).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });
    });

    describe("for intersections", () => {
      it("should validate intersection of string and string literal", () => {
        const typeDef = Type.AllOf(
          Type.String,
          Type.Literal("foo"),
        );

        type ExpectedType = string & "foo";
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("foo")).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate("bar")).toEqual(false);
        expect(validate("")).toEqual(false);
      });

      it("should validate intersection of string and string numerals", () => {
        const typeDef = Type.AllOf(Type.String, Type.StringNumeral);

        type ExpectedType = string & `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("1")).toEqual(true);
        expect(validate("123")).toEqual(true);
        expect(validate("123.123")).toEqual(true);

        expect(validate("123.123.123")).toEqual(false);
        expect(validate("a")).toEqual(false);
        expect(validate("1a")).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate("bar")).toEqual(false);
        expect(validate("")).toEqual(false);
      });

      it("should validate intersection of records", () => {
        const typeDef = Type.AllOf(
          Type.Record({
            foo: { type: Type.String },
          }),
          Type.Record({
            bar: { type: Type.Number },
          }),
        );

        type ExpectedType = { foo: string } & { bar: number };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo", bar: 123 })).toEqual(true);

        expect(validate({ foo: "foo" })).toEqual(false);
        expect(validate({ bar: 123 })).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate("bar")).toEqual(false);
        expect(validate("")).toEqual(false);
      });

      it("should validate intersection of records with optional properties", () => {
        const typeDef = Type.AllOf(
          Type.Record({
            foo: { type: Type.String },
          }),
          Type.Record({
            bar: { type: Type.Number, required: false },
          }),
          Type.Record({
            baz: Type.Int,
            qux: { type: Type.Literal("qux"), required: false },
          }),
        );

        type ExpectedType = { foo: string } & { bar?: number } & {
          baz: number;
          qux?: "qux";
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo", baz: 1 })).toEqual(true);
        expect(validate({ foo: "foo", baz: 0, bar: 1.1 })).toEqual(true);
        expect(validate({ foo: "foo", baz: 0, bar: 1.1, qux: "qux" })).toEqual(
          true,
        );
        expect(
          validate({
            foo: "foo",
            baz: 0,
            bar: 1.1,
            qux: "qux",
            randomProp: () => {},
          }),
        ).toEqual(true);

        expect(
          validate({ foo: "foo", baz: false, bar: 1.1, qux: "qux" }),
        ).toEqual(false);
        expect(
          validate({ foo: "foo", baz: 1.02, bar: 1.1, qux: "qux" }),
        ).toEqual(false);
        expect(validate({ foo: 1, baz: 0, bar: 1.1, qux: "qux" })).toEqual(
          false,
        );
        expect(validate({ foo: "foo", baz: 0, bar: 1.1, qux: "quxx" })).toEqual(
          false,
        );
        expect(validate({ baz: 0, bar: 1.1, qux: "qux" })).toEqual(false);
        expect(validate({ foo: "foo", bar: 1.1, qux: "qux" })).toEqual(false);
        expect(validate({ bar: 123 })).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate("bar")).toEqual(false);
        expect(validate("")).toEqual(false);
      });
    });

    describe("for arrays", () => {
      it("should validate against any array when type is unknown", () => {
        const typeDef = Type.Array(Type.Unknown);

        type ExpectedType = unknown[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate([])).toEqual(true);
        expect(validate([1])).toEqual(true);
        expect(validate([""])).toEqual(true);
        expect(validate([true])).toEqual(true);
        expect(validate([Symbol()])).toEqual(true);
        expect(validate([{}])).toEqual(true);
        expect(validate([[]])).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate("")).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate({})).toEqual(false);
      });

      it("should validate against simple array of string", () => {
        const typeDef = Type.Array(Type.String);

        type ExpectedType = string[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate([])).toEqual(true);
        expect(validate(["foo"])).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(["bar", 1])).toEqual(false);
        expect(validate([true])).toEqual(false);
        expect(validate({ 0: "baz" })).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
      });

      it("should validate against simple array of enum values", () => {
        enum T {
          FOO = "FOO",
          BAR = "BAR",
        }
        const typeDef = Type.Array(Type.Enum(T));

        type ExpectedType = T[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate([])).toEqual(true);
        expect(validate([T.BAR])).toEqual(true);
        expect(validate([T.BAR, T.FOO])).toEqual(true);
        expect(validate([T.BAR, "FOO"])).toEqual(true);
        expect(validate(["BAR"])).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(["bar", 1])).toEqual(false);
        expect(validate([true])).toEqual(false);
        expect(validate({ 0: "baz" })).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
      });

      it("should validate against array of functions or booleans", () => {
        const typeDef = Type.Array(Type.Function, Type.Boolean);

        type ExpectedType = Array<UnknownFunction | boolean>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate([true, false])).toEqual(true);
        expect(validate([() => {}])).toEqual(true);
        expect(validate([true, () => {}, false])).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(["bar", 1])).toEqual(false);
        expect(validate([true, 6])).toEqual(false);
        expect(validate([{}, false])).toEqual(false);
        expect(validate({ 0: "baz" })).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
      });

      it("should validate against array of undefined or nulls", () => {
        const typeDef = Type.Array(Type.Null, Type.Undefined);

        type ExpectedType = Array<null | undefined>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate([])).toEqual(true);
        expect(validate([null])).toEqual(true);
        expect(validate([undefined])).toEqual(true);
        expect(validate([null, undefined, null, null])).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate([null, null, null, {}])).toEqual(false);
        expect(validate([() => {}])).toEqual(false);
        expect(validate([true])).toEqual(false);
        expect(validate([false])).toEqual(false);
        expect(validate(["bar", 1])).toEqual(false);
        expect(validate([true, 6])).toEqual(false);
        expect(validate([{}, false])).toEqual(false);
        expect(validate({ 0: "baz" })).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
      });

      it("should validate against nested arrays", () => {
        const typeDef = Type.Array(
          Type.Array(Type.Number),
          Type.Array(Type.Array(Type.String)),
        );

        type ExpectedType = Array<Array<number> | Array<Array<string>>>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate([])).toEqual(true);
        expect(validate([[], [], []])).toEqual(true);
        expect(validate([[], [[]]])).toEqual(true);
        expect(validate([[], [["foo"]]])).toEqual(true);
        expect(validate([[1], [["foo"]]])).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate([[1], [[1]]])).toEqual(false);
        expect(validate([["1"]])).toEqual(false);
        expect(validate([[1], [[[]]]])).toEqual(false);
        expect(validate([[[["asd"]]]])).toEqual(false);
      });
    });

    describe("for tuples", () => {
      it("should validate against simple tuple", () => {
        const typeDef = Type.Tuple(Type.String, Type.Number);

        type ExpectedType = [string, number];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(["foo", 1])).toEqual(true);
        expect(validate(["", 0])).toEqual(true);

        expect(validate(["foo", 1, 2])).toEqual(false);
        expect(validate(["foo", 1, undefined])).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate([, 1])).toEqual(false);
        expect(validate(["foo"])).toEqual(false);
        expect(validate([1, "foo"])).toEqual(false);
        expect(validate(["foo", "1"])).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate([true])).toEqual(false);
        expect(validate({ 0: "baz", 1: 2 })).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate(0)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
      });

      it("should validate against nested tuples", () => {
        const typeDef = Type.Tuple(
          Type.String,
          Type.Tuple(Type.Number, Type.String),
        );

        type ExpectedType = [string, [number, string]];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(["foo", [1, "bar"]])).toEqual(true);

        expect(validate(["foo", [1, "bar", 2]])).toEqual(false);
        expect(validate(["foo", [1, "bar", null], () => {}])).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate([, 1])).toEqual(false);
        expect(validate(["foo"])).toEqual(false);
        expect(validate(["foo", { 0: 1, 2: "foo" }, [1, "bar"]])).toEqual(
          false,
        );
        expect(validate([1, ["foo", "bar"]])).toEqual(false);
        expect(validate(["foo", ["1", "bar"]])).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate([true])).toEqual(false);
        expect(validate({ 0: "baz", 1: 2 })).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate(0)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
      });
    });

    describe("for records", () => {
      it("should not validate null for empty objects", () => {
        const typeDef = Type.Record({});

        type ExpectedType = Record<string, never>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({})).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
      });

      it("should validate for optional properties", () => {
        const typeDef = Type.Record({
          foo: { required: true, type: Type.String },
          bar: { required: false, type: Type.Number },
        });

        type ExpectedType = {
          foo: string;
          bar?: number;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo" })).toEqual(true);
        expect(validate({ foo: "foo", bar: 1 })).toEqual(true);
        expect(validate({ foo: "", bar: undefined })).toEqual(true);

        expect(validate({ foo: "foo", bar: "1" })).toEqual(false);
        expect(validate({ bar: 1 })).toEqual(false);
      });

      it("should validate for optional properties defined with Type.Option", () => {
        const typeDef = Type.Record({
          foo: Type.String,
          bar: Type.Option(Type.Number),
        });

        type ExpectedType = {
          foo: string;
          bar?: number;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo" })).toEqual(true);
        expect(validate({ foo: "foo", bar: 1 })).toEqual(true);

        expect(validate({ foo: "foo", bar: "1" })).toEqual(false);
        expect(validate({ bar: 1 })).toEqual(false);
      });

      it("should validate for simple records", () => {
        const typeDef = Type.Record({
          foo: { type: Type.String },
          bar: { type: Type.Number },
          baz: { type: Type.Unknown },
        });

        type ExpectedType = {
          foo: string;
          bar: number;
          baz: unknown;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo", bar: 123, baz: true })).toEqual(true);
        expect(validate({ foo: "", bar: 0, baz: [] })).toEqual(true);
        expect(validate({ foo: "123", bar: -2, baz: () => {} })).toEqual(true);
        expect(validate({ foo: "123", bar: -2, baz: undefined })).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate({ foo: "foo", bar: "123", baz: true })).toEqual(false);
        expect(validate({ foo: "foo", bar: "123", baz: true })).toEqual(false);
        expect(validate({ foo: false, bar: 1, baz: true })).toEqual(false);
        expect(validate({ foo: "foo", bar: 123 })).toEqual(false);
        expect(validate({ foo: "", baz: undefined })).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(76)).toEqual(false);
        expect(validate({})).toEqual(false);
      });

      it("should validate for nested records", () => {
        enum T {
          FOO = "FOO",
          BAR = "BAR",
        }

        const typeDef = Type.Record({
          foo: { type: Type.String },
          bar: {
            type: Type.Record({
              baz: { type: Type.Number },
              qux: {
                type: Type.Record({
                  corge: { type: Type.Function },
                }),
              },
              thud: { type: Type.EnumMember(T.BAR), required: false },
            }),
          },
        });

        type ExpectedType = {
          foo: string;
          bar: {
            baz: number;
            qux: {
              corge: UnknownFunction;
            };
            thud?: T.BAR;
          };
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(
          validate({
            foo: "foo",
            bar: { baz: 1, qux: { corge: () => {} }, thud: T.BAR },
          }),
        ).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(
          validate({ foo: 0, bar: { baz: 1, qux: { corge: () => {} } } }),
        ).toEqual(false);
        expect(
          validate({ foo: "foo", bar: { baz: 1, qux: { corge: Symbol() } } }),
        ).toEqual(false);
        expect(
          validate({ foo: "foo", bar: { baz: "1", qux: { corge: () => {} } } }),
        ).toEqual(false);
        expect(
          validate({
            foo: "foo",
            bar: { baz: 1, qux: { corge: () => {} }, thud: T.FOO },
          }),
        ).toEqual(false);
        expect(
          validate({
            foo: "foo",
            bar: { baz: 1, qux: { corge: () => {} }, thud: 0 },
          }),
        ).toEqual(false);
      });

      it("should correctly validate against a record with undefined and null properties", () => {
        const typeDef = Type.Record({
          foo: { type: Type.Undefined },
          bar: { type: Type.Null },
        });

        type ExpectedType = {
          foo: undefined;
          bar: null;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: undefined, bar: null })).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate({ foo: undefined })).toEqual(false);
        expect(validate({ bar: null })).toEqual(false);
        expect(validate({ foo: "undefined", bar: "null" })).toEqual(false);
        expect(validate({ foo: "undefined", bar: null })).toEqual(false);
        expect(validate({ foo: undefined, bar: "null" })).toEqual(false);
      });

      it("should correctly parse the new record syntax", () => {
        const typeDef = Type.Record({
          foo: Type.String,
          bar: Type.Array(Type.String, Type.Number),
          baz: Type.Record({
            qux: Type.Boolean,
          }),
          optional: { type: Type.Number, required: false },
        });

        type ExpectedType = {
          foo: string;
          bar: (string | number)[];
          baz: {
            qux: boolean;
          };
          optional?: number;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo", bar: [1], baz: { qux: true } })).toEqual(
          true,
        );
        expect(
          validate({ foo: "", bar: [""], baz: { qux: false }, optional: 10 }),
        ).toEqual(true);
        expect(
          validate({ bar: [""], baz: { qux: false }, optional: 10 }),
        ).toEqual(false);
        expect(
          validate({ foo: 0, bar: [""], baz: { qux: false }, optional: 10 }),
        ).toEqual(false);
        expect(
          validate({ foo: "", baz: { qux: false }, optional: 10 }),
        ).toEqual(false);
        expect(validate({ foo: "", bar: [""], optional: 10 })).toEqual(false);
        expect(
          validate({ foo: "", bar: [""], baz: { qux: false }, optional: "10" }),
        ).toEqual(false);
      });
    });

    describe("for dictionaries", () => {
      it("should not validate null for empty objects", () => {
        const typeDef = Type.Dict(Type.Unknown);

        type ExpectedType = Record<string | number, unknown>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({})).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
      });

      it("should validate for simple dictionaries", () => {
        const typeDef = Type.Dict(Type.String, Type.Number);

        type ExpectedType = Record<string | number, string | number>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo", bar: 123 })).toEqual(true);
        expect(validate({ foo: "", bar: "0", baz: "" })).toEqual(true);
        expect(validate({ foo: 123, bar: -2 })).toEqual(true);
        expect(validate({ foo: "123", bar: -2, baz: "undefined" })).toEqual(
          true,
        );

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate({ foo: "foo", bar: "123", baz: true })).toEqual(false);
        expect(validate({ foo: "foo", bar: "123", baz: true })).toEqual(false);
        expect(validate({ foo: 1, bar: 1, baz: () => 1 })).toEqual(false);
        expect(validate({ foo: "foo", bar: Symbol("1") })).toEqual(false);
        expect(validate({ foo: "", baz: {} })).toEqual(false);
        expect(validate({ foo: "", baz: [] })).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(76)).toEqual(false);
      });

      it("should validate for nested dictionaries", () => {
        enum T {
          FOO = "FOO",
          BAR = "BAR",
        }

        const typeDef = Type.Dict(
          Type.String,
          Type.Record({
            foo: Type.Dict(Type.Dict(Type.EnumMember(T.BAR))),
          }),
        );

        type ExpectedType = Record<
          string | number,
          | string
          | {
            foo: Record<string | number, Record<string | number, T.BAR>>;
          }
        >;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ bar: "bar" })).toEqual(true);
        expect(validate({ bar: { foo: {} } })).toEqual(true);
        expect(validate({ bar: { foo: { dict1: {} } } })).toEqual(true);
        expect(validate({ bar: { foo: { dict1: {} } } })).toEqual(true);
        expect(validate({ bar: { foo: { dict1: { enum: T.BAR } } } })).toEqual(
          true,
        );

        expect(
          validate({
            foo: "foo",
            bar: {
              foo: {
                dict1: { enum: T.BAR },
                dict2: { tbar: T.BAR },
                dict3: { a: T.BAR, b: T.BAR, c: T.BAR },
              },
            },
          }),
        ).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate("undefined")).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate({ bar: 1 })).toEqual(false);
        expect(validate({ bar: null })).toEqual(false);
        expect(validate({ bar: undefined })).toEqual(false);
        expect(validate({ bar: Symbol() })).toEqual(false);
        expect(validate({ bar: () => {} })).toEqual(false);
        expect(validate({ bar: { foo: { a: 1 } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: "1" } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: null } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: undefined } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: Symbol() } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: () => {} } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: { b: 1 } } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: { b: "1" } } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: { b: null } } } })).toEqual(false);
        expect(validate({ bar: { foo: { a: { b: undefined } } } })).toEqual(
          false,
        );
        expect(validate({ bar: { foo: { a: { b: Symbol() } } } })).toEqual(
          false,
        );
        expect(validate({ bar: { foo: { a: { b: () => {} } } } })).toEqual(
          false,
        );
        expect(validate({ bar: { foo: { dict1: { enum: T.FOO } } } })).toEqual(
          false,
        );

        expect(
          validate({
            foo: "foo",
            bar: { foo: { dict1: { enum: 1 } } },
          }),
        ).toEqual(false);
      });
    });

    describe("for sets", () => {
      it("should validate for set of numbers", () => {
        const typeDef = Type.Set(Type.Number);

        type ExpectedType = Set<number>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(new Set())).toEqual(true);
        expect(validate(new Set([1, 2, 3]))).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(new Set([1, 2, 3, ""]))).toEqual(false);
        expect(validate(new Set([true]))).toEqual(false);
        expect(validate(new Set([Symbol()]))).toEqual(false);
        expect(validate(new Set([{}]))).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate for set of functions", () => {
        const typeDef = Type.Set(Type.Function);

        type ExpectedType = Set<UnknownFunction>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(new Set())).toEqual(true);
        expect(validate(new Set([() => {}]))).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(new Set([() => {}, "foo"]))).toEqual(false);
        expect(validate(new Set([true]))).toEqual(false);
        expect(validate(new Set([Symbol()]))).toEqual(false);
        expect(validate(new Set([{}]))).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate for set of symbols or strings", () => {
        const typeDef = Type.Set(Type.Symbol, Type.String);

        type ExpectedType = Set<symbol | string>;
        assert<AssertType<ExpectedType, typeof typeDef>>();
        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(new Set())).toEqual(true);
        expect(validate(new Set([Symbol()]))).toEqual(true);
        expect(validate(new Set(["foo"]))).toEqual(true);
        expect(
          validate(new Set(["symbol", Symbol(), "foo", Symbol()])),
        ).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(new Set(["foo", Symbol(), () => {}]))).toEqual(false);
        expect(validate(new Set([true]))).toEqual(false);
        expect(validate(new Set([123]))).toEqual(false);
        expect(validate(new Set([{}]))).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate for set of records or undefined", () => {
        const typeDef = Type.Set(
          Type.Undefined,
          Type.Record({ foo: { type: Type.String } }),
        );

        type ExpectedType = Set<undefined | { foo: string }>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(new Set())).toEqual(true);
        expect(validate(new Set([undefined]))).toEqual(true);
        expect(validate(new Set([{ foo: "" }]))).toEqual(true);
        expect(validate(new Set([undefined, { foo: "" }, undefined]))).toEqual(
          true,
        );

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(new Set(["foo", Symbol(), () => {}]))).toEqual(false);
        expect(validate(new Set([true]))).toEqual(false);
        expect(validate(new Set([123]))).toEqual(false);
        expect(validate(new Set([{}]))).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate("foo")).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });
    });

    describe("for enums", () => {
      it("should correctly check if the string value is assignable to the enum", () => {
        enum Foo {
          A = "A",
          B = "B",
          C = "C",
        }

        const typeDef = Type.Enum(Foo);

        type ExpectedType = Foo;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(Foo.A)).toEqual(true);
        expect(validate(Foo.B)).toEqual(true);
        expect(validate(Foo.C)).toEqual(true);
        expect(validate("A")).toEqual(true);
        expect(validate("B")).toEqual(true);
        expect(validate("C")).toEqual(true);

        expect(validate(Foo)).toEqual(false);
        expect(validate("D")).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(0)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(2)).toEqual(false);
        expect(validate(3)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
      });

      it("should correctly check if the numeric value is assignable to the enum", () => {
        enum Foo {
          A,
          B,
          C,
        }

        const typeDef = Type.Enum(Foo);

        type ExpectedType = Foo;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(Foo.A)).toEqual(true);
        expect(validate(Foo.B)).toEqual(true);
        expect(validate(Foo.C)).toEqual(true);
        expect(validate(0)).toEqual(true);
        expect(validate(1)).toEqual(true);
        expect(validate(2)).toEqual(true);

        expect(validate(Foo)).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate("A")).toEqual(false);
        expect(validate("B")).toEqual(false);
        expect(validate("C")).toEqual(false);
        expect(validate("D")).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
      });

      it("should correctly parse enum inside a record", () => {
        enum Foo {
          A = "A",
          B = "B",
          C = "C",
        }

        const typeDef = Type.Record({
          myEnum: Type.Enum(Foo),
        });

        type ExpectedType = { myEnum: Foo };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ myEnum: Foo.A })).toEqual(true);
        expect(validate({ myEnum: Foo.B })).toEqual(true);
        expect(validate({ myEnum: Foo.C })).toEqual(true);
        expect(validate({ myEnum: "A" })).toEqual(true);
        expect(validate({ myEnum: "B" })).toEqual(true);
        expect(validate({ myEnum: "C" })).toEqual(true);

        expect(validate({ myEnum: "a" })).toEqual(false);
        expect(validate({ myEnum: "1" })).toEqual(false);
        expect(validate({ myEnum: 0 })).toEqual(false);
      });
    });

    describe("for enum members", () => {
      it("should correctly check if the string value equals to the enum member", () => {
        enum Foo {
          A = "A",
          B = "B",
          C = "C",
        }

        const typeDef = Type.EnumMember(Foo.A);

        type ExpectedType = Foo.A;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(Foo.A)).toEqual(true);
        expect(validate("A")).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(Foo)).toEqual(false);
        expect(validate(Foo.B)).toEqual(false);
        expect(validate(Foo.C)).toEqual(false);
        expect(validate("B")).toEqual(false);
        expect(validate("C")).toEqual(false);
        expect(validate("D")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(2)).toEqual(false);
        expect(validate(3)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
      });

      it("should correctly check if the string value equals to the enum member", () => {
        enum Foo {
          A,
          B,
          C,
        }

        const typeDef = Type.EnumMember(Foo.A);

        type ExpectedType = Foo.A;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(Foo.A)).toEqual(true);
        expect(validate(0)).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(Foo)).toEqual(false);
        expect(validate(Foo.B)).toEqual(false);
        expect(validate(Foo.C)).toEqual(false);
        expect(validate("A")).toEqual(false);
        expect(validate("B")).toEqual(false);
        expect(validate("C")).toEqual(false);
        expect(validate("D")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(2)).toEqual(false);
        expect(validate(3)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
      });
    });

    describe("for class instances", () => {
      it("should correctly check if the value is an instance of the class", () => {
        class Foo {}

        const typeDef = Type.InstanceOf(Foo);

        type ExpectedType = Foo;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(new Foo())).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(Foo)).toEqual(false);
        expect(validate("A")).toEqual(false);
        expect(validate("B")).toEqual(false);
        expect(validate("C")).toEqual(false);
        expect(validate("D")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(2)).toEqual(false);
        expect(validate(3)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
      });

      it("should correctly check if the value is an instance of a builtin class", () => {
        const typeDef = Type.InstanceOf(RegExp);

        type ExpectedType = RegExp;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(/foo/)).toEqual(true);
        expect(validate(new RegExp("foo"))).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(RegExp)).toEqual(false);
        expect(validate("A")).toEqual(false);
        expect(validate(3)).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
      });
    });

    describe("for custom validators", () => {
      it("should validate the value against the custom validator", () => {
        const customValidator = (value: unknown): value is string => {
          return typeof value === "string";
        };

        const typeDef = Type.Record({
          foo: Type.Custom(customValidator),
        });

        type ExpectedType = { foo: string };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "bar" })).toEqual(true);

        expect(validate({ foo: 1 })).toEqual(false);
        expect(validate({ foo: null })).toEqual(false);
        expect(validate({ foo: undefined })).toEqual(false);
        expect(validate({ foo: true })).toEqual(false);
        expect(validate({ foo: false })).toEqual(false);
        expect(validate({ foo: Symbol() })).toEqual(false);
        expect(validate({ foo: () => {} })).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate("bar")).toEqual(false);
        expect(validate("")).toEqual(false);
      });

      it("should propagate errors thrown within the custom validator", () => {
        const customValidator = (value: unknown): value is string => {
          throw new Error("foo");
        };

        const typeDef = Type.Record({
          foo: Type.Custom(customValidator),
        });

        type ExpectedType = { foo: string };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(() => validate({ foo: "bar" })).toThrowError("foo");
      });
    });

    describe("for string matching pattern", () => {
      it("should validate the string against the pattern", () => {
        const typeDef = Type.StringMatching(/^foo/);

        type ExpectedType = string;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("foobar")).toEqual(true);
        expect(validate("foo")).toEqual(true);
        expect(validate("foo bar")).toEqual(true);

        expect(validate("bar")).toEqual(false);
        expect(validate("barfoo")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });

      it("should validate the string against the pattern and assert the type", () => {
        const typeDef = Type.StringMatching<`bar.${string}`>(/^bar\./);

        type ExpectedType = `bar.${string}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = compileFastValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("bar.foo")).toEqual(true);
        expect(validate("bar.")).toEqual(true);

        expect(validate("foo")).toEqual(false);
        expect(validate("bar")).toEqual(false);
        expect(validate("foobar.")).toEqual(false);
        expect(validate("foo.bar.")).toEqual(false);
        expect(validate(1)).toEqual(false);
        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(validate(true)).toEqual(false);
        expect(validate(false)).toEqual(false);
        expect(validate(Symbol())).toEqual(false);
        expect(validate(() => {})).toEqual(false);
        expect(validate({})).toEqual(false);
        expect(validate([])).toEqual(false);
      });
    });

    describe("for circular types, it correctly validates", () => {
      describe("a record", () => {
        it("scenario 1", () => {
          const typeDef = Type.Recursive((self) =>
            Type.Record({
              foo: Type.String,
              bar: Type.Array(self),
            })
          );

          type ExpectedType = {
            foo: string;
            bar: {
              foo: string;
              bar: {
                foo: string;
                bar: {
                  foo: string;
                  bar: any[];
                }[];
              }[];
            }[];
          };
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              foo: "foo",
              bar: [],
            }),
          ).toEqual(true);
          expect(
            validate({
              foo: "foo",
              bar: [
                {
                  foo: "foo",
                  bar: [],
                },
              ],
            }),
          ).toEqual(true);
          expect(
            validate({
              foo: "foo",
              bar: [
                {
                  foo: "foo",
                  bar: [
                    {
                      foo: "foo",
                      bar: [],
                    },
                  ],
                },
                {
                  foo: "foo",
                  bar: [
                    {
                      foo: "foo",
                      bar: [],
                    },
                  ],
                },
              ],
            }),
          ).toEqual(true);

          expect(
            validate({
              foo: "foo",
              bar: [
                {
                  foo: "foo",
                  bar: [
                    {
                      foo: "foo",
                      bar: [],
                    },
                  ],
                },
                {
                  foo: "foo",
                  bar: [
                    {
                      foo: "foo",
                      bar: [1],
                    },
                  ],
                },
              ],
            }),
          ).toEqual(false);
          expect(
            validate({
              foo: "foo",
              bar: [
                {
                  foo: "foo",
                  bar: [
                    {
                      foo: "foo",
                      bar: [
                        {
                          foo: "foo",
                          bar: [
                            {
                              foo: 1,
                              bar: [],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            }),
          ).toEqual(false);
          expect(
            validate({
              foo: "foo",
              bar: [""],
            }),
          ).toEqual(false);
          expect(
            validate({
              foo: "foo",
            }),
          ).toEqual(false);
          expect(validate({})).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(true)).toEqual(false);
          expect(validate(false)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });

        it("scenario 2", () => {
          const typeDef = Type.Record({
            foo: Type.String,
            bar: Type.Recursive((self) =>
              Type.Record({
                baz: Type.Dict(self),
              })
            ),
          });

          type ExpectedType = {
            foo: string;
            bar: {
              baz: Record<
                string | number,
                {
                  baz: Record<
                    string | number,
                    {
                      baz: Record<
                        string | number,
                        {
                          baz: any;
                        }
                      >;
                    }
                  >;
                }
              >;
            };
          };
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              foo: "foo",
              bar: {
                baz: {},
              },
            }),
          ).toEqual(true);
          expect(
            validate({
              foo: "foo",
              bar: {
                baz: {
                  foo: {
                    baz: {
                      foo: {
                        baz: {
                          a: { baz: {} },
                          b: { baz: {} },
                          c: { baz: {} },
                        },
                      },
                    },
                  },
                },
              },
            }),
          ).toEqual(true);

          expect(validate({})).toEqual(false);
          expect(validate({ foo: "" })).toEqual(false);
          expect(validate({ bar: { baz: {} } })).toEqual(false);
          expect(validate({ foo: "", bar: {} })).toEqual(false);
          expect(
            validate({
              foo: "",
              bar: {
                baz: {
                  foo: {
                    baz: {
                      foo: {
                        baz: {
                          a: 1,
                        },
                      },
                    },
                  },
                },
              },
            }),
          ).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(true)).toEqual(false);
          expect(validate(false)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });

        it("scenario 3", () => {
          const typeDef = Type.Record({
            foo: Type.Recursive((self) => Type.Set(self, Type.String)),
          });

          type ExpectedType = {
            foo: Set<string | Set<string | Set<string | Set<any>>>>;
          };
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              foo: new Set(),
            }),
          ).toEqual(true);
          expect(
            validate({
              foo: new Set(["foo"]),
            }),
          ).toEqual(true);
          expect(
            validate({
              foo: new Set([
                new Set([
                  new Set([new Set([new Set([new Set([""]), ""]), ""]), ""]),
                  "",
                ]),
                "",
              ]),
            }),
          ).toEqual(true);

          expect(validate({})).toEqual(false);
          expect(validate({ foo: new Set([1]) })).toEqual(false);
          expect(
            validate({
              foo: new Set([
                new Set([
                  new Set([new Set([new Set([new Set([true]), ""]), ""]), ""]),
                  "",
                ]),
                "",
              ]),
            }),
          ).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(true)).toEqual(false);
          expect(validate(false)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });

        it("scenario 5", () => {
          const typeDef = Type.Recursive((self) =>
            Type.Record({
              a: Type.Option(
                Type.Record({
                  b: Type.Option(
                    Type.Record({
                      ref: Type.Option(self),
                    }),
                  ),
                }),
              ),
            })
          );

          type ExpectedType = {
            a?: {
              b?: {
                ref?: {
                  a?: {
                    b?: {
                      ref?: {
                        a?: {
                          b?: {
                            ref?: {
                              a?: {
                                b?: {
                                  ref?: any;
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };

          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({})).toEqual(true);
          expect(validate({ a: {} })).toEqual(true);
          expect(validate({ a: { b: {} } })).toEqual(true);
          expect(validate({ a: { b: { ref: {} } } })).toEqual(true);
          expect(validate({ a: { b: { ref: { a: {} } } } })).toEqual(true);
          expect(validate({ a: { b: { ref: { a: { b: {} } } } } })).toEqual(
            true,
          );
          expect(
            validate({ a: { b: { ref: { a: { b: { ref: {} } } } } } }),
          ).toEqual(true);
          expect(validate({ a: { b: { ref: undefined } } })).toEqual(true);

          expect(validate({ a: [] })).toEqual(false);
          expect(validate({ a: { b: 1 } })).toEqual(false);
          expect(validate({ a: { b: { ref: 0 } } })).toEqual(false);
          expect(
            validate({ a: { b: { ref: { a: { b: { ref: "" } } } } } }),
          ).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate(0)).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(true)).toEqual(false);
          expect(validate(false)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });
      });

      describe("a dict", () => {
        it("scenario 1", () => {
          const typeDef = Type.Recursive((self) =>
            Type.Dict(Type.Number, self, Type.Symbol)
          );

          type ExpectedType = Record<
            string | number,
            | number
            | Record<
              string | number,
              | number
              | Record<
                string | number,
                | number
                | Record<string | number, number | never | symbol>
                | symbol
              >
              | symbol
            >
            | symbol
          >;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({})).toEqual(true);
          expect(validate({ a: 1 })).toEqual(true);
          expect(validate({ a: { b: 2 }, c: Symbol() })).toEqual(true);
          expect(
            validate({
              a: {
                b: {
                  c: {
                    d: {
                      e: {
                        f: Symbol("F"),
                        g: 3,
                        h: Symbol("H"),
                        i: 5,
                        j: 1e10,
                        k: Symbol("K"),
                      },
                    },
                  },
                },
              },
            }),
          ).toEqual(true);

          expect(validate({ a: "foo" })).toEqual(false);
          expect(validate({ a: { b: "foo" } })).toEqual(false);
          expect(
            validate({
              a: {
                b: {
                  c: {
                    d: {
                      e: {
                        f: Symbol("F"),
                        g: 3,
                        h: Symbol("H"),
                        i: 5,
                        j: NaN,
                        k: Symbol("K"),
                      },
                    },
                  },
                },
              },
            }),
          ).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(true)).toEqual(false);
          expect(validate(false)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });

        it("scenario 2", () => {
          const typeDef = Type.Recursive((self) =>
            Type.Dict(
              Type.Record({
                foo: Type.OneOf(Type.String, Type.Array(self)),
              }),
            )
          );

          type ExpectedType = Record<
            string | number,
            {
              foo:
                | string
                | Array<
                  Record<
                    string | number,
                    {
                      foo:
                        | string
                        | Array<
                          Record<
                            string | number,
                            {
                              foo:
                                | string
                                | Array<
                                  Record<
                                    string | number,
                                    { foo: string | Array<any> }
                                  >
                                >;
                            }
                          >
                        >;
                    }
                  >
                >;
            }
          >;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              a: {
                foo: "1",
              },
              b: { foo: [] },
            }),
          ).toEqual(true);
          expect(
            validate({
              a: {
                foo: "1",
              },
              b: {
                foo: [
                  {
                    c: {
                      foo: "2",
                    },
                    d: {
                      foo: [],
                    },
                  },
                ],
              },
            }),
          ).toEqual(true);
          expect(
            validate({
              a: {
                foo: [
                  {
                    b: {
                      foo: [
                        {
                          c: { foo: [{ d: { foo: [{ e: { foo: "" } }] } }] },
                        },
                      ],
                    },
                  },
                ],
              },
            }),
          );

          expect(
            validate({
              a: {},
            }),
          ).toEqual(false);
          expect(
            validate({
              a: {
                foo: 1,
              },
            }),
          ).toEqual(false);
          expect(
            validate({
              a: {
                foo: "1",
              },
              b: {
                foo: [
                  {
                    c: {
                      foo: "2",
                    },
                    d: {
                      foo: [null],
                    },
                  },
                ],
              },
            }),
          ).toEqual(false);
          expect(
            validate({
              a: {
                foo: [
                  {
                    b: {
                      foo: [
                        {
                          c: { foo: [{ d: { foo: [{ e: { foo: null } }] } }] },
                        },
                      ],
                    },
                  },
                ],
              },
            }),
          ).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(true)).toEqual(false);
          expect(validate(false)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });
      });

      describe("a tuple", () => {
        it("scenario 1", () => {
          const typeDef = Type.Recursive((self) =>
            Type.Tuple(
              Type.Number,
              Type.OneOf(Type.Boolean, self),
              Type.String,
            )
          );

          type ExpectedType = [
            number,
            (
              | boolean
              | [
                number,
                boolean | [number, boolean | [number, any, string], string],
                string,
              ]
            ),
            string,
          ];

          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate([1, true, "foo"])).toEqual(true);
          expect(validate([1, [3, false, ""], "foo"])).toEqual(true);
          expect(validate([1, [3, [5, true, "bar"], ""], "foo"])).toEqual(true);
          expect(
            validate([1, [3, [5, [7, true, "bar"], "bar"], ""], "foo"]),
          ).toEqual(true);

          expect(validate([1, "foo", "foo"])).toEqual(false);
          expect(validate([1, [3, "foo", ""], "foo"])).toEqual(false);
          expect(validate([1, [3, [5, [7, true], "bar"], ""], "foo"])).toEqual(
            false,
          );
          expect(
            validate([1, [3, [5, [7, [], ""], "bar"], ""], "foo"]),
          ).toEqual(false);
          expect(
            validate([1, [3, [5, [NaN, true, ""], "bar"], ""], "foo"]),
          ).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(true)).toEqual(false);
          expect(validate(false)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
          expect(validate([])).toEqual(false);
          expect(validate({})).toEqual(false);
        });

        it("scenario 2", () => {
          const typeDef = Type.Tuple(
            Type.Recursive((self) =>
              Type.Set(
                Type.Tuple(
                  Type.Record({
                    a: Type.Boolean,
                    b: Type.Option(self),
                  }),
                ),
              )
            ),
          );

          type ExpectedType = [
            Set<
              [
                {
                  a: boolean;
                  b?: Set<
                    [
                      {
                        a: boolean;
                        b?: Set<
                          [
                            {
                              a: boolean;
                              b?: Set<
                                [
                                  {
                                    a: boolean;
                                    b?: any;
                                  },
                                ]
                              >;
                            },
                          ]
                        >;
                      },
                    ]
                  >;
                },
              ]
            >,
          ];
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate([new Set()])).toEqual(true);
          expect(validate([new Set([[{ a: true }]])])).toEqual(true);
          expect(
            validate([
              new Set([
                [
                  {
                    a: true,
                    b: new Set([
                      [
                        {
                          a: false,
                          b: new Set([
                            [{ a: true, b: new Set([[{ a: false }]]) }],
                          ]),
                        },
                      ],
                    ]),
                  },
                ],
              ]),
            ]),
          ).toEqual(true);

          expect(validate([])).toEqual(false);
          expect(validate([new Set([[{ a: 1 }]])])).toEqual(false);
          expect(validate([new Set([[{ a: true, b: "" }]])])).toEqual(false);
          expect(validate([new Set([[{ a: true, b: [] }]])])).toEqual(false);
          expect(
            validate([
              new Set([
                [
                  {
                    a: true,
                    b: new Set([
                      [
                        {
                          a: false,
                          b: new Set([[{ a: true, b: new Set([[{}]]) }]]),
                        },
                      ],
                    ]),
                  },
                ],
              ]),
            ]),
          ).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(true)).toEqual(false);
          expect(validate(false)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
          expect(validate([])).toEqual(false);
          expect(validate({})).toEqual(false);
        });
      });

      describe("a union", () => {
        it("scenario 1", () => {
          const typeDef = Type.Recursive((self) =>
            Type.OneOf(
              Type.Number,
              Type.Boolean,
              Type.String,
              Type.Array(self),
            )
          );

          type ExpectedType =
            | number
            | boolean
            | string
            | Array<
              | number
              | boolean
              | string
              | Array<
                | number
                | boolean
                | string
                | Array<number | boolean | string | Array<any>>
              >
            >;

          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate(1)).toEqual(true);
          expect(validate(true)).toEqual(true);
          expect(validate("foo")).toEqual(true);
          expect(validate([])).toEqual(true);
          expect(validate([[[[[[[[[[[[]]]]]]]]]]]])).toEqual(true);
          expect(validate([1, true, "foo"])).toEqual(true);
          expect(validate([[1, true, "foo"]])).toEqual(true);
          expect(validate([[[1, true, "foo"]]])).toEqual(true);
          expect(validate([[[[1, true, "foo"]]]])).toEqual(true);
          expect(
            validate([
              [[[1, true, "foo"], 2, false, "bar"], "baz", 3, 6],
              "",
              "",
              12e21,
            ]),
          ).toEqual(true);

          expect(
            validate([
              [
                [[1, true, "foo"], 2, false, "bar"],
                "baz",
                3,
                6,
                [[[[[() => {}]]]]],
              ],
              "",
              "",
              12e21,
            ]),
          ).toEqual(false);
          expect(validate([null])).toEqual(false);
          expect(validate([[[[[[[[[[[[NaN]]]]]]]]]]]])).toEqual(false);
          expect(validate({})).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });

        it("scenario 2", () => {
          const typeDef = Type.OneOf(
            Type.Number,
            Type.Boolean,
            Type.String,
            Type.Recursive((self) =>
              Type.Array(
                Type.OneOf(Type.Number, Type.StringNumeral, self),
              )
            ),
          );

          type ExpectedType =
            | number
            | boolean
            | string
            | Array<
              | number
              | `${number}`
              | Array<
                | number
                | `${number}`
                | Array<
                  | number
                  | `${number}`
                  | Array<number | `${number}` | Array<any>>
                >
              >
            >;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate(1)).toEqual(true);
          expect(validate(true)).toEqual(true);
          expect(validate("foo")).toEqual(true);
          expect(validate([])).toEqual(true);
          expect(validate([[[[[[[[[[[[]]]]]]]]]]]])).toEqual(true);
          expect(validate([1, "2"])).toEqual(true);
          expect(validate([[3, "1.2"]])).toEqual(true);
          expect(validate([[[5, "1234"]]])).toEqual(true);
          expect(validate([[[[123, "12.345"]]]])).toEqual(true);
          expect(
            validate([[[[1, "0"], 2, "1"], "2", 3, 6], "3", "4", 12e21]),
          ).toEqual(true);

          expect(
            validate([
              [[[1, "0"], 2, "1", [[[""]]]], "2", 3, 6],
              "3",
              "4",
              12e21,
            ]),
          ).toEqual(false);
          expect(validate([null])).toEqual(false);
          expect(validate([[[[[[[[[[[[NaN]]]]]]]]]]]])).toEqual(false);
          expect(validate({})).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });
      });

      describe("a intersection", () => {
        it("scenario 1", () => {
          const typeDef = Type.Recursive((self) =>
            Type.AllOf(
              Type.Record({
                type: Type.OneOf(
                  Type.Literal("A"),
                  Type.Literal("B"),
                ),
                children: Type.Array(
                  Type.AllOf(
                    self,
                    Type.Record({ name: Type.String }),
                  ),
                ),
              }),
            )
          );

          type ExpectedType = {
            type: "A" | "B";
            children: Array<
              { name: string } & {
                type: "A" | "B";
                children: Array<
                  { name: string } & {
                    type: "A" | "B";
                    children: Array<
                      { name: string } & {
                        type: "A" | "B";
                        children: Array<any>;
                      }
                    >;
                  }
                >;
              }
            >;
          };
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = compileFastValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              type: "A",
              children: [],
            }),
          ).toEqual(true);
          expect(
            validate({
              type: "B",
              children: [
                {
                  name: "foo",
                  type: "A",
                  children: [],
                },
              ],
            }),
          ).toEqual(true);
          expect(
            validate({
              type: "A",
              children: [
                {
                  name: "a",
                  type: "B",
                  children: [
                    {
                      name: "b",
                      type: "A",
                      children: [
                        {
                          name: "bb",
                          type: "B",
                          children: [
                            {
                              name: "aa",
                              type: "A",
                              children: [
                                {
                                  name: "bbb",
                                  type: "B",
                                  children: [
                                    {
                                      name: "aaa",
                                      type: "A",
                                      children: [],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            }),
          ).toEqual(true);

          expect(
            validate({
              type: "A",
            }),
          ).toEqual(false);
          expect(
            validate({
              type: "A",
              children: {},
            }),
          ).toEqual(false);
          expect(
            validate({
              type: "A",
              children: [
                {
                  name: "a",
                  type: "B",
                  children: [
                    {
                      name: "b",
                      type: "A",
                      children: [
                        {
                          name: "bb",
                          type: "B",
                          children: [
                            {
                              name: "aa",
                              type: "A",
                              children: [
                                {
                                  name: "bbb",
                                  type: "B",
                                  children: [
                                    {
                                      name: "aaa",
                                      type: "C",
                                      children: [],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            }),
          ).toEqual(false);
          expect(validate(1)).toEqual(false);
          expect(validate("{}")).toEqual(false);
          expect(validate({})).toEqual(false);
          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate(Symbol())).toEqual(false);
          expect(validate(() => {})).toEqual(false);
        });
      });

      it("self referencing record shouldn't throw the 'Maximum call stack size exceeded' error", () => {
        const typeDef = Type.Recursive((self) =>
          Type.Record({
            tag: Type.String,
            children: Type.Array(self),
          })
        );

        const validate = compileFastValidator(typeDef);

        const data: Infer<typeof typeDef> = {
          tag: "div",
          children: [
            {
              tag: "span",
              children: [],
            },
          ],
        };

        data.children.push(data);
        data.children[0]!.children.push(data);

        const span = data.children[0]!;
        span.children.push(span);

        expect(() => validate(data)).not.toThrowError();
        expect(validate(data)).toEqual(true);
        expect(validate(data)).toEqual(true);

        // @ts-expect-error
        span.children.push({});

        expect(validate(data)).toEqual(false);

        const data2: Infer<typeof typeDef> = {
          tag: "section",
          children: [
            {
              tag: "div",
              children: [
                {
                  tag: "span",
                  children: [],
                },
              ],
            },
          ],
        };

        data2.children[0]!.children[0]!.children.push(data2);
        data2.children[0]!.children.push(data2);

        expect(() => validate(data2)).not.toThrowError();
        expect(validate(data2)).toEqual(true);
      });

      it("multiple neighboring circular types should correctly validate", () => {
        const typeDef = Type.Record({
          a: Type.Recursive((self) =>
            Type.Record({
              tag: Type.String,
              children: Type.Array(self),
            })
          ),
          b: Type.Recursive((self) =>
            Type.Record({
              tag: Type.Number,
            })
          ),
        });

        const validate = compileFastValidator(typeDef);

        const a = {
          tag: "div",
          children: [],
        };

        const data = {
          a: a,
          b: a,
        };

        expect(validate(data)).toEqual(false);

        const typeDef2 = Type.Record({
          a: Type.Recursive((self) =>
            Type.Record({
              tag: Type.String,
              children: Type.Array(self),
              notSelf: Type.Recursive((s) => Type.Record({ foo: Type.String })),
            })
          ),
        });

        const validate2 = compileFastValidator(typeDef2);

        const data2 = {
          a: {
            tag: "div",
            children: [],
            notSelf: {},
          },
        };

        data2.a.notSelf = data2.a;

        expect(validate2(data2)).toEqual(false);
      });
    });
  });
});
