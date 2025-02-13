import { Pick, Type } from "../../src";

describe("Pick utility", () => {
  it("should correctly remove the un-specified keys from data type", () => {
    const a = Type.Record({
      foo: { type: Type.Number },
      bar: { type: Type.String },
      baz: { type: Type.Boolean },
      qux: { type: Type.Symbol },
      coorg: { type: Type.Null },
    });

    expect(Pick(a, "bar", "qux")).toMatchObject(
      Type.Record({
        bar: { type: Type.String },
        qux: { type: Type.Symbol },
      }),
    );
  });
});
