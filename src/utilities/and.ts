import { dataTypeSymbol } from "../type-def-helpers";
import type { RecordOf, RecordTypeSchema } from "../types";
import type { SumRecord } from "./types";

/**
 * Merges two RecordOf Data Types into one. Similar to how the
 * Typescript `&` works.
 */
export const And = <R1 extends RecordTypeSchema, R2 extends RecordTypeSchema>(
  recordDataTypeA: RecordOf<R1>,
  recordDataTypeB: RecordOf<R2>
): SumRecord<R1, R2> => {
  return {
    [dataTypeSymbol]: true,
    recordOf: {
      ...(Object.fromEntries(
        Object.entries(recordDataTypeA.recordOf).map(([key, desc]) => [
          key,
          typeof desc === "object" && desc !== null ? { ...desc } : desc,
        ])
      ) as R1),
      ...(Object.fromEntries(
        Object.entries(recordDataTypeB.recordOf).map(([key, desc]) => [
          key,
          typeof desc === "object" && desc !== null ? { ...desc } : desc,
        ])
      ) as R2),
    },
  };
};
