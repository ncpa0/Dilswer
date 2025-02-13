import type { RecordTypeSchema } from "@DataTypes/types";
import { RecordType } from "@DataTypes/types/record";
import type { SumRecord } from "@Intrinsic/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

/**
 * Merges two RecordOf Data Types into one. Similar to how the
 * Typescript `&` works.
 */
export const And = <R1 extends RecordTypeSchema, R2 extends RecordTypeSchema>(
  recordDataTypeA: RecordType<R1>,
  recordDataTypeB: RecordType<R2>,
): SumRecord<R1, R2> => {
  return new RecordType({
    ...(Object.fromEntries(
      Object.entries(recordDataTypeA.recordOf).map(([key, desc]) => [
        key,
        isFieldDescriptor(desc) ? desc : desc["copy"](),
      ]),
    ) as R1),
    ...(Object.fromEntries(
      Object.entries(recordDataTypeB.recordOf).map(([key, desc]) => [
        key,
        isFieldDescriptor(desc) ? desc : desc["copy"](),
      ]),
    ) as R2),
  });
};
