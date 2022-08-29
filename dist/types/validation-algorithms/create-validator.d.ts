import type { ParseDataType, ReWrap } from "../data-types/type-utils";
import type { AllDataTypes } from "../data-types/types";
/**
 * Higher order function that generates a validator which will
 * check the provided `data` against the `dataType` type
 * structure definition and returns a boolean indicating if the
 * check was successful.
 */
export declare const createValidator: <DT extends AllDataTypes>(dataType: DT) => (data: unknown) => data is ReWrap<ParseDataType<DT>>;
/** Function alias for the `createValidator`. */
export declare const createChecker: <DT extends AllDataTypes>(dataType: DT) => (data: unknown) => data is ReWrap<ParseDataType<DT>>;
