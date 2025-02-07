import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordOf } from "@DataTypes/types";
import type { OmitRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Removes specified entries from the RecordOf Data Type. Similar
 * to the Typescript's `Omit<>` utility type.
 */
export const Omit = <R extends RecordTypeSchema, K extends keyof R>(
  recordDataType: RecordOf<R>,
  ...omitKeys: ReadonlyArray<K>
): OmitRecord<R, K> => {
  return new RecordOf(
    Object.fromEntries(
      Object.entries(recordDataType.recordOf)
        .filter(([key]) => !omitKeys.includes(key as K))
        .map(([key, desc]) => [
          key,
          isFieldDescriptor(desc) ? desc : desc["copy"](),
        ]),
    ) as any,
  );
};
