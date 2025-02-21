import { Omit, Type } from "../../src";

describe("Omit utility", () => {
  it("should correctly remove the specified keys from data type", () => {
    const a = Type.Record({
      foo: { type: Type.Number },
      bar: { type: Type.String },
      baz: { type: Type.Boolean },
      qux: { type: Type.Symbol },
      coorg: { type: Type.Null },
    });

    expect(Omit(a, "bar", "qux")).toMatchObject(
      Type.Record({
        foo: { type: Type.Number },
        baz: { type: Type.Boolean },
        coorg: { type: Type.Null },
      }),
    );
  });
});
