import { dataTypeSymbol } from "../schame-construction-helpers";
import { isFieldDescriptor } from "../shared/is-field-descriptor";
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
    [dataTypeSymbol]: true,
    recordOf: Object.fromEntries(
      Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
        key,
        isFieldDescriptor(descriptor)
          ? { ...descriptor, required: true }
          : { type: descriptor, required: true },
      ])
    ) as any,
  };
};
