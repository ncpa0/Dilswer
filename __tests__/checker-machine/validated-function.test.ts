import { DataType } from "../../src";
import { createValidatedFunction } from "../../src/checker-machine/validated-function";

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
});
