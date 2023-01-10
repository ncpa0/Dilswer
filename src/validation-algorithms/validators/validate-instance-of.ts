import type { InstanceOf } from "@DataTypes/data-types";
import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateInstanceOf = (
  path: Path,
  type: InstanceOf,
  data: unknown
) => {
  if (typeof data !== "object" || data === null)
    throw new ValidationError(path, type, data);

  if (!(data instanceof type.instanceOf))
    throw new ValidationError(path, type, data);
};
