import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordOf } from "@DataTypes/types";
import type { RequiredRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Makes all entries from the RecordOf Data Type required.
 * Similar to the Typescript's `Required<>` utility type.
 */
export const Required = <R extends RecordTypeSchema>(
  recordDataType: RecordOf<R>
): RequiredRecord<R> => {
  return new RecordOf(
    Object.fromEntries(
      Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
        key,
        isFieldDescriptor(descriptor)
          ? { ...descriptor, required: true }
          : { type: descriptor, required: true },
      ])
    ) as any
  );
};
