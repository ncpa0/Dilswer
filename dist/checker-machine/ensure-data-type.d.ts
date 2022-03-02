import type { AllDataTypes } from "..";
/**
 * Checks the provided `data` against the `dataType` type
 * definition and throws an ValidationError if the `data` does
 * not conform to the `dataType`
 */
export declare const ensureDataType: <DT extends AllDataTypes>(dataType: DT, data: unknown) => void;
