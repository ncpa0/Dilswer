import { DataType } from "../../src";
import { createValidatedFunction } from "../../src/checker-machine/create-validated-function";

describe("createValidatedFunction", () => {
  it("should execute success function when validation is successful", () => {
    const validator = DataType.RecordOf({
      foo: { type: DataType.String },
    });

    const fn = createValidatedFunction(
      validator,
      (data) => {
        return "success";
      },
      () => {
        return "failure";
      }
    );

    expect(fn({ foo: "foo" })).toEqual("success");

    expect(fn("")).toEqual("failure");
    expect(fn(1)).toEqual("failure");
    expect(fn({})).toEqual("failure");
    expect(fn({ foo: 1 })).toEqual("failure");
  });

  it("should throw an error pointing where the types do not match", () => {
    const validator = DataType.RecordOf({
      foo: {
        type: DataType.RecordOf({
          bar: { type: DataType.Number },
        }),
      },
      baz: { type: DataType.ArrayOf(DataType.String) },
      qux: { type: DataType.SetOf(DataType.Function) },
    });

    const fn = createValidatedFunction(
      validator,
      (data) => {
        return undefined;
      },
      (e) => e
    );

    expect(
      fn({
        foo: { bar: 1 },
        baz: ["baz1", "baz2", "baz3"],
        qux: new Set([() => {}]),
      })
    ).toEqual(undefined);

    expect(
      fn({
        foo: { bar: "1" },
        baz: ["baz1", "baz2", "baz3"],
        qux: new Set([() => {}]),
      })
    ).toMatchObject({
      fieldPath: "$.foo.bar",
      receivedValue: "1",
      expectedValueType: DataType.Number,
    });

    expect(
      fn({
        foo: { bar: 1 },
        baz: ["baz1", "baz2", 0],
        qux: new Set([() => {}]),
      })
    ).toMatchObject({
      fieldPath: "$.baz.2",
      receivedValue: 0,
      expectedValueType: DataType.OneOf(DataType.String),
    });

    expect(
      fn({
        foo: { bar: 1 },
        baz: ["baz1", "baz2"],
        qux: () => {},
      })
    ).toMatchObject({
      fieldPath: "$.qux",
      receivedValue: expect.any(Function),
      expectedValueType: DataType.SetOf(DataType.Function),
    });

    expect(fn("abcde")).toMatchObject({
      fieldPath: "$",
      receivedValue: "abcde",
      expectedValueType: validator,
    });
  });
});
