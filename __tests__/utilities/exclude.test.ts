import { DataType, Exclude } from "../../src";

describe("Exclude utility", () => {
  it("should correctly exclude the data types specified", () => {
    const a = DataType.OneOf(
      DataType.ArrayOf(DataType.String),
      DataType.Number,
      DataType.String
    );

    expect(Exclude(a, DataType.Number)).toMatchObject(
      DataType.OneOf(DataType.ArrayOf(DataType.String), DataType.String)
    );
  });
});
