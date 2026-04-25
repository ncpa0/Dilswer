import { describe, expect, it } from "@jest/globals";
import dedent from "dedent";
import { Type } from "../src/index";
import { StandardSchemaV1 } from "../src/standard-schema";

function endpoint<R>(validator: StandardSchemaV1<any, R>) {
  return {
    async post(
      response: any,
    ): Promise<{ data?: R; validationResults: StandardSchemaV1.Result<R> }> {
      const vres = await validator["~standard"].validate(response);
      return { data: response, validationResults: vres };
    },
  };
}

class AssertionFailed<Reason, Values = never> {
  private _reason!: Reason;
}

const TRUE_SYM = Symbol("true");
type True = typeof TRUE_SYM;
type AssertEndpoint<Expected, Endpoint> = Endpoint extends {
  post(...args: any[]): Promise<{ data?: infer T }>;
} ? T extends Expected ? True
  : AssertionFailed<"Types do not match", [Expected, T]>
  : AssertionFailed<"Types do not match", [Expected, Endpoint]>;

/**
 * A dummy function for asserting the type T provided is equal to
 * `true`
 */
const assert = <V extends True>() => {};

describe("validating via the Standard Schema", () => {
  describe("default validation function", () => {
    it("correctly validates simple types", async () => {
      const e1 = endpoint(Type.Boolean);
      const e2 = endpoint(Type.String);
      const e3 = endpoint(Type.Number);
      const e4 = endpoint(Type.Null);
      const e5 = endpoint(Type.Symbol);
      const e6 = endpoint(Type.Undefined);
      const e7 = endpoint(Type.Int);

      assert<AssertEndpoint<boolean, typeof e1>>();
      assert<AssertEndpoint<string, typeof e2>>();
      assert<AssertEndpoint<number, typeof e3>>();
      assert<AssertEndpoint<null, typeof e4>>();
      assert<AssertEndpoint<symbol, typeof e5>>();
      assert<AssertEndpoint<undefined, typeof e6>>();
      assert<AssertEndpoint<number, typeof e7>>();

      await expect(e1.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          value: true,
        },
      });
      await expect(e2.post("true")).resolves.toEqual({
        data: "true",
        validationResults: {
          value: "true",
        },
      });
      await expect(e3.post(231.23)).resolves.toEqual({
        data: 231.23,
        validationResults: {
          value: 231.23,
        },
      });
      await expect(e4.post(null)).resolves.toEqual({
        data: null,
        validationResults: {
          value: null,
        },
      });
      const sym = Symbol("test");
      await expect(e5.post(sym)).resolves.toEqual({
        data: sym,
        validationResults: {
          value: sym,
        },
      });
      await expect(e6.post(undefined)).resolves.toEqual({
        data: undefined,
        validationResults: {
          value: undefined,
        },
      });
      await expect(e7.post(1)).resolves.toEqual({
        data: 1,
        validationResults: {
          value: 1,
        },
      });

      await expect(e1.post("")).resolves.toEqual({
        data: "",
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a boolean
                Path: $
                Expected: PrimitiveSchema[ boolean ]
                Got: string`,
              path: [{ key: "$" }],
            },
          ],
        },
      });
      await expect(e2.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a string
                Path: $
                Expected: PrimitiveSchema[ string ]
                Got: boolean
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
      await expect(e3.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a number
                Path: $
                Expected: PrimitiveSchema[ number ]
                Got: boolean
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
      await expect(e4.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a null
                Path: $
                Expected: PrimitiveSchema[ null ]
                Got: boolean
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
      await expect(e5.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a symbol
                Path: $
                Expected: PrimitiveSchema[ symbol ]
                Got: boolean
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
      await expect(e6.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a undefined
                Path: $
                Expected: PrimitiveSchema[ undefined ]
                Got: boolean
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
      await expect(e7.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a number
                Path: $
                Expected: PrimitiveSchema[ int ]
                Got: boolean
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });

    it("correctly validates records", async () => {
      const e = endpoint(
        Type.Record({
          a: Type.String,
          b: Type.Number,
          c: { type: Type.Record({ foo: Type.Boolean }), required: false },
        }),
      );

      assert<
        AssertEndpoint<{
          a: string;
          b: number;
          c?: {
            foo: boolean;
          };
        }, typeof e>
      >();

      await expect(e.post({ a: "hello", b: 1 })).resolves.toEqual({
        data: { a: "hello", b: 1 },
        validationResults: {
          value: { a: "hello", b: 1 },
        },
      });

      await expect(e.post({ a: "hello", b: "1" })).resolves.toEqual({
        data: { a: "hello", b: "1" },
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a number
                Path: $.b
                Expected: PrimitiveSchema[ number ]
                Got: string`,
              path: [{ key: "$" }, { key: "b" }],
            },
          ],
        },
      });

      const e2 = endpoint(
        Type.Record({
          foo: Type.Record({ bar: Type.Record({ baz: Type.String }) }),
        }),
      );

      assert<
        AssertEndpoint<{
          foo: { bar: { baz: string } };
        }, typeof e2>
      >();

      await expect(e2.post({ foo: { bar: { baz: "quux" } } })).resolves.toEqual(
        {
          data: { foo: { bar: { baz: "quux" } } },
          validationResults: {
            value: { foo: { bar: { baz: "quux" } } },
          },
        },
      );

      await expect(e2.post({ foo: { bar: { baz: true } } })).resolves.toEqual({
        data: { foo: { bar: { baz: true } } },
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a string
                Path: $.foo.bar.baz
                Expected: PrimitiveSchema[ string ]
                Got: boolean
              `,
              path: [
                { key: "$" },
                { key: "foo" },
                { key: "bar" },
                { key: "baz" },
              ],
            },
          ],
        },
      });
    });

    it("correctly validates arrays", async () => {
      const e = endpoint(Type.Array(Type.String, Type.Set(Type.Number)));

      assert<AssertEndpoint<Array<string | Set<number>>, typeof e>>();

      await expect(e.post(["hello", "world", new Set([1, 2])])).resolves
        .toEqual({
          data: ["hello", "world", new Set([1, 2])],
          validationResults: {
            value: ["hello", "world", new Set([1, 2])],
          },
        });

      await expect(e.post(["hello", 1])).resolves.toEqual({
        data: ["hello", 1],
        validationResults: {
          issues: [
            {
              message: dedent`
                AggregateValidationError: does not match any of the types in the union
                Path: $[1]
                Errors:
                  ValidationError: not a string
                  Path: $[1]
                  Expected: PrimitiveSchema[ string ]
                  Got: number

                  ValidationError: not an object
                  Path: $[1]
                  Expected: SetSchema[ PrimitiveSchema[ number ] ]
                  Got: number`,
              path: [{ key: "$" }, { key: "1" }],
            },
          ],
        },
      });
    });

    it("correctly validates sets", async () => {
      const e = endpoint(
        Type.Set(Type.String, Type.Record({ foo: Type.String })),
      );

      assert<AssertEndpoint<Set<string | { foo: string }>, typeof e>>();

      await expect(e.post(new Set(["hello", "world"]))).resolves.toEqual({
        data: new Set(["hello", "world"]),
        validationResults: {
          value: new Set(["hello", "world"]),
        },
      });

      await expect(e.post(new Set(["hello", 1]))).resolves.toEqual({
        data: new Set(["hello", 1]),
        validationResults: {
          issues: [
            {
              message: dedent`
                AggregateValidationError: does not match any of the types in the union
                Path: $["SET_ELEMENT"]
                Errors:
                  ValidationError: not a string
                  Path: $["SET_ELEMENT"]
                  Expected: PrimitiveSchema[ string ]
                  Got: number

                  ValidationError: not an object
                  Path: $["SET_ELEMENT"]
                  Expected: RecordSchema[ foo=PrimitiveSchema[ string ] ]
                  Got: number`,
              path: [{ key: "$" }, { key: "SET_ELEMENT" }],
            },
          ],
        },
      });
    });

    it("correctly validates dictionaries", async () => {
      const e = endpoint(
        Type.Dict(Type.String, Type.Record({ args: Type.String })),
      );

      assert<
        AssertEndpoint<
          Record<string | number, { args: string } | string>,
          typeof e
        >
      >();

      await expect(e.post({ key1: "value1", key2: "value2" })).resolves.toEqual(
        {
          data: { key1: "value1", key2: "value2" },
          validationResults: {
            value: { key1: "value1", key2: "value2" },
          },
        },
      );

      await expect(e.post({ key1: "value1", key2: 2 })).resolves.toEqual({
        data: { key1: "value1", key2: 2 },
        validationResults: {
          issues: [
            {
              message: dedent`
                AggregateValidationError: does not match any of the types in the union
                Path: $.key2
                Errors:
                  ValidationError: not a string
                  Path: $.key2
                  Expected: PrimitiveSchema[ string ]
                  Got: number

                  ValidationError: not an object
                  Path: $.key2
                  Expected: RecordSchema[ args=PrimitiveSchema[ string ] ]
                  Got: number`,
              path: [{ key: "$" }, { key: "key2" }],
            },
          ],
        },
      });
    });

    it("correctly validates tuples", async () => {
      const e = endpoint(
        Type.Tuple(
          Type.String,
          Type.Record({ arr: Type.Array(Type.Number) }),
        ),
      );

      assert<
        AssertEndpoint<[string, { arr: number[] }], typeof e>
      >();

      await expect(e.post(["hello", { arr: [1, 2] }])).resolves.toEqual({
        data: ["hello", { arr: [1, 2] }],
        validationResults: {
          value: ["hello", { arr: [1, 2] }],
        },
      });

      await expect(e.post(["hello", "world"])).resolves.toEqual({
        data: ["hello", "world"],
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not an object
                Path: $[1]
                Expected: RecordSchema[ arr=ArraySchema[ PrimitiveSchema[ number ] ] ]
                Got: string`,
              path: [{ key: "$" }, { key: "1" }],
            },
          ],
        },
      });
    });

    it("correctly validates one of types", async () => {
      const e = endpoint(
        Type.OneOf(
          Type.String,
          Type.Number,
          Type.Record({ args: Type.String }),
        ),
      );

      assert<
        AssertEndpoint<string | number | { args: string }, typeof e>
      >();

      await expect(e.post("hello")).resolves.toEqual({
        data: "hello",
        validationResults: {
          value: "hello",
        },
      });

      await expect(e.post(1)).resolves.toEqual({
        data: 1,
        validationResults: {
          value: 1,
        },
      });

      await expect(e.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message: dedent`
                AggregateValidationError: does not match any of the types in the union
                Path: $
                Errors:
                  ValidationError: not a string
                  Path: $
                  Expected: PrimitiveSchema[ string ]
                  Got: boolean

                  ValidationError: not a number
                  Path: $
                  Expected: PrimitiveSchema[ number ]
                  Got: boolean

                  ValidationError: not an object
                  Path: $
                  Expected: RecordSchema[ args=PrimitiveSchema[ string ] ]
                  Got: boolean`,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });

    it("correctly validates all of types", async () => {
      const e = endpoint(
        Type.AllOf(
          Type.Record({ foo: Type.String }),
          Type.Record({ bar: Type.Literal("bar") }),
          Type.Record({
            baz: { required: false, type: Type.Array(Type.Number) },
          }),
        ),
      );

      assert<
        AssertEndpoint<{
          foo: string;
          bar: "bar";
          baz?: number[];
        }, typeof e>
      >();

      await expect(e.post({ foo: "abc", bar: "bar" })).resolves.toEqual({
        data: { foo: "abc", bar: "bar" },
        validationResults: {
          value: { foo: "abc", bar: "bar" },
        },
      });

      await expect(e.post({ foo: "abc", bar: "baz" })).resolves.toEqual({
        data: { foo: "abc", bar: "baz" },
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not equal to the expected literal value
                Path: $.bar
                Expected: LiteralSchema[ bar ]
                Got: string`,
              path: [{ key: "$" }, { key: "bar" }],
            },
          ],
        },
      });
    });

    it("correctly validates literals", async () => {
      const e = endpoint(Type.Literal("hello"));

      assert<AssertEndpoint<"hello", typeof e>>();

      await expect(e.post("hello")).resolves.toEqual({
        data: "hello",
        validationResults: {
          value: "hello",
        },
      });

      await expect(e.post("world")).resolves.toEqual({
        data: "world",
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not equal to the expected literal value
                Path: $
                Expected: LiteralSchema[ hello ]
                Got: string`,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });

    it("correctly validates enums", async () => {
      enum TestEnum {
        A = "A",
        B = "B",
      }
      const e = endpoint(Type.Enum(TestEnum));

      assert<AssertEndpoint<TestEnum, typeof e>>();

      await expect(e.post(TestEnum.A)).resolves.toEqual({
        data: TestEnum.A,
        validationResults: {
          value: TestEnum.A,
        },
      });

      await expect(e.post("C")).resolves.toEqual({
        data: "C",
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a valid enum value
                Path: $
                Expected: EnumSchema[ A | B ]
                Got: string`,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });

    it("correctly validates enum members", async () => {
      enum TestEnum {
        A = "A",
        B = "B",
      }
      const e = endpoint(Type.EnumMember(TestEnum.A));

      assert<AssertEndpoint<TestEnum.A, typeof e>>();

      await expect(e.post(TestEnum.A)).resolves.toEqual({
        data: TestEnum.A,
        validationResults: {
          value: TestEnum.A,
        },
      });

      await expect(e.post(TestEnum.B)).resolves.toEqual({
        data: TestEnum.B,
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not a valid enum member
                Path: $
                Expected: EnumMemberSchema[ A ]
                Got: string`,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });

    it("correctly validates instances", async () => {
      class TestClass {}
      const e = endpoint(Type.InstanceOf(TestClass));

      assert<AssertEndpoint<TestClass, typeof e>>();

      const instance = new TestClass();
      await expect(e.post(instance)).resolves.toEqual({
        data: instance,
        validationResults: {
          value: instance,
        },
      });

      await expect(e.post({})).resolves.toEqual({
        data: {},
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not an instance of TestClass
                Path: $
                Expected: InstanceofSchema[ TestClass() ]
                Got: object`,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });

    it("correctly validates custom types", async () => {
      const e = endpoint(
        Type.Custom((value): value is "string" =>
          value === "string" ? true : false
        ),
      );

      assert<AssertEndpoint<"string", typeof e>>();

      await expect(e.post("string")).resolves.toEqual({
        data: "string",
        validationResults: {
          value: "string",
        },
      });

      await expect(e.post("123")).resolves.toEqual({
        data: "123",
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: value does not conform the data type structure definition
                Path: $
                Expected: CustomSchema[  ]
                Got: string
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });

    it("correctly validates string regex matcher", async () => {
      const e = endpoint(
        Type.String.matching(/^START.+END$/),
      );

      assert<AssertEndpoint<string, typeof e>>();

      await expect(e.post("START hello END")).resolves.toEqual({
        data: "START hello END",
        validationResults: {
          value: "START hello END",
        },
      });

      await expect(e.post("START hello END|")).resolves.toEqual({
        data: "START hello END|",
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: does not match the pattern
                Path: $
                Expected: PrimitiveSchema[ string (/^START.+END$/) ]
                Got: string
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });

    it("correctly validates circular types", async () => {
      const e = endpoint(
        Type.Recursive(self =>
          Type.Record({
            foo: Type.String,
            childs: Type.Array(self),
          })
        ),
      );

      assert<
        AssertEndpoint<{
          foo: string;
          childs: Array<{
            foo: string;
            childs: Array<{
              foo: string;
              childs: any[];
            }>;
          }>;
        }, typeof e>
      >();

      await expect(
        e.post({
          foo: "l1",
          childs: [{ foo: "l2", childs: [{ foo: "l3", childs: [] }] }],
        }),
      ).resolves.toEqual({
        data: {
          foo: "l1",
          childs: [{ foo: "l2", childs: [{ foo: "l3", childs: [] }] }],
        },
        validationResults: {
          value: {
            foo: "l1",
            childs: [{ foo: "l2", childs: [{ foo: "l3", childs: [] }] }],
          },
        },
      });

      await expect(e.post("123")).resolves.toEqual({
        data: "123",
        validationResults: {
          issues: [
            {
              message: dedent`
                ValidationError: not an object
                Path: $
                Expected: RecordSchema[ foo=PrimitiveSchema[ string ]; childs=ArraySchema[ RecursiveRefSchema[] ] ]
                Got: string
              `,
              path: [{ key: "$" }],
            },
          ],
        },
      });
    });
  });

  describe("compiled validation function", () => {
    it("correctly validates simple types", async () => {
      const e1 = endpoint(Type.Boolean.compile());
      const e2 = endpoint(Type.String.compile());
      const e3 = endpoint(Type.Number.compile());
      const e4 = endpoint(Type.Null.compile());
      const e5 = endpoint(Type.Symbol.compile());
      const e6 = endpoint(Type.Undefined.compile());
      const e7 = endpoint(Type.Int.compile());

      await expect(e1.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          value: true,
        },
      });
      await expect(e2.post("true")).resolves.toEqual({
        data: "true",
        validationResults: {
          value: "true",
        },
      });
      await expect(e3.post(231.23)).resolves.toEqual({
        data: 231.23,
        validationResults: {
          value: 231.23,
        },
      });
      await expect(e4.post(null)).resolves.toEqual({
        data: null,
        validationResults: {
          value: null,
        },
      });
      const sym = Symbol("test");
      await expect(e5.post(sym)).resolves.toEqual({
        data: sym,
        validationResults: {
          value: sym,
        },
      });
      await expect(e6.post(undefined)).resolves.toEqual({
        data: undefined,
        validationResults: {
          value: undefined,
        },
      });
      await expect(e7.post(1)).resolves.toEqual({
        data: 1,
        validationResults: {
          value: 1,
        },
      });

      await expect(e1.post("")).resolves.toEqual({
        data: "",
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
      await expect(e2.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
      await expect(e3.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
      await expect(e4.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
      await expect(e5.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
      await expect(e6.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
      await expect(e7.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates records", async () => {
      const e = endpoint(
        Type.Record({
          a: Type.String,
          b: Type.Number,
          c: { type: Type.Record({ foo: Type.Boolean }), required: false },
        }).compile(),
      );

      await expect(e.post({ a: "hello", b: 1 })).resolves.toEqual({
        data: { a: "hello", b: 1 },
        validationResults: {
          value: { a: "hello", b: 1 },
        },
      });

      await expect(e.post({ a: "hello", b: "1" })).resolves.toEqual({
        data: { a: "hello", b: "1" },
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });

      const e2 = endpoint(
        Type.Record({
          foo: Type.Record({ bar: Type.Record({ baz: Type.String }) }),
        }).compile(),
      );

      await expect(e2.post({ foo: { bar: { baz: "quux" } } })).resolves.toEqual(
        {
          data: { foo: { bar: { baz: "quux" } } },
          validationResults: {
            value: { foo: { bar: { baz: "quux" } } },
          },
        },
      );

      await expect(e2.post({ foo: { bar: { baz: true } } })).resolves.toEqual({
        data: { foo: { bar: { baz: true } } },
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates arrays", async () => {
      const e = endpoint(
        Type.Array(Type.String, Type.Set(Type.Number)).compile(),
      );

      await expect(e.post(["hello", "world", new Set([1, 2])])).resolves
        .toEqual({
          data: ["hello", "world", new Set([1, 2])],
          validationResults: {
            value: ["hello", "world", new Set([1, 2])],
          },
        });

      await expect(e.post(["hello", 1])).resolves.toEqual({
        data: ["hello", 1],
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates sets", async () => {
      const e = endpoint(
        Type.Set(Type.String, Type.Record({ foo: Type.String }))
          .compile(),
      );

      await expect(e.post(new Set(["hello", "world"]))).resolves.toEqual({
        data: new Set(["hello", "world"]),
        validationResults: {
          value: new Set(["hello", "world"]),
        },
      });

      await expect(e.post(new Set(["hello", 1]))).resolves.toEqual({
        data: new Set(["hello", 1]),
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates dictionaries", async () => {
      const e = endpoint(
        Type.Dict(Type.String, Type.Record({ args: Type.String }))
          .compile(),
      );

      await expect(e.post({ key1: "value1", key2: "value2" })).resolves.toEqual(
        {
          data: { key1: "value1", key2: "value2" },
          validationResults: {
            value: { key1: "value1", key2: "value2" },
          },
        },
      );

      await expect(e.post({ key1: "value1", key2: 2 })).resolves.toEqual({
        data: { key1: "value1", key2: 2 },
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates tuples", async () => {
      const e = endpoint(
        Type.Tuple(
          Type.String,
          Type.Record({ arr: Type.Array(Type.Number) }),
        ).compile(),
      );

      await expect(e.post(["hello", { arr: [1, 2] }])).resolves.toEqual({
        data: ["hello", { arr: [1, 2] }],
        validationResults: {
          value: ["hello", { arr: [1, 2] }],
        },
      });

      await expect(e.post(["hello", "world"])).resolves.toEqual({
        data: ["hello", "world"],
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates one of types", async () => {
      const e = endpoint(
        Type.OneOf(
          Type.String,
          Type.Number,
          Type.Record({ args: Type.String }),
        ).compile(),
      );

      await expect(e.post("hello")).resolves.toEqual({
        data: "hello",
        validationResults: {
          value: "hello",
        },
      });

      await expect(e.post(1)).resolves.toEqual({
        data: 1,
        validationResults: {
          value: 1,
        },
      });

      await expect(e.post(true)).resolves.toEqual({
        data: true,
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates all of types", async () => {
      const e = endpoint(
        Type.AllOf(
          Type.Record({ foo: Type.String }),
          Type.Record({ bar: Type.Literal("bar") }),
          Type.Record({
            baz: { required: false, type: Type.Array(Type.Number) },
          }),
        ).compile(),
      );

      await expect(e.post({ foo: "abc", bar: "bar" })).resolves.toEqual({
        data: { foo: "abc", bar: "bar" },
        validationResults: {
          value: { foo: "abc", bar: "bar" },
        },
      });

      await expect(e.post({ foo: "abc", bar: "baz" })).resolves.toEqual({
        data: { foo: "abc", bar: "baz" },
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates literals", async () => {
      const e = endpoint(Type.Literal("hello").compile());

      await expect(e.post("hello")).resolves.toEqual({
        data: "hello",
        validationResults: {
          value: "hello",
        },
      });

      await expect(e.post("world")).resolves.toEqual({
        data: "world",
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates enums", async () => {
      enum TestEnum {
        A = "A",
        B = "B",
      }
      const e = endpoint(Type.Enum(TestEnum).compile());

      await expect(e.post(TestEnum.A)).resolves.toEqual({
        data: TestEnum.A,
        validationResults: {
          value: TestEnum.A,
        },
      });

      await expect(e.post("C")).resolves.toEqual({
        data: "C",
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates enum members", async () => {
      enum TestEnum {
        A = "A",
        B = "B",
      }
      const e = endpoint(Type.EnumMember(TestEnum.A).compile());

      await expect(e.post(TestEnum.A)).resolves.toEqual({
        data: TestEnum.A,
        validationResults: {
          value: TestEnum.A,
        },
      });

      await expect(e.post(TestEnum.B)).resolves.toEqual({
        data: TestEnum.B,
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates instances", async () => {
      class TestClass {}
      const e = endpoint(Type.InstanceOf(TestClass).compile());

      const instance = new TestClass();
      await expect(e.post(instance)).resolves.toEqual({
        data: instance,
        validationResults: {
          value: instance,
        },
      });

      await expect(e.post({})).resolves.toEqual({
        data: {},
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates custom types", async () => {
      const e = endpoint(
        Type.Custom((value): value is "string" =>
          value === "string" ? true : false
        ).compile(),
      );

      await expect(e.post("string")).resolves.toEqual({
        data: "string",
        validationResults: {
          value: "string",
        },
      });

      await expect(e.post("123")).resolves.toEqual({
        data: "123",
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates string regex matcher", async () => {
      const e = endpoint(
        Type.String.matching(/^START.+END$/).compile(),
      );

      await expect(e.post("START hello END")).resolves.toEqual({
        data: "START hello END",
        validationResults: {
          value: "START hello END",
        },
      });

      await expect(e.post("START hello END|")).resolves.toEqual({
        data: "START hello END|",
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });

    it("correctly validates circular types", async () => {
      const e = endpoint(
        Type.Recursive(self =>
          Type.Record({
            foo: Type.String,
            childs: Type.Array(self),
          })
        ).compile(),
      );

      await expect(
        e.post({
          foo: "l1",
          childs: [{ foo: "l2", childs: [{ foo: "l3", childs: [] }] }],
        }),
      ).resolves.toEqual({
        data: {
          foo: "l1",
          childs: [{ foo: "l2", childs: [{ foo: "l3", childs: [] }] }],
        },
        validationResults: {
          value: {
            foo: "l1",
            childs: [{ foo: "l2", childs: [{ foo: "l3", childs: [] }] }],
          },
        },
      });

      await expect(e.post("123")).resolves.toEqual({
        data: "123",
        validationResults: {
          issues: [
            {
              message:
                "Value does not conform the data type structure definition.",
            },
          ],
        },
      });
    });
  });
});
