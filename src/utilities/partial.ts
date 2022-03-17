import type { RecordOf, RecordTypeSchema } from "../types";
import type { PartialRecord } from "./types";

/**
 * Makes all entries from the RecordOf Data Type not required.
 * Similar to the Typescript's `Partial<>` utility type.
 */
export const Partial = <R extends RecordTypeSchema>(
  recordDataType: RecordOf<R>
): PartialRecord<R> => {
  return {
    recordOf: Object.fromEntries(
      Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
        key,
        { ...descriptor, required: false },
      ])
    ) as any,
  };
};
