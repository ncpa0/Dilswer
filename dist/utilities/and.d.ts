import type { RecordOf, RecordTypeSchema } from "../types";
import type { SumRecord } from "./types";
/**
 * Merges two RecordOf Data Types into one. Similar to how the
 * Typescript `&` works.
 */
export declare const And: <R1 extends RecordTypeSchema, R2 extends RecordTypeSchema>(recordDataTypeA: RecordOf<R1>, recordDataTypeB: RecordOf<R2>) => SumRecord<R1, R2>;
