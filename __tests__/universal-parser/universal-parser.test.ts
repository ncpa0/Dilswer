import { RecordVisitChild } from "@DataTypes/types";
import {
  AnyType,
  parseWith,
  RecordType,
  Type,
  TypeVisitor,
} from "../../src/index";

describe("parseWith", () => {
  it("should parse a type using the provided visitor interface", () => {
    type TestParsedFormat = {
      name: string;
      simpleType?: string;
      children: TestParsedFormat[] | RecordVisitChild<TestParsedFormat>[];
    };

    class TestVisitor implements TypeVisitor<TestParsedFormat> {
      visit(
        dataType: Exclude<AnyType, RecordType>,
        children?: TestParsedFormat[],
      ): TestParsedFormat;
      visit(
        dataType: RecordType,
        children?: RecordVisitChild<TestParsedFormat>[],
      ): TestParsedFormat;
      visit(dataType: AnyType, children: any[] = []): TestParsedFormat {
        return {
          name: dataType.kind,
          simpleType: dataType.kind === "simple"
            ? dataType.simpleType
            : undefined,
          children: children.map((c) =>
            c._isRecordOfVisitChild
              ? { ...c.child, propertyName: c.propertyName }
              : c
          ),
        };
      }
    }

    const parsed = parseWith(
      new TestVisitor(),
      Type.Record({
        foo: Type.String,
        bar: Type.Number,
        baz: Type.Record({
          qux: Type.Boolean,
          quux: Type.Array(Type.String),
        }),
      }),
    );

    expect(parsed).toEqual({
      name: "record",
      children: [
        {
          propertyName: "foo",
          name: "simple",
          simpleType: "string",
          children: [],
        },
        {
          propertyName: "bar",
          name: "simple",
          simpleType: "number",
          children: [],
        },
        {
          propertyName: "baz",
          name: "record",
          simpleType: undefined,
          children: [
            {
              propertyName: "qux",
              name: "simple",
              simpleType: "boolean",
              children: [],
            },
            {
              propertyName: "quux",
              name: "array",
              simpleType: undefined,
              children: [
                {
                  name: "simple",
                  simpleType: "string",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("readme example test", () => {
    type Node = {
      typeName: string;
      children?: Node[] | Record<string, Node>;
    };

    const visitor = {
      visit(
        type: AnyType,
        children?: Node[] | RecordVisitChild<Node>[],
      ): Node {
        switch (type.kind) {
          case "simple":
            return { typeName: type.simpleType };
          case "record":
            return {
              typeName: "record",
              children: children
                && Object.fromEntries(
                  (children as RecordVisitChild<Node>[]).map(
                    ({ propertyName, child }) => [propertyName, child],
                  ),
                ),
            };
          default:
            return { typeName: type.kind, children: children as Node[] };
        }
      },
    };

    const type = Type.Record({
      foo: Type.String,
      bar: Type.Array(Type.Number),
      baz: Type.OneOf(Type.String, Type.Number),
    });

    const nodeTree = parseWith(visitor, type);

    expect(nodeTree).toMatchSnapshot();
  });
});
