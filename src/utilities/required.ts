import type { RecordOf, RecordTypeSchema } from "../types";
import type { RequiredRecord } from "./types";

/**
 * Makes all entries from the RecordOf Data Type required.
 * Similar to the Typescript's `Required<>` utility type.
 */
export const Required = <R extends RecordTypeSchema>(
  recordDataType: RecordOf<R>
): RequiredRecord<R> => {
  return {
    recordOf: Object.fromEntries(
      Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
        key,
        { ...descriptor, required: true },
      ])
    ) as any,
  };
};
