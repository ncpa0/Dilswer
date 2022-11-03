import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordOf } from "@DataTypes/types";
import type { SumRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Merges two RecordOf Data Types into one. Similar to how the
 * Typescript `&` works.
 */
export const And = <R1 extends RecordTypeSchema, R2 extends RecordTypeSchema>(
  recordDataTypeA: RecordOf<R1>,
  recordDataTypeB: RecordOf<R2>
): SumRecord<R1, R2> => {
  return new RecordOf({
    ...(Object.fromEntries(
      Object.entries(recordDataTypeA.recordOf).map(([key, desc]) => [
        key,
        isFieldDescriptor(desc) ? desc : desc["copy"](),
      ])
    ) as R1),
    ...(Object.fromEntries(
      Object.entries(recordDataTypeB.recordOf).map(([key, desc]) => [
        key,
        isFieldDescriptor(desc) ? desc : desc["copy"](),
      ])
    ) as R2),
  });
};
