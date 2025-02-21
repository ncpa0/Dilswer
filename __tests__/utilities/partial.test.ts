import { Partial, Type } from "../../src";

describe("Partial utility", () => {
  it("should correctly set all fields as not required", () => {
    const a = Type.Record({
      foo: { type: Type.Number, required: true },
      bar: { type: Type.String, required: false },
      baz: { type: Type.Boolean, required: true },
      qux: { type: Type.Symbol, required: false },
      coorg: { type: Type.Null },
    });

    expect(Partial(a)).toMatchObject(
      Type.Record({
        foo: { type: Type.Number, required: false },
        bar: { type: Type.String, required: false },
        baz: { type: Type.Boolean, required: false },
        qux: { type: Type.Symbol, required: false },
        coorg: { type: Type.Null, required: false },
      }),
    );
  });
});
