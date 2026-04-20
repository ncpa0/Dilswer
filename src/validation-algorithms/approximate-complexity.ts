import { AnyType, RecordVisitChild } from "@DataTypes/type-types";

/**
 * Gives a score for a given type that gives a hint of how many possible branches validation of that type may take.
 * These scores are only useful for direct comparison between them and are not intended to be used for anything else.
 */
export function approximateComplexity(t: AnyType) {
  return t._acceptVisitor<number>({
    visit(t, children) {
      switch (t.kind) {
        case "literal":
        case "instanceOf":
        case "enumMember":
        case "simple": {
          return 1;
        }
        case "stringMatching": {
          return 2;
        }
        case "set":
        case "array": {
          return 10 + ((children as number[]).reduce<number>(
            (c, next) => next + c,
            0,
          ) ?? 0);
        }
        case "tuple": {
          return 1 + ((children as number[]).reduce<number>(
            (c, next) => next + c,
            0,
          ) ?? 0);
        }
        case "circularRef":
        case "circular": {
          return 0;
        }
        case "custom": {
          return 1;
        }
        case "dictionary": {
          return 3 + ((children as number[]).reduce<number>(
            (c, next) => next + c,
            0,
          ) ?? 0);
        }
        case "enumUnion": {
          return children?.length ?? 1;
        }
        case "union": {
          return ((children as number[]).reduce<number>(
            (c, next) => next + c,
            0,
          ) ?? 0);
        }
        case "intersection": {
          return Math.floor((children?.length ?? 0) / 2)
            + ((children as number[]).reduce<number>(
              (c, next) => next + c,
              0,
            ) ?? 0);
        }
        case "record": {
          return 2 + ((children as RecordVisitChild<number>[]).reduce<number>(
            (c, next) => next.child + c,
            0,
          ) ?? 0);
        }
      }

      return 0;
    },
  });
}
