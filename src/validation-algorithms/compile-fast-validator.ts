import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type {
  AnyType,
  BasicType,
  RecordVisitChild,
  TypeVisitor,
} from "@DataTypes/types";
import type { ArrayType } from "@DataTypes/types/array";
import type { CustomType } from "@DataTypes/types/custom";
import type { DictType } from "@DataTypes/types/dict";
import type { EnumType } from "@DataTypes/types/enum";
import type { EnumMemberType } from "@DataTypes/types/enum-member";
import type { InstanceOfType } from "@DataTypes/types/instance";
import type { IntersectionType } from "@DataTypes/types/intersection";
import type { LiteralType } from "@DataTypes/types/literal";
import type { RecordType } from "@DataTypes/types/record";
import type {
  RecursiveType,
  RecursiveTypeReference,
} from "@DataTypes/types/recursive";
import type { SetType } from "@DataTypes/types/set";
import type { StringMatchingType } from "@DataTypes/types/string-matching";
import type { TupleType } from "@DataTypes/types/tuple";
import type { UnionType } from "@DataTypes/types/union";

const KNOWN_GLOBAL_CLASSES = new Map<new(...args: any[]) => any, string>([
  [Map, "Map"],
  [Set, "Set"],
  [RegExp, "RegExp"],
  [Date, "Date"],
  [Error, "Error"],
  [EvalError, "EvalError"],
  [RangeError, "RangeError"],
  [ReferenceError, "ReferenceError"],
  [SyntaxError, "SyntaxError"],
  [TypeError, "TypeError"],
  [URIError, "URIError"],
  [AggregateError, "AggregateError"],
  [Array, "Array"],
  [Object, "Object"],
  [WeakMap, "WeakMap"],
  [WeakSet, "WeakSet"],
  [Function, "Function"],
  [String, "String"],
  [Number, "Number"],
  [Boolean, "Boolean"],
  [Int8Array, "Int8Array"],
  [Uint8Array, "Uint8Array"],
  [Uint8ClampedArray, "Uint8ClampedArray"],
  [Int16Array, "Int16Array"],
  [Uint16Array, "Uint16Array"],
  [Int32Array, "Int32Array"],
  [Uint32Array, "Uint32Array"],
  [Float32Array, "Float32Array"],
  [Float64Array, "Float64Array"],
  [BigInt64Array, "BigInt64Array"],
  [BigUint64Array, "BigUint64Array"],
  [SharedArrayBuffer, "SharedArrayBuffer"],
  [ArrayBuffer, "ArrayBuffer"],
  [DataView, "DataView"],
  [Promise, "Promise"],
]);

enum Char {
  Minus = 45,
  Dot = 46,
  Zero = 48,
  One = 49,
  Nine = 57,
}

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
      "("
      + this.conditions
        .map((c): string => (typeof c === "string" ? c : c.build()))
        .join(separator)
      + ")"
    );
  }
}

const $dependency = (depName: string) =>
  `_$getDependency(${JSON.stringify(depName)})`;

const $condition = (type: "&&" | "||") => new ConditionBuilder(type);

const $type = (
  varname: string,
  type:
    | "string"
    | "number"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function",
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

const $defineRegexp = (name: string, regexp: RegExp) => {
  return {
    declaration: `const ${name} = new RegExp(${
      JSON.stringify(
        regexp.source,
      )
    }, ${JSON.stringify(regexp.flags)});`,
    $test(varname: string) {
      return `${name}.test(${varname})`;
    },
  };
};

const $lte = (name: string, value: number) => {
  return `${name} <= ${value}`;
};

const $gte = (name: string, value: number) => {
  return `${name} >= ${value}`;
};

const $equal = (
  varname: string,
  value: string | number | boolean | null | undefined,
) => {
  return `${varname} === ${_serialize(value)}`;
};

const $notEqual = (
  varname: string,
  value: string | number | boolean | null | undefined,
) => {
  return `${varname} !== ${_serialize(value)}`;
};

const $laxNotEqual = (
  varname: string,
  value: string | number | boolean | null | undefined,
) => {
  return `${varname} != ${_serialize(value)}`;
};

const $isArray = (varname: string) => {
  return `Array.isArray(${varname})`;
};

const $isSet = (varname: string) => {
  return $equal(`${varname}[Symbol.toStringTag]`, "Set");
};

const $isInteger = (varname: string) => {
  return `Number.isInteger(${varname})`;
};

const $notNaN = (varname: string) => {
  return `!Number.isNaN(${varname})`;
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

const $length = (
  varname: string,
  is: ">" | "<" | "==" | "<=" | ">=",
  than: number,
) => {
  switch (is) {
    case "==":
      return `${varname}.length === ${than}`;
    case ">":
      return `${varname}.length > ${than}`;
    case "<":
      return `${varname}.length < ${than}`;
    case ">=":
      return `${varname}.length >= ${than}`;
    case "<=":
      return `${varname}.length <= ${than}`;
  }
};

const $some = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  predicate: (elementName: string, index: string) => string,
) => {
  generator.includes.some = true;
  const elemName = generator.getUniqueVarName();
  const indexName = generator.getUniqueVarName();
  return `_$some(${varname}, (${elemName}, ${indexName}) => ${
    predicate(elemName, indexName)
  })`;
};

const $every = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  predicate: (elementName: string, index: string) => string,
  startIndex?: number,
) => {
  generator.includes.every = true;
  const elemName = generator.getUniqueVarName();
  const indexName = generator.getUniqueVarName();
  if (startIndex != null) {
    return `_$every(${varname}, (${elemName}, ${indexName}) => ${
      predicate(elemName, indexName)
    }, ${startIndex})`;
  }
  return `_$every(${varname}, (${elemName}, ${indexName}) => ${
    predicate(elemName, indexName)
  })`;
};

const $everySome = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  everyPredicate: (elementName: string, index: string) => string,
  somePredicate: (elementName: string, index: string) => string,
  startIdx?: number,
) => {
  generator.includes.everySome = true;
  const elemName1 = generator.getUniqueVarName();
  const indexName1 = generator.getUniqueVarName();
  const elemName2 = generator.getUniqueVarName();
  const indexName2 = generator.getUniqueVarName();
  if (startIdx != null) {
    return `_$everySome(${varname}, (${elemName1}, ${indexName1}) => ${
      everyPredicate(elemName1, indexName1)
    }, (${elemName2}, ${indexName2}) => ${
      somePredicate(elemName2, indexName2)
    }, ${startIdx})`;
  }
  return `_$everySome(${varname}, (${elemName1}, ${indexName1}) => ${
    everyPredicate(elemName1, indexName1)
  }, (${elemName2}, ${indexName2}) => ${somePredicate(elemName2, indexName2)})`;
};

const $everyObjectValue = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  predicate: (elementName: string) => string,
) => {
  const elemName = generator.getUniqueVarName();
  return `_$everyObjectValue(${varname}, (${elemName}) => ${
    predicate(elemName)
  })`;
};

const $everyInSet = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  predicate: (elementName: string) => string,
) => {
  const elemName = generator.getUniqueVarName();
  return `_$everyInSet(${varname}, (${elemName}) => ${predicate(elemName)})`;
};

const $charCode = (varname: string, is: number | [number, number]) => {
  if (Array.isArray(is)) {
    return `${varname}.charCodeAt(0) >= ${
      is[0]
    } && ${varname}.charCodeAt(0) <= ${is[1]}`;
  }
  return `${varname}.charCodeAt(0) === ${is}`;
};

const $charCount = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  char: string,
  is: ">" | "==" | "<",
  expected: number,
) => {
  generator.includes.charCount = true;
  return `_$countChar(${varname}, ${JSON.stringify(char)}) ${is} ${expected}`;
};

const $instanceof = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  constructor: new(...args: any[]) => any,
) => {
  if (KNOWN_GLOBAL_CLASSES.has(constructor)) {
    return `(${varname} instanceof ${KNOWN_GLOBAL_CLASSES.get(constructor)})`;
  }

  const name = generator.getUniqueVarName();
  generator.addDependency(name, constructor);
  return `(${varname} instanceof ${$dependency(name)})`;
};

class ValidateGenerator {
  constructor(
    private get$validate: (
      varname: string,
      self: ValidateGenerator,
    ) => ConditionBuilder | string,
  ) {}

  $validate(varname: string) {
    const validate = this.get$validate(varname, this);
    if (typeof validate === "string") {
      return validate;
    }
    return validate.build();
  }
}

type R = ValidateGenerator;

class DataTypeValidatorVisitor implements TypeVisitor<R> {
  includes = {
    some: false,
    every: false,
    everySome: false,
    charCount: false,
    stringNumeral: false,
    stringInteger: false,
    recursive: false,
    set: false,
    dict: false,
    array: false,
    custom: false,
    instanceof: false,
  };

  private circValidationFnNames: Map<AnyType, string> = new Map();

  private _counter1 = 0;
  private _counter2 = 0;
  private _counter3 = 0;

  private knownTypes = new Map<AnyType, string>();

  public outerDeclarations: string[] = [];
  public innerDeclarations: string[] = [];
  public dependencies: Array<[string, any]> = [];

  constructor() {}

  public addDeclaration(type: "inner" | "outer", inlined: string) {
    if (type === "inner") {
      this.innerDeclarations.push(inlined);
    } else {
      this.outerDeclarations.push(inlined);
    }
    return this;
  }

  public addDependency(name: string, value: any) {
    this.dependencies.push([name, value]);
    return this;
  }

  public getUniqueStringForType(type: AnyType) {
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

  private visitPrimitive(type: BasicType): R {
    switch (type.simpleType) {
      case "boolean":
        return new ValidateGenerator(
          (varname) => $type(varname, "boolean"),
        );
      case "integer":
        return new ValidateGenerator(
          (varname) => {
            const cond = $condition("&&")
              .add($type(varname, "number"))
              .add($isInteger(varname));
            if (type.options.max != null) {
              cond.add($lte(varname, type.options.max));
            }
            if (type.options.min != null) {
              cond.add($gte(varname, type.options.min));
            }
            return cond;
          },
        );
      case "null":
        return new ValidateGenerator(
          (varname) => $equal(varname, null),
        );
      case "number":
        return new ValidateGenerator(
          (varname) => {
            let cond = $condition("&&")
              .add($type(varname, "number"))
              .add($notNaN(varname));
            if (type.options.max != null) {
              cond = cond.add($lte(varname, type.options.max!));
            }
            if (type.options.min != null) {
              cond = cond.add($gte(varname, type.options.min!));
            }
            return cond;
          },
        );
      case "string":
        return new ValidateGenerator(
          (varname) => {
            const cond = $condition("&&").add($type(varname, "string"));
            if (type.options.max != null) {
              cond.add($length(varname, "<=", type.options.max));
            }
            if (type.options.min != null) {
              cond.add($length(varname, ">=", type.options.min));
            }
            return cond;
          },
        );
      case "stringinteger":
        this.includes.stringInteger = true;
        if (
          type.options.negative === false
          && type.options.positive === false
        ) {
          // String.Int.zero()
          return new ValidateGenerator(
            (varname) =>
              $condition("&&")
                .add($type(varname, "string"))
                .add($length(varname, ">", 0))
                .add(
                  $ternary($charCode(varname, Char.Minus))
                    .then($every(
                      this,
                      varname,
                      (char) => $charCode(char, Char.Zero),
                      1, // start from the second char
                    ))
                    .else($every(
                      this,
                      varname,
                      (char) => $charCode(char, Char.Zero),
                    )),
                ),
          );
        }
        if (type.options.negative === false) {
          // String.Int.positive()
          return new ValidateGenerator(
            (varname) =>
              $condition("&&")
                .add($type(varname, "string"))
                .add($length(varname, ">", 0))
                .add(
                  $everySome(
                    this,
                    varname,
                    (char) => $charCode(char, [Char.Zero, Char.Nine]), // each char must be a digit
                    (char) => $charCode(char, [Char.One, Char.Nine]), // at least one char must be a non-zero digit
                  ),
                ),
          );
        }
        if (type.options.positive === false) {
          // String.Int.negative()
          return new ValidateGenerator(
            (varname) =>
              $condition("&&")
                .add($type(varname, "string"))
                .add($length(varname, ">", 0))
                .add($charCode(varname, Char.Minus))
                .add(
                  $everySome(
                    this,
                    varname,
                    (char) => $charCode(char, [Char.Zero, Char.Nine]), // each char must be a digit
                    (char) => $charCode(char, [Char.One, Char.Nine]), // at least one char must be a non-zero digit
                    1, // start from the second char
                  ),
                ),
          );
        }
        return new ValidateGenerator(
          (varname) =>
            $condition("&&")
              .add($type(varname, "string"))
              .add($length(varname, ">", 0))
              .add(
                $ternary($charCode(varname, Char.Minus))
                  .then($every(
                    this,
                    varname,
                    (char) => $charCode(char, [Char.Zero, Char.Nine]),
                    1, // start from the second char
                  ))
                  .else($every(
                    this,
                    varname,
                    (char) => $charCode(char, [Char.Zero, Char.Nine]),
                  )),
              ),
        );
      case "stringnumeral":
        this.includes.stringNumeral = true;
        if (
          type.options.negative === false
          && type.options.positive === false
        ) {
          // String.Float.zero()
          return new ValidateGenerator(
            (varname) =>
              $condition("&&")
                .add($type(varname, "string"))
                .add($length(varname, ">", 0))
                .add(
                  $ternary($charCode(varname, Char.Minus))
                    .then(
                      $every(
                        this,
                        varname,
                        (char) =>
                          $condition("||")
                            .add($charCode(char, Char.Zero))
                            .add($charCode(char, Char.Dot)).build(),
                        1, // start from the second char
                      ),
                    )
                    .else(
                      $every(
                        this,
                        varname,
                        (char) =>
                          $condition("||")
                            .add($charCode(char, Char.Zero))
                            .add($charCode(char, Char.Dot)).build(),
                      ),
                    ),
                )
                .add($charCount(this, varname, ".", "<", 2)),
          );
        }
        if (type.options.negative === false) {
          // String.Float.positive()
          return new ValidateGenerator(
            (varname) =>
              $condition("&&")
                .add($type(varname, "string"))
                .add($length(varname, ">", 0))
                .add(
                  $everySome(
                    this,
                    varname,
                    char =>
                      $condition("||")
                        .add($charCode(char, [Char.Zero, Char.Nine]))
                        .add($charCode(char, Char.Dot))
                        .build(),
                    char => $charCode(char, [Char.One, Char.Nine]),
                  ),
                )
                .add($charCount(this, varname, ".", "<", 2)),
          );
        }
        if (type.options.positive === false) {
          // String.Float.negative()
          return new ValidateGenerator(
            (varname) =>
              $condition("&&")
                .add($type(varname, "string"))
                .add($length(varname, ">", 0))
                .add($charCode(varname, Char.Minus))
                .add(
                  $everySome(
                    this,
                    varname,
                    char =>
                      $condition("||")
                        .add($charCode(char, [Char.Zero, Char.Nine]))
                        .add($charCode(char, Char.Dot))
                        .build(),
                    char => $charCode(char, [Char.One, Char.Nine]),
                    1,
                  ),
                )
                .add($charCount(this, varname, ".", "<", 2)),
          );
        }
        return new ValidateGenerator(
          (varname) =>
            $condition("&&")
              .add($type(varname, "string"))
              .add($length(varname, ">", 0))
              .add(
                $ternary($charCode(varname, Char.Minus))
                  .then($every(
                    this,
                    varname,
                    (char) =>
                      $condition("||")
                        .add($charCode(char, [Char.Zero, Char.Nine]))
                        .add($charCode(char, Char.Dot))
                        .build(),
                    1,
                  ))
                  .else($every(
                    this,
                    varname,
                    (char) =>
                      $condition("||")
                        .add($charCode(char, [Char.Zero, Char.Nine]))
                        .add($charCode(char, Char.Dot))
                        .build(),
                  )),
              )
              .add($charCount(this, varname, ".", "<", 2)),
        );
      case "function":
        return new ValidateGenerator(
          (varname) => $type(varname, "function"),
        );
      case "symbol":
        return new ValidateGenerator(
          (varname) => $type(varname, "symbol"),
        );
      case "undefined":
        return new ValidateGenerator(
          (varname) => $type(varname, "undefined"),
        );
      case "unknown":
        return new ValidateGenerator(() => "true");
    }
  }

  private visitArrayOf(type: ArrayType, children?: Array<R>): R {
    this.includes.array = true;

    if (children && children.length > 0) {
      const oneof = this.visitOneOf(type["union"], children);

      return new ValidateGenerator((varname) =>
        $condition("&&")
          .add($isArray(varname))
          .add($every(this, varname, elem => oneof.$validate(elem)))
      );
    }

    return new ValidateGenerator(
      (varname) => $isArray(varname),
    );
  }

  private visitTuple(type: TupleType, children?: Array<R>): R {
    return new ValidateGenerator((varname) => {
      const cond = $condition("&&")
        .add($isArray(varname))
        .add($length(varname, "==", type.tuple.length));

      if (children && children.length > 0) {
        for (const [index, c] of children.entries()) {
          cond.add(c.$validate(`${varname}[${index}]`));
        }
      }

      return cond;
    });
  }

  private visitRecordOf(
    type: RecordType,
    children: RecordVisitChild<R>[] = [],
  ): R {
    const getRecordConditions = (varName: string) => {
      const cond = $condition("&&")
        .add($type(varName, "object"))
        .add($laxNotEqual(varName, null));

      if (children && children.length > 0) {
        for (const c of children) {
          const accessor = propertyAccessor(c.propertyName);
          const nextName = `${varName}${accessor}`;

          if (c.required !== true) {
            cond.add(
              $ternary(
                $condition("&&")
                  .add($has(varName, c.propertyName))
                  .add($notEqual(nextName, undefined)),
              )
                .then(c.child.$validate(nextName))
                .else("true"),
            );
          } else {
            cond.add($has(varName, c.propertyName));
            cond.add(c.child.$validate(nextName));
          }
        }
      }

      return cond;
    };

    return new ValidateGenerator((varname) => {
      if (varname.split(/\[|\./).length > 2) {
        const fnName = this.getUniqueFnName();
        const argName = this.getUniqueVarName();

        const validateFn = $defineFn(
          fnName,
          argName,
          getRecordConditions(argName).build(),
        );
        this.addDeclaration("inner", validateFn.declaration);

        return validateFn.$invokeWith(varname);
      } else {
        return getRecordConditions(varname);
      }
    });
  }

  private visitDict(type: DictType, children?: Array<R>): R {
    this.includes.dict = true;

    const isDictConditions = (varName: string) => {
      return $condition("&&")
        .add($type(varName, "object"))
        .add($laxNotEqual(varName, null));
    };

    if (children && children.length > 0) {
      const oneof = this.visitOneOf(type["union"], children);
      return new ValidateGenerator(
        (varname) =>
          isDictConditions(varname).add(
            $everyObjectValue(this, varname, elem => oneof.$validate(elem)),
          ),
      );
    } else {
      return new ValidateGenerator(
        (varname) => isDictConditions(varname),
      );
    }
  }

  private visitSetOf(type: SetType, children: Array<R> = []): R {
    this.includes.set = true;

    const getBaseSetConditions = (varName: string) => {
      return $condition("&&")
        .add($type(varName, "object"))
        .add($laxNotEqual(varName, null))
        .add($isSet(varName));
    };

    if (children && children.length > 0) {
      const oneof = this.visitOneOf(type["union"], children);
      return new ValidateGenerator(
        (varname) =>
          getBaseSetConditions(varname).add(
            $everyInSet(this, varname, elem => oneof.$validate(elem)),
          ),
      );
    }

    return new ValidateGenerator(
      (varname) => getBaseSetConditions(varname),
    );
  }

  private visitOneOf(type: UnionType, children: Array<R>): R {
    return new ValidateGenerator((varname) => {
      const cond = $condition("||");

      for (const c of children) {
        cond.add(c.$validate(varname));
      }

      return cond;
    });
  }

  private visitAllOf(type: IntersectionType, children: Array<R>): R {
    return new ValidateGenerator((varname) => {
      const cond = $condition("&&");

      for (const c of children) {
        cond.add(c.$validate(varname));
      }

      return cond;
    });
  }

  private visitLiteral(type: LiteralType): R {
    return new ValidateGenerator(
      (varname) => $equal(varname, type.literal),
    );
  }

  private visitEnum(type: EnumType): R {
    const enumKeys = Object.keys(type.enumInstance).filter((key) =>
      Number.isNaN(Number(key))
    );

    return new ValidateGenerator((varname) => {
      const cond = $condition("||");

      for (const key of enumKeys) {
        const member = type.enumInstance[key];
        cond.add($equal(varname, member));
      }

      return cond;
    });
  }

  private visitEnumMember(type: EnumMemberType): R {
    return new ValidateGenerator(
      (varname) => $equal(varname, type.enumMember),
    );
  }

  private visitInstanceOf(type: InstanceOfType): R {
    if (!KNOWN_GLOBAL_CLASSES.has(type.instanceOf)) {
      this.includes.instanceof = true;
    }

    return new ValidateGenerator((varname) =>
      $condition("&&")
        .add($instanceof(this, varname, type.instanceOf))
    );
  }

  private visitCustom(type: CustomType): R {
    this.includes.custom = true;

    const customDepName = this.getUniqueVarName();
    this.addDependency(customDepName, type.custom);
    return new ValidateGenerator(
      (varname) => `${$dependency(customDepName)}(${varname})`,
    );
  }

  private visitStringMatching(type: StringMatchingType): R {
    const regexp = $defineRegexp(this.getUniqueVarName(), type.pattern);

    this.addDeclaration("outer", regexp.declaration);
    return new ValidateGenerator(
      (varname) =>
        $condition("&&")
          .add($type(varname, "string"))
          .add(regexp.$test(varname)),
    );
  }

  private visitRecursive(circular: RecursiveType, children: R[]): R {
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
          `_$wasRecursivelyValidated(${
            _serialize(typeUniqueName)
          }, ${argName})`,
        )
          .then("true")
          .else(childSchema.$validate(argName)),
      );

      this.includes.recursive = true;

      this.addDeclaration("inner", validateFn.declaration);
      return new ValidateGenerator(
        (varname) => validateFn.$invokeWith(varname),
      );
    }

    return childSchema;
  }

  private visitRecursiveRef(type: RecursiveTypeReference): R {
    const referencedType = type._getReferencedType();

    if (this.circValidationFnNames.has(referencedType)) {
      const validatorFnName = this.circValidationFnNames.get(referencedType)!;

      return new ValidateGenerator(
        (varname) => `${validatorFnName}(${varname})`,
      );
    }

    const validatorFnName = this.getUniqueFnName();

    this.circValidationFnNames.set(referencedType, validatorFnName);

    return new ValidateGenerator(
      (varname) => `${validatorFnName}(${varname})`,
    );
  }

  visit(dataType: Exclude<AnyType, RecordType>, children?: R[]): R;
  visit(dataType: RecordType, children?: RecordVisitChild<R>[]): R;
  visit(type: AnyType, children?: (R | RecordVisitChild<R>)[]): R {
    switch (type.kind) {
      case "simple":
        return this.visitPrimitive(type);
      case "array":
        return this.visitArrayOf(type, children as R[]);
      case "tuple":
        return this.visitTuple(type, children as R[]);
      case "record":
        return this.visitRecordOf(type, children as RecordVisitChild<R>[]);
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
        return this.visitRecursive(type, children as R[]);
      case "circularRef":
        return this.visitRecursiveRef(type);
    }
  }
}

const e = eval;

const some = /* js */ `
  function _$some(_$arr, _$predicate) {
    for (let _$i = 0; _$i < _$arr.length; _$i++) {
      if (_$predicate(_$arr[_$i], _$i))
        return true;
    }
    return false;
  };
`.trim();

const every = /* js */ `
  function _$every(_$arr, _$predicate, _$start = 0) {
    for (let _$i = _$start; _$i < _$arr.length; _$i++) {
      if (!_$predicate(_$arr[_$i], _$i))
        return false;
    }
    return true;
  };
`.trim();

const everySome = /* js */ `
  function _$everySome(_$arr, _$everyPredicate, _$somePredicate, _$start = 0) {
    let _$someSatisfied = false;
    for (let _$i = _$start; _$i < _$arr.length; _$i++) {
      if (!_$everyPredicate(_$arr[_$i], _$i))
        return false;
      if (!_$someSatisfied) {
        _$someSatisfied = _$somePredicate(_$arr[_$i], _$i);
      }
    }
    return _$someSatisfied;
  };
`.trim();

const everyInSet = /* js */ `
  function _$everyInSet(_$set, _$predicate) {
    for (let _$item of _$set) {
      if (!_$predicate(_$item))
        return false;
    }
    return true;
  };
`.trim();

const everyObjectValue = /* js */ `
  function _$everyObjectValue(_$obj, _$predicate) {
    for (let _$key in _$obj) {
      if (!_$predicate(_$obj[_$key]))
        return false;
    }
    return true;
  };
`.trim();

const recursiveTracker = /* js */ `
    const _$validatedRecursiveValues = new Map();
    function _$wasRecursivelyValidated(_$tn, _$d) {
      let _$set = _$validatedRecursiveValues.get(_$tn);
      if (!_$set) {
        _$set = new Set([_$d]);
        _$validatedRecursiveValues.set(_$tn, _$set);
        return false;
      }
      if (_$set.has(_$d)) {
        return true;
      }
      _$set.add(_$d);
      return false;
    };
`.trim();

const countChar = /* js */ `
  function _$countChar(_$str, _$char) {
    let _$count = 0;
    for (let _$i = 0; _$i < _$str.length; _$i++) {
      if (_$str[_$i] === _$char)
        _$count++;
    }
    return _$count;
  };
`.trim();

export interface FastValidator<DT extends AnyType> {
  (data: unknown): data is ReWrap<ParseDataType<DT>>;
  asString(name?: string): string;
}

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
export const compileFastValidator = <DT extends AnyType>(
  dataType: DT,
): FastValidator<DT> => {
  const visitor = new DataTypeValidatorVisitor();

  const generator = dataType._acceptVisitor(visitor);

  const validation = generator.$validate("data");

  const outerDeclarations: string[] = [];
  const innerDeclarations: string[] = [];

  if (visitor.includes.every) {
    outerDeclarations.push(every);
  }
  if (visitor.includes.some) {
    outerDeclarations.push(some);
  }
  if (visitor.includes.everySome) {
    outerDeclarations.push(everySome);
  }
  if (visitor.includes.set) {
    outerDeclarations.push(everyInSet);
  }
  if (visitor.includes.dict) {
    outerDeclarations.push(everyObjectValue);
  }
  if (visitor.includes.charCount) {
    outerDeclarations.push(countChar);
  }
  if (visitor.outerDeclarations) {
    outerDeclarations.push(...visitor.outerDeclarations);
  }

  if (visitor.includes.recursive) {
    innerDeclarations.push(recursiveTracker);
  }
  if (visitor.innerDeclarations) {
    innerDeclarations.push(...visitor.innerDeclarations);
  }

  const validatorStr = `(_$getDependency) => {
  ${outerDeclarations.join("\n  ")}
  return function validate(data) {
    ${innerDeclarations.join("\n    ")}
    return ${validation};
  }
}`;

  const deps = new Map(visitor.dependencies);
  const _$getDependency = (name: string): any => {
    return deps.get(name);
  };

  const evaluatedCode = e(validatorStr);

  const validator = evaluatedCode(_$getDependency);

  const { includes } = visitor;
  validator.asString = (name = "validate") => {
    if (includes.custom) {
      throw new Error(
        "Validators with Custom type validation cannot be compiled to standalone code",
      );
    }
    if (includes.instanceof) {
      throw new Error(
        "Validators with InstanceOf type validation cannot be compiled to standalone code",
      );
    }
    return `${outerDeclarations.join("\n")}\nfunction ${name}(data) {\n  ${
      innerDeclarations.join("\n  ")
    }\n  return ${validation}\n}`;
  };

  return validator;
};
