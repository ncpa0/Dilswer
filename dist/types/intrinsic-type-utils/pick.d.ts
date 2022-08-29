import type { RecordOf, RecordTypeSchema } from "../data-types/types";
import type { PickRecord } from "./types";
/**
 * Removes the not specified entries from the RecordOf Data Type.
 * Similar to the Typescript's `Pick<>` utility type.
 */
export declare const Pick: <R extends RecordTypeSchema, K extends keyof R>(recordDataType: RecordOf<R>, ...pickKeys: readonly K[]) => PickRecord<R, K>;
