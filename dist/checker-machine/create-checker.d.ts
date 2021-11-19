import type { ParseDataType, ReWrap } from "../type-utils";
import type { AllDataTypes } from "../types";
export declare const createChecker: <DT extends AllDataTypes>(dataType: DT) => (data: unknown) => data is ReWrap<ParseDataType<DT>>;
