import type { RecordOf, RecordTypeSchema } from "../data-types/types";
import type { PartialRecord } from "./types";
/**
 * Makes all entries from the RecordOf Data Type not required.
 * Similar to the Typescript's `Partial<>` utility type.
 */
export declare const Partial: <R extends RecordTypeSchema>(recordDataType: RecordOf<R>) => PartialRecord<R>;
