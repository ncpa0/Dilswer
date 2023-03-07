import type { ParseDataType, UnknownFunction } from "@DataTypes/type-utils";
import {
  AnyDataType,
  createValidator,
  DataType,
  OptionalField,
} from "../../src";

const TRUE_SYM = Symbol("true");
type True = typeof TRUE_SYM;

const ASSERTION_FAILED_SYM = Symbol("Type assertion failed.");
type AssertionFailed = typeof ASSERTION_FAILED_SYM;

type IsFailed<T> = AssertionFailed extends T ? true : false;

type AssertEqual<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? T extends object
      ? AssertEqual<keyof T, keyof U>
      : True
    : AssertionFailed
  : AssertionFailed;

type AssertNotFailed<T> = IsFailed<T> extends true ? AssertionFailed : T;

type AssertType<T, U extends AnyDataType> = AssertNotFailed<
  AssertEqual<T, ParseDataType<U>>
>;

type AssertValidator<T, V extends (data: unknown) => boolean> = V extends (
  data: unknown
) => data is infer R
  ? AssertNotFailed<AssertEqual<T, R>>
  : AssertionFailed;

/**
 * A dummy function for asserting the type T provided is equal to
 * `true`
 */
const assert = <V extends True>() => {};

describe("createValidator", () => {
  describe("for primitives", () => {
    it("should validate against a string", () => {
      const typeDef = DataType.String;

      type ExpectedType = string;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.Number;

      type ExpectedType = number;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.Int;

      type ExpectedType = number;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.Boolean;

      type ExpectedType = boolean;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.Symbol;

      type ExpectedType = symbol;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.Null;

      type ExpectedType = null;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.Undefined;

      type ExpectedType = undefined;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.Unknown;

      type ExpectedType = unknown;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.StringNumeral;

      type ExpectedType = `${number}`;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
      const typeDef = DataType.StringInt;

      type ExpectedType = `${number}`;
      assert<AssertType<ExpectedType, typeof typeDef>>();

      const validate = createValidator(typeDef);

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
        const typeDef = DataType.Literal("foo");

        type ExpectedType = "foo";
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.Literal(69);

        type ExpectedType = 69;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.Literal(false);

        type ExpectedType = false;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(DataType.String);

        type ExpectedType = string;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(DataType.Number);

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(DataType.Boolean);

        type ExpectedType = boolean;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(DataType.String, DataType.Number);

        type ExpectedType = string | number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(DataType.Boolean, DataType.Null);

        type ExpectedType = boolean | null;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(DataType.Boolean, DataType.Symbol);

        type ExpectedType = boolean | symbol;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.OneOf(DataType.Enum(T), DataType.Symbol);

        type ExpectedType = T | symbol;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(
          DataType.Function,
          DataType.String,
          DataType.Number
        );

        type ExpectedType = UnknownFunction | string | number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(
          DataType.Function,
          DataType.String,
          DataType.ArrayOf(
            DataType.RecordOf({
              foo: { type: DataType.String },
            })
          )
        );

        type ExpectedType = UnknownFunction | string | { foo: string }[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(
          DataType.ArrayOf(DataType.String),
          DataType.ArrayOf(DataType.Number)
        );

        type ExpectedType = string[] | number[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.OneOf(
          DataType.RecordOf({
            id: { type: DataType.Literal("1") },
            value: { type: DataType.Number },
          }),
          DataType.RecordOf({
            id: { type: DataType.Literal("2") },
            value: { type: DataType.String },
          }),
          DataType.RecordOf({
            id: { type: DataType.Literal("3") },
            value: { type: DataType.Boolean },
            otherValue: { type: DataType.Null },
          })
        );

        type ExpectedType =
          | { id: "1"; value: number }
          | { id: "2"; value: string }
          | { id: "3"; value: boolean; otherValue: null };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ id: "1", value: 1 })).toEqual(true);
        expect(validate({ id: "2", value: "2" })).toEqual(true);
        expect(validate({ id: "1", value: 1, otherValue: 123 })).toEqual(true);
        expect(validate({ id: "3", value: true, otherValue: null })).toEqual(
          true
        );

        expect(validate({ id: "1", value: "2" })).toEqual(false);
        expect(validate({ id: "2", value: 2 })).toEqual(false);
        expect(validate({ id: "3", value: true })).toEqual(false);
        expect(
          validate({ id: "3", value: true, otherValue: undefined })
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
        const typeDef = DataType.AllOf(
          DataType.String,
          DataType.Literal("foo")
        );

        type ExpectedType = string & "foo";
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.AllOf(DataType.String, DataType.StringNumeral);

        type ExpectedType = string & `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.AllOf(
          DataType.RecordOf({
            foo: { type: DataType.String },
          }),
          DataType.RecordOf({
            bar: { type: DataType.Number },
          })
        );

        type ExpectedType = { foo: string } & { bar: number };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.AllOf(
          DataType.RecordOf({
            foo: { type: DataType.String },
          }),
          DataType.RecordOf({
            bar: { type: DataType.Number, required: false },
          }),
          DataType.RecordOf({
            baz: DataType.Int,
            qux: { type: DataType.Literal("qux"), required: false },
          })
        );

        type ExpectedType = { foo: string } & { bar?: number } & {
          baz: number;
          qux?: "qux";
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo", baz: 1 })).toEqual(true);
        expect(validate({ foo: "foo", baz: 0, bar: 1.1 })).toEqual(true);
        expect(validate({ foo: "foo", baz: 0, bar: 1.1, qux: "qux" })).toEqual(
          true
        );
        expect(
          validate({
            foo: "foo",
            baz: 0,
            bar: 1.1,
            qux: "qux",
            randomProp: () => {},
          })
        ).toEqual(true);

        expect(
          validate({ foo: "foo", baz: false, bar: 1.1, qux: "qux" })
        ).toEqual(false);
        expect(
          validate({ foo: "foo", baz: 1.02, bar: 1.1, qux: "qux" })
        ).toEqual(false);
        expect(validate({ foo: 1, baz: 0, bar: 1.1, qux: "qux" })).toEqual(
          false
        );
        expect(validate({ foo: "foo", baz: 0, bar: 1.1, qux: "quxx" })).toEqual(
          false
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
        const typeDef = DataType.ArrayOf(DataType.Unknown);

        type ExpectedType = unknown[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.ArrayOf(DataType.String);

        type ExpectedType = string[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.ArrayOf(DataType.Enum(T));

        type ExpectedType = T[];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.ArrayOf(DataType.Function, DataType.Boolean);

        type ExpectedType = Array<UnknownFunction | boolean>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.ArrayOf(DataType.Null, DataType.Undefined);

        type ExpectedType = Array<null | undefined>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.ArrayOf(
          DataType.ArrayOf(DataType.Number),
          DataType.ArrayOf(DataType.ArrayOf(DataType.String))
        );

        type ExpectedType = Array<Array<number> | Array<Array<string>>>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.Tuple(DataType.String, DataType.Number);

        type ExpectedType = [string, number];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.Tuple(
          DataType.String,
          DataType.Tuple(DataType.Number, DataType.String)
        );

        type ExpectedType = [string, [number, string]];
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(["foo", [1, "bar"]])).toEqual(true);

        expect(validate(["foo", [1, "bar", 2]])).toEqual(false);
        expect(validate(["foo", [1, "bar", null], () => {}])).toEqual(false);
        expect(validate([])).toEqual(false);
        expect(validate([, 1])).toEqual(false);
        expect(validate(["foo"])).toEqual(false);
        expect(validate(["foo", { 0: 1, 2: "foo" }, [1, "bar"]])).toEqual(
          false
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
        const typeDef = DataType.RecordOf({});

        type ExpectedType = Record<string, never>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({})).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
      });

      it("should validate for optional properties", () => {
        const typeDef = DataType.RecordOf({
          foo: { required: true, type: DataType.String },
          bar: { required: false, type: DataType.Number },
        });

        type ExpectedType = {
          foo: string;
          bar?: number;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo" })).toEqual(true);
        expect(validate({ foo: "foo", bar: 1 })).toEqual(true);
        expect(validate({ foo: "", bar: undefined })).toEqual(true);

        expect(validate({ foo: "foo", bar: "1" })).toEqual(false);
        expect(validate({ bar: 1 })).toEqual(false);
      });

      it("should validate for optional properties defined with OptionalField", () => {
        const typeDef = DataType.RecordOf({
          foo: DataType.String,
          bar: OptionalField(DataType.Number),
        });

        type ExpectedType = {
          foo: string;
          bar?: number;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo" })).toEqual(true);
        expect(validate({ foo: "foo", bar: 1 })).toEqual(true);

        expect(validate({ foo: "foo", bar: "1" })).toEqual(false);
        expect(validate({ bar: 1 })).toEqual(false);
      });

      it("should validate for simple records", () => {
        const typeDef = DataType.RecordOf({
          foo: { type: DataType.String },
          bar: { type: DataType.Number },
          baz: { type: DataType.Unknown },
        });

        type ExpectedType = {
          foo: string;
          bar: number;
          baz: unknown;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.RecordOf({
          foo: { type: DataType.String },
          bar: {
            type: DataType.RecordOf({
              baz: { type: DataType.Number },
              qux: {
                type: DataType.RecordOf({
                  corge: { type: DataType.Function },
                }),
              },
              thud: { type: DataType.EnumMember(T.BAR), required: false },
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

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(
          validate({
            foo: "foo",
            bar: { baz: 1, qux: { corge: () => {} }, thud: T.BAR },
          })
        ).toEqual(true);

        expect(validate(null)).toEqual(false);
        expect(validate(undefined)).toEqual(false);
        expect(
          validate({ foo: 0, bar: { baz: 1, qux: { corge: () => {} } } })
        ).toEqual(false);
        expect(
          validate({ foo: "foo", bar: { baz: 1, qux: { corge: Symbol() } } })
        ).toEqual(false);
        expect(
          validate({ foo: "foo", bar: { baz: "1", qux: { corge: () => {} } } })
        ).toEqual(false);
        expect(
          validate({
            foo: "foo",
            bar: { baz: 1, qux: { corge: () => {} }, thud: T.FOO },
          })
        ).toEqual(false);
        expect(
          validate({
            foo: "foo",
            bar: { baz: 1, qux: { corge: () => {} }, thud: 0 },
          })
        ).toEqual(false);
      });

      it("should correctly validate against a record with undefined and null properties", () => {
        const typeDef = DataType.RecordOf({
          foo: { type: DataType.Undefined },
          bar: { type: DataType.Null },
        });

        type ExpectedType = {
          foo: undefined;
          bar: null;
        };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.RecordOf({
          foo: DataType.String,
          bar: DataType.ArrayOf(DataType.String, DataType.Number),
          baz: DataType.RecordOf({
            qux: DataType.Boolean,
          }),
          optional: { type: DataType.Number, required: false },
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

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo", bar: [1], baz: { qux: true } })).toEqual(
          true
        );
        expect(
          validate({ foo: "", bar: [""], baz: { qux: false }, optional: 10 })
        ).toEqual(true);
        expect(
          validate({ bar: [""], baz: { qux: false }, optional: 10 })
        ).toEqual(false);
        expect(
          validate({ foo: 0, bar: [""], baz: { qux: false }, optional: 10 })
        ).toEqual(false);
        expect(
          validate({ foo: "", baz: { qux: false }, optional: 10 })
        ).toEqual(false);
        expect(validate({ foo: "", bar: [""], optional: 10 })).toEqual(false);
        expect(
          validate({ foo: "", bar: [""], baz: { qux: false }, optional: "10" })
        ).toEqual(false);
      });
    });

    describe("for dictionaries", () => {
      it("should not validate null for empty objects", () => {
        const typeDef = DataType.Dict(DataType.Unknown);

        type ExpectedType = Record<string | number, unknown>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({})).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
      });

      it("should validate for simple dictionaries", () => {
        const typeDef = DataType.Dict(DataType.String, DataType.Number);

        type ExpectedType = Record<string | number, string | number>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ foo: "foo", bar: 123 })).toEqual(true);
        expect(validate({ foo: "", bar: "0", baz: "" })).toEqual(true);
        expect(validate({ foo: 123, bar: -2 })).toEqual(true);
        expect(validate({ foo: "123", bar: -2, baz: "undefined" })).toEqual(
          true
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

        const typeDef = DataType.Dict(
          DataType.String,
          DataType.RecordOf({
            foo: DataType.Dict(DataType.Dict(DataType.EnumMember(T.BAR))),
          })
        );

        type ExpectedType = Record<
          string | number,
          | string
          | {
              foo: Record<string | number, Record<string | number, T.BAR>>;
            }
        >;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate({ bar: "bar" })).toEqual(true);
        expect(validate({ bar: { foo: {} } })).toEqual(true);
        expect(validate({ bar: { foo: { dict1: {} } } })).toEqual(true);
        expect(validate({ bar: { foo: { dict1: {} } } })).toEqual(true);
        expect(validate({ bar: { foo: { dict1: { enum: T.BAR } } } })).toEqual(
          true
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
          })
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
          false
        );
        expect(validate({ bar: { foo: { a: { b: Symbol() } } } })).toEqual(
          false
        );
        expect(validate({ bar: { foo: { a: { b: () => {} } } } })).toEqual(
          false
        );
        expect(validate({ bar: { foo: { dict1: { enum: T.FOO } } } })).toEqual(
          false
        );

        expect(
          validate({
            foo: "foo",
            bar: { foo: { dict1: { enum: 1 } } },
          })
        ).toEqual(false);
      });
    });

    describe("for sets", () => {
      it("should validate for set of numbers", () => {
        const typeDef = DataType.SetOf(DataType.Number);

        type ExpectedType = Set<number>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.SetOf(DataType.Function);

        type ExpectedType = Set<UnknownFunction>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.SetOf(DataType.Symbol, DataType.String);

        type ExpectedType = Set<symbol | string>;
        assert<AssertType<ExpectedType, typeof typeDef>>();
        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(new Set())).toEqual(true);
        expect(validate(new Set([Symbol()]))).toEqual(true);
        expect(validate(new Set(["foo"]))).toEqual(true);
        expect(
          validate(new Set(["symbol", Symbol(), "foo", Symbol()]))
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
        const typeDef = DataType.SetOf(
          DataType.Undefined,
          DataType.RecordOf({ foo: { type: DataType.String } })
        );

        type ExpectedType = Set<undefined | { foo: string }>;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate(new Set())).toEqual(true);
        expect(validate(new Set([undefined]))).toEqual(true);
        expect(validate(new Set([{ foo: "" }]))).toEqual(true);
        expect(validate(new Set([undefined, { foo: "" }, undefined]))).toEqual(
          true
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

        const typeDef = DataType.Enum(Foo);

        type ExpectedType = Foo;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.Enum(Foo);

        type ExpectedType = Foo;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.RecordOf({
          myEnum: DataType.Enum(Foo),
        });

        type ExpectedType = { myEnum: Foo };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.EnumMember(Foo.A);

        type ExpectedType = Foo.A;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.EnumMember(Foo.A);

        type ExpectedType = Foo.A;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.InstanceOf(Foo);

        type ExpectedType = Foo;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.InstanceOf(RegExp);

        type ExpectedType = RegExp;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.RecordOf({
          foo: DataType.Custom(customValidator),
        });

        type ExpectedType = { foo: string };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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

        const typeDef = DataType.RecordOf({
          foo: DataType.Custom(customValidator),
        });

        type ExpectedType = { foo: string };
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(() => validate({ foo: "bar" })).toThrowError("foo");
      });
    });

    describe("for string matching pattern", () => {
      it("should validate the string against the pattern", () => {
        const typeDef = DataType.StringMatching(/^foo/);

        type ExpectedType = string;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
        const typeDef = DataType.StringMatching<`bar.${string}`>(/^bar\./);

        type ExpectedType = `bar.${string}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = createValidator(typeDef);

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
          const typeDef = DataType.Circular((self) =>
            DataType.RecordOf({
              foo: DataType.String,
              bar: DataType.ArrayOf(self),
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

          const validate = createValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              foo: "foo",
              bar: [],
            })
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
            })
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
            })
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
            })
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
            })
          ).toEqual(false);
          expect(
            validate({
              foo: "foo",
              bar: [""],
            })
          ).toEqual(false);
          expect(
            validate({
              foo: "foo",
            })
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
          const typeDef = DataType.RecordOf({
            foo: DataType.String,
            bar: DataType.Circular((self) =>
              DataType.RecordOf({
                baz: DataType.Dict(self),
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

          const validate = createValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              foo: "foo",
              bar: {
                baz: {},
              },
            })
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
            })
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
            })
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
          const typeDef = DataType.RecordOf({
            foo: DataType.Circular((self) =>
              DataType.SetOf(self, DataType.String)
            ),
          });

          type ExpectedType = {
            foo: Set<string | Set<string | Set<string | Set<any>>>>;
          };
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = createValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              foo: new Set(),
            })
          ).toEqual(true);
          expect(
            validate({
              foo: new Set(["foo"]),
            })
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
            })
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
            })
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
          const typeDef = DataType.Circular((self) =>
            DataType.RecordOf({
              a: OptionalField(
                DataType.RecordOf({
                  b: OptionalField(
                    DataType.RecordOf({
                      ref: OptionalField(self),
                    })
                  ),
                })
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

          const validate = createValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({})).toEqual(true);
          expect(validate({ a: {} })).toEqual(true);
          expect(validate({ a: { b: {} } })).toEqual(true);
          expect(validate({ a: { b: { ref: {} } } })).toEqual(true);
          expect(validate({ a: { b: { ref: { a: {} } } } })).toEqual(true);
          expect(validate({ a: { b: { ref: { a: { b: {} } } } } })).toEqual(
            true
          );
          expect(
            validate({ a: { b: { ref: { a: { b: { ref: {} } } } } } })
          ).toEqual(true);
          expect(validate({ a: { b: { ref: undefined } } })).toEqual(true);

          expect(validate({ a: [] })).toEqual(false);
          expect(validate({ a: { b: 1 } })).toEqual(false);
          expect(validate({ a: { b: { ref: 0 } } })).toEqual(false);
          expect(
            validate({ a: { b: { ref: { a: { b: { ref: "" } } } } } })
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
          const typeDef = DataType.Circular((self) =>
            DataType.Dict(DataType.Number, self, DataType.Symbol)
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

          const validate = createValidator(typeDef);

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
            })
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
            })
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
          const typeDef = DataType.Circular((self) =>
            DataType.Dict(
              DataType.RecordOf({
                foo: DataType.OneOf(DataType.String, DataType.ArrayOf(self)),
              })
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

          const validate = createValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              a: {
                foo: "1",
              },
              b: { foo: [] },
            })
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
            })
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
            })
          );

          expect(
            validate({
              a: {},
            })
          ).toEqual(false);
          expect(
            validate({
              a: {
                foo: 1,
              },
            })
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
            })
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
            })
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
          const typeDef = DataType.Circular((self) =>
            DataType.Tuple(
              DataType.Number,
              DataType.OneOf(DataType.Boolean, self),
              DataType.String
            )
          );

          type ExpectedType = [
            number,
            (
              | boolean
              | [
                  number,
                  boolean | [number, boolean | [number, any, string], string],
                  string
                ]
            ),
            string
          ];

          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = createValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate([1, true, "foo"])).toEqual(true);
          expect(validate([1, [3, false, ""], "foo"])).toEqual(true);
          expect(validate([1, [3, [5, true, "bar"], ""], "foo"])).toEqual(true);
          expect(
            validate([1, [3, [5, [7, true, "bar"], "bar"], ""], "foo"])
          ).toEqual(true);

          expect(validate([1, "foo", "foo"])).toEqual(false);
          expect(validate([1, [3, "foo", ""], "foo"])).toEqual(false);
          expect(validate([1, [3, [5, [7, true], "bar"], ""], "foo"])).toEqual(
            false
          );
          expect(
            validate([1, [3, [5, [7, [], ""], "bar"], ""], "foo"])
          ).toEqual(false);
          expect(
            validate([1, [3, [5, [NaN, true, ""], "bar"], ""], "foo"])
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
          const typeDef = DataType.Tuple(
            DataType.Circular((self) =>
              DataType.SetOf(
                DataType.Tuple(
                  DataType.RecordOf({
                    a: DataType.Boolean,
                    b: OptionalField(self),
                  })
                )
              )
            )
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
                                  }
                                ]
                              >;
                            }
                          ]
                        >;
                      }
                    ]
                  >;
                }
              ]
            >
          ];
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = createValidator(typeDef);

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
            ])
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
            ])
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
          const typeDef = DataType.Circular((self) =>
            DataType.OneOf(
              DataType.Number,
              DataType.Boolean,
              DataType.String,
              DataType.ArrayOf(self)
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

          const validate = createValidator(typeDef);

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
            ])
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
            ])
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
          const typeDef = DataType.OneOf(
            DataType.Number,
            DataType.Boolean,
            DataType.String,
            DataType.Circular((self) =>
              DataType.ArrayOf(
                DataType.OneOf(DataType.Number, DataType.StringNumeral, self)
              )
            )
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

          const validate = createValidator(typeDef);

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
            validate([[[[1, "0"], 2, "1"], "2", 3, 6], "3", "4", 12e21])
          ).toEqual(true);

          expect(
            validate([
              [[[1, "0"], 2, "1", [[[""]]]], "2", 3, 6],
              "3",
              "4",
              12e21,
            ])
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
          const typeDef = DataType.Circular((self) =>
            DataType.AllOf(
              DataType.RecordOf({
                type: DataType.OneOf(
                  DataType.Literal("A"),
                  DataType.Literal("B")
                ),
                children: DataType.ArrayOf(
                  DataType.AllOf(
                    self,
                    DataType.RecordOf({ name: DataType.String })
                  )
                ),
              })
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

          const validate = createValidator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(
            validate({
              type: "A",
              children: [],
            })
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
            })
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
            })
          ).toEqual(true);

          expect(
            validate({
              type: "A",
            })
          ).toEqual(false);
          expect(
            validate({
              type: "A",
              children: {},
            })
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
            })
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
    });
  });
});
