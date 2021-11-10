import { ParseDataType, ReWrap } from "../type-utils";
import { AllDataTypes } from "../types";
import { validateType } from "./validators/validate-type";

export const createChecker = <DT extends AllDataTypes>(dataType: DT) => {
  return (data: unknown): data is ReWrap<ParseDataType<DT>> => {
    try {
      validateType("$", dataType, data);
      return true;
    } catch (e) {
      return false;
    }
  };
};
