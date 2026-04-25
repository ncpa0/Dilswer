import type {
  Infer,
  InferDType,
  ReWrap,
  UnknownFunction,
} from "@DataTypes/type-utils";
import { describe, expect, it } from "@jest/globals";
import dedent from "dedent";
import { AnyType, Type, validator } from "../../src";

const TRUE_SYM = Symbol("true");
type True = typeof TRUE_SYM;

class AssertionFailed<Reason, Values = never> {
  private _reason!: Reason;
}

type AssertEqual<T, U> = [T] extends [U]
  ? [U] extends [T] ? T extends object ? AssertEqual<keyof T, keyof U>
    : True
  : AssertionFailed<"Values are not equal", [T, U]>
  : AssertionFailed<"Values are not equal", [T, U]>;

type AssertType<T, U extends AnyType> = AssertEqual<
  T,
  ReWrap<InferDType<U>>
>;

type AssertValidator<T, V extends (data: unknown) => data is any> = V extends (
  data: unknown,
) => data is infer R ? AssertEqual<T, R>
  : AssertionFailed<"Given type is not a assertion function", [T, V]>;

/**
 * A dummy function for asserting the type T provided is equal to
 * `true`
 */
const assert = <V extends True>() => {};

describe("createValidator", () => {
  describe("without error msg collecting", () => {
    describe("for primitives", () => {
      it("should validate against a string", () => {
        const typeDef = Type.String;

        type ExpectedType = string;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

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

      it("should validate against a constrained string", () => {
        const typeDefMax = Type.String.len({ max: 6 });
        const typeDefMin = Type.String.len({ min: 6 });
        const typeDefRange = typeDefMax.len({ min: 2 });

        type ExpectedType = string;
        assert<AssertType<ExpectedType, typeof typeDefMax>>();
        assert<AssertType<ExpectedType, typeof typeDefMin>>();
        assert<AssertType<ExpectedType, typeof typeDefRange>>();

        const validateMax = validator(typeDefMax);
        const validateMin = validator(typeDefMin);
        const validateRange = validator(typeDefRange);

        assert<AssertValidator<ExpectedType, typeof validateMax>>();
        assert<AssertValidator<ExpectedType, typeof validateMin>>();
        assert<AssertValidator<ExpectedType, typeof validateRange>>();

        expect(validateMax("")).toEqual(true);
        expect(validateMax("a")).toEqual(true);
        expect(validateMax("ab")).toEqual(true);
        expect(validateMax("abc")).toEqual(true);
        expect(validateMax("abcd")).toEqual(true);
        expect(validateMax("abcde")).toEqual(true);
        expect(validateMax("abcdef")).toEqual(true);

        expect(validateMax("abcdefg")).toEqual(false);
        expect(validateMax("asfh2938erulksdnmf")).toEqual(false);
        expect(validateMax(null)).toEqual(false);
        expect(validateMax(undefined)).toEqual(false);
        expect(validateMax(1)).toEqual(false);
        expect(validateMax(false)).toEqual(false);
        expect(validateMax(Symbol())).toEqual(false);
        expect(validateMax(() => ["foo"])).toEqual(false);
        expect(validateMax(["foo"])).toEqual(false);
        expect(validateMax({ foo: "foo" })).toEqual(false);
        expect(validateMax(new Set(["foo"]))).toEqual(false);

        expect(validateMin("abcdef")).toEqual(true);
        expect(validateMin("abcdefg")).toEqual(true);
        expect(validateMin("asfh2938erulksdnmf")).toEqual(true);

        expect(validateMin("")).toEqual(false);
        expect(validateMin("a")).toEqual(false);
        expect(validateMin("ab")).toEqual(false);
        expect(validateMin("abc")).toEqual(false);
        expect(validateMin("abcd")).toEqual(false);
        expect(validateMin("abcde")).toEqual(false);
        expect(validateMin(null)).toEqual(false);
        expect(validateMin(undefined)).toEqual(false);
        expect(validateMin(1)).toEqual(false);
        expect(validateMin(false)).toEqual(false);
        expect(validateMin(Symbol())).toEqual(false);
        expect(validateMin(() => ["foo"])).toEqual(false);
        expect(validateMin(["foo"])).toEqual(false);
        expect(validateMin({ foo: "foo" })).toEqual(false);
        expect(validateMin(new Set(["foo"]))).toEqual(false);

        expect(validateRange("ab")).toEqual(true);
        expect(validateRange("abc")).toEqual(true);
        expect(validateRange("abcd")).toEqual(true);
        expect(validateRange("abcde")).toEqual(true);
        expect(validateRange("abcdef")).toEqual(true);

        expect(validateRange("abcdefg")).toEqual(false);
        expect(validateRange("")).toEqual(false);
        expect(validateRange("a")).toEqual(false);
        expect(validateRange("asfh2938erulksdnmf")).toEqual(false);
        expect(validateRange(null)).toEqual(false);
        expect(validateRange(undefined)).toEqual(false);
        expect(validateRange(1)).toEqual(false);
        expect(validateRange(false)).toEqual(false);
        expect(validateRange(Symbol())).toEqual(false);
        expect(validateRange(() => ["foo"])).toEqual(false);
        expect(validateRange(["foo"])).toEqual(false);
        expect(validateRange({ foo: "foo" })).toEqual(false);
        expect(validateRange(new Set(["foo"]))).toEqual(false);
      });

      it("should validate against a number", () => {
        const typeDef = Type.Number;

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

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

      it("should validate against a constrained number", () => {
        const defMin5 = Type.Number.min(5);
        const defMax100 = Type.Number.max(100);
        const defRange5to20 = defMin5.max(20);

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof defMin5>>();
        assert<AssertType<ExpectedType, typeof defMax100>>();
        assert<AssertType<ExpectedType, typeof defRange5to20>>();

        const validateMin5 = validator(defMin5);
        const validateMax100 = validator(defMax100);
        const validateRange = validator(defRange5to20);

        assert<AssertValidator<ExpectedType, typeof validateMin5>>();
        assert<AssertValidator<ExpectedType, typeof validateMax100>>();
        assert<AssertValidator<ExpectedType, typeof validateRange>>();

        expect(validateMin5(5)).toEqual(true);
        expect(validateMin5(5.1805916207174113e21)).toEqual(true);
        expect(validateMin5(0xff)).toEqual(true);

        expect(validateMin5(0x04)).toEqual(false);
        expect(validateMin5(1)).toEqual(false);
        expect(validateMin5(-20)).toEqual(false);
        expect(validateMin5(4.99)).toEqual(false);
        expect(validateMin5(null)).toEqual(false);
        expect(validateMin5(NaN)).toEqual(false);
        expect(validateMin5(undefined)).toEqual(false);
        expect(validateMin5("foo")).toEqual(false);
        expect(validateMin5(false)).toEqual(false);
        expect(validateMin5(Symbol())).toEqual(false);
        expect(validateMin5(() => ["foo"])).toEqual(false);
        expect(validateMin5(["foo"])).toEqual(false);
        expect(validateMin5({ foo: "foo" })).toEqual(false);
        expect(validateMin5(new Set(["foo"]))).toEqual(false);

        expect(validateMax100(1)).toEqual(true);
        expect(validateMax100(99)).toEqual(true);
        expect(validateMax100(100)).toEqual(true);
        expect(validateMax100(-2100)).toEqual(true);
        expect(validateMax100(1.1805916207174113e1)).toEqual(true);
        expect(validateMax100(0xf)).toEqual(true);

        expect(validateMax100(1.1805916207174113e21)).toEqual(false);
        expect(validateMax100(101)).toEqual(false);
        expect(validateMax100(100.1)).toEqual(false);
        expect(validateMax100(0xffffff)).toEqual(false);
        expect(validateMax100(null)).toEqual(false);
        expect(validateMax100(NaN)).toEqual(false);
        expect(validateMax100(undefined)).toEqual(false);
        expect(validateMax100("foo")).toEqual(false);
        expect(validateMax100(false)).toEqual(false);
        expect(validateMax100(Symbol())).toEqual(false);
        expect(validateMax100(() => ["foo"])).toEqual(false);
        expect(validateMax100(["foo"])).toEqual(false);
        expect(validateMax100({ foo: "foo" })).toEqual(false);
        expect(validateMax100(new Set(["foo"]))).toEqual(false);

        expect(validateRange(5)).toEqual(true);
        expect(validateRange(10)).toEqual(true);
        expect(validateRange(20)).toEqual(true);
        expect(validateRange(1.1805916207174113e1)).toEqual(true);
        expect(validateRange(0xa)).toEqual(true);

        expect(validateRange(1)).toEqual(false);
        expect(validateRange(1.1805916207174113e21)).toEqual(false);
        expect(validateRange(-100)).toEqual(false);
        expect(validateRange(-0)).toEqual(false);
        expect(validateRange(4.99)).toEqual(false);
        expect(validateRange(100.01)).toEqual(false);
        expect(validateRange(2000)).toEqual(false);
        expect(validateRange(null)).toEqual(false);
        expect(validateRange(NaN)).toEqual(false);
        expect(validateRange(undefined)).toEqual(false);
        expect(validateRange("foo")).toEqual(false);
        expect(validateRange(false)).toEqual(false);
        expect(validateRange(Symbol())).toEqual(false);
        expect(validateRange(() => ["foo"])).toEqual(false);
        expect(validateRange(["foo"])).toEqual(false);
        expect(validateRange({ foo: "foo" })).toEqual(false);
        expect(validateRange(new Set(["foo"]))).toEqual(false);
      });

      it("should validate against a integer", () => {
        const typeDef = Type.Int;

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

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

      it("should validate against a constrained integer", () => {
        const defMin199 = Type.Int.min(199);
        const defMax0 = Type.Int.max(0);
        const defRange = defMax0.min(-100);

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof defMin199>>();
        assert<AssertType<ExpectedType, typeof defMax0>>();
        assert<AssertType<ExpectedType, typeof defRange>>();

        const validateMin = validator(defMin199);
        const validateMax = validator(defMax0);
        const validateRange = validator(defRange);

        assert<AssertValidator<ExpectedType, typeof validateMin>>();
        assert<AssertValidator<ExpectedType, typeof validateMax>>();
        assert<AssertValidator<ExpectedType, typeof validateRange>>();

        expect(validateMin(199)).toEqual(true);
        expect(validateMin(200.0)).toEqual(true);
        expect(validateMin(1.1805916207174113e21)).toEqual(true);
        expect(validateMin(0xfff)).toEqual(true);

        expect(validateMin(198)).toEqual(false);
        expect(validateMin(1)).toEqual(false);
        expect(validateMin(0)).toEqual(false);
        expect(validateMin(-113)).toEqual(false);
        expect(validateMin(-1130)).toEqual(false);
        expect(validateMin(1.2)).toEqual(false);
        expect(validateMin(0.9)).toEqual(false);
        expect(validateMin(NaN)).toEqual(false);
        expect(validateMin(null)).toEqual(false);
        expect(validateMin(undefined)).toEqual(false);
        expect(validateMin("foo")).toEqual(false);
        expect(validateMin(false)).toEqual(false);
        expect(validateMin(Symbol())).toEqual(false);
        expect(validateMin(() => ["foo"])).toEqual(false);
        expect(validateMin(["foo"])).toEqual(false);
        expect(validateMin({ foo: "foo" })).toEqual(false);
        expect(validateMin(new Set(["foo"]))).toEqual(false);

        expect(validateMax(-1)).toEqual(true);
        expect(validateMax(0)).toEqual(true);
        expect(validateMax(-123)).toEqual(true);
        expect(validateMax(-0xff)).toEqual(true);

        expect(validateMax(0.01)).toEqual(false);
        expect(validateMax(1)).toEqual(false);
        expect(validateMax(200)).toEqual(false);
        expect(validateMax(1.2)).toEqual(false);
        expect(validateMax(0.9)).toEqual(false);
        expect(validateMax(NaN)).toEqual(false);
        expect(validateMax(null)).toEqual(false);
        expect(validateMax(undefined)).toEqual(false);
        expect(validateMax("foo")).toEqual(false);
        expect(validateMax(false)).toEqual(false);
        expect(validateMax(Symbol())).toEqual(false);
        expect(validateMax(() => ["foo"])).toEqual(false);
        expect(validateMax(["foo"])).toEqual(false);
        expect(validateMax({ foo: "foo" })).toEqual(false);
        expect(validateMax(new Set(["foo"]))).toEqual(false);

        expect(validateRange(0)).toEqual(true);
        expect(validateRange(-50)).toEqual(true);
        expect(validateRange(-99)).toEqual(true);

        expect(validateRange(2)).toEqual(false);
        expect(validateRange(-101)).toEqual(false);
        expect(validateRange(1.2)).toEqual(false);
        expect(validateRange(0.9)).toEqual(false);
        expect(validateRange(NaN)).toEqual(false);
        expect(validateRange(null)).toEqual(false);
        expect(validateRange(undefined)).toEqual(false);
        expect(validateRange("foo")).toEqual(false);
        expect(validateRange(false)).toEqual(false);
        expect(validateRange(Symbol())).toEqual(false);
        expect(validateRange(() => ["foo"])).toEqual(false);
        expect(validateRange(["foo"])).toEqual(false);
        expect(validateRange({ foo: "foo" })).toEqual(false);
        expect(validateRange(new Set(["foo"]))).toEqual(false);
      });

      it("should validate against a boolean", () => {
        const typeDef = Type.Boolean;

        type ExpectedType = boolean;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

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

        const validate = validator(typeDef);

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

        const validate = validator(typeDef);

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

        const validate = validator(typeDef);

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

        const validate = validator(typeDef);

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

      it("should validate against a string float", () => {
        const typeDef = Type.String.Float;

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("1")).toEqual(true);
        expect(validate("6.12")).toEqual(true);
        expect(validate(".0")).toEqual(true);
        expect(validate(".5")).toEqual(true);
        expect(validate("0.")).toEqual(true);
        expect(validate("2.")).toEqual(true);
        expect(validate("-1")).toEqual(true);
        expect(validate("-6.12")).toEqual(true);
        expect(validate("-.0")).toEqual(true);
        expect(validate("-.5")).toEqual(true);
        expect(validate("-0.")).toEqual(true);
        expect(validate("-2.")).toEqual(true);

        expect(validate("1-")).toEqual(false);
        expect(validate("6.-12")).toEqual(false);
        expect(validate("6-.12")).toEqual(false);
        expect(validate("6-1.12")).toEqual(false);
        expect(validate(".0-")).toEqual(false);
        expect(validate(".-5")).toEqual(false);
        expect(validate("0.-")).toEqual(false);
        expect(validate("2-.")).toEqual(false);
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

      it("should validate against a positive string float", () => {
        const typeDef = Type.String.Float.positive();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("1")).toEqual(true);
        expect(validate("6.12")).toEqual(true);
        expect(validate(".5")).toEqual(true);
        expect(validate("2.")).toEqual(true);

        expect(validate("0.")).toEqual(false);
        expect(validate("0")).toEqual(false);
        expect(validate(".0")).toEqual(false);
        expect(validate("00.00")).toEqual(false);
        expect(validate("0.0")).toEqual(false);
        expect(validate("00.00.")).toEqual(false);
        expect(validate("-0.0.0")).toEqual(false);
        expect(validate("-1")).toEqual(false);
        expect(validate("-6.12")).toEqual(false);
        expect(validate("-.0")).toEqual(false);
        expect(validate("-.5")).toEqual(false);
        expect(validate("-0.")).toEqual(false);
        expect(validate("-2.")).toEqual(false);
        expect(validate("1-")).toEqual(false);
        expect(validate("6.-12")).toEqual(false);
        expect(validate("6-.12")).toEqual(false);
        expect(validate("6-1.12")).toEqual(false);
        expect(validate(".0-")).toEqual(false);
        expect(validate(".-5")).toEqual(false);
        expect(validate("0.-")).toEqual(false);
        expect(validate("2-.")).toEqual(false);
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

      it("should validate against a negative string float", () => {
        const typeDef = Type.String.Float.negative();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("-1")).toEqual(true);
        expect(validate("-6.12")).toEqual(true);
        expect(validate("-.5")).toEqual(true);
        expect(validate("-2.")).toEqual(true);

        expect(validate("-0.")).toEqual(false);
        expect(validate("-.0")).toEqual(false);
        expect(validate("0")).toEqual(false);
        expect(validate("0.0")).toEqual(false);
        expect(validate("00.00")).toEqual(false);
        expect(validate("-0")).toEqual(false);
        expect(validate("-0.0")).toEqual(false);
        expect(validate("-00.00")).toEqual(false);
        expect(validate("00.00.")).toEqual(false);
        expect(validate("-0.0.0")).toEqual(false);
        expect(validate("1")).toEqual(false);
        expect(validate("6.12")).toEqual(false);
        expect(validate(".5")).toEqual(false);
        expect(validate("2.")).toEqual(false);
        expect(validate("1-")).toEqual(false);
        expect(validate("6.-12")).toEqual(false);
        expect(validate("6-.12")).toEqual(false);
        expect(validate("6-1.12")).toEqual(false);
        expect(validate(".0-")).toEqual(false);
        expect(validate(".-5")).toEqual(false);
        expect(validate("0.-")).toEqual(false);
        expect(validate("2-.")).toEqual(false);
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

      it("should validate against a zero string float", () => {
        const typeDef = Type.String.Float.zero();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("0")).toEqual(true);
        expect(validate("000")).toEqual(true);
        expect(validate("0.0")).toEqual(true);
        expect(validate("00.00")).toEqual(true);
        expect(validate(".0")).toEqual(true);
        expect(validate("0.")).toEqual(true);
        expect(validate("0")).toEqual(true);
        expect(validate("-000")).toEqual(true);
        expect(validate("-0.0")).toEqual(true);
        expect(validate("-00.00")).toEqual(true);
        expect(validate("-.0")).toEqual(true);
        expect(validate("-0.")).toEqual(true);
        expect(validate("-.0")).toEqual(true);
        expect(validate("-0.")).toEqual(true);

        expect(validate("1")).toEqual(false);
        expect(validate("6.12")).toEqual(false);
        expect(validate(".5")).toEqual(false);
        expect(validate("2.")).toEqual(false);
        expect(validate("-1")).toEqual(false);
        expect(validate("-6.12")).toEqual(false);
        expect(validate("-.5")).toEqual(false);
        expect(validate("-2.")).toEqual(false);
        expect(validate("1-")).toEqual(false);
        expect(validate("6.-12")).toEqual(false);
        expect(validate("6-.12")).toEqual(false);
        expect(validate("6-1.12")).toEqual(false);
        expect(validate(".0-")).toEqual(false);
        expect(validate(".-5")).toEqual(false);
        expect(validate("0.-")).toEqual(false);
        expect(validate("2-.")).toEqual(false);
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
        const typeDef = Type.String.Int;

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("0000")).toEqual(true);
        expect(validate("1")).toEqual(true);
        expect(validate("612")).toEqual(true);
        expect(validate("0")).toEqual(true);
        expect(validate("-0")).toEqual(true);
        expect(validate("-1")).toEqual(true);
        expect(validate("-612")).toEqual(true);

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

      it("should validate against a positive string integer", () => {
        const typeDef = Type.String.Int.positive();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("1")).toEqual(true);
        expect(validate("612")).toEqual(true);

        expect(validate("0")).toEqual(false);
        expect(validate("0000")).toEqual(false);
        expect(validate("-0")).toEqual(false);
        expect(validate("-1")).toEqual(false);
        expect(validate("-612")).toEqual(false);
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

      it("should validate against a negative string integer", () => {
        const typeDef = Type.String.Int.negative();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("-1")).toEqual(true);
        expect(validate("-612")).toEqual(true);

        expect(validate("-0")).toEqual(false);
        expect(validate("0")).toEqual(false);
        expect(validate("0000")).toEqual(false);
        expect(validate("1")).toEqual(false);
        expect(validate("612")).toEqual(false);
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

      it("should validate against a zero string integer", () => {
        const typeDef = Type.String.Int.zero();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef);

        assert<AssertValidator<ExpectedType, typeof validate>>();

        expect(validate("0000")).toEqual(true);
        expect(validate("0")).toEqual(true);
        expect(validate("-0")).toEqual(true);

        expect(validate("1")).toEqual(false);
        expect(validate("612")).toEqual(false);
        expect(validate("-1")).toEqual(false);
        expect(validate("-612")).toEqual(false);
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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({ id: "1", value: 1 })).toEqual(true);
          expect(validate({ id: "2", value: "2" })).toEqual(true);
          expect(validate({ id: "1", value: 1, otherValue: 123 })).toEqual(
            true,
          );
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

          const validate = validator(typeDef);

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
          const typeDef = Type.AllOf(Type.String, Type.String.Float);

          type ExpectedType = string & `${number}`;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({ foo: "foo", baz: 1 })).toEqual(true);
          expect(validate({ foo: "foo", baz: 0, bar: 1.1 })).toEqual(true);
          expect(validate({ foo: "foo", baz: 0, bar: 1.1, qux: "qux" }))
            .toEqual(
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
          expect(validate({ foo: "foo", baz: 0, bar: 1.1, qux: "quxx" }))
            .toEqual(
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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({ foo: "foo", bar: 123, baz: true })).toEqual(true);
          expect(validate({ foo: "", bar: 0, baz: [] })).toEqual(true);
          expect(validate({ foo: "123", bar: -2, baz: () => {} })).toEqual(
            true,
          );
          expect(validate({ foo: "123", bar: -2, baz: undefined })).toEqual(
            true,
          );

          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate({ foo: "foo", bar: "123", baz: true })).toEqual(
            false,
          );
          expect(validate({ foo: "foo", bar: "123", baz: true })).toEqual(
            false,
          );
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

          const validate = validator(typeDef);

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
            validate({
              foo: "foo",
              bar: { baz: "1", qux: { corge: () => {} } },
            }),
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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({ foo: "foo", bar: [1], baz: { qux: true } }))
            .toEqual(
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
            validate({
              foo: "",
              bar: [""],
              baz: { qux: false },
              optional: "10",
            }),
          ).toEqual(false);
        });
      });

      describe("for dictionaries", () => {
        it("should not validate null for empty objects", () => {
          const typeDef = Type.Dict(Type.Unknown);

          type ExpectedType = Record<string | number, unknown>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({})).toEqual(true);

          expect(validate(undefined)).toEqual(false);
          expect(validate(null)).toEqual(false);
        });

        it("should validate for simple dictionaries", () => {
          const typeDef = Type.Dict(Type.String, Type.Number);

          type ExpectedType = Record<string | number, string | number>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({ foo: "foo", bar: 123 })).toEqual(true);
          expect(validate({ foo: "", bar: "0", baz: "" })).toEqual(true);
          expect(validate({ foo: 123, bar: -2 })).toEqual(true);
          expect(validate({ foo: "123", bar: -2, baz: "undefined" })).toEqual(
            true,
          );

          expect(validate(null)).toEqual(false);
          expect(validate(undefined)).toEqual(false);
          expect(validate({ foo: "foo", bar: "123", baz: true })).toEqual(
            false,
          );
          expect(validate({ foo: "foo", bar: "123", baz: true })).toEqual(
            false,
          );
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

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate({ bar: "bar" })).toEqual(true);
          expect(validate({ bar: { foo: {} } })).toEqual(true);
          expect(validate({ bar: { foo: { dict1: {} } } })).toEqual(true);
          expect(validate({ bar: { foo: { dict1: {} } } })).toEqual(true);
          expect(validate({ bar: { foo: { dict1: { enum: T.BAR } } } }))
            .toEqual(
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
          expect(validate({ bar: { foo: { dict1: { enum: T.FOO } } } }))
            .toEqual(
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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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
          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(validate(new Set())).toEqual(true);
          expect(validate(new Set([undefined]))).toEqual(true);
          expect(validate(new Set([{ foo: "" }]))).toEqual(true);
          expect(validate(new Set([undefined, { foo: "" }, undefined])))
            .toEqual(
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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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
          class Foo {
            private foo = "foo";
            public bar = 123;
          }

          const typeDef = Type.InstanceOf(Foo);
          const validate = validator(typeDef);

          type ExpectedType = Foo;
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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          const validate = validator(typeDef);

          assert<AssertValidator<ExpectedType, typeof validate>>();

          expect(() => validate({ foo: "bar" })).toThrow("foo");
        });
      });

      describe("for string matching pattern", () => {
        it("should validate the string against the pattern", () => {
          const typeDef = Type.String.matching(/^foo/);

          type ExpectedType = string;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef);

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
          const typeDef = Type.String.matching<`bar.${string}`>(/^bar\./);

          type ExpectedType = `bar.${string}`;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef);

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

            const validate = validator(typeDef);

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

            const validate = validator(typeDef);

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

            const validate = validator(typeDef);

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
                    new Set([
                      new Set([new Set([new Set([true]), ""]), ""]),
                      "",
                    ]),
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

            const validate = validator(typeDef);

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

            const validate = validator(typeDef);

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

            const validate = validator(typeDef);

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
                            c: {
                              foo: [{ d: { foo: [{ e: { foo: null } }] } }],
                            },
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

            const validate = validator(typeDef);

            assert<AssertValidator<ExpectedType, typeof validate>>();

            expect(validate([1, true, "foo"])).toEqual(true);
            expect(validate([1, [3, false, ""], "foo"])).toEqual(true);
            expect(validate([1, [3, [5, true, "bar"], ""], "foo"])).toEqual(
              true,
            );
            expect(
              validate([1, [3, [5, [7, true, "bar"], "bar"], ""], "foo"]),
            ).toEqual(true);

            expect(validate([1, "foo", "foo"])).toEqual(false);
            expect(validate([1, [3, "foo", ""], "foo"])).toEqual(false);
            expect(validate([1, [3, [5, [7, true], "bar"], ""], "foo"]))
              .toEqual(
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

            const validate = validator(typeDef);

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

            const validate = validator(typeDef);

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
                  Type.OneOf(Type.Number, Type.String.Float, self),
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

            const validate = validator(typeDef);

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

            const validate = validator(typeDef);

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

          const validate = validator(typeDef);

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

          expect(() => validate(data)).not.toThrow();
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

          expect(() => validate(data2)).not.toThrow();
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

          const validate = validator(typeDef);

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
                notSelf: Type.Recursive((s) =>
                  Type.Record({ foo: Type.String })
                ),
              })
            ),
          });

          const validate2 = validator(typeDef2);

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

  describe("with error msg collecting", () => {
    describe("for primitives", () => {
      it("should validate against a string", () => {
        const typeDef = Type.String;

        type ExpectedType = string;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate("foo").success).toEqual(true);

        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate(0);
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not a string
            Path: $
            Expected: PrimitiveSchema[ string ]
            Got: number
          `);
        }
      });

      it("should validate against a constrained string", () => {
        const typeDefMax = Type.String.len({ max: 6 });
        const typeDefMin = Type.String.len({ min: 6 });
        const typeDefRange = typeDefMax.len({ min: 2 });

        type ExpectedType = string;
        assert<AssertType<ExpectedType, typeof typeDefMax>>();
        assert<AssertType<ExpectedType, typeof typeDefMin>>();
        assert<AssertType<ExpectedType, typeof typeDefRange>>();

        const validateMax = validator(typeDefMax, { details: true });
        const validateMin = validator(typeDefMin, { details: true });
        const validateRange = validator(typeDefRange, { details: true });

        expect(validateMax("").success).toEqual(true);
        expect(validateMax("a").success).toEqual(true);
        expect(validateMax("ab").success).toEqual(true);
        expect(validateMax("abc").success).toEqual(true);
        expect(validateMax("abcd").success).toEqual(true);
        expect(validateMax("abcde").success).toEqual(true);
        expect(validateMax("abcdef").success).toEqual(true);

        expect(validateMax("abcdefg").success).toEqual(false);
        expect(validateMax("asfh2938erulksdnmf").success).toEqual(false);
        expect(validateMax(null).success).toEqual(false);
        expect(validateMax(undefined).success).toEqual(false);
        expect(validateMax(1).success).toEqual(false);
        expect(validateMax(false).success).toEqual(false);
        expect(validateMax(Symbol()).success).toEqual(false);
        expect(validateMax(() => ["foo"]).success).toEqual(false);
        expect(validateMax(["foo"]).success).toEqual(false);
        expect(validateMax({ foo: "foo" }).success).toEqual(false);
        expect(validateMax(new Set(["foo"])).success).toEqual(false);

        expect(validateMin("abcdef").success).toEqual(true);
        expect(validateMin("abcdefg").success).toEqual(true);
        expect(validateMin("asfh2938erulksdnmf").success).toEqual(true);

        expect(validateMin("").success).toEqual(false);
        expect(validateMin("a").success).toEqual(false);
        expect(validateMin("ab").success).toEqual(false);
        expect(validateMin("abc").success).toEqual(false);
        expect(validateMin("abcd").success).toEqual(false);
        expect(validateMin("abcde").success).toEqual(false);
        expect(validateMin(null).success).toEqual(false);
        expect(validateMin(undefined).success).toEqual(false);
        expect(validateMin(1).success).toEqual(false);
        expect(validateMin(false).success).toEqual(false);
        expect(validateMin(Symbol()).success).toEqual(false);
        expect(validateMin(() => ["foo"]).success).toEqual(false);
        expect(validateMin(["foo"]).success).toEqual(false);
        expect(validateMin({ foo: "foo" }).success).toEqual(false);
        expect(validateMin(new Set(["foo"])).success).toEqual(false);

        expect(validateRange("ab").success).toEqual(true);
        expect(validateRange("abc").success).toEqual(true);
        expect(validateRange("abcd").success).toEqual(true);
        expect(validateRange("abcde").success).toEqual(true);
        expect(validateRange("abcdef").success).toEqual(true);

        expect(validateRange("abcdefg").success).toEqual(false);
        expect(validateRange("").success).toEqual(false);
        expect(validateRange("a").success).toEqual(false);
        expect(validateRange("asfh2938erulksdnmf").success).toEqual(false);
        expect(validateRange(null).success).toEqual(false);
        expect(validateRange(undefined).success).toEqual(false);
        expect(validateRange(1).success).toEqual(false);
        expect(validateRange(false).success).toEqual(false);
        expect(validateRange(Symbol()).success).toEqual(false);
        expect(validateRange(() => ["foo"]).success).toEqual(false);
        expect(validateRange(["foo"]).success).toEqual(false);
        expect(validateRange({ foo: "foo" }).success).toEqual(false);
        expect(validateRange(new Set(["foo"])).success).toEqual(false);

        const res = validateRange(0);
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not a string
            Path: $
            Expected: PrimitiveSchema[ string {"min":2,"max":6} ]
            Got: number
          `);
        }
      });

      it("should validate against a number", () => {
        const typeDef = Type.Number;

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate(1).success).toEqual(true);
        expect(validate(1.1805916207174113e21).success).toEqual(true);
        expect(validate(0xff).success).toEqual(true);

        expect(validate(null).success).toEqual(false);
        expect(validate(NaN).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate("0");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not a number
            Path: $
            Expected: PrimitiveSchema[ number ]
            Got: string
          `);
        }
      });

      it("should validate against a constrained number", () => {
        const defMin5 = Type.Number.min(5);
        const defMax100 = Type.Number.max(100);
        const defRange5to20 = defMin5.max(20);

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof defMin5>>();
        assert<AssertType<ExpectedType, typeof defMax100>>();
        assert<AssertType<ExpectedType, typeof defRange5to20>>();

        const validateMin5 = validator(defMin5, { details: true });
        const validateMax100 = validator(defMax100, { details: true });
        const validateRange = validator(defRange5to20, { details: true });

        expect(validateMin5(5).success).toEqual(true);
        expect(validateMin5(5.1805916207174113e21).success).toEqual(true);
        expect(validateMin5(0xff).success).toEqual(true);

        expect(validateMin5(0x04).success).toEqual(false);
        expect(validateMin5(1).success).toEqual(false);
        expect(validateMin5(-20).success).toEqual(false);
        expect(validateMin5(4.99).success).toEqual(false);
        expect(validateMin5(null).success).toEqual(false);
        expect(validateMin5(NaN).success).toEqual(false);
        expect(validateMin5(undefined).success).toEqual(false);
        expect(validateMin5("foo").success).toEqual(false);
        expect(validateMin5(false).success).toEqual(false);
        expect(validateMin5(Symbol()).success).toEqual(false);
        expect(validateMin5(() => ["foo"]).success).toEqual(false);
        expect(validateMin5(["foo"]).success).toEqual(false);
        expect(validateMin5({ foo: "foo" }).success).toEqual(false);
        expect(validateMin5(new Set(["foo"])).success).toEqual(false);

        expect(validateMax100(1).success).toEqual(true);
        expect(validateMax100(99).success).toEqual(true);
        expect(validateMax100(100).success).toEqual(true);
        expect(validateMax100(-2100).success).toEqual(true);
        expect(validateMax100(1.1805916207174113e1).success).toEqual(true);
        expect(validateMax100(0xf).success).toEqual(true);

        expect(validateMax100(1.1805916207174113e21).success).toEqual(false);
        expect(validateMax100(101).success).toEqual(false);
        expect(validateMax100(100.1).success).toEqual(false);
        expect(validateMax100(0xffffff).success).toEqual(false);
        expect(validateMax100(null).success).toEqual(false);
        expect(validateMax100(NaN).success).toEqual(false);
        expect(validateMax100(undefined).success).toEqual(false);
        expect(validateMax100("foo").success).toEqual(false);
        expect(validateMax100(false).success).toEqual(false);
        expect(validateMax100(Symbol()).success).toEqual(false);
        expect(validateMax100(() => ["foo"]).success).toEqual(false);
        expect(validateMax100(["foo"]).success).toEqual(false);
        expect(validateMax100({ foo: "foo" }).success).toEqual(false);
        expect(validateMax100(new Set(["foo"])).success).toEqual(false);

        expect(validateRange(5).success).toEqual(true);
        expect(validateRange(10).success).toEqual(true);
        expect(validateRange(20).success).toEqual(true);
        expect(validateRange(1.1805916207174113e1).success).toEqual(true);
        expect(validateRange(0xa).success).toEqual(true);

        expect(validateRange(1).success).toEqual(false);
        expect(validateRange(1.1805916207174113e21).success).toEqual(false);
        expect(validateRange(-100).success).toEqual(false);
        expect(validateRange(-0).success).toEqual(false);
        expect(validateRange(4.99).success).toEqual(false);
        expect(validateRange(100.01).success).toEqual(false);
        expect(validateRange(2000).success).toEqual(false);
        expect(validateRange(null).success).toEqual(false);
        expect(validateRange(NaN).success).toEqual(false);
        expect(validateRange(undefined).success).toEqual(false);
        expect(validateRange("foo").success).toEqual(false);
        expect(validateRange(false).success).toEqual(false);
        expect(validateRange(Symbol()).success).toEqual(false);
        expect(validateRange(() => ["foo"]).success).toEqual(false);
        expect(validateRange(["foo"]).success).toEqual(false);
        expect(validateRange({ foo: "foo" }).success).toEqual(false);
        expect(validateRange(new Set(["foo"])).success).toEqual(false);

        const res = validateRange("0");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not a number
            Path: $
            Expected: PrimitiveSchema[ number {"min":5,"max":20} ]
            Got: string
          `);
        }
      });

      it("should validate against a integer", () => {
        const typeDef = Type.Int;

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate(1).success).toEqual(true);
        expect(validate(543.0).success).toEqual(true);
        expect(validate(1.1805916207174113e21).success).toEqual(true);
        expect(validate(0xff).success).toEqual(true);

        expect(validate(1.2).success).toEqual(false);
        expect(validate(0.9).success).toEqual(false);
        expect(validate(NaN).success).toEqual(false);
        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate(2.2);
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not an integer
            Path: $
            Expected: PrimitiveSchema[ int ]
            Got: number
          `);
        }
      });

      it("should validate against a constrained integer", () => {
        const defMin199 = Type.Int.min(199);
        const defMax0 = Type.Int.max(0);
        const defRange = defMax0.min(-100);

        type ExpectedType = number;
        assert<AssertType<ExpectedType, typeof defMin199>>();
        assert<AssertType<ExpectedType, typeof defMax0>>();
        assert<AssertType<ExpectedType, typeof defRange>>();

        const validateMin = validator(defMin199, { details: true });
        const validateMax = validator(defMax0, { details: true });
        const validateRange = validator(defRange, { details: true });

        expect(validateMin(199).success).toEqual(true);
        expect(validateMin(200.0).success).toEqual(true);
        expect(validateMin(1.1805916207174113e21).success).toEqual(true);
        expect(validateMin(0xfff).success).toEqual(true);

        expect(validateMin(198).success).toEqual(false);
        expect(validateMin(1).success).toEqual(false);
        expect(validateMin(0).success).toEqual(false);
        expect(validateMin(-113).success).toEqual(false);
        expect(validateMin(-1130).success).toEqual(false);
        expect(validateMin(1.2).success).toEqual(false);
        expect(validateMin(0.9).success).toEqual(false);
        expect(validateMin(NaN).success).toEqual(false);
        expect(validateMin(null).success).toEqual(false);
        expect(validateMin(undefined).success).toEqual(false);
        expect(validateMin("foo").success).toEqual(false);
        expect(validateMin(false).success).toEqual(false);
        expect(validateMin(Symbol()).success).toEqual(false);
        expect(validateMin(() => ["foo"]).success).toEqual(false);
        expect(validateMin(["foo"]).success).toEqual(false);
        expect(validateMin({ foo: "foo" }).success).toEqual(false);
        expect(validateMin(new Set(["foo"])).success).toEqual(false);

        expect(validateMax(-1).success).toEqual(true);
        expect(validateMax(0).success).toEqual(true);
        expect(validateMax(-123).success).toEqual(true);
        expect(validateMax(-0xff).success).toEqual(true);

        expect(validateMax(0.01).success).toEqual(false);
        expect(validateMax(1).success).toEqual(false);
        expect(validateMax(200).success).toEqual(false);
        expect(validateMax(1.2).success).toEqual(false);
        expect(validateMax(0.9).success).toEqual(false);
        expect(validateMax(NaN).success).toEqual(false);
        expect(validateMax(null).success).toEqual(false);
        expect(validateMax(undefined).success).toEqual(false);
        expect(validateMax("foo").success).toEqual(false);
        expect(validateMax(false).success).toEqual(false);
        expect(validateMax(Symbol()).success).toEqual(false);
        expect(validateMax(() => ["foo"]).success).toEqual(false);
        expect(validateMax(["foo"]).success).toEqual(false);
        expect(validateMax({ foo: "foo" }).success).toEqual(false);
        expect(validateMax(new Set(["foo"])).success).toEqual(false);

        expect(validateRange(0).success).toEqual(true);
        expect(validateRange(-50).success).toEqual(true);
        expect(validateRange(-99).success).toEqual(true);

        expect(validateRange(2).success).toEqual(false);
        expect(validateRange(-101).success).toEqual(false);
        expect(validateRange(1.2).success).toEqual(false);
        expect(validateRange(0.9).success).toEqual(false);
        expect(validateRange(NaN).success).toEqual(false);
        expect(validateRange(null).success).toEqual(false);
        expect(validateRange(undefined).success).toEqual(false);
        expect(validateRange("foo").success).toEqual(false);
        expect(validateRange(false).success).toEqual(false);
        expect(validateRange(Symbol()).success).toEqual(false);
        expect(validateRange(() => ["foo"]).success).toEqual(false);
        expect(validateRange(["foo"]).success).toEqual(false);
        expect(validateRange({ foo: "foo" }).success).toEqual(false);
        expect(validateRange(new Set(["foo"])).success).toEqual(false);

        const res = validateRange(2);
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: integer greater than max
            Path: $
            Expected: PrimitiveSchema[ int {"min":-100,"max":0} ]
            Got: number
          `);
        }
      });

      it("should validate against a boolean", () => {
        const typeDef = Type.Boolean;

        type ExpectedType = boolean;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate(false).success).toEqual(true);
        expect(validate(true).success).toEqual(true);

        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate(0);
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not a boolean
            Path: $
            Expected: PrimitiveSchema[ boolean ]
            Got: number
          `);
        }
      });

      it("should validate against a symbol", () => {
        const typeDef = Type.Symbol;

        type ExpectedType = symbol;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate(Symbol()).success).toEqual(true);

        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate(0);
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not a symbol
            Path: $
            Expected: PrimitiveSchema[ symbol ]
            Got: number
          `);
        }
      });

      it("should validate against a null", () => {
        const typeDef = Type.Null;

        type ExpectedType = null;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate(null).success).toEqual(true);

        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate(0);
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not a null
            Path: $
            Expected: PrimitiveSchema[ null ]
            Got: number
          `);
        }
      });

      it("should validate against a undefined", () => {
        const typeDef = Type.Undefined;

        type ExpectedType = undefined;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate(undefined).success).toEqual(true);

        expect(validate(null).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate(0);
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: not a undefined
            Path: $
            Expected: PrimitiveSchema[ undefined ]
            Got: number
          `);
        }
      });

      it("should validate against unknown", () => {
        const typeDef = Type.Unknown;

        type ExpectedType = unknown;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate(null).success).toEqual(true);
        expect(validate(undefined).success).toEqual(true);
        expect(validate(Symbol()).success).toEqual(true);
        expect(validate(1).success).toEqual(true);
        expect(validate("foo").success).toEqual(true);
        expect(validate(false).success).toEqual(true);
        expect(validate(() => ["foo"]).success).toEqual(true);
        expect(validate(["foo"]).success).toEqual(true);
        expect(validate({ foo: "foo" }).success).toEqual(true);
        expect(validate(new Set(["foo"])).success).toEqual(true);
      });

      it("should validate against a string float", () => {
        const typeDef = Type.String.Float;

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate("1").success).toEqual(true);
        expect(validate("6.12").success).toEqual(true);
        expect(validate(".0").success).toEqual(true);
        expect(validate(".5").success).toEqual(true);
        expect(validate("0.").success).toEqual(true);
        expect(validate("2.").success).toEqual(true);
        expect(validate("-1").success).toEqual(true);
        expect(validate("-6.12").success).toEqual(true);
        expect(validate("-.0").success).toEqual(true);
        expect(validate("-.5").success).toEqual(true);
        expect(validate("-0.").success).toEqual(true);
        expect(validate("-2.").success).toEqual(true);

        expect(validate("1-").success).toEqual(false);
        expect(validate("6.-12").success).toEqual(false);
        expect(validate("6-.12").success).toEqual(false);
        expect(validate("6-1.12").success).toEqual(false);
        expect(validate(".0-").success).toEqual(false);
        expect(validate(".-5").success).toEqual(false);
        expect(validate("0.-").success).toEqual(false);
        expect(validate("2-.").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(12345).success).toEqual(false);
        expect(validate(1.1).success).toEqual(false);
        expect(validate(0.1).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(1.1805916207174113e21).success).toEqual(false);
        expect(validate("1.1805916207174113e+21").success).toEqual(false);
        expect(validate("FFF").success).toEqual(false);
        expect(validate("A10").success).toEqual(false);
        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate("A");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: value contained by the string is not a valid float
            Path: $
            Expected: PrimitiveSchema[ string (float) ]
            Got: string
          `);
        }
      });

      it("should validate against a positive string float", () => {
        const typeDef = Type.String.Float.positive();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate("1").success).toEqual(true);
        expect(validate("6.12").success).toEqual(true);
        expect(validate(".5").success).toEqual(true);
        expect(validate("2.").success).toEqual(true);

        expect(validate(".0").success).toEqual(false);
        expect(validate("0.").success).toEqual(false);
        expect(validate("0").success).toEqual(false);
        expect(validate("00.00").success).toEqual(false);
        expect(validate("0.0").success).toEqual(false);
        expect(validate("00.00.").success).toEqual(false);
        expect(validate("-0.0.0").success).toEqual(false);
        expect(validate("-1").success).toEqual(false);
        expect(validate("-6.12").success).toEqual(false);
        expect(validate("-.0").success).toEqual(false);
        expect(validate("-.5").success).toEqual(false);
        expect(validate("-0.").success).toEqual(false);
        expect(validate("-2.").success).toEqual(false);
        expect(validate("1-").success).toEqual(false);
        expect(validate("6.-12").success).toEqual(false);
        expect(validate("6-.12").success).toEqual(false);
        expect(validate("6-1.12").success).toEqual(false);
        expect(validate(".0-").success).toEqual(false);
        expect(validate(".-5").success).toEqual(false);
        expect(validate("0.-").success).toEqual(false);
        expect(validate("2-.").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(12345).success).toEqual(false);
        expect(validate(1.1).success).toEqual(false);
        expect(validate(0.1).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(1.1805916207174113e21).success).toEqual(false);
        expect(validate("1.1805916207174113e+21").success).toEqual(false);
        expect(validate("FFF").success).toEqual(false);
        expect(validate("A10").success).toEqual(false);
        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate("-3");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: value contained by the string is not positive
            Path: $
            Expected: PrimitiveSchema[ string (float) {"positive":true,"negative":false,"zero":false} ]
            Got: string
          `);
        }
      });

      it("should validate against a negative string float", () => {
        const typeDef = Type.String.Float.negative();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate("-1").success).toEqual(true);
        expect(validate("-6.12").success).toEqual(true);
        expect(validate("-.5").success).toEqual(true);
        expect(validate("-2.").success).toEqual(true);

        expect(validate("-.0").success).toEqual(false);
        expect(validate("-0.").success).toEqual(false);
        expect(validate("0").success).toEqual(false);
        expect(validate("0.0").success).toEqual(false);
        expect(validate("00.00").success).toEqual(false);
        expect(validate("-0").success).toEqual(false);
        expect(validate("-0.0").success).toEqual(false);
        expect(validate("-00.00").success).toEqual(false);
        expect(validate("00.00.").success).toEqual(false);
        expect(validate("-0.0.0").success).toEqual(false);
        expect(validate("1").success).toEqual(false);
        expect(validate("6.12").success).toEqual(false);
        expect(validate(".5").success).toEqual(false);
        expect(validate("2.").success).toEqual(false);
        expect(validate("1-").success).toEqual(false);
        expect(validate("6.-12").success).toEqual(false);
        expect(validate("6-.12").success).toEqual(false);
        expect(validate("6-1.12").success).toEqual(false);
        expect(validate(".0-").success).toEqual(false);
        expect(validate(".-5").success).toEqual(false);
        expect(validate("0.-").success).toEqual(false);
        expect(validate("2-.").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(12345).success).toEqual(false);
        expect(validate(1.1).success).toEqual(false);
        expect(validate(0.1).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(1.1805916207174113e21).success).toEqual(false);
        expect(validate("1.1805916207174113e+21").success).toEqual(false);
        expect(validate("FFF").success).toEqual(false);
        expect(validate("A10").success).toEqual(false);
        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate("3");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: value contained by the string is not negative
            Path: $
            Expected: PrimitiveSchema[ string (float) {"positive":false,"negative":true,"zero":false} ]
            Got: string
          `);
        }
      });

      it("should validate against a string integer", () => {
        const typeDef = Type.String.Int;

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate("1").success).toEqual(true);
        expect(validate("612").success).toEqual(true);

        expect(validate(".0").success).toEqual(false);
        expect(validate("8.5").success).toEqual(false);
        expect(validate("0.").success).toEqual(false);
        expect(validate("2.7").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(12345).success).toEqual(false);
        expect(validate(1.1).success).toEqual(false);
        expect(validate(0.1).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(1.1805916207174113e21).success).toEqual(false);
        expect(validate("1.1805916207174113e+21").success).toEqual(false);
        expect(validate("FFF").success).toEqual(false);
        expect(validate("A10").success).toEqual(false);
        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate("1.1");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: value contained by the string is not a valid integer
            Path: $
            Expected: PrimitiveSchema[ string (int) ]
            Got: string
          `);
        }
      });

      it("should validate against a positive string integer", () => {
        const typeDef = Type.String.Int.positive();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate("1").success).toEqual(true);
        expect(validate("612").success).toEqual(true);

        expect(validate("0").success).toEqual(false);
        expect(validate("0000").success).toEqual(false);
        expect(validate("-0").success).toEqual(false);
        expect(validate("-1").success).toEqual(false);
        expect(validate("-612").success).toEqual(false);
        expect(validate(".0").success).toEqual(false);
        expect(validate("8.5").success).toEqual(false);
        expect(validate("0.").success).toEqual(false);
        expect(validate("2.7").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(12345).success).toEqual(false);
        expect(validate(1.1).success).toEqual(false);
        expect(validate(0.1).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(1.1805916207174113e21).success).toEqual(false);
        expect(validate("1.1805916207174113e+21").success).toEqual(false);
        expect(validate("FFF").success).toEqual(false);
        expect(validate("A10").success).toEqual(false);
        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate("-1");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: value contained by the string is not positive
            Path: $
            Expected: PrimitiveSchema[ string (int) {"positive":true,"negative":false,"zero":false} ]
            Got: string
          `);
        }
      });

      it("should validate against a negative string integer", () => {
        const typeDef = Type.String.Int.negative();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate("-1").success).toEqual(true);
        expect(validate("-612").success).toEqual(true);

        expect(validate("0").success).toEqual(false);
        expect(validate("0000").success).toEqual(false);
        expect(validate("-0").success).toEqual(false);
        expect(validate("1").success).toEqual(false);
        expect(validate("612").success).toEqual(false);
        expect(validate(".0").success).toEqual(false);
        expect(validate("8.5").success).toEqual(false);
        expect(validate("0.").success).toEqual(false);
        expect(validate("2.7").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(12345).success).toEqual(false);
        expect(validate(1.1).success).toEqual(false);
        expect(validate(0.1).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(1.1805916207174113e21).success).toEqual(false);
        expect(validate("1.1805916207174113e+21").success).toEqual(false);
        expect(validate("FFF").success).toEqual(false);
        expect(validate("A10").success).toEqual(false);
        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate("1");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: value contained by the string is not negative
            Path: $
            Expected: PrimitiveSchema[ string (int) {"positive":false,"negative":true,"zero":false} ]
            Got: string
          `);
        }
      });

      it("should validate against a zero string integer", () => {
        const typeDef = Type.String.Int.zero();

        type ExpectedType = `${number}`;
        assert<AssertType<ExpectedType, typeof typeDef>>();

        const validate = validator(typeDef, { details: true });

        expect(validate("0000").success).toEqual(true);
        expect(validate("0").success).toEqual(true);
        expect(validate("-0").success).toEqual(true);

        expect(validate("1").success).toEqual(false);
        expect(validate("612").success).toEqual(false);
        expect(validate("-1").success).toEqual(false);
        expect(validate("-612").success).toEqual(false);
        expect(validate(".0").success).toEqual(false);
        expect(validate("8.5").success).toEqual(false);
        expect(validate("0.").success).toEqual(false);
        expect(validate("2.7").success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(12345).success).toEqual(false);
        expect(validate(1.1).success).toEqual(false);
        expect(validate(0.1).success).toEqual(false);
        expect(validate(1).success).toEqual(false);
        expect(validate(1.1805916207174113e21).success).toEqual(false);
        expect(validate("1.1805916207174113e+21").success).toEqual(false);
        expect(validate("FFF").success).toEqual(false);
        expect(validate("A10").success).toEqual(false);
        expect(validate(null).success).toEqual(false);
        expect(validate(undefined).success).toEqual(false);
        expect(validate("foo").success).toEqual(false);
        expect(validate(false).success).toEqual(false);
        expect(validate(Symbol()).success).toEqual(false);
        expect(validate(() => ["foo"]).success).toEqual(false);
        expect(validate(["foo"]).success).toEqual(false);
        expect(validate({ foo: "foo" }).success).toEqual(false);
        expect(validate(new Set(["foo"])).success).toEqual(false);

        const res = validate("-1");
        expect(res.success).toEqual(false);
        if (res.success === false) {
          expect(res.error.details()).toEqual(dedent`
            ValidationError: value contained by the string is not equal to zero
            Path: $
            Expected: PrimitiveSchema[ string (int) {"positive":false,"negative":false,"zero":true} ]
            Got: string
          `);
        }
      });
    });

    describe("for complex types", () => {
      describe("for literals", () => {
        it("should validate against a string literal", () => {
          const typeDef = Type.Literal("foo");

          type ExpectedType = "foo";
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate("foo").success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate("f").success).toEqual(false);
          expect(validate("fo").success).toEqual(false);
          expect(validate("fooo").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate(["foo"]).success).toEqual(false);
          expect(validate(() => "foo").success).toEqual(false);

          const res = validate("-1");
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not equal to the expected literal value
              Path: $
              Expected: LiteralSchema[ foo ]
              Got: string
            `);
          }
        });

        it("should validate against a numeric literal", () => {
          const typeDef = Type.Literal(69);

          type ExpectedType = 69;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(69).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(6).success).toEqual(false);
          expect(validate(9).success).toEqual(false);
          expect(validate(6.9).success).toEqual(false);
          expect(validate(0.69).success).toEqual(false);
          expect(validate(69.01).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate([69]).success).toEqual(false);
          expect(validate(() => 69).success).toEqual(false);
        });

        it("should validate against a boolean literal", () => {
          const typeDef = Type.Literal(false);

          type ExpectedType = false;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(false).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(0).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate([false]).success).toEqual(false);
          expect(validate(() => false).success).toEqual(false);
        });
      });

      describe("for unions", () => {
        it("should validate a union of string type", () => {
          const typeDef = Type.OneOf(Type.String);

          type ExpectedType = string;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate("foobarbaz").success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
        });

        it("should validate a union of number type", () => {
          const typeDef = Type.OneOf(Type.Number);

          type ExpectedType = number;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(1).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate("foobarbaz").success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
        });

        it("should validate a union of boolean type", () => {
          const typeDef = Type.OneOf(Type.Boolean);

          type ExpectedType = boolean;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(true).success).toEqual(true);
          expect(validate(false).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate("foobarbaz").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(0).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
        });

        it("should validate a union of string and numbers", () => {
          const typeDef = Type.OneOf(Type.String, Type.Number);

          type ExpectedType = string | number;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate("foo").success).toEqual(true);
          expect(validate(123).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);

          const res = validate(null);
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              AggregateValidationError: does not match any of the types in the union
              Path: $
              Errors:
                ValidationError: not a string
                Path: $
                Expected: PrimitiveSchema[ string ]
                Got: object

                ValidationError: not a number
                Path: $
                Expected: PrimitiveSchema[ number ]
                Got: object
            `);
          }
        });

        it("should validate a union of boolean and null", () => {
          const typeDef = Type.OneOf(Type.Boolean, Type.Null);

          type ExpectedType = boolean | null;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(null).success).toEqual(true);
          expect(validate(true).success).toEqual(true);
          expect(validate(false).success).toEqual(true);

          expect(validate(undefined).success).toEqual(false);
          expect(validate(123).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
        });

        it("should validate a union of booleans and symbols", () => {
          const typeDef = Type.OneOf(Type.Boolean, Type.Symbol);

          type ExpectedType = boolean | symbol;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(false).success).toEqual(true);
          expect(validate(true).success).toEqual(true);
          expect(validate(Symbol()).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(123).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
        });

        it("should validate a union of enum value and symbol", () => {
          enum T {
            FOO = "FOO",
            BAR = "BAR",
          }

          const typeDef = Type.OneOf(Type.Enum(T), Type.Symbol);

          type ExpectedType = T | symbol;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(T.FOO).success).toEqual(true);
          expect(validate(T.BAR).success).toEqual(true);
          expect(validate("FOO").success).toEqual(true);
          expect(validate("BAR").success).toEqual(true);
          expect(validate(Symbol()).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(123).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
        });

        it("should validate a union of functions, string and numbers", () => {
          const typeDef = Type.OneOf(
            Type.Function,
            Type.String,
            Type.Number,
          );

          type ExpectedType = UnknownFunction | string | number;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate("foo").success).toEqual(true);
          expect(validate(123).success).toEqual(true);
          expect(validate(() => {}).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
        });

        it("should validate a union of object with discriminant", () => {
          const typeDef = Type.OneOf(
            Type.Record({
              foo: Type.Number,
              bar: Type.String,
              type: Type.Literal("a"),
            }),
            Type.Record({
              foo: Type.String,
              baz: Type.String,
              type: Type.Literal("b"),
            }),
            Type.Record({
              foo: Type.Boolean,
              qux: Type.String,
              type: Type.Literal("c"),
            }),
          );

          type ExpectedType = {
            foo: number;
            bar: string;
            type: "a";
          } | {
            foo: string;
            baz: string;
            type: "b";
          } | {
            foo: boolean;
            qux: string;
            type: "c";
          };

          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: 1, bar: "", type: "a" }).success).toEqual(
            true,
          );
          expect(validate({ foo: "1", baz: "", type: "b" }).success).toEqual(
            true,
          );
          expect(validate({ foo: true, qux: "", type: "c" }).success).toEqual(
            true,
          );

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate({ foo: "1", baz: "", type: "a" }).success).toEqual(
            false,
          );
          expect(validate({ foo: true, qux: "", type: "b" }).success).toEqual(
            false,
          );
          expect(validate({ foo: "1", baz: "", type: "c" }).success).toEqual(
            false,
          );

          const res = validate(null);
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              AggregateValidationError: does not match any of the types in the union
              Path: $
              Errors:
                ValidationError: not an object
                Path: $
                Expected: RecordSchema[ type=LiteralSchema[ a ]; foo=PrimitiveSchema[ number ]; bar=PrimitiveSchema[ string ] ]
                Got: object

                ValidationError: not an object
                Path: $
                Expected: RecordSchema[ type=LiteralSchema[ b ]; foo=PrimitiveSchema[ string ]; baz=PrimitiveSchema[ string ] ]
                Got: object

                ValidationError: not an object
                Path: $
                Expected: RecordSchema[ type=LiteralSchema[ c ]; foo=PrimitiveSchema[ boolean ]; qux=PrimitiveSchema[ string ] ]
                Got: object
            `);
          }

          const res2 = validate({ foo: 1, bar: 0, type: "a" });
          expect(res2.success).toEqual(false);
          if (res2.success === false) {
            // console.log(res2.error.details());
            expect(res2.error.details()).toEqual(dedent`
              AggregateValidationError: does not match any of the types in the union
              Path: $
              Errors:
                By: RecordSchema[ type=LiteralSchema[ a ]; foo=PrimitiveSchema[ number ]; bar=PrimitiveSchema[ string ] ]
                ValidationError: not a string
                Path: $.bar
                Expected: PrimitiveSchema[ string ]
                Got: number

                By: RecordSchema[ type=LiteralSchema[ b ]; foo=PrimitiveSchema[ string ]; baz=PrimitiveSchema[ string ] ]
                ValidationError: not equal to the expected literal value
                Path: $.type
                Expected: LiteralSchema[ b ]
                Got: string

                By: RecordSchema[ type=LiteralSchema[ c ]; foo=PrimitiveSchema[ boolean ]; qux=PrimitiveSchema[ string ] ]
                ValidationError: not equal to the expected literal value
                Path: $.type
                Expected: LiteralSchema[ c ]
                Got: string
            `);
          }
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

          const validate = validator(typeDef, { details: true });

          expect(validate("foo").success).toEqual(true);
          expect(validate(() => {}).success).toEqual(true);
          expect(validate([]).success).toEqual(true);
          expect(validate([{ foo: "foo" }]).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(123).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([[]]).success).toEqual(false);
          expect(validate([{}]).success).toEqual(false);
          expect(validate([{ foo: 1 }]).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
        });

        it("should validate for an array of string or array of number", () => {
          const typeDef = Type.OneOf(
            Type.Array(Type.String),
            Type.Array(Type.Number),
          );

          type ExpectedType = string[] | number[];
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate([]).success).toEqual(true);
          expect(validate(["foo", "bar", "baz"]).success).toEqual(true);
          expect(validate([1, 2, 3, 4]).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(["foo", 1]).success).toEqual(false);
          expect(validate([1, 23, 4, 5, 6, 6, ""]).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ id: "1", value: 1 }).success).toEqual(true);
          expect(validate({ id: "2", value: "2" }).success).toEqual(true);
          expect(validate({ id: "1", value: 1, otherValue: 123 }).success)
            .toEqual(
              true,
            );
          expect(validate({ id: "3", value: true, otherValue: null }).success)
            .toEqual(
              true,
            );

          expect(validate({ id: "1", value: "2" }).success).toEqual(false);
          expect(validate({ id: "2", value: 2 }).success).toEqual(false);
          expect(validate({ id: "3", value: true }).success).toEqual(false);
          expect(
            validate({ id: "3", value: true, otherValue: undefined }).success,
          ).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate("foo").success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate("bar").success).toEqual(false);
          expect(validate("").success).toEqual(false);
        });

        it("should validate intersection of string and string numerals", () => {
          const typeDef = Type.AllOf(Type.String, Type.String.Float);

          type ExpectedType = string & `${number}`;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate("1").success).toEqual(true);
          expect(validate("123").success).toEqual(true);
          expect(validate("123.123").success).toEqual(true);

          expect(validate("123.123.123").success).toEqual(false);
          expect(validate("a").success).toEqual(false);
          expect(validate("1a").success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate("bar").success).toEqual(false);
          expect(validate("").success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: "foo", bar: 123 }).success).toEqual(true);

          expect(validate({ foo: "foo" }).success).toEqual(false);
          expect(validate({ bar: 123 }).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate("bar").success).toEqual(false);
          expect(validate("").success).toEqual(false);

          const res = validate({ foo: 1 });
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not a string
              Path: $.foo
              Expected: PrimitiveSchema[ string ]
              Got: number
            `);
          }
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: "foo", baz: 1 }).success).toEqual(true);
          expect(validate({ foo: "foo", baz: 0, bar: 1.1 }).success).toEqual(
            true,
          );
          expect(validate({ foo: "foo", baz: 0, bar: 1.1, qux: "qux" }).success)
            .toEqual(
              true,
            );
          expect(
            validate({
              foo: "foo",
              baz: 0,
              bar: 1.1,
              qux: "qux",
              randomProp: () => {},
            }).success,
          ).toEqual(true);

          expect(
            validate({ foo: "foo", baz: false, bar: 1.1, qux: "qux" }).success,
          ).toEqual(false);
          expect(
            validate({ foo: "foo", baz: 1.02, bar: 1.1, qux: "qux" }).success,
          ).toEqual(false);
          expect(validate({ foo: 1, baz: 0, bar: 1.1, qux: "qux" }).success)
            .toEqual(
              false,
            );
          expect(
            validate({ foo: "foo", baz: 0, bar: 1.1, qux: "quxx" }).success,
          )
            .toEqual(
              false,
            );
          expect(validate({ baz: 0, bar: 1.1, qux: "qux" }).success).toEqual(
            false,
          );
          expect(validate({ foo: "foo", bar: 1.1, qux: "qux" }).success)
            .toEqual(false);
          expect(validate({ bar: 123 }).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate("bar").success).toEqual(false);
          expect(validate("").success).toEqual(false);
        });
      });

      describe("for arrays", () => {
        it("should validate against any array when type is unknown", () => {
          const typeDef = Type.Array(Type.Unknown);

          type ExpectedType = unknown[];
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate([]).success).toEqual(true);
          expect(validate([1]).success).toEqual(true);
          expect(validate([""]).success).toEqual(true);
          expect(validate([true]).success).toEqual(true);
          expect(validate([Symbol()]).success).toEqual(true);
          expect(validate([{}]).success).toEqual(true);
          expect(validate([[]]).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate("").success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
        });

        it("should validate against simple array of string", () => {
          const typeDef = Type.Array(Type.String);

          type ExpectedType = string[];
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate([]).success).toEqual(true);
          expect(validate(["foo"]).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(["bar", 1]).success).toEqual(false);
          expect(validate([true]).success).toEqual(false);
          expect(validate({ 0: "baz" }).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);

          const res = validate({ 0: "lol" });
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not an array
              Path: $
              Expected: ArraySchema[ PrimitiveSchema[ string ] ]
              Got: object
            `);
          }

          const res2 = validate(["", 2]);
          expect(res2.success).toEqual(false);
          if (res2.success === false) {
            expect(res2.error.details()).toEqual(dedent`
              ValidationError: not a string
              Path: $[1]
              Expected: PrimitiveSchema[ string ]
              Got: number
            `);
          }
        });

        it("should validate against simple array of enum values", () => {
          enum T {
            FOO = "FOO",
            BAR = "BAR",
          }
          const typeDef = Type.Array(Type.Enum(T));

          type ExpectedType = T[];
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate([]).success).toEqual(true);
          expect(validate([T.BAR]).success).toEqual(true);
          expect(validate([T.BAR, T.FOO]).success).toEqual(true);
          expect(validate([T.BAR, "FOO"]).success).toEqual(true);
          expect(validate(["BAR"]).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(["bar", 1]).success).toEqual(false);
          expect(validate([true]).success).toEqual(false);
          expect(validate({ 0: "baz" }).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
        });

        it("should validate against array of functions or booleans", () => {
          const typeDef = Type.Array(Type.Function, Type.Boolean);

          type ExpectedType = Array<UnknownFunction | boolean>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate([true, false]).success).toEqual(true);
          expect(validate([() => {}]).success).toEqual(true);
          expect(validate([true, () => {}, false]).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(["bar", 1]).success).toEqual(false);
          expect(validate([true, 6]).success).toEqual(false);
          expect(validate([{}, false]).success).toEqual(false);
          expect(validate({ 0: "baz" }).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
        });

        it("should validate against array of undefined or nulls", () => {
          const typeDef = Type.Array(Type.Null, Type.Undefined);

          type ExpectedType = Array<null | undefined>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate([]).success).toEqual(true);
          expect(validate([null]).success).toEqual(true);
          expect(validate([undefined]).success).toEqual(true);
          expect(validate([null, undefined, null, null]).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate([null, null, null, {}]).success).toEqual(false);
          expect(validate([() => {}]).success).toEqual(false);
          expect(validate([true]).success).toEqual(false);
          expect(validate([false]).success).toEqual(false);
          expect(validate(["bar", 1]).success).toEqual(false);
          expect(validate([true, 6]).success).toEqual(false);
          expect(validate([{}, false]).success).toEqual(false);
          expect(validate({ 0: "baz" }).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
        });

        it("should validate against nested arrays", () => {
          const typeDef = Type.Array(
            Type.Array(Type.Number),
            Type.Array(Type.Array(Type.String)),
          );

          type ExpectedType = Array<Array<number> | Array<Array<string>>>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate([]).success).toEqual(true);
          expect(validate([[], [], []]).success).toEqual(true);
          expect(validate([[], [[]]]).success).toEqual(true);
          expect(validate([[], [["foo"]]]).success).toEqual(true);
          expect(validate([[1], [["foo"]]]).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate([[1], [[1]]]).success).toEqual(false);
          expect(validate([["1"]]).success).toEqual(false);
          expect(validate([[1], [[[]]]]).success).toEqual(false);
          expect(validate([[[["asd"]]]]).success).toEqual(false);
        });
      });

      describe("for tuples", () => {
        it("should validate against simple tuple", () => {
          const typeDef = Type.Tuple(Type.String, Type.Number);

          type ExpectedType = [string, number];
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(["foo", 1]).success).toEqual(true);
          expect(validate(["", 0]).success).toEqual(true);

          expect(validate(["foo", 1, 2]).success).toEqual(false);
          expect(validate(["foo", 1, undefined]).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate([, 1]).success).toEqual(false);
          expect(validate(["foo"]).success).toEqual(false);
          expect(validate([1, "foo"]).success).toEqual(false);
          expect(validate(["foo", "1"]).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate([true]).success).toEqual(false);
          expect(validate({ 0: "baz", 1: 2 }).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate(0).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);

          const res = validate({ 0: "lol" });
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not an array
              Path: $
              Expected: TupleSchema[ PrimitiveSchema[ string ], PrimitiveSchema[ number ] ]
              Got: object
            `);
          }
        });

        it("should validate against nested tuples", () => {
          const typeDef = Type.Tuple(
            Type.String,
            Type.Tuple(Type.Number, Type.String),
          );

          type ExpectedType = [string, [number, string]];
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(["foo", [1, "bar"]]).success).toEqual(true);

          expect(validate(["foo", [1, "bar", 2]]).success).toEqual(false);
          expect(validate(["foo", [1, "bar", null], () => {}]).success).toEqual(
            false,
          );
          expect(validate([]).success).toEqual(false);
          expect(validate([, 1]).success).toEqual(false);
          expect(validate(["foo"]).success).toEqual(false);
          expect(validate(["foo", { 0: 1, 2: "foo" }, [1, "bar"]]).success)
            .toEqual(
              false,
            );
          expect(validate([1, ["foo", "bar"]]).success).toEqual(false);
          expect(validate(["foo", ["1", "bar"]]).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate([true]).success).toEqual(false);
          expect(validate({ 0: "baz", 1: 2 }).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate(0).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
        });
      });

      describe("for records", () => {
        it("should not validate null for empty objects", () => {
          const typeDef = Type.Record({});

          type ExpectedType = Record<string, never>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate({}).success).toEqual(true);

          expect(validate(undefined).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: "foo" }).success).toEqual(true);
          expect(validate({ foo: "foo", bar: 1 }).success).toEqual(true);
          expect(validate({ foo: "", bar: undefined }).success).toEqual(true);

          expect(validate({ foo: "foo", bar: "1" }).success).toEqual(false);
          expect(validate({ bar: 1 }).success).toEqual(false);

          const res = validate("");
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not an object
              Path: $
              Expected: RecordSchema[ foo=PrimitiveSchema[ string ]; bar?=PrimitiveSchema[ number ] ]
              Got: string
            `);
          }
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: "foo" }).success).toEqual(true);
          expect(validate({ foo: "foo", bar: 1 }).success).toEqual(true);

          expect(validate({ foo: "foo", bar: "1" }).success).toEqual(false);
          expect(validate({ bar: 1 }).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: "foo", bar: 123, baz: true }).success).toEqual(
            true,
          );
          expect(validate({ foo: "", bar: 0, baz: [] }).success).toEqual(true);
          expect(validate({ foo: "123", bar: -2, baz: () => {} }).success)
            .toEqual(
              true,
            );
          expect(validate({ foo: "123", bar: -2, baz: undefined }).success)
            .toEqual(
              true,
            );

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate({ foo: "foo", bar: "123", baz: true }).success)
            .toEqual(
              false,
            );
          expect(validate({ foo: "foo", bar: "123", baz: true }).success)
            .toEqual(
              false,
            );
          expect(validate({ foo: false, bar: 1, baz: true }).success).toEqual(
            false,
          );
          expect(validate({ foo: "foo", bar: 123 }).success).toEqual(false);
          expect(validate({ foo: "", baz: undefined }).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(76).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(
            validate({
              foo: "foo",
              bar: { baz: 1, qux: { corge: () => {} }, thud: T.BAR },
            }).success,
          ).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(
            validate({ foo: 0, bar: { baz: 1, qux: { corge: () => {} } } })
              .success,
          ).toEqual(false);
          expect(
            validate({ foo: "foo", bar: { baz: 1, qux: { corge: Symbol() } } })
              .success,
          ).toEqual(false);
          expect(
            validate({
              foo: "foo",
              bar: { baz: "1", qux: { corge: () => {} } },
            }).success,
          ).toEqual(false);
          expect(
            validate({
              foo: "foo",
              bar: { baz: 1, qux: { corge: () => {} }, thud: T.FOO },
            }).success,
          ).toEqual(false);
          expect(
            validate({
              foo: "foo",
              bar: { baz: 1, qux: { corge: () => {} }, thud: 0 },
            }).success,
          ).toEqual(false);

          const res = validate({
            foo: "foo",
            bar: { baz: 1, qux: { corge: () => {} }, thud: T.FOO },
          });
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not a valid enum member
              Path: $.bar.thud
              Expected: EnumMemberSchema[ BAR ]
              Got: string
            `);
          }
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: undefined, bar: null }).success).toEqual(true);

          expect(validate(undefined).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate({ foo: undefined }).success).toEqual(false);
          expect(validate({ bar: null }).success).toEqual(false);
          expect(validate({ foo: "undefined", bar: "null" }).success).toEqual(
            false,
          );
          expect(validate({ foo: "undefined", bar: null }).success).toEqual(
            false,
          );
          expect(validate({ foo: undefined, bar: "null" }).success).toEqual(
            false,
          );
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: "foo", bar: [1], baz: { qux: true } }).success)
            .toEqual(
              true,
            );
          expect(
            validate({ foo: "", bar: [""], baz: { qux: false }, optional: 10 })
              .success,
          ).toEqual(true);
          expect(
            validate({ bar: [""], baz: { qux: false }, optional: 10 }).success,
          ).toEqual(false);
          expect(
            validate({ foo: 0, bar: [""], baz: { qux: false }, optional: 10 })
              .success,
          ).toEqual(false);
          expect(
            validate({ foo: "", baz: { qux: false }, optional: 10 }).success,
          ).toEqual(false);
          expect(validate({ foo: "", bar: [""], optional: 10 }).success)
            .toEqual(false);
          expect(
            validate({
              foo: "",
              bar: [""],
              baz: { qux: false },
              optional: "10",
            }).success,
          ).toEqual(false);
        });
      });

      describe("for dictionaries", () => {
        it("should not validate null for empty objects", () => {
          const typeDef = Type.Dict(Type.Unknown);

          type ExpectedType = Record<string | number, unknown>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate({}).success).toEqual(true);

          expect(validate(undefined).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
        });

        it("should validate for simple dictionaries", () => {
          const typeDef = Type.Dict(Type.String, Type.Number);

          type ExpectedType = Record<string | number, string | number>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: "foo", bar: 123 }).success).toEqual(true);
          expect(validate({ foo: "", bar: "0", baz: "" }).success).toEqual(
            true,
          );
          expect(validate({ foo: 123, bar: -2 }).success).toEqual(true);
          expect(validate({ foo: "123", bar: -2, baz: "undefined" }).success)
            .toEqual(
              true,
            );

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate({ foo: "foo", bar: "123", baz: true }).success)
            .toEqual(
              false,
            );
          expect(validate({ foo: "foo", bar: "123", baz: true }).success)
            .toEqual(
              false,
            );
          expect(validate({ foo: 1, bar: 1, baz: () => 1 }).success).toEqual(
            false,
          );
          expect(validate({ foo: "foo", bar: Symbol("1") }).success).toEqual(
            false,
          );
          expect(validate({ foo: "", baz: {} }).success).toEqual(false);
          expect(validate({ foo: "", baz: [] }).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(76).success).toEqual(false);

          const res = validate("");
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not an object
              Path: $
              Expected: DictSchema[ UnionSchema[ PrimitiveSchema[ string ] | PrimitiveSchema[ number ] ] ]
              Got: string
            `);
          }
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ bar: "bar" }).success).toEqual(true);
          expect(validate({ bar: { foo: {} } }).success).toEqual(true);
          expect(validate({ bar: { foo: { dict1: {} } } }).success).toEqual(
            true,
          );
          expect(validate({ bar: { foo: { dict1: {} } } }).success).toEqual(
            true,
          );
          expect(validate({ bar: { foo: { dict1: { enum: T.BAR } } } }).success)
            .toEqual(
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
            }).success,
          ).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate("undefined").success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate({ bar: 1 }).success).toEqual(false);
          expect(validate({ bar: null }).success).toEqual(false);
          expect(validate({ bar: undefined }).success).toEqual(false);
          expect(validate({ bar: Symbol() }).success).toEqual(false);
          expect(validate({ bar: () => {} }).success).toEqual(false);
          expect(validate({ bar: { foo: { a: 1 } } }).success).toEqual(false);
          expect(validate({ bar: { foo: { a: "1" } } }).success).toEqual(false);
          expect(validate({ bar: { foo: { a: null } } }).success).toEqual(
            false,
          );
          expect(validate({ bar: { foo: { a: undefined } } }).success).toEqual(
            false,
          );
          expect(validate({ bar: { foo: { a: Symbol() } } }).success).toEqual(
            false,
          );
          expect(validate({ bar: { foo: { a: () => {} } } }).success).toEqual(
            false,
          );
          expect(validate({ bar: { foo: { a: { b: 1 } } } }).success).toEqual(
            false,
          );
          expect(validate({ bar: { foo: { a: { b: "1" } } } }).success).toEqual(
            false,
          );
          expect(validate({ bar: { foo: { a: { b: null } } } }).success)
            .toEqual(false);
          expect(validate({ bar: { foo: { a: { b: undefined } } } }).success)
            .toEqual(
              false,
            );
          expect(validate({ bar: { foo: { a: { b: Symbol() } } } }).success)
            .toEqual(
              false,
            );
          expect(validate({ bar: { foo: { a: { b: () => {} } } } }).success)
            .toEqual(
              false,
            );
          expect(validate({ bar: { foo: { dict1: { enum: T.FOO } } } }).success)
            .toEqual(
              false,
            );

          expect(
            validate({
              foo: "foo",
              bar: { foo: { dict1: { enum: 1 } } },
            }).success,
          ).toEqual(false);
        });
      });

      describe("for sets", () => {
        it("should validate for set of numbers", () => {
          const typeDef = Type.Set(Type.Number);

          type ExpectedType = Set<number>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(new Set()).success).toEqual(true);
          expect(validate(new Set([1, 2, 3])).success).toEqual(true);

          expect(validate(undefined).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(new Set([1, 2, 3, ""])).success).toEqual(false);
          expect(validate(new Set([true])).success).toEqual(false);
          expect(validate(new Set([Symbol()])).success).toEqual(false);
          expect(validate(new Set([{}])).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
        });

        it("should validate for set of functions", () => {
          const typeDef = Type.Set(Type.Function);

          type ExpectedType = Set<UnknownFunction>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(new Set()).success).toEqual(true);
          expect(validate(new Set([() => {}])).success).toEqual(true);

          expect(validate(undefined).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(new Set([() => {}, "foo"])).success).toEqual(false);
          expect(validate(new Set([true])).success).toEqual(false);
          expect(validate(new Set([Symbol()])).success).toEqual(false);
          expect(validate(new Set([{}])).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
        });

        it("should validate for set of symbols or strings", () => {
          const typeDef = Type.Set(Type.Symbol, Type.String);

          type ExpectedType = Set<symbol | string>;
          assert<AssertType<ExpectedType, typeof typeDef>>();
          const validate = validator(typeDef, { details: true });

          expect(validate(new Set()).success).toEqual(true);
          expect(validate(new Set([Symbol()])).success).toEqual(true);
          expect(validate(new Set(["foo"])).success).toEqual(true);
          expect(
            validate(new Set(["symbol", Symbol(), "foo", Symbol()])).success,
          ).toEqual(true);

          expect(validate(undefined).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(new Set(["foo", Symbol(), () => {}])).success)
            .toEqual(false);
          expect(validate(new Set([true])).success).toEqual(false);
          expect(validate(new Set([123])).success).toEqual(false);
          expect(validate(new Set([{}])).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);

          const res = validate({});
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not a Set instance
              Path: $
              Expected: SetSchema[ UnionSchema[ PrimitiveSchema[ symbol ] | PrimitiveSchema[ string ] ] ]
              Got: object
            `);
          }
        });

        it("should validate for set of records or undefined", () => {
          const typeDef = Type.Set(
            Type.Undefined,
            Type.Record({ foo: { type: Type.String } }),
          );

          type ExpectedType = Set<undefined | { foo: string }>;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(new Set()).success).toEqual(true);
          expect(validate(new Set([undefined])).success).toEqual(true);
          expect(validate(new Set([{ foo: "" }])).success).toEqual(true);
          expect(validate(new Set([undefined, { foo: "" }, undefined])).success)
            .toEqual(
              true,
            );

          expect(validate(undefined).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(new Set(["foo", Symbol(), () => {}])).success)
            .toEqual(false);
          expect(validate(new Set([true])).success).toEqual(false);
          expect(validate(new Set([123])).success).toEqual(false);
          expect(validate(new Set([{}])).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate("foo").success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate(Foo.A).success).toEqual(true);
          expect(validate(Foo.B).success).toEqual(true);
          expect(validate(Foo.C).success).toEqual(true);
          expect(validate("A").success).toEqual(true);
          expect(validate("B").success).toEqual(true);
          expect(validate("C").success).toEqual(true);

          expect(validate(Foo).success).toEqual(false);
          expect(validate("D").success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(0).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(2).success).toEqual(false);
          expect(validate(3).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);

          const res = validate("");
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not a valid enum value
              Path: $
              Expected: EnumSchema[ A | B | C ]
              Got: string
            `);
          }
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

          const validate = validator(typeDef, { details: true });

          expect(validate(Foo.A).success).toEqual(true);
          expect(validate(Foo.B).success).toEqual(true);
          expect(validate(Foo.C).success).toEqual(true);
          expect(validate(0).success).toEqual(true);
          expect(validate(1).success).toEqual(true);
          expect(validate(2).success).toEqual(true);

          expect(validate(Foo).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate("A").success).toEqual(false);
          expect(validate("B").success).toEqual(false);
          expect(validate("C").success).toEqual(false);
          expect(validate("D").success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ myEnum: Foo.A }).success).toEqual(true);
          expect(validate({ myEnum: Foo.B }).success).toEqual(true);
          expect(validate({ myEnum: Foo.C }).success).toEqual(true);
          expect(validate({ myEnum: "A" }).success).toEqual(true);
          expect(validate({ myEnum: "B" }).success).toEqual(true);
          expect(validate({ myEnum: "C" }).success).toEqual(true);

          expect(validate({ myEnum: "a" }).success).toEqual(false);
          expect(validate({ myEnum: "1" }).success).toEqual(false);
          expect(validate({ myEnum: 0 }).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate(Foo.A).success).toEqual(true);
          expect(validate("A").success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(Foo).success).toEqual(false);
          expect(validate(Foo.B).success).toEqual(false);
          expect(validate(Foo.C).success).toEqual(false);
          expect(validate("B").success).toEqual(false);
          expect(validate("C").success).toEqual(false);
          expect(validate("D").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(2).success).toEqual(false);
          expect(validate(3).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);

          const res = validate("");
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not a valid enum member
              Path: $
              Expected: EnumMemberSchema[ A ]
              Got: string
            `);
          }
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

          const validate = validator(typeDef, { details: true });

          expect(validate(Foo.A).success).toEqual(true);
          expect(validate(0).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(Foo).success).toEqual(false);
          expect(validate(Foo.B).success).toEqual(false);
          expect(validate(Foo.C).success).toEqual(false);
          expect(validate("A").success).toEqual(false);
          expect(validate("B").success).toEqual(false);
          expect(validate("C").success).toEqual(false);
          expect(validate("D").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(2).success).toEqual(false);
          expect(validate(3).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
        });
      });

      describe("for class instances", () => {
        it("should correctly check if the value is an instance of the class", () => {
          class Foo {
            private foo = "foo";
            public bar = 123;
          }

          const typeDef = Type.InstanceOf(Foo);
          const validate = validator(typeDef, { details: true });

          expect(validate(new Foo()).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(Foo).success).toEqual(false);
          expect(validate("A").success).toEqual(false);
          expect(validate("B").success).toEqual(false);
          expect(validate("C").success).toEqual(false);
          expect(validate("D").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(2).success).toEqual(false);
          expect(validate(3).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);

          const res = validate("");
          expect(res.success).toEqual(false);
          if (res.success === false) {
            expect(res.error.details()).toEqual(dedent`
              ValidationError: not an instance of Foo
              Path: $
              Expected: InstanceofSchema[ Foo() ]
              Got: string
            `);
          }
        });

        it("should correctly check if the value is an instance of a builtin class", () => {
          const typeDef = Type.InstanceOf(RegExp);

          type ExpectedType = RegExp;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate(/foo/).success).toEqual(true);
          expect(validate(new RegExp("foo")).success).toEqual(true);

          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(RegExp).success).toEqual(false);
          expect(validate("A").success).toEqual(false);
          expect(validate(3).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(validate({ foo: "bar" }).success).toEqual(true);

          expect(validate({ foo: 1 }).success).toEqual(false);
          expect(validate({ foo: null }).success).toEqual(false);
          expect(validate({ foo: undefined }).success).toEqual(false);
          expect(validate({ foo: true }).success).toEqual(false);
          expect(validate({ foo: false }).success).toEqual(false);
          expect(validate({ foo: Symbol() }).success).toEqual(false);
          expect(validate({ foo: () => {} }).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
          expect(validate("bar").success).toEqual(false);
          expect(validate("").success).toEqual(false);
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

          const validate = validator(typeDef, { details: true });

          expect(() => validate({ foo: "bar" })).toThrow("foo");
        });
      });

      describe("for string matching pattern", () => {
        it("should validate the string against the pattern", () => {
          const typeDef = Type.String.matching(/^foo/);

          type ExpectedType = string;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate("foobar").success).toEqual(true);
          expect(validate("foo").success).toEqual(true);
          expect(validate("foo bar").success).toEqual(true);

          expect(validate("bar").success).toEqual(false);
          expect(validate("barfoo").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
        });

        it("should validate the string against the pattern and assert the type", () => {
          const typeDef = Type.String.matching<`bar.${string}`>(/^bar\./);

          type ExpectedType = `bar.${string}`;
          assert<AssertType<ExpectedType, typeof typeDef>>();

          const validate = validator(typeDef, { details: true });

          expect(validate("bar.foo").success).toEqual(true);
          expect(validate("bar.").success).toEqual(true);

          expect(validate("foo").success).toEqual(false);
          expect(validate("bar").success).toEqual(false);
          expect(validate("foobar.").success).toEqual(false);
          expect(validate("foo.bar.").success).toEqual(false);
          expect(validate(1).success).toEqual(false);
          expect(validate(null).success).toEqual(false);
          expect(validate(undefined).success).toEqual(false);
          expect(validate(true).success).toEqual(false);
          expect(validate(false).success).toEqual(false);
          expect(validate(Symbol()).success).toEqual(false);
          expect(validate(() => {}).success).toEqual(false);
          expect(validate({}).success).toEqual(false);
          expect(validate([]).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(
              validate({
                foo: "foo",
                bar: [],
              }).success,
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
              }).success,
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
              }).success,
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
              }).success,
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
              }).success,
            ).toEqual(false);
            expect(
              validate({
                foo: "foo",
                bar: [""],
              }).success,
            ).toEqual(false);
            expect(
              validate({
                foo: "foo",
              }).success,
            ).toEqual(false);
            expect(validate({}).success).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(true).success).toEqual(false);
            expect(validate(false).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(
              validate({
                foo: "foo",
                bar: {
                  baz: {},
                },
              }).success,
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
              }).success,
            ).toEqual(true);

            expect(validate({}).success).toEqual(false);
            expect(validate({ foo: "" }).success).toEqual(false);
            expect(validate({ bar: { baz: {} } }).success).toEqual(false);
            expect(validate({ foo: "", bar: {} }).success).toEqual(false);
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
              }).success,
            ).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(true).success).toEqual(false);
            expect(validate(false).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
          });

          it("scenario 3", () => {
            const typeDef = Type.Record({
              foo: Type.Recursive((self) => Type.Set(self, Type.String)),
            });

            type ExpectedType = {
              foo: Set<string | Set<string | Set<string | Set<any>>>>;
            };
            assert<AssertType<ExpectedType, typeof typeDef>>();

            const validate = validator(typeDef, { details: true });

            expect(
              validate({
                foo: new Set(),
              }).success,
            ).toEqual(true);
            expect(
              validate({
                foo: new Set(["foo"]),
              }).success,
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
              }).success,
            ).toEqual(true);

            expect(validate({}).success).toEqual(false);
            expect(validate({ foo: new Set([1]) }).success).toEqual(false);
            expect(
              validate({
                foo: new Set([
                  new Set([
                    new Set([
                      new Set([new Set([new Set([true]), ""]), ""]),
                      "",
                    ]),
                    "",
                  ]),
                  "",
                ]),
              }).success,
            ).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(true).success).toEqual(false);
            expect(validate(false).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(validate({}).success).toEqual(true);
            expect(validate({ a: {} }).success).toEqual(true);
            expect(validate({ a: { b: {} } }).success).toEqual(true);
            expect(validate({ a: { b: { ref: {} } } }).success).toEqual(true);
            expect(validate({ a: { b: { ref: { a: {} } } } }).success).toEqual(
              true,
            );
            expect(validate({ a: { b: { ref: { a: { b: {} } } } } }).success)
              .toEqual(
                true,
              );
            expect(
              validate({ a: { b: { ref: { a: { b: { ref: {} } } } } } })
                .success,
            ).toEqual(true);
            expect(validate({ a: { b: { ref: undefined } } }).success).toEqual(
              true,
            );

            expect(validate({ a: { b: 1 } }).success).toEqual(false);
            expect(validate({ a: { b: { ref: 0 } } }).success).toEqual(false);
            expect(
              validate({ a: { b: { ref: { a: { b: { ref: "" } } } } } })
                .success,
            ).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate(0).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(true).success).toEqual(false);
            expect(validate(false).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(validate({}).success).toEqual(true);
            expect(validate({ a: 1 }).success).toEqual(true);
            expect(validate({ a: { b: 2 }, c: Symbol() }).success).toEqual(
              true,
            );
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
              }).success,
            ).toEqual(true);

            expect(validate({ a: "foo" }).success).toEqual(false);
            expect(validate({ a: { b: "foo" } }).success).toEqual(false);
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
              }).success,
            ).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(true).success).toEqual(false);
            expect(validate(false).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(
              validate({
                a: {
                  foo: "1",
                },
                b: { foo: [] },
              }).success,
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
              }).success,
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
              }).success,
            ).toEqual(true);
            expect(
              validate({
                a: {},
              }).success,
            ).toEqual(false);
            expect(
              validate({
                a: {
                  foo: 1,
                },
              }).success,
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
              }).success,
            ).toEqual(false);
            expect(
              validate({
                a: {
                  foo: [
                    {
                      b: {
                        foo: [
                          {
                            c: {
                              foo: [{ d: { foo: [{ e: { foo: null } }] } }],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              }).success,
            ).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(true).success).toEqual(false);
            expect(validate(false).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(validate([1, true, "foo"]).success).toEqual(true);
            expect(validate([1, [3, false, ""], "foo"]).success).toEqual(true);
            expect(validate([1, [3, [5, true, "bar"], ""], "foo"]).success)
              .toEqual(
                true,
              );
            expect(
              validate([1, [3, [5, [7, true, "bar"], "bar"], ""], "foo"])
                .success,
            ).toEqual(true);

            expect(validate([1, "foo", "foo"]).success).toEqual(false);
            expect(validate([1, [3, "foo", ""], "foo"]).success).toEqual(false);
            expect(validate([1, [3, [5, [7, true], "bar"], ""], "foo"]).success)
              .toEqual(
                false,
              );
            expect(
              validate([1, [3, [5, [7, [], ""], "bar"], ""], "foo"]).success,
            ).toEqual(false);
            expect(
              validate([1, [3, [5, [NaN, true, ""], "bar"], ""], "foo"])
                .success,
            ).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(true).success).toEqual(false);
            expect(validate(false).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
            expect(validate([]).success).toEqual(false);
            expect(validate({}).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(validate([new Set()]).success).toEqual(true);
            expect(validate([new Set([[{ a: true }]])]).success).toEqual(true);
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
              ]).success,
            ).toEqual(true);

            expect(validate([]).success).toEqual(false);
            expect(validate([new Set([[{ a: 1 }]])]).success).toEqual(false);
            expect(validate([new Set([[{ a: true, b: "" }]])]).success).toEqual(
              false,
            );
            expect(validate([new Set([[{ a: true, b: [] }]])]).success).toEqual(
              false,
            );
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
              ]).success,
            ).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(true).success).toEqual(false);
            expect(validate(false).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
            expect(validate([]).success).toEqual(false);
            expect(validate({}).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(validate(1).success).toEqual(true);
            expect(validate(true).success).toEqual(true);
            expect(validate("foo").success).toEqual(true);
            expect(validate([]).success).toEqual(true);
            expect(validate([[[[[[[[[[[[]]]]]]]]]]]]).success).toEqual(true);
            expect(validate([1, true, "foo"]).success).toEqual(true);
            expect(validate([[1, true, "foo"]]).success).toEqual(true);
            expect(validate([[[1, true, "foo"]]]).success).toEqual(true);
            expect(validate([[[[1, true, "foo"]]]]).success).toEqual(true);
            expect(
              validate([
                [[[1, true, "foo"], 2, false, "bar"], "baz", 3, 6],
                "",
                "",
                12e21,
              ]).success,
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
              ]).success,
            ).toEqual(false);
            expect(validate([null]).success).toEqual(false);
            expect(validate([[[[[[[[[[[[NaN]]]]]]]]]]]]).success).toEqual(
              false,
            );
            expect(validate({}).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
          });

          it("scenario 2", () => {
            const typeDef = Type.OneOf(
              Type.Number,
              Type.Boolean,
              Type.String,
              Type.Recursive((self) =>
                Type.Array(
                  Type.OneOf(Type.Number, Type.String.Float, self),
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

            const validate = validator(typeDef, { details: true });

            expect(validate(1).success).toEqual(true);
            expect(validate(true).success).toEqual(true);
            expect(validate("foo").success).toEqual(true);
            expect(validate([]).success).toEqual(true);
            expect(validate([[[[[[[[[[[[]]]]]]]]]]]]).success).toEqual(true);
            expect(validate([1, "2"]).success).toEqual(true);
            expect(validate([[3, "1.2"]]).success).toEqual(true);
            expect(validate([[[5, "1234"]]]).success).toEqual(true);
            expect(validate([[[[123, "12.345"]]]]).success).toEqual(true);
            expect(
              validate([[[[1, "0"], 2, "1"], "2", 3, 6], "3", "4", 12e21])
                .success,
            ).toEqual(true);

            expect(
              validate([
                [[[1, "0"], 2, "1", [[[""]]]], "2", 3, 6],
                "3",
                "4",
                12e21,
              ]).success,
            ).toEqual(false);
            expect(validate([null]).success).toEqual(false);
            expect(validate([[[[[[[[[[[[NaN]]]]]]]]]]]]).success).toEqual(
              false,
            );
            expect(validate({}).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
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

            const validate = validator(typeDef, { details: true });

            expect(
              validate({
                type: "A",
                children: [],
              }).success,
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
              }).success,
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
              }).success,
            ).toEqual(true);

            expect(
              validate({
                type: "A",
              }).success,
            ).toEqual(false);
            expect(
              validate({
                type: "A",
                children: {},
              }).success,
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
              }).success,
            ).toEqual(false);
            expect(validate(1).success).toEqual(false);
            expect(validate("{}").success).toEqual(false);
            expect(validate({}).success).toEqual(false);
            expect(validate(null).success).toEqual(false);
            expect(validate(undefined).success).toEqual(false);
            expect(validate(Symbol()).success).toEqual(false);
            expect(validate(() => {}).success).toEqual(false);
          });
        });

        it("self referencing record shouldn't throw the 'Maximum call stack size exceeded' error", () => {
          const typeDef = Type.Recursive((self) =>
            Type.Record({
              tag: Type.String,
              children: Type.Array(self),
            })
          );

          const validate = validator(typeDef, { details: true });

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

          expect(() => validate(data).success).not.toThrow();
          expect(validate(data).success).toEqual(true);
          expect(validate(data).success).toEqual(true);

          // @ts-expect-error
          span.children.push({});

          expect(validate(data).success).toEqual(false);

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

          expect(() => validate(data2).success).not.toThrow();
          expect(validate(data2).success).toEqual(true);
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

          const validate = validator(typeDef, { details: true });

          const a = {
            tag: "div",
            children: [],
          };

          const data = {
            a: a,
            b: a,
          };

          expect(validate(data).success).toEqual(false);

          const typeDef2 = Type.Record({
            a: Type.Recursive((self) =>
              Type.Record({
                tag: Type.String,
                children: Type.Array(self),
                notSelf: Type.Recursive((s) =>
                  Type.Record({ foo: Type.String })
                ),
              })
            ),
          });

          const validate2 = validator(typeDef2, { details: true });

          const data2 = {
            a: {
              tag: "div",
              children: [],
              notSelf: {},
            },
          };

          data2.a.notSelf = data2.a;

          expect(validate2(data2).success).toEqual(false);
        });
      });
    });
  });
});
