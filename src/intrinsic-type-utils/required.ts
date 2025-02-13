import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordType } from "@DataTypes/types/record";
import type { RequiredRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Makes all entries from the RecordOf Data Type required.
 * Similar to the Typescript's `Required<>` utility type.
 */
export const Required = <R extends RecordTypeSchema>(
  recordDataType: RecordType<R>,
): RequiredRecord<R> => {
  return new RecordType(
    Object.fromEntries(
      Object.entries(recordDataType.recordOf).map(([key, descriptor]) => [
        key,
        isFieldDescriptor(descriptor)
          ? { ...descriptor, required: true }
          : { type: descriptor, required: true },
      ]),
    ) as any,
  );
};
