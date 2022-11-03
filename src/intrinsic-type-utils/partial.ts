import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordOf } from "@DataTypes/types";
import type { PartialRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Makes all entries from the RecordOf Data Type not required.
 * Similar to the Typescript's `Partial<>` utility type.
 */
export const Partial = <R extends RecordTypeSchema>(
  recordDataType: RecordOf<R>
): PartialRecord<R> => {
  return new RecordOf(
    Object.fromEntries(
      Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
        key,
        isFieldDescriptor(descriptor)
          ? { ...descriptor, required: false }
          : { type: descriptor, required: false },
      ])
    ) as any
  );
};
