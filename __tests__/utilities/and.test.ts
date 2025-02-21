import { And, Type } from "../../src";

describe("And utility", () => {
  it("should correctly merge the two record data types", () => {
    const a = Type.Record({
      foo: { type: Type.Number },
      bar: { type: Type.String },
    });

    const b = Type.Record({
      bar: { type: Type.Boolean },
      baz: { type: Type.Symbol },
    });

    expect(And(a, b)).toMatchObject(
      Type.Record({
        foo: { type: Type.Number },
        bar: { type: Type.Boolean },
        baz: { type: Type.Symbol },
      }),
    );
  });
});
