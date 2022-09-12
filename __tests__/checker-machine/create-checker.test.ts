import { createValidator, DataType } from "../../src";

describe("createValidator", () => {
  describe("for primitives", () => {
    it("should validate against a string", () => {
      const typeDef = DataType.String;

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

      const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

    describe("for records", () => {
      it("should not validate null for empty objects", () => {
        const typeDef = DataType.RecordOf({});

        const validate = createValidator(typeDef);

        expect(validate({})).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
      });

      it("should validate for optional properties", () => {
        const typeDef = DataType.RecordOf({
          foo: { required: true, type: DataType.String },
          bar: { required: false, type: DataType.Number },
        });

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

        expect(validate({})).toEqual(true);

        expect(validate(undefined)).toEqual(false);
        expect(validate(null)).toEqual(false);
      });

      it("should validate for simple dictionaries", () => {
        const typeDef = DataType.Dict(DataType.String, DataType.Number);

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

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

    describe("for custom validators", () => {
      it("should validate the value against the custom validator", () => {
        const customValidator = (value: unknown): value is string => {
          return typeof value === "string";
        };

        const typeDef = DataType.RecordOf({
          foo: DataType.Custom(customValidator),
        });

        const validate = createValidator(typeDef);

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

        const validate = createValidator(typeDef);

        expect(() => validate({ foo: "bar" })).toThrowError("foo");
      });
    });
  });
});
