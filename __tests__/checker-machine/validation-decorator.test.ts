import { DataType } from "../../src";
import {
  ClassWithValidation,
  validate,
} from "../../src/checker-machine/validation-decorator";
import { ValidationError } from "../../src/checker-machine/validation-error/validation-error";

describe("validator decorator", () => {
  it("should add validation to a class method", () => {
    const validator = DataType.RecordOf({
      property: { type: DataType.Boolean },
    });

    class Test implements ClassWithValidation {
      onValidationError(
        error: ValidationError,
        data: unknown,
        methodName: string
      ): void {
        throw "failure";
      }

      @validate(validator)
      foo(data: unknown) {
        return "success";
      }
    }

    const testInstance = new Test();

    expect(testInstance.foo({ property: true })).toEqual("success");

    expect(() => testInstance.foo({ property: "foo" })).toThrow("failure");
  });
});
