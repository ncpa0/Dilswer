import { dataTypeSymbol } from "@DataTypes/data-types";
import type { RecordOf, RecordTypeSchema } from "@DataTypes/types";
import type { PickRecord } from "@Intrinsic/types";

/**
 * Removes the not specified entries from the RecordOf Data Type.
 * Similar to the Typescript's `Pick<>` utility type.
 */
export const Pick = <R extends RecordTypeSchema, K extends keyof R>(
  recordDataType: RecordOf<R>,
  ...pickKeys: ReadonlyArray<K>
): PickRecord<R, K> => {
  return {
    [dataTypeSymbol]: true,
    recordOf: Object.fromEntries(
      Object.entries(recordDataType.recordOf)
        .filter(([key]) => pickKeys.includes(key as K))
        .map(([key, desc]) => [
          key,
          typeof desc === "object" && desc !== null ? { ...desc } : desc,
        ])
    ) as any,
  };
};
