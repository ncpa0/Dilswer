import type { RecordOf, RecordTypeSchema } from "../data-types/types";
import type { OmitRecord } from "./types";
/**
 * Removes specified entries from the RecordOf Data Type. Similar
 * to the Typescript's `Omit<>` utility type.
 */
export declare const Omit: <R extends RecordTypeSchema, K extends keyof R>(recordDataType: RecordOf<R>, ...omitKeys: readonly K[]) => OmitRecord<R, K>;
