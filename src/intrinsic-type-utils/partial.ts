import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordType } from "@DataTypes/types/record";
import type { PartialRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Makes all entries from the RecordOf Data Type not required.
 * Similar to the Typescript's `Partial<>` utility type.
 */
export const Partial = <R extends RecordTypeSchema>(
  recordDataType: RecordType<R>,
): PartialRecord<R> => {
  return new RecordType(
    Object.fromEntries(
      Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
        key,
        isFieldDescriptor(descriptor)
          ? { ...descriptor, required: false }
          : { type: descriptor, required: false },
      ]),
    ) as any,
  );
};
