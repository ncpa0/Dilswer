import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordOf } from "@DataTypes/types";
import type { PickRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Removes the not specified entries from the RecordOf Data Type.
 * Similar to the Typescript's `Pick<>` utility type.
 */
export const Pick = <R extends RecordTypeSchema, K extends keyof R>(
  recordDataType: RecordOf<R>,
  ...pickKeys: ReadonlyArray<K>
): PickRecord<R, K> => {
  return new RecordOf(
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
