import type {
  Circular,
  CircularRef,
  InstanceOf,
  StringMatching,
  Tuple,
} from "@DataTypes/data-types";
import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type {
  AllOf,
  AnyDataType,
  ArrayOf,
  BasicDataType,
  Custom,
  DataTypeVisitor,
  Dict,
  Enum,
  EnumMember,
  Literal,
  RecordOf,
  RecordOfVisitChild,
  SetOf,
} from "@DataTypes/types";
import { OneOf } from "@DataTypes/types";

const propertyAccessor = (propertyName: string) => {
  if (propertyName.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/)) {
    return `.${propertyName}`;
  }
  return `[${JSON.stringify(propertyName)}]`;
};

class ConditionBuilder {
  private conditions: Array<string | ConditionBuilder> = [];

  constructor(private type: "&&" | "||") {}

  public add(condition: string | ConditionBuilder) {
    this.conditions.push(condition);
    return this;
  }

  public build(): string {
    if (this.conditions.length === 0) {
      return "true";
    }

    if (this.conditions.length === 1) {
      const c = this.conditions[0];
      return typeof c === "string" ? c : c.build();
    }

    const separator = this.type === "||" ? " || " : " && ";

    return (
      "(" +
      this.conditions
        .map((c): string => (typeof c === "string" ? c : c.build()))
        .join(separator) +
      ")"
    );
  }
}

const condition = (type: "&&" | "||") => new ConditionBuilder(type);

const $type = (
  varname: string,
  type:
    | "string"
    | "number"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
) => {
  return `typeof ${varname} === "${type}"`;
};

const _serialize = (value: string | number | boolean | null | undefined) => {
  return JSON.stringify(value);
};

const $defineFn = (fnName: string, argName: string, body: string) => {
  return {
    declaration: `const ${fnName} = (${argName}) => ${body};`,
    $invokeWith(varname: string) {
      return `${fnName}(${varname})`;
    },
  };
};

const $iife = (passedArg: string, argName: string, body: string) => {
  return `((${argName}) => ${body})(${passedArg})`;
};

const $defineRegexp = (name: string, regexp: RegExp) => {
  return {
    declaration: `const ${name} = new RegExp(${JSON.stringify(
      regexp.source
    )}, ${JSON.stringify(regexp.flags)});`,
    $test(varname: string) {
      return `${name}.test(${varname})`;
    },
  };
};

const $equal = (
  varname: string,
  value: string | number | boolean | null | undefined
) => {
  return `${varname} === ${_serialize(value)}`;
};

const $notEqual = (
  varname: string,
  value: string | number | boolean | null | undefined
) => {
  return `${varname} !== ${_serialize(value)}`;
};

const $laxNotEqual = (
  varname: string,
  value: string | number | boolean | null | undefined
) => {
  return `${varname} != ${_serialize(value)}`;
};

const $isArray = (varname: string) => {
  return `Array.isArray(${varname})`;
};

const $isSet = (varname: string) => {
  return $equal(`${varname}[Symbol.toStringTag]`, "Set");
};

const $isNotSet = (varname: string) => {
  return $notEqual(`${varname}[Symbol.toStringTag]`, "Set");
};

const $isInteger = (varname: string) => {
  return `Number.isInteger(${varname})`;
};

const $notNaN = (varname: string) => {
  return `!Number.isNaN(${varname})`;
};

const $not = (condition: string) => {
  return `!(${condition})`;
};

const $has = (varname: string, key: string) => {
  return `${_serialize(key)} in ${varname}`;
};

const $ternary = (condition: string | ConditionBuilder) => {
  return {
    then(thenValue: string) {
      return {
        else(elseValue: string) {
          return `(${
            typeof condition === "string" ? condition : condition.build()
          } ? ${thenValue} : ${elseValue})`;
        },
      };
    },
  };
};

class ValidateGenerator {
  declarations: string[] = [];
  dependencies: Array<[string, any]> = [];

  constructor(
    children: ValidateGenerator[] | undefined | null,
    private get$validate: (
      varname: string,
      self: ValidateGenerator
    ) => ConditionBuilder
  ) {
    this.addChildren(children ?? []);
  }

  addChildren(children: ValidateGenerator[]) {
    this.declarations.push(...children.flatMap((c) => c.declarations));
    this.dependencies.push(...children.flatMap((c) => c.dependencies));
    return this;
  }

  $validate(varname: string) {
    return this.get$validate(varname, this).build();
  }

  addDeclare(inlined: string) {
    this.declarations.push(inlined);
    return this;
  }

  addDependency(name: string, value: any) {
    this.dependencies.push([name, value]);
    return this;
  }
}

type R = ValidateGenerator;

class DataTypeValidatorVisitor implements DataTypeVisitor<R> {
  includes = {
    stringNumeral: false,
    stringInteger: false,
    circular: false,
    set: false,
    dict: false,
    array: false,
  };

  private circValidationFnNames: Map<AnyDataType, string> = new Map();

  private _counter1 = 0;
  private _counter2 = 0;
  private _counter3 = 0;

  private knownTypes = new Map<AnyDataType, string>();

  constructor() {}

  public getUniqueStringForType(type: AnyDataType) {
    if (this.knownTypes.has(type)) {
      return this.knownTypes.get(type)!;
    }

    const name = `_$t${++this._counter3}`;
    this.knownTypes.set(type, name);

    return name;
  }

  public getUniqueVarName() {
    return `_$a${++this._counter1}`;
  }

  public getUniqueFnName() {
    return `_$v${++this._counter2}`;
  }

  private visitPrimitive(type: BasicDataType): R {
    switch (type.simpleType) {
      case "boolean":
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add($type(varname, "boolean"))
        );
      case "integer":
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add($type(varname, "number")).add($isInteger(varname))
        );
      case "null":
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add($equal(varname, null))
        );
      case "number":
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add($type(varname, "number")).add($notNaN(varname))
        );
      case "string":
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add($type(varname, "string"))
        );
      case "stringinteger":
        this.includes.stringInteger = true;
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add(`_$validateStringInteger(${varname})`)
        );
      case "stringnumeral":
        this.includes.stringNumeral = true;
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add(`_$validateStringNumeral(${varname})`)
        );
      case "unknown":
        return new ValidateGenerator(null, () => condition("&&"));
      case "function":
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add($type(varname, "function"))
        );
      case "symbol":
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add($type(varname, "symbol"))
        );
      case "undefined":
        return new ValidateGenerator(null, (varname) =>
          condition("&&").add($type(varname, "undefined"))
        );
    }
  }

  private visitArrayOf(type: ArrayOf, children?: Array<R>): R {
    this.includes.array = true;

    if (children && children.length > 0) {
      const oneof = this.visitOneOf(new OneOf(type.arrayOf), children);

      const itemName = this.getUniqueVarName();

      const v = oneof.$validate(itemName);

      return new ValidateGenerator([oneof], (varname) =>
        condition("&&")
          .add($isArray(varname))
          .add(`_$every(${varname}, (${itemName}) => ${v})`)
      );
    }

    return new ValidateGenerator(children, (varname) =>
      condition("&&").add($isArray(varname))
    );
  }

  private visitTuple(type: Tuple, children?: Array<R>): R {
    const generator = this;

    return new ValidateGenerator(null, (varname, v) => {
      const cond = condition("&&")
        .add($isArray(varname))
        .add($equal(`${varname}.length`, type.tuple.length));

      if (children && children.length > 0) {
        for (const [index, c] of children.entries()) {
          const argName = generator.getUniqueVarName();

          cond.add(
            $iife(`${varname}[${index}]`, argName, c.$validate(argName))
          );

          v.addChildren([c]);
        }
      }

      return cond;
    });
  }

  private visitRecordOf(
    type: RecordOf,
    children: RecordOfVisitChild<R>[] = []
  ): R {
    const getRecordConditions = (varName: string, v: ValidateGenerator) => {
      const cond = condition("&&")
        .add($type(varName, "object"))
        .add($laxNotEqual(varName, null))
        .add($not($isArray(varName)))
        .add($isNotSet(varName));

      if (children && children.length > 0) {
        for (const c of children) {
          const accessor = propertyAccessor(c.propertyName);
          const nextName = `${varName}${accessor}`;

          if (c.required !== true) {
            cond.add(
              $ternary(
                condition("&&")
                  .add($has(varName, c.propertyName))
                  .add($notEqual(nextName, undefined))
              )
                .then(c.child.$validate(nextName))
                .else("true")
            );
          } else {
            cond.add($has(varName, c.propertyName));
            cond.add(c.child.$validate(nextName));
          }

          v.addChildren([c.child]);
        }
      }

      return cond;
    };

    return new ValidateGenerator(null, (varname, v) => {
      if (varname.split(/\[|\./).length > 2) {
        const fnName = this.getUniqueFnName();
        const argName = this.getUniqueVarName();

        const validateFn = $defineFn(
          fnName,
          argName,
          getRecordConditions(argName, v).build()
        );
        v.addDeclare(validateFn.declaration);

        return condition("&&").add(validateFn.$invokeWith(varname));
      } else {
        return getRecordConditions(varname, v);
      }
    });
  }

  private visitDict(type: Dict, children?: Array<R>): R {
    this.includes.dict = true;

    const getBaseDictConditions = (varName: string) => {
      return condition("&&")
        .add($type(varName, "object"))
        .add($laxNotEqual(varName, null))
        .add($not($isArray(varName)))
        .add($isNotSet(varName));
    };

    if (children && children.length > 0) {
      const oneof = this.visitOneOf(new OneOf(type.dict), children);

      const itemName = this.getUniqueVarName();

      const v = oneof.$validate(itemName);

      return new ValidateGenerator([oneof], (varname) =>
        getBaseDictConditions(varname).add(
          `_$everyObjectValue(${varname}, (${itemName}) => ${v})`
        )
      );
    } else {
      return new ValidateGenerator(children, (varname) =>
        getBaseDictConditions(varname)
      );
    }
  }

  private visitSetOf(type: SetOf, children: Array<R> = []): R {
    this.includes.set = true;

    const getBaseSetConditions = (varName: string) => {
      return condition("&&")
        .add($type(varName, "object"))
        .add($laxNotEqual(varName, null))
        .add($isSet(varName));
    };

    if (children && children.length > 0) {
      const oneof = this.visitOneOf(new OneOf(type.setOf), children);

      const itemName = this.getUniqueVarName();

      const v = oneof.$validate(itemName);

      return new ValidateGenerator([oneof], (varname) =>
        getBaseSetConditions(varname).add(
          `_$everyInSet(${varname}, (${itemName}) => ${v})`
        )
      );
    }

    return new ValidateGenerator(children, (varname) =>
      getBaseSetConditions(varname)
    );
  }

  private visitOneOf(type: OneOf, children: Array<R>): R {
    return new ValidateGenerator(null, (varname, v) => {
      const cond = condition("||");

      for (const c of children) {
        cond.add(c.$validate(varname));
      }

      v.addChildren(children);

      return cond;
    });
  }

  private visitAllOf(type: AllOf, children: Array<R>): R {
    return new ValidateGenerator(null, (varname, v) => {
      const cond = condition("&&");

      for (const c of children) {
        cond.add(c.$validate(varname));
      }

      v.addChildren(children);

      return cond;
    });
  }

  private visitLiteral(type: Literal): R {
    return new ValidateGenerator(null, (varname) =>
      condition("&&").add($equal(varname, type.literal))
    );
  }

  private visitEnum(type: Enum): R {
    const enumKeys = Object.keys(type.enumInstance).filter((key) =>
      Number.isNaN(Number(key))
    );

    return new ValidateGenerator(null, (varname) => {
      const cond = condition("||");

      for (const key of enumKeys) {
        const member = type.enumInstance[key];
        cond.add($equal(varname, member));
      }

      return cond;
    });
  }

  private visitEnumMember(type: EnumMember): R {
    return new ValidateGenerator(null, (varname) =>
      condition("&&").add($equal(varname, type.enumMember))
    );
  }

  private visitInstanceOf(type: InstanceOf): R {
    const classDepName = this.getUniqueVarName();

    return new ValidateGenerator(null, (varname) =>
      condition("&&").add(
        `${varname} instanceof _$getDependency("${classDepName}")`
      )
    ).addDependency(classDepName, type.instanceOf);
  }

  private visitCustom(type: Custom): R {
    const customDepName = this.getUniqueVarName();

    return new ValidateGenerator(null, (varname) =>
      condition("&&").add(`_$getDependency("${customDepName}")(${varname})`)
    ).addDependency(customDepName, type.custom);
  }

  private visitStringMatching(type: StringMatching): R {
    const regexp = $defineRegexp(this.getUniqueVarName(), type.pattern);

    return new ValidateGenerator(null, (varname) =>
      condition("&&").add($type(varname, "string")).add(regexp.$test(varname))
    ).addDeclare(regexp.declaration);
  }

  private visitCircular(circular: Circular, children: R[]): R {
    const [childSchema] = children;
    const child = circular.type;

    if (this.circValidationFnNames.has(child)) {
      const validatorFnName = this.circValidationFnNames.get(child)!;
      const argName = this.getUniqueVarName();
      const typeUniqueName = this.getUniqueStringForType(child);

      const validateFn = $defineFn(
        validatorFnName,
        argName,
        $ternary(
          `_$wasCircValidated(${_serialize(typeUniqueName)}, ${argName})`
        )
          .then("true")
          .else(childSchema.$validate(argName))
      );

      this.includes.circular = true;

      return new ValidateGenerator(children, (varname) =>
        condition("&&").add(validateFn.$invokeWith(varname))
      ).addDeclare(validateFn.declaration);
    }

    return childSchema;
  }

  private visitCircularRef(type: CircularRef): R {
    const referencedType = type._getReferencedType();

    if (this.circValidationFnNames.has(referencedType)) {
      const validatorFnName = this.circValidationFnNames.get(referencedType)!;

      return new ValidateGenerator(null, (varname) =>
        condition("&&").add(`${validatorFnName}(${varname})`)
      );
    }

    const validatorFnName = this.getUniqueFnName();

    this.circValidationFnNames.set(referencedType, validatorFnName);

    return new ValidateGenerator(null, (varname) =>
      condition("&&").add(`${validatorFnName}(${varname})`)
    );
  }

  visit(dataType: Exclude<AnyDataType, RecordOf>, children?: R[]): R;
  visit(dataType: RecordOf, children?: RecordOfVisitChild<R>[]): R;
  visit(type: AnyDataType, children?: (R | RecordOfVisitChild<R>)[]): R {
    switch (type.kind) {
      case "simple":
        return this.visitPrimitive(type);
      case "array":
        return this.visitArrayOf(type, children as R[]);
      case "tuple":
        return this.visitTuple(type, children as R[]);
      case "record":
        return this.visitRecordOf(type, children as RecordOfVisitChild<R>[]);
      case "dictionary":
        return this.visitDict(type, children as R[]);
      case "set":
        return this.visitSetOf(type, children as R[]);
      case "union":
        return this.visitOneOf(type, children as R[]);
      case "intersection":
        return this.visitAllOf(type, children as R[]);
      case "literal":
        return this.visitLiteral(type);
      case "enumUnion":
        return this.visitEnum(type);
      case "enumMember":
        return this.visitEnumMember(type);
      case "instanceOf":
        return this.visitInstanceOf(type);
      case "custom":
        return this.visitCustom(type);
      case "stringMatching":
        return this.visitStringMatching(type);
      case "circular":
        return this.visitCircular(type, children as R[]);
      case "circularRef":
        return this.visitCircularRef(type);
    }
  }
}

const e = eval;

const every = /* js */ `
    const _$every = (_$arr, _$predicate) => {
      for (let _$i = 0; _$i < _$arr.length; _$i++) {
        if (!_$predicate(_$arr[_$i]))
          return false;
      }
      return true;
    };
`.trim();

const everyInSet = /* js */ `
    const _$everyInSet = (_$set, _$predicate) => {
      for (let _$item of _$set) {
        if (!_$predicate(_$item))
          return false;
      }
      return true;
    };
`.trim();

const everyObjectValue = /* js */ `
    const _$everyObjectValue = (_$obj, _$predicate) => {
      for (let _$key in _$obj) {
        if (!_$predicate(_$obj[_$key]))
          return false;
      }
      return true;
    };
`.trim();

const strNumeralValidator = /* js */ `
    const _$STRING_NUMERAL_ALLOWED_CHARS = ["0","1","2","3","4","5","6","7","8","9","."];
    const _$validateStringNumeral = (_$d) => typeof _$d === "string" &&
        _$d.length !== 0 &&
        _$d.split(".").length < 3 &&
        _$every(_$d, (_$char) => _$STRING_NUMERAL_ALLOWED_CHARS.includes(_$char));
`.trim();

const strIntValidator = /* js */ `
    const _$STRING_INTEGER_ALLOWED_CHARS = ["0","1","2","3","4","5","6","7","8","9"];
    const _$validateStringInteger = (_$d) => typeof _$d === "string" &&
        _$d.length !== 0 &&
        _$every(_$d, (_$char) => _$STRING_INTEGER_ALLOWED_CHARS.includes(_$char));
`.trim();

const circTracker = /* js */ `
    const _$validatedCircularValues = new Map();
    const _$wasCircValidated = (_$tn, _$d) => {
      let _$set = _$validatedCircularValues.get(_$tn);
      if (!_$set) {
        _$set = new Set([_$d]);
        _$validatedCircularValues.set(_$tn, _$set);
        return false;
      }
      if (_$set.has(_$d)) {
        return true;
      }
      _$set.add(_$d);
      return false;
    };
`.trim();

/**
 * Compile a validation function for the given data type.
 *
 * The compile function is extremely fast, but it is not possible
 * to get detailed error messages from it.
 *
 * The compilation process takes a similar amount of time to
 * validating using the `createValidator` function, so for the
 * best performance, you should compile the validator
 * ahead-of-time and reuse it.
 */
export const compileFastValidator = <DT extends AnyDataType>(
  dataType: DT
): ((data: unknown) => data is ReWrap<ParseDataType<DT>>) => {
  const visitor = new DataTypeValidatorVisitor();

  const generator = dataType._acceptVisitor(visitor);

  const validation = generator.$validate("data");

  const declarations = [];

  if (
    visitor.includes.array ||
    visitor.includes.stringInteger ||
    visitor.includes.stringNumeral
  ) {
    declarations.push(every);
  }

  if (visitor.includes.set) {
    declarations.push(everyInSet);
  }

  if (visitor.includes.dict) {
    declarations.push(everyObjectValue);
  }

  if (visitor.includes.stringInteger) {
    declarations.push(strIntValidator);
  }

  if (visitor.includes.stringNumeral) {
    declarations.push(strNumeralValidator);
  }

  if (visitor.includes.circular) {
    declarations.push(circTracker);
  }

  if (generator.declarations) {
    declarations.push(...generator.declarations);
  }

  const validatorStr = `(_$getDependency) => {
  return function validate(data) {
    ${declarations.join("\n    ")}
    return ${validation};
  }
}`;

  const deps = new Map(generator.dependencies);
  const _$getDependency = (name: string): any => {
    return deps.get(name);
  };

  const validator = e(validatorStr)(_$getDependency);

  return validator;
};
