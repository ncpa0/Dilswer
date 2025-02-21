import { Required, Type } from "../../src";

describe("Required utility", () => {
  it("should correctly set all fields as required", () => {
    const a = Type.Record({
      foo: { type: Type.Number, required: true },
      bar: { type: Type.String, required: false },
      baz: { type: Type.Boolean, required: true },
      qux: { type: Type.Symbol, required: false },
      coorg: { type: Type.Null },
    });

    expect(Required(a)).toMatchObject(
      Type.Record({
        foo: { type: Type.Number, required: true },
        bar: { type: Type.String, required: true },
        baz: { type: Type.Boolean, required: true },
        qux: { type: Type.Symbol, required: true },
        coorg: { type: Type.Null, required: true },
      }),
    );
  });
});
