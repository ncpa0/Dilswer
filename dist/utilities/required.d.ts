import type { RecordOf, RecordTypeSchema } from "../types";
import type { RequiredRecord } from "./types";
/**
 * Makes all entries from the RecordOf Data Type required.
 * Similar to the Typescript's `Required<>` utility type.
 */
export declare const Required: <R extends RecordTypeSchema>(recordDataType: RecordOf<R>) => RequiredRecord<R>;
