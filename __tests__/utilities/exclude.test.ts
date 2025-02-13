import { Exclude, Type } from "../../src";

describe("Exclude utility", () => {
  it("should correctly exclude the data types specified", () => {
    const a = Type.OneOf(
      Type.Array(Type.String),
      Type.Number,
      Type.String,
    );

    expect(Exclude(a, Type.Number)).toMatchObject(
      Type.OneOf(Type.Array(Type.String), Type.String),
    );
  });
});
