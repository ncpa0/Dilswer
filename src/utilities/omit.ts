import type { RecordOf, RecordTypeSchema } from "../types";
import type { OmitRecord } from "./types";

/**
 * Removes specified entries from the RecordOf Data Type. Similar
 * to the Typescript's `Omit<>` utility type.
 */
export const Omit = <R extends RecordTypeSchema, K extends keyof R>(
  recordDataType: RecordOf<R>,
  ...omitKeys: ReadonlyArray<K>
): OmitRecord<R, K> => {
  return {
    recordOf: Object.fromEntries(
      Object.entries(recordDataType.recordOf)
        .filter(([key]) => !omitKeys.includes(key as K))
        .map(([key, desc]) => [key, { ...desc }])
    ) as any,
  };
};
