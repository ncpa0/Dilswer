import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordType } from "@DataTypes/types/record";
import type { PickRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Removes the not specified entries from the RecordOf Data Type.
 * Similar to the Typescript's `Pick<>` utility type.
 */
export const Pick = <R extends RecordTypeSchema, K extends keyof R>(
  recordDataType: RecordType<R>,
  ...pickKeys: ReadonlyArray<K>
): PickRecord<R, K> => {
  return new RecordType(
    Object.fromEntries(
      Object.entries(recordDataType.recordOf)
        .filter(([key]) => pickKeys.includes(key as K))
        .map(([key, desc]) => [
          key,
          isFieldDescriptor(desc) ? desc : desc["copy"](),
        ]),
    ) as any,
  );
};
