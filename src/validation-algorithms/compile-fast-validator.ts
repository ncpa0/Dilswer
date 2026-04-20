import type {
  AnyType,
  BasicType,
  RecordVisitChild,
  TypeVisitor,
} from "@DataTypes/type-types";
import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
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
import { approximateComplexity } from "@Validation/approximate-complexity";

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
  [ArrayBuffer, "ArrayBuffer"],
  [DataView, "DataView"],
  [Promise, "Promise"],
]);

if (typeof SharedArrayBuffer !== "undefined") {
  KNOWN_GLOBAL_CLASSES.set(SharedArrayBuffer, "SharedArrayBuffer");
}

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

const $isArray = (varname: string) => {
  return `Array.isArray(${varname})`;
};

const $isObject = (varname: string) => {
  return $condition("&&")
    .add($type(varname, "object"))
    .add($notEqual(varname, null));
};

const $isSet = (varname: string) => {
  return $equal(`${varname}[Symbol.toStringTag]`, "Set");
};

const $isInteger = (varname: string) => {
  return `Number.isInteger(${varname})`;
};

const $notNaN = (varname: string) => {
  return `${varname} === ${varname}`;
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

const $every = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  predicate: (elementName: string, index: string) => string,
  startIndex?: number,
) => {
  const iVar = generator.getUniqueVarName();
  return `(() => { for (let ${iVar} = ${
    startIndex ?? 0
  }; ${iVar} < ${varname}.length; ${iVar}++) { if (!(${
    predicate(`${varname}[${iVar}]`, iVar)
  })) { return false; } }return true; })()`;
};

const $everySome = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  everyPredicate: (elementName: string, index: string) => string,
  somePredicate: (elementName: string, index: string) => string,
  startIdx?: number,
) => {
  const satisfied = generator.getUniqueVarName("someSatisfied");
  const iVar = generator.getUniqueVarName();
  return `(() => { let ${satisfied} = false; for (let ${iVar} = ${
    startIdx ?? 0
  }; ${iVar} < ${varname}.length; ${iVar}++) { if (!(${
    everyPredicate(`${varname}[${iVar}]`, iVar)
  })) { return false; } if(!${satisfied}) { ${satisfied} = ${
    somePredicate(`${varname}[${iVar}]`, iVar)
  }; } } return ${satisfied}; })()`;
};

const $everyObjectValue = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  predicate: (elementName: string) => string,
) => {
  const iVar = generator.getUniqueVarName();
  return `(() => { for (let ${iVar} in ${varname}) { if (!(${
    predicate(`${varname}[${iVar}]`)
  })) { return false; } }return true; })()`;
};

const $everyInSet = (
  generator: DataTypeValidatorVisitor,
  varname: string,
  predicate: (elementName: string) => string,
) => {
  const item = generator.getUniqueVarName();
  return `(() => { for (let ${item} of ${varname}) { if (!(${
    predicate(item)
  })) { return false; } }return true; })()`;
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
  const counter = generator.getUniqueVarName("count");
  const iVar = generator.getUniqueVarName();
  return `(() => { let ${counter} = 0; for (let ${iVar} = 0; ${iVar} < ${varname}.length; ${iVar}++) { if (${varname}[${iVar}] === ${
    JSON.stringify(char)
  }) { ${counter}++; } }return ${counter}; })() ${is} ${expected}`;
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
  private _memo_complexity: number | null = null;

  constructor(
    private t: AnyType,
    private get$validate: (
      varname: string,
      self: ValidateGenerator,
    ) => ConditionBuilder | string,
  ) {}

  approxComplexity() {
    if (this._memo_complexity != null) {
      return this._memo_complexity;
    }

    return (this._memo_complexity = approximateComplexity(this.t));
  }

  originalSchema(): AnyType {
    return this.t;
  }

  isAlwaysTrue() {
    return false;
  }

  $buildValidate(varname: string) {
    const validate = this.get$validate(varname, this);
    if (typeof validate === "string") {
      return validate;
    }
    return validate.build();
  }
}

class TruthyGenerator {
  constructor(private t: AnyType) {}

  approxComplexity() {
    return 0;
  }

  originalSchema(): AnyType {
    return this.t;
  }

  isAlwaysTrue() {
    return true;
  }

  $buildValidate(varname: string) {
    return "true";
  }
}

type R = {
  originalSchema(): AnyType;
  isAlwaysTrue(): boolean;
  approxComplexity(): number;
  $buildValidate(varname: string): string;
};

class DataTypeValidatorVisitor implements TypeVisitor<R> {
  includes = {
    recursive: false,
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

  private canSkipPropertyCheck(t: AnyType) {
    if (t.kind === "simple") {
      switch (t.simpleType) {
        case "null":
        case "unknown":
        case "undefined":
          return false;
      }
      return true;
    }
    return t.kind === "dictionary" || t.kind === "record";
  }

  private sortChildren<C extends RecordVisitChild<R> | R>(children: C[]): C[] {
    return children.slice().sort(
      (a: RecordVisitChild<R> | R, b: RecordVisitChild<R> | R) => {
        const ac = "_isRecordOfVisitChild" in a ? a.child : a;
        const bc = "_isRecordOfVisitChild" in b ? b.child : b;

        const aSchema = ac.originalSchema();
        const bSchema = bc.originalSchema();
        const aKind = aSchema.kind;
        const bKind = bSchema.kind;

        // put custom types always at the end
        const aCustom = aKind === "custom";
        const bCustom = bKind === "custom";
        if (aCustom !== bCustom && (aCustom || bCustom)) {
          return aCustom ? 1 : -1;
        }

        const aMaybeDiscriminator = aKind === "literal"
          || aKind === "enumMember"
          || aKind === "stringMatching"
          || (aKind === "union"
            && aSchema.oneOf.every((t: AnyType) =>
              t.kind === "literal" || t.kind === "enumMember"
              || t.kind === "stringMatching"
            ));
        const bMaybeDiscriminator = bKind === "literal"
          || bKind === "enumMember"
          || bKind === "stringMatching"
          || (bKind === "union"
            && bSchema.oneOf.every((t: AnyType) =>
              t.kind === "literal" || t.kind === "enumMember"
              || t.kind === "stringMatching"
            ));
        if (
          aMaybeDiscriminator !== bMaybeDiscriminator
          && (aMaybeDiscriminator || bMaybeDiscriminator)
        ) {
          return aMaybeDiscriminator ? -1 : 1;
        }

        const aCplx = ac.approxComplexity();
        const bCplx = bc.approxComplexity();

        return aCplx - bCplx;
      },
    );
  }

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

  public getUniqueVarName(name?: string) {
    if (name) {
      return `_$a${++this._counter1}_${name}`;
    }
    return `_$a${++this._counter1}`;
  }

  public getUniqueFnName() {
    return `_$v${++this._counter2}`;
  }

  private visitPrimitive(type: BasicType): R {
    switch (type.simpleType) {
      case "boolean":
        return new ValidateGenerator(
          type,
          (varname) => $type(varname, "boolean"),
        );
      case "integer":
        return new ValidateGenerator(type, (varname) => {
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
        });
      case "null":
        return new ValidateGenerator(type, (varname) => $equal(varname, null));
      case "number":
        return new ValidateGenerator(type, (varname) => {
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
        });
      case "string":
        return new ValidateGenerator(type, (varname) => {
          const cond = $condition("&&").add($type(varname, "string"));
          if (type.options.max != null) {
            cond.add($length(varname, "<=", type.options.max));
          }
          if (type.options.min != null) {
            cond.add($length(varname, ">=", type.options.min));
          }
          return cond;
        });
      case "stringinteger":
        if (
          type.options.negative === false
          && type.options.positive === false
        ) {
          // String.Int.zero()
          return new ValidateGenerator(type, (varname) =>
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
              ));
        }
        if (type.options.negative === false) {
          // String.Int.positive()
          return new ValidateGenerator(type, (varname) =>
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
              ));
        }
        if (type.options.positive === false) {
          // String.Int.negative()
          return new ValidateGenerator(type, (varname) =>
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
              ));
        }
        return new ValidateGenerator(type, (varname) =>
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
            ));
      case "stringnumeral":
        if (
          type.options.negative === false
          && type.options.positive === false
        ) {
          // String.Float.zero()
          return new ValidateGenerator(type, (varname) =>
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
              .add($charCount(this, varname, ".", "<", 2)));
        }
        if (type.options.negative === false) {
          // String.Float.positive()
          return new ValidateGenerator(type, (varname) =>
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
              .add($charCount(this, varname, ".", "<", 2)));
        }
        if (type.options.positive === false) {
          // String.Float.negative()
          return new ValidateGenerator(type, (varname) =>
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
              .add($charCount(this, varname, ".", "<", 2)));
        }
        return new ValidateGenerator(type, (varname) =>
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
            .add($charCount(this, varname, ".", "<", 2)));
      case "function":
        return new ValidateGenerator(
          type,
          (varname) => $type(varname, "function"),
        );
      case "symbol":
        return new ValidateGenerator(
          type,
          (varname) => $type(varname, "symbol"),
        );
      case "undefined":
        return new ValidateGenerator(
          type,
          (varname) => $type(varname, "undefined"),
        );
      case "unknown":
        return new TruthyGenerator(type);
    }
  }

  private visitArrayOf(type: ArrayType, children?: Array<R>): R {
    if (children && children.length > 0) {
      const oneof = this.visitOneOf(type["union"], children);

      return new ValidateGenerator(type, (varname) => {
        return $condition("&&")
          .add($isArray(varname))
          .add($every(this, varname, elem => oneof.$buildValidate(elem)));
      });
    }

    return new ValidateGenerator(type, (varname) => $isArray(varname));
  }

  private visitTuple(type: TupleType, children?: Array<R>): R {
    return new ValidateGenerator(type, (varname) => {
      const cond = $condition("&&")
        .add($isArray(varname))
        .add($length(varname, "==", type.tuple.length));

      if (children && children.length > 0) {
        for (const [index, c] of children.entries()) {
          cond.add(c.$buildValidate(`${varname}[${index}]`));
        }
      }

      return cond;
    });
  }

  private visitRecordOf(
    type: RecordType,
    children: RecordVisitChild<R>[] = [],
  ): R {
    children = this.sortChildren(children);

    const getRecordConditions = (varName: string) => {
      const cond = $isObject(varName);

      if (children && children.length > 0) {
        for (const c of children) {
          const accessor = propertyAccessor(c.propertyName);
          const nextName = `${varName}${accessor}`;

          if (c.required === true) {
            if (
              this.canSkipPropertyCheck(c.child.originalSchema())
            ) {
              if (c.child.isAlwaysTrue()) {
                cond.add($has(varName, c.propertyName));
              } else {
                cond.add(c.child.$buildValidate(nextName));
              }
            } else {
              cond.add($has(varName, c.propertyName));
              if (!c.child.isAlwaysTrue()) {
                cond.add(c.child.$buildValidate(nextName));
              }
            }
          } else {
            if (!c.child.isAlwaysTrue()) {
              cond.add(
                $ternary($notEqual(nextName, undefined))
                  .then(c.child.$buildValidate(nextName))
                  .else("true"),
              );
            }
          }
        }
      }

      return cond;
    };

    return new ValidateGenerator(type, (varname) => {
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
    if (children && children.length > 0) {
      const oneof = this.visitOneOf(type["union"], children);
      return new ValidateGenerator(
        type,
        (varname) =>
          $isObject(varname).add(
            $everyObjectValue(
              this,
              varname,
              elem => oneof.$buildValidate(elem),
            ),
          ),
      );
    } else {
      return new ValidateGenerator(
        type,
        (varname) => $isObject(varname),
      );
    }
  }

  private visitSetOf(type: SetType, children: Array<R> = []): R {
    children = this.sortChildren(children);

    const getBaseSetConditions = (varName: string) => {
      return $isObject(varName)
        .add($isSet(varName));
    };

    if (children && children.length > 0) {
      const oneof = this.visitOneOf(type["union"], children);
      return new ValidateGenerator(
        type,
        (varname) =>
          getBaseSetConditions(varname).add(
            $everyInSet(this, varname, elem => oneof.$buildValidate(elem)),
          ),
      );
    }

    return new ValidateGenerator(
      type,
      (varname) => getBaseSetConditions(varname),
    );
  }

  private visitOneOf(type: UnionType, children: Array<R>): R {
    children = this.sortChildren(children);
    return new ValidateGenerator(type, (varname) => {
      const cond = $condition("||");

      for (const c of children) {
        cond.add(c.$buildValidate(varname));
      }

      return cond;
    });
  }

  private visitAllOf(type: IntersectionType, children: Array<R>): R {
    return new ValidateGenerator(type, (varname) => {
      const cond = $condition("&&");

      for (const c of children) {
        cond.add(c.$buildValidate(varname));
      }

      return cond;
    });
  }

  private visitLiteral(type: LiteralType): R {
    return new ValidateGenerator(
      type,
      (varname) => $equal(varname, type.literal),
    );
  }

  private visitEnum(type: EnumType): R {
    const enumKeys = Object.keys(type.enumInstance).filter((key) =>
      Number.isNaN(Number(key))
    );

    return new ValidateGenerator(type, (varname) => {
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
      type,
      (varname) => $equal(varname, type.enumMember),
    );
  }

  private visitInstanceOf(type: InstanceOfType): R {
    if (!KNOWN_GLOBAL_CLASSES.has(type.instanceOf)) {
      this.includes.instanceof = true;
    }

    return new ValidateGenerator(type, (varname) =>
      $condition("&&")
        .add($instanceof(this, varname, type.instanceOf)));
  }

  private visitCustom(type: CustomType): R {
    this.includes.custom = true;

    const customDepName = this.getUniqueVarName();
    this.addDependency(customDepName, type.custom);
    return new ValidateGenerator(
      type,
      (varname) => `${$dependency(customDepName)}(${varname})`,
    );
  }

  private visitStringMatching(type: StringMatchingType): R {
    const regexp = $defineRegexp(this.getUniqueVarName(), type.pattern);

    this.addDeclaration("outer", regexp.declaration);
    return new ValidateGenerator(type, (varname) =>
      $condition("&&")
        .add($type(varname, "string"))
        .add(regexp.$test(varname)));
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
          .else(childSchema.$buildValidate(argName)),
      );

      this.includes.recursive = true;

      this.addDeclaration("inner", validateFn.declaration);
      return new ValidateGenerator(
        circular,
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
        type,
        (varname) => `${validatorFnName}(${varname})`,
      );
    }

    const validatorFnName = this.getUniqueFnName();

    this.circValidationFnNames.set(referencedType, validatorFnName);

    return new ValidateGenerator(
      type,
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

  const validation = generator.$buildValidate("data");

  const outerDeclarations: string[] = [];
  const innerDeclarations: string[] = [];

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
  ${outerDeclarations.join("\n  ")}\n
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

    return [
      ...outerDeclarations,
      `function ${name}(data) {\n  ${
        innerDeclarations.join("\n  ")
      }\n  return ${validation}\n}`,
    ].join("\n");
  };

  return validator;
};
