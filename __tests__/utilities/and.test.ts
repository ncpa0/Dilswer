import { And, DataType } from "../../src";

describe("And utility", () => {
  it("should correctly merge the two record data types", () => {
    const a = DataType.RecordOf({
      foo: { type: DataType.Number },
      bar: { type: DataType.String },
    });

    const b = DataType.RecordOf({
      bar: { type: DataType.Boolean },
      baz: { type: DataType.Symbol },
    });

    expect(And(a, b)).toMatchObject(
      DataType.RecordOf({
        foo: { type: DataType.Number },
        bar: { type: DataType.Boolean },
        baz: { type: DataType.Symbol },
      }),
    );
  });
});
