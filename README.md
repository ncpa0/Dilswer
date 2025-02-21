# Dilswer

![GitHub](https://img.shields.io/github/license/ncpa0cpl/Dilswer?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ncpa0cpl/dilswer/test.yml?branch=master&style=for-the-badge)
[![npm](https://img.shields.io/npm/v/dilswer?style=for-the-badge)](https://www.npmjs.com/package/dilswer)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/Dilswer?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/ncpa0cpl/Dilswer?style=for-the-badge)

Small and lightweight data validation library with TypeScript integration.

Keep your type definitions in one place, and have but one source of truth for
both the runtime validation types and the TypeScript type definitions.

## Table Of Contents

1. [Quick Start](#quick-start)
   1. [Create type definitions](#create-type-definitions)
   2. [Create a TypeScript type from a Dilswer definition](#create-a-typescript-type-from-a-dilswer-definition)
   3. [Create a validation function](#create-a-validation-function)
   4. [Create a function with a validated input](#create-a-function-with-a-validated-input)
   5. [Standard Schema support](#standard-schema-support)
2. [Available Functions](#available-functions)
   1. [assertDataType()](#assertdatatype)
   2. [createValidator()](#createvalidator)
   3. [compileFastValidator()](#compilefastvalidator)
   4. [createTypeGuardedFunction()](#createtypeguardedfunction)
   5. [createValidatedFunction()](#createvalidatedfunction)
   6. [toJsonSchema()](#tojsonschema)
   7. [toTsType()](#totstype)
   8. [DataType](#datatype)
3. [Data Types](#data-types)
   1. [Number](#datatypenumber)
   2. [Int](#datatypeint)
   3. [String](#datatypestring)
   4. [StringNumeral](#datatypestringnumeral)
   5. [StringInt](#datatypestringint)
   6. [StringMatching](#datatypestringmatchingregex)
   7. [Boolean](#datatypeboolean)
   8. [Symbol](#datatypesymbol)
   9. [Null](#datatypenull)
   10. [Undefined](#datatypeundefined)
   11. [Function](#datatypefunction)
   12. [Unknown](#datatypeunknown)
   13. [OneOf](#datatypeoneofdatatypes)
   14. [AllOf](#datatypeallofdatatypes)
   15. [ArrayOf](#datatypearrayofdatatypes)
   16. [RecordOf](#datatyperecordofrecordstring-fielddescriptor)
   17. [Dict](#datatypedictdatatypes)
   18. [SetOf](#datatypesetofdatatypes)
   19. [Literal](#datatypeliteralstring--number--boolean)
   20. [InstanceOf](#datatypeinstanceofclass)
   21. [Enum](#datatypeenumenum)
   22. [EnumMember](#datatypeenummemberenum-member)
   23. [Circular](#datatypecircularfunction)
   24. [Custom](#datatypecustomfunction)
4. [Utility Functions](#utility-functions)
   1. [And](#and)
   2. [Omit](#omit)
   3. [Pick](#pick)
   4. [Partial](#partial)
   5. [Required](#required)
   6. [Exclude](#exclude)
5. [Metadata](#metadata)
   1. [Assign Metadata](#assign-metadata)
   2. [Read Metadata](#read-metadata)
   3. [Metadata and JSON Schema's](#metadata-and-json-schemas)
6. [Parsing](#parsing)

## Quick Start

#### Create type definitions

```ts
// person-type.ts
import { Type } from "dilswer";

// Record property types can be defined in a few different ways:
const PersonDataType = Type.Record({
  id: Type.String,
  name: Type.String,
  age: { type: Type.Number },
  email: Type.Option(Type.String),
  friends: { type: Type.Array(Type.String), required: false },
});

// A TypeScript equivalent type of the above would be:
// type Person = {
//   id: string;
//   name: string;
//   age: number;
//   email?: string;
//   friends?: string[];
// };
```

**NOTE:** the `required` attribute in a RecordOf fields is set to `true` by
default.

#### Create a TypeScript type from a Dilswer definition

It is possible to infer a TypeScript type from a Dilswer definition:

```ts
import { Infer } from "dilswer";
import { PersonDataType } from "./person-type.ts";

type Person = Infer<typeof PersonDataType>;

// Result:
// type Person: {
//   id: string;
//   name: string;
//   age: number;
//   email?: string;
//   friends?: string[];
// }
```

#### Create a validation function

```ts
import { validator } from "dilswer";
import { PersonDataType } from "./person-type.ts";

const isPerson = validator(PersonDataType);

// Result:
// const isPerson: (data: unknown) => data is {
//     friends?: string[];
//     id: string;
//     name: string;
//     age: number;
// }

const person = await axios
  .get("https://my-api.io/get-person/1")
  .then((r) => r.data);

if (isPerson(person)) {
  console.log("Name: ", person.name);
  // do something with person
} else {
  console.error("`person` variable is not of expected type.");
  // handle the validation failure
}
```

##### validation details

if you want to obtain more details about validation failures, validator can be passed a second argument that will change the bahavior of the validate function:

```ts
import { validator } from "dilswer";
import { PersonDataType } from "./person-type.ts";

const isPerson = validator(PersonDataType, { details: true });

// Result:
// const isPerson: (data: unknown) => {
//   success: false;
//   error: ValidationError;
// } | {
//   success: true;
//   value: {
//     friends?: string[];
//     id: string;
//     name: string;
//     age: number;
//   };
// }
```

#### Assertion function

Assertion function can change the type of a variable by simply being called:

```ts
import { Type, assertType } from "dilswer";

function foo(value: any) {
  try {
    assertType(Type.String, value);
    value.toUpperCase(); // value is now treated as string by TypeScript
  } catch (error) {
    console.error("Value is not a string");
  }
}
```

### Standard Schema support

Dilswer can be used with any library that supports the Standard Schema validation, like tRPC, OpenAuth and others.

```ts
import { Type } from "dilswer";
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

const router = t.router({
  greeting: t.procedure
    .input(Type.Record({
      name: Type.String,
    }))
    .query(async ({ input }) => {
      return `Hello, ${input.name}!`;
    }),
})
```

For the best performance, type schemas passed to the other libraries should get compiled via the `.compileStd()` method.
The compiled schemas do not provide as detailed error messages but are order of magnitude faster.

```ts
const router = t.router({
  greeting: t.procedure
    .input(
      Type.Record({
        name: Type.String,
      }).compileStd()
    )
    .query(async ({ input }) => {
      return `Hello, ${input.name}!`;
    }),
})
```

## Other features

### Json Schema generation

Translates given Type into a JSON Schema.

```ts
const toJsonSchema: (
  type: AnyType,
  options: ParseToJsonSchemaOptions = {},
  include$schemaProperty = true
) => JSONSchema6 | undefined;
```

#### ParseToJsonSchemaOptions

```ts
type ParseToJsonSchemaOptions = {
  /**
   * Defines how to handle DataTypes that do not have an
   * equivalent type in JSON Schema. (Set's, undefined, Symbols,
   * etc.)
   *
   * - `throw` (default): Throw an error if an incompatible type is
   *   encountered.
   * - `omit`: Omits incompatible properties from the JSON Schema.
   * - `set-as-any`: Adds the type to the schema without a "type"
   *   property but with a name equivalent to the given
   *   DataType.
   */
  incompatibleTypes?: "throw" | "omit" | "set-as-any";
  /**
   * Determines if the schemas generated for Record's should have
   * additional properties set to `true` or `false`.
   */
  additionalProperties?: boolean;
  /**
   * Custom Parser's are methods used to parse incompatible
   * DataTypes to JSON Schema's.
   *
   * By default a strategy defined in `incompatibleTypes` is
   * used, if a method is defined, that method will be used
   * instead.
   */
  customParser?: {
    Set?: (
      setItemsSchemas: JSONSchema6[],
      original: SetType<AnyType[]>,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Custom?: (
      validateFunction: Custom["custom"],
      original: Custom,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Undefined?: (
      dataType: BasicType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Symbol?: (
      dataType: BasicType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Function?: (
      dataType: BasicType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
  };
};
```

#### TypeScript type definition generation

Translates given Type into a TypeScript type definition. This is not very
useful at runtime, and is mostly intended for generating type definitions with
JSDoc comments that can be bundled with libraries.

```ts
const toTsType: (
  dataType: AnyType,
  options?: Partial<TsParsingOptions>,
) => string;
```

#### TsParsingOptions

```ts
type TsParsingOptions = {
  /**
   * Defines how to parse the type.
   *
   * - `compact` - the type will be parsed into a single type
   *   definition
   * - `fully-expanded` - the type will be split into multiple type
   *   definitions, and the main DataType type definition will
   *   reference them.
   * - `named-expanded` - similar to `fully-expanded`, but only the
   *   types that have titles assigned will be split into
   *   separate type definitions.
   *
   * @default `compact`
   */
  mode: TsParsingMode;
  /**
   * Defines how to export the generated types.
   *
   * - `main` - only the main DataType type will be exported
   * - `all` - all types generated will be exported
   * - `named` - only the types with titles will be exported
   * - `none` - nothing will be exported
   *
   * @default `main`
   */
  exports: "main" | "named" | "all" | "none";
  /**
   * Defines whether to generate the type as a declaration or
   * not.
   *
   * The difference is that declaration will generate each type
   * definition with a `declare` keyword preceding it.
   *
   * @default `false`
   */
  declaration: boolean;
  /**
   * Defines how to handle duplicate names.
   *
   * - `error` - will throw an error if a duplicate name is
   *   encountered
   * - `rename` - will rename the duplicate type
   *
   * @default `error`
   */
  onDuplicateName: "error" | "rename";
  /**
   * Some DataType can reference enums or classes, in which case
   * it's sometimes impossible to generate a valid TypeScript
   * type for them. By default just the name of that class/enum
   * will be used, and if that name is not available in the
   * global scope, TS will resolve it to `any`. This option
   * allows to define a custom import path for such types.
   *
   * @example
   *   // foo.ts
   *   export class Foo {}
   *
   *   // data-type.ts
   *   import { Foo } from "./foo";
   *
   *   export const dt = Type.RecordOf({
   *     foo: Type.InstanceOf(Foo),
   *   });
   *
   *   // ts-type-generator.ts
   *   import { dt } from "./data-type";
   *   import { Foo } from "./foo";
   *
   *   const tsType = toTsType(dt, {
   *     getExternalTypeImport: (t) => {
   *       if (t.instanceOf === Foo) {
   *         return {
   *           typeName: "Foo",
   *           path: "./foo",
   *         };
   *       }
   *     },
   *   });
   *   // tsType:
   *   //"
   *   // import { Foo } from "./foo";
   *   //
   *   // export type Record1 = {
   *   //   foo: InstanceType<typeof Foo>;
   *   // }
   *   //"
   */
  getExternalTypeImport?: (
    type: EnumType | EnumMemberType | InstanceType | CustomType | FunctionType,
  ) => ExternalTypeImport | undefined;
};

type TsParsingMode = "compact" | "fully-expanded" | "named-expanded";

type ExternalTypeImport = {
  /**
   * Path to the file containing the external type. If the path
   * is not specified, the import statement will be omitted, so
   * for the generated declarations to be valid, you will have to
   * include that yourself or make the specified type available
   * in the global scope.
   */
  path?: string;
  /**
   * Name of the type as it is to be used within the generated
   * declarations.
   *
   * If original name is not provided this is also the name of
   * the imported type.
   */
  typeName: string;
  /**
   * Name of the type that will be used in the generated import
   * statement.
   */
  originalName?: string;
  /**
   * Whether the imported name is a "value" or a "type". If it is
   * a "value" it will be referenced with a `typeof` keyword.
   */
  valueImport?: boolean;
};
```

### Availabla Type's


#### Type.Number

will match any number values and translate to the standard `number` type in
TypeScript.

#### Type.Int

will match any integer values and translate to the standard `number` type in
TypeScript. TypeScript does not have any way of distinguishing float and
integers therefore both are assigned the same TypeScript type.

#### Type.String

will match any string values and translate to the standard `string` type in
TypeScript.

#### Type.StringNumeral

will match any string containing only numeric values and translate to a
`` `${number}` `` type in TypeScript. A value successfully validated with
`StringNumeral` is safe to convert into a number and will never produce a `NaN`
value.

#### Type.StringInt

will match any string containing only numbers and translate to a
`` `${number}` `` type in TypeScript. Strings with floating point numbers are
not matched by this type. A value successfully validated with `StringInt` is
safe to convert into a number and will never produce a `NaN` value.

#### Type.StringMatching(regex)

will match any string matching the provided regular expression and translate to
a the standard `string` type in TypeScript.

#### Type.Boolean

will match any `true` and `false` values and translate to the standard `boolean`
type in TypeScript.

#### Type.Symbol

will match any symbolic values and translate to the `symbol` type in TypeScript.

#### Type.Null

will match only `null` value and translate to the standard `null` type in
TypeScript.

#### Type.Undefined

will match only `undefined` value and translate to the standard `undefined` type
in TypeScript.

#### Type.Function

will match any function and translate to the `Function` type in TypeScript.

#### Type.Unknown

will match any value and translate to the `unknown` type in TypeScript.

#### Type.OneOf(...Type's)

will match any value matching one of the DataType's provided in the arguments
and translate to an TypeScript union type.

Example

```ts
const foo = Type.OneOf(Type.String, Type.Number);

type T = Infer<typeof foo>; // type T = (string | number)
```

#### Type.AllOf(...Type's)

will match values matching every DataType provided and translate to a TypeScript
intersection of all those DataType's.

Mostly useful to intersect multiple RecordOf's.

Example

```ts
const foo = Type.Record({ foo: string });
const bar = Type.Record({ bar: string });

const combined = Type.AllOf(foo, bar);

type T = Infer<typeof combined>; // type T = { foo: string; bar: string; }
```

#### Type.Array(...Type's)

will match any array which contains only values matching any of the DataType's
provided in the arguments and translate to the `Array<...>` type in TypeScript.

Example

```ts
const foo = Type.Array(Type.String, Type.Number);

type T = Infer<typeof foo>; // type T = (string | number)[]
```

#### Type.Record(Record<string, FieldDescriptor>)

will match any object which structure matches the key-value pairs of object
properties and FieldDescriptor's passed to the argument.

Example

```ts
const foo = Type.Record({
  foo: Type.Boolean,
  bar: Type.String,
  baz: { type: Type.Number, required: false },
  qux: Type.Option(Type.String),
});

type T = Infer<typeof foo>;
// type T = { foo: boolean, bar: string, baz?: number | undefined; qux?: string | undefined; }
```

#### Type.Dict(...Type's)

will match any object which properties match against the provided DataTypes's,
and translates to a Record type in TypeScript.

Example

```ts
const dictOfFunctions = Type.Dict(Type.Function);

type T = Infer<typeof dictOfFunctions>; // type T = Record<string | number, Function>
```

#### Type.Set(...Type's)

will match any Set object which contains only values matching any of the
DataType's provided in the arguments and translate to the `Set<...>` type in
TypeScript.

Example

```ts
const foo = Type.Set(Type.String, Type.Number);

type T = Infer<typeof foo>; // type T = Set<string | number>
```

#### Type.Literal(string | number | boolean)

will match any value that exactly matches the passed argument and translate to
the literal type of that value in TypeScript.

Example's

```ts
const foo = Type.Literal("some-string-literal");

type T0 = GetDataType<typeof foo>; // type T0 = "some-string-literal"
```

```ts
const bar = Type.Literal(123);

type T1 = GetDataType<typeof bar>; // type T1 = 123
```

```ts
const baz = Type.Literal(true);

type T2 = GetDataType<typeof baz>; // type T2 = true
```

#### Type.InstanceOf(class)

will match any value that is an instance of the passed class and translate to
the `InstanceType` type of that class in TypeScript.

```ts
class FooBar {
  // ...
}

const foo = Type.InstanceOf(FooBar);

type T = Infer<typeof foo>; // type T = InstanceType<typeof FooBar>
```

#### Type.Enum(enum)

will match any value that belongs to an TypeScript enum and translate to that
enum type.

```ts
enum MyEnum {
  A = "A",
  B = "B",
}

const foo = Type.Enum(MyEnum);

type T = Infer<typeof foo>; // type T = MyEnum

const validate = validator(foo);

validate(MyEnum.A); // => true
validate(MyEnum.B); // => true
```

#### Type.EnumMember(enum member)

will match any value that equals to the specified TypeScript enum member and
translate to that enum member type.

```ts
enum MyEnum {
  A = "VALUE_A",
  B = "VALUE_B",
}

const foo = Type.EnumMember(MyEnum.A);

type T = Infer<typeof foo>; // type T = MyEnum.A

const validate = validator(foo);

validate("VALUE_A"); // => true
validate(MyEnum.A); // => true
validate(MyEnum.B); // => false
```

#### Type.Recursive(Function)

Allows to define types that reference themselves. The function it accepts should
always return a valid DataType, which the reference provided to that function
will point to.

Example

```ts
const Node = Type.Recursive((self) =>
  Type.Record({
    tag: Type.String,
    children: Type.ArrayOf(self),
  })
);

// this is equivalent to the following type:
type Node = {
  tag: string;
  children: Node[];
};
```

Type definitions given for circular DataTypes via `GetDataType` and validation
methods will not however include infinite recursion as they should. (this does
not affect the runtime validation) Due to the TypeScript limitations, it's
impossible for a inferred type to include a reference to itself, so to get a
usable type we use some TypeScript magic to create a similar type that is
4-levels deep. For the above example the actual type you will get will look like
this:

```ts
type Node = {
  tag: string;
  children: Array<{
    tag: string;
    children: Array<{
      tag: string;
      children: Array<{
        tag: string;
        children: Array<any>;
      }>;
    }>;
  }>;
};
```

If you absolutely need to get a type that has infinite recursion, you can use
[toTsType](#totstype) utility to generate TypeScript code which will meet that
need.

#### Type.Custom(Function)

will test the data with the provided function, provided function should return a
boolean indicating if the tested value passed the validation, passed function
should also have a type definition that looks like this: `(v: any) => v is T`,
where T is any valid TS type.

Example

```ts
const NonEmptyString = Type.Custom(
  (v: any): v is string => typeof v === "string" && v.length > 0
);

type T = Infer<typeof NonEmptyString>; // type T = string

const validate = validator(NonEmptyString);

validate("foo"); // => true
validate(""); // => false
```

### Utility Functions

#### And()

`And()` utility function can combine two Record Type Definitions into one. If
any of the properties between the two combined Type Defs have the same key-name,
the definition of the second one takes priority.

```ts
const typeDefOne = Type.Record({
  foo: Type.Number,
  bar: Type.Number,
});

const typeDefTwo = Type.Record({
  bar: Type.Array(Type.String),
  baz: Type.Boolean,
});

const typeDefSum = And(typeDefOne, typeDefTwo);
// typeDefSum = {
//    foo: number;
//    bar: string[];
//    baz: boolean;
// }
```

#### Omit()

`Omit()` utility function removes specified keys from a Record Type Definition.

```ts
const typeDefOne = Type.Record({
  foo: Type.Number,
  bar: Type.Number,
  baz: Type.Number,
  qux: Type.Number,
});

const typeDefOmitted = Omit(typeDefOne, "bar", "qux");
// typeDefOmitted = {
//    foo: number;
//    baz: number;
// }
```

#### Pick()

`Pick()` utility function removes all not specified keys from a Record Type
Definition.

```ts
const typeDefOne = Type.Record({
  foo: Type.Number,
  bar: Type.Number,
  baz: Type.Number,
  qux: Type.Number,
});

const typeDefPick = Pick(typeDefOne, "bar", "qux");
// typeDefPick = {
//    bar: number;
//    qux: number;
// }
```

#### Partial()

`Partial()` utility type makes all the Record's Type Definition keys optional.

```ts
const typeDefOne = Type.Record({
  foo: Type.Number,
  bar: Type.String,
  baz: Type.Array(Type.Number),
});

const typeDefPartial = Partial(typeDefOne);
// typeDefPartial = {
//    foo?: number | undefined;
//    bar?: string | undefined;
//    baz?: number[] | undefined;
// }
```

#### Required()

`Required()` utility type makes all the Record's Type Definition keys to be
required (vs optional).

```ts
const typeDefOne = Type.Record({
  foo: { type: Type.Number, required: false },
  bar: { type: Type.String, required: false },
  baz: { type: Type.Array(Type.Number), required: false },
});

const typeDefRequired = Required(typeDefOne);
// typeDefRequired = {
//    foo: number;
//    bar: string;
//    baz: number[];
// }
```

#### Exclude()

`Exclude()` utility function removes Type Definitions from an Type Def union.

```ts
const typeDefOne = Type.OneOf(
  Type.String,
  Type.Number,
  Type.Boolean,
);

const typeDefExcluded = Exclude(typeDefOne, DataType.Number);
// typeDefExcluded = string | boolean;
```

## Metadata

Each Type can have metadata attached to it, this metadata can be used to
provide additional information about the data type, for example, you can attach
a description to a Type, or a title, or format.

**Metadata is completely ignored by the validation process**

### Assign Metadata

```ts
import { Type } from "dilswer";

const UserNameDT = Type.String.setTitle("User Name").setDescription(
  "The user's name.",
);

const User = Type.Record({
  name: UserNameDT,
  id: Type.String.setTitle("User ID").setFormat("uuid"),
  friends: Type.Array(Type.String).setDescription(
    "A list of the user's friends names.",
  ),
})
  .setTitle("User")
  .setDescription(
    "A user object. Contains the user's name, id and friends list.",
  );
```

### Read Metadata

```ts
import { Type, getMetadata } from "dilswer";

const userNameMetadata = getMetadata(UserNameDT);

// userNameMetadata = {
//   title: "User Name",
//   description: "The user's name.",
// }

const userMetadata = getMetadata(User);

// userMetadata = {
//  title: "User",
//  description: "A user object. Contains the user's name, id and friends list.",
// }
```

### Metadata and JSON Schema's

Metadata is also used when generating JSON Schema, if a DataType has a title,
description or format, it will be included in the generated JSON Schema.

```ts
import { Type, toJsonSchema } from "dilswer";

const UserDT = Type.Record({
  name: Type.String.setTitle("User Name").setDescription(
    "The user's name.",
  ),
  id: Type.String.setTitle("User ID").setFormat("uuid"),
  friends: Type.Array(Type.String).setDescription(
    "A list of the user's friends names.",
  ),
})
  .setTitle("User")
  .setDescription(
    "A user object. Contains the user's name, id and friends list.",
  );

const jsonSchema = toJsonSchema(UserDT);

//  jsonSchema = {
//    title: "User",
//    description: "A user object. Contains the user's name, id and friends list.",
//    properties: {
//      name: {
//        type: "string",
//        title: "User Name",
//        description: "The user's name.",
//      },
//      id: {
//        type: "string",
//        title: "User ID",
//        format: "uuid",
//      },
//      friends: {
//        type: "array",
//        items: {
//          type: "string",
//        },
//      },
//    },
//    required: ["name", "id", "friends"],
// }
```

### Parsing

Dilswer data types can be easily parsed into any arbitrary data structure via
`parseWith` function.

This function takes a `visitor` object, which should contain a `visit` method,
this method should generate a node of the new, desired data structure.

This method is also used internally by `toJsonSchema` and `toTsType` functions.
You can see the implementation of these functions in the source code
[here](./src/json-schema-parser/to-json-schema.ts) and
[here](./src/ts-type-generator/to-ts-type.ts).

#### Example

```ts
import { AnyType, Type, parseWith } from "dilswer";

// Define how the new structure should look like
type TypeNode = {
  typeName: string;
  children?: TypeNode[] | Record<string, TypeNode>;
};

// Create a visitor which will be used to translate Dilswer's data types into `Node`s
const visitor = {
  visit(
    type: AnyType,
    children?: TypeNode[] | RecordOfVisitChild<TypeNode>[],
  ): TypeNode {
    switch (type.kind) {
      case "simple":
        return { typeName: type.simpleType };
      case "record":
        return {
          typeName: "record",
          children: children
            ? Object.fromEntries(
              (children as RecordOfVisitChild<Node>[]).map(
                ({ propertyName, child }) => [propertyName, child],
              ),
            )
            : undefined,
        };
      default:
        return { typeName: type.kind, children: children as Node[] };
    }
  },
};

// use the visitor on a Dilser data type

const type = Type.Record({
  foo: Type.String,
  bar: Type.Array(Type.Number),
  baz: Type.OneOf(Type.String, Type.Number),
});

const nodeTree = parseWith(visitor, type);
```

##### Example output

```json
{
  "typeName": "record",
  "children": {
    "foo": {
      "typeName": "string"
    },
    "bar": {
      "typeName": "array",
      "children": [
        {
          "typeName": "number"
        }
      ]
    },
    "baz": {
      "typeName": "union",
      "children": [
        {
          "typeName": "string"
        },
        {
          "typeName": "number"
        }
      ]
    }
  }
}
```
