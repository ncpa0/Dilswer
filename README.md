# Dilswer

![build](https://github.com/ncpa0cpl/Dilswer/actions/workflows/test.yml/badge.svg)

Small and lightweight data validation library with TypeScript integration.

Keep your type definitions in one place, and have but one source of truth for
both the runtime validation types and the TypeScript type definitions.

## Table Of Contents

1. [Quick Start](#quick-start)
   1. [Create type definitions](#create-type-definitions)
   2. [Create a TypeScript type from a Dilswer definition](#create-a-typescript-type-from-a-dilswer-definition)
   3. [Create a validation function](#create-a-validation-function)
   4. [Create a function with a validated input](#create-a-function-with-a-validated-input)
2. [Main exported functions](#main-exported-functions)
   1. [assertDataType()](#dilswerassertdatatype)
   2. [createValidator()](#dilswercreatevalidator)
   3. [createTypeGuardedFunction()](#dilswercreatetypeguardedfunction)
   4. [createValidatedFunction()](#dilswercreatevalidatedfunction)
   5. [toJsonSchema()](#dilswertojsonschema)
   6. [DataType](#dilswerdatatype)
3. [Data Types](#data-types)
   1. [String](#datatypestring)
   2. [Number](#datatypenumber)
   3. [Int](#datatypeint)
   4. [StringNumeral](#datatypestringnumeral)
   5. [StringInt](#datatypestringint)
   6. [Boolean](#datatypeboolean)
   7. [Symbol](#datatypesymbol)
   8. [Null](#datatypenull)
   9. [Undefined](#datatypeundefined)
   10. [Function](#datatypefunction)
   11. [Unknown](#datatypeunknown)
   12. [OneOf](#datatypeoneofdatatypes)
   13. [AllOf](#datatypeallofdatatypes)
   14. [ArrayOf](#datatypearrayofdatatypes)
   15. [RecordOf](#datatyperecordofrecordstring-fielddescriptor)
   16. [Dict](#datatypedictdatatypes)
   17. [SetOf](#datatypesetofdatatypes)
   18. [Literal](#datatypeliteralstring--number--boolean)
   19. [Enum](#datatypeenumenum)
   20. [EnumMember](#datatypeenummemberenum-member)
   21. [Custom](#datatypecustomfunction)
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
   3. [Metadata in JSON Schema](#metadata-in-json-schema)

## Quick Start

#### Create type definitions

```ts
// person-type.ts
import { DataType, OptionalField } from "dilswer";

// Record property types can be defined in a few different ways:
const PersonDataType = DataType.RecordOf({
  id: DataType.String,
  name: DataType.String,
  age: { type: DataType.Number },
  email: OptionalField(DataType.String),
  friends: { type: DataType.ArrayOf(DataType.String), required: false },
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
import { GetDataType } from "dilswer";
import { PersonDataType } from "./person-type.ts";

type Person = GetDataType<typeof PersonDataType>;

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
import { createValidator } from "dilswer";
import { PersonDataType } from "./person-type.ts";

const isPerson = createValidator(PersonDataType);

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

#### Create a function with a validated input

```ts
import { createValidator } from "dilswer";
import { PersonDataType } from "./person-type.ts";

const processPerson = createValidatedFunction(
  PersonDataType,
  (person) => {
    console.log("Processing person: ", person.name);

    // do something with person

    return "Success!";
  },
  (error) => {
    console.error("Function input is not of expected type.");
    console.error("Type expected:", error.expectedValueType);
    console.error("Received:", error.receivedValue);
    console.error("Invalid property location: ", error.fieldPath);

    // handle the validation failure

    return "Failure";
  }
);

// Result:
// const processPerson: (data: unknown) => "Success!" | "Failure"

const person = await axios
  .get("https://my-api.io/get-person/1")
  .then((r) => r.data);

const result = processPerson(person); // => "Success!" or "Failure"
```

## Main exported functions

#### dilswer.createValidator()

```ts
const createValidator: <DT extends AllDataTypes>(
  dataType: DT
) => (data: unknown) => data is ParseDataType<DT>;
```

Higher order function that generates a validator which will check the provided
`data` against the `dataType` type structure definition and returns a boolean
indicating if the check was successful.

#### dilswer.createTypeGuardedFunction()

```ts
const createTypeGuardedFunction: <DT extends AllDataTypes, R, ER = void>(
  dataType: DT,
  onValidationSuccess: (data: ReWrap<ParseDataType<DT>>) => R,
  onValidationError?: (error: ValidationError, data: unknown) => ER
) => (data: unknown) => R | ER;
```

Higher order function that generates a new function which will check the
provided `data` against the `dataType` type structure, and if the check is
successful then the first callback `onValidationSuccess` is invoked with `data`
as it's argument, otherwise the second callback `onValidationError` is invoked
with the type validation error as it's argument (unless the callback is not
specified).

#### dilswer.createValidatedFunction()

Alias for the `createTypeGuardedFunction()`.

#### dilswer.assertDataType()

_Also available under an alias `dilswer.ensureDataType()`_

```ts
const assertDataType: <DT extends AllDataTypes>(
  dataType: DT,
  data: unknown
) => asserts data is ParseDataType<DT>;
```

Checks the provided `data` against the `dataType` type definition and throws an
ValidationError if the `data` does not conform to the `dataType`.

#### dilswer.toJsonSchema()

Translates given DataType into a JSON Schema.

```ts
const toJsonSchema = (
  type: AnyDataType,
  options: ParseToJsonSchemaOptions = {},
  include$schemaProperty = true
): JSONSchema6 | undefined
```

##### ParseToJsonSchemaOptions

```ts
type ParseToJsonSchemaOptions = {
  /**
   * Defines how to handle DataTypes that do not have an
   * equivalent type in JSON Schema. (Set's, undefined, Symbols, etc.)
   *
   * - `throw` (default): Throw an error if an incompatible type is
   *   encountered.
   * - `omit`: Omits incompatible properties from the JSON Schema.
   * - `set-as-any`: Adds the type to the schema without a "type"
   *   property but with a name equivalent to the given DataType.
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
   * used, if a method is defined, that method will be used instead.
   */
  customParser?: {
    Set?: (
      setItemsSchemas: JSONSchema6[],
      original: Set<AnyDataType[]>,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Custom?: (
      validateFunction: Custom["custom"],
      original: Custom,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Undefined?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Symbol?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Function?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
  };
};
```

#### dilswer.DataType

Object containing all the dilswer runtime type definitions (like `Number`,
`String`, `ArrayOf(...)`, etc.)

## Data Types

#### DataType.String

will match any string values and translate to the standard `string` type in
TypeScript.

#### DataType.Number

will match any number values and translate to the standard `number` type in
TypeScript.

#### DataType.Int

will match any integer values and translate to the standard `number` type in
TypeScript. TypeScript does not have any way of distinguishing float and
integers therefore both are assigned the same TypeScript type.

#### DataType.StringNumeral

will match any string containing only numeric values and translate to a
`` `${number}` `` type in TypeScript. A value successfully validated with
`StringNumeral` is safe to convert into a number and will never produce a `NaN`
value.

#### DataType.StringInt

will match any string containing only numbers and translate to a
`` `${number}` `` type in TypeScript. Strings with floating point numbers are
not matched by this type. A value successfully validated with `StringInt` is
safe to convert into a number and will never produce a `NaN` value.

#### DataType.Boolean

will match any `true` and `false` values and translate to the standard `boolean`
type in TypeScript.

#### DataType.Symbol

will match any symbolic values and translate to the `symbol` type in TypeScript.

#### DataType.Null

will match only `null` value and translate to the standard `null` type in
TypeScript.

#### DataType.Undefined

will match only `undefined` value and translate to the standard `undefined` type
in TypeScript.

#### DataType.Function

will match any function and translate to the `Function` type in TypeScript.

#### DataType.Unknown

will match any value and translate to the `unknown` type in TypeScript.

#### DataType.OneOf(...DataType's)

will match any value matching one of the DataType's provided in the arguments
and translate to an TypeScript union type.

Example

```ts
const foo = DataType.OneOf(DataType.String, DataType.Number);

type T = GetDataType<typeof foo>; // type T = (string | number)
```

#### DataType.AllOf(...DataType's)

will match values matching every DataType provided and translate to a TypeScript
intersection of all those DataType's.

Mostly useful to intersect multiple RecordOf's.

Example

```ts
const foo = DataType.RecordOf({ foo: string });
const bar = DataType.RecordOf({ bar: string });

const combined = DataType.AllOf(foo, bar);

type T = GetDataType<typeof combined>; // type T = { foo: string; bar: string; }
```

#### DataType.ArrayOf(...DataType's)

will match any array which contains only values matching any of the DataType's
provided in the arguments and translate to the `Array<...>` type in TypeScript.

Example

```ts
const foo = DataType.ArrayOf(DataType.String, DataType.Number);

type T = GetDataType<typeof foo>; // type T = (string | number)[]
```

#### DataType.RecordOf(Record<string, FieldDescriptor>)

will match any object which structure matches the key-value pairs of object
properties and FieldDescriptor's passed to the argument.

Example

```ts
const foo = DataType.RecordOf({
  foo: DataType.Boolean,
  bar: { type: DataType.String },
  baz: { type: DataType.Number, required: false },
});

type T = GetDataType<typeof foo>; // type T = {foo: boolean, bar: string, baz?: number | undefined}
```

#### DataType.Dict(...DataType's)

will match any object which properties match against the provided DataTypes's,
and translates to a Record type in TypeScript.

Example

```ts
const dictOfFunctions = DataType.Dict(DataType.Function);

type T = GetDataType<typeof dictOfFunctions>; // type T = Record<string | number, Function>
```

#### DataType.SetOf(...DataType's)

will match any Set object which contains only values matching any of the
DataType's provided in the arguments and translate to the `Set<...>` type in
TypeScript.

Example

```ts
const foo = DataType.SetOf(DataType.String, DataType.Number);

type T = GetDataType<typeof foo>; // type T = Set<string | number>
```

#### DataType.Literal(string | number | boolean)

will match any value that exactly matches the passed argument and translate to
the literal type of that value in TypeScript.

Example's

```ts
const foo = DataType.Literal("some-string-literal");

type T0 = GetDataType<typeof foo>; // type T0 = "some-string-literal"
```

```ts
const bar = DataType.Literal(123);

type T1 = GetDataType<typeof bar>; // type T1 = 123
```

```ts
const baz = DataType.Literal(true);

type T2 = GetDataType<typeof baz>; // type T2 = true
```

#### DataType.Enum(enum)

will match any value that belongs to an TypeScript enum and translate to that
enum type.

```ts
enum MyEnum {
  A = "A",
  B = "B",
}

const foo = DataType.Enum(MyEnum);

type T = GetDataType<typeof foo>; // type T = MyEnum

const validate = createValidator(foo);

validate(MyEnum.A); // => true
validate(MyEnum.B); // => true
```

#### DataType.EnumMember(enum member)

will match any value that equals to the specified TypeScript enum member and
translate to that enum member type.

```ts
enum MyEnum {
  A = "VALUE_A",
  B = "VALUE_B",
}

const foo = DataType.EnumMember(MyEnum.A);

type T = GetDataType<typeof foo>; // type T = MyEnum.A

const validate = createValidator(foo);

validate("VALUE_A"); // => true
validate(MyEnum.A); // => true
validate(MyEnum.B); // => false
```

#### DataType.Custom(Function)

will test the data with the provided function, provided function should return a
boolean indicating if the tested value passed the validation, passed function
should also have a type definition that looks like this: `(v: any) => v is T`,
where T is any valid TS type.

Example

```ts
const isNonEmptyString = (v: any): v is string =>
  typeof v === "string" && v.length > 0;

const nonEmptyTypeDef = DataType.Custom(isNonEmptyString);

type T = GetDataType<typeof nonEmptyTypeDef>; // type T = string
```

### Utility Functions

#### And()

`And()` utility function can combine two Record Type Definitions into one. If
any of the properties between the two combined Type Defs have the same key-name,
the definition of the second one takes priority.

```ts
const typeDefOne = DataType.RecordOf({
  foo: DataType.Number,
  bar: DataType.Number,
});

const typeDefTwo = DataType.RecordOf({
  bar: DataType.ArrayOf(DataType.String),
  baz: DataType.Boolean,
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
const typeDefOne = DataType.RecordOf({
  foo: DataType.Number,
  bar: DataType.Number,
  baz: DataType.Number,
  qux: DataType.Number,
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
const typeDefOne = DataType.RecordOf({
  foo: DataType.Number,
  bar: DataType.Number,
  baz: DataType.Number,
  qux: DataType.Number,
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
const typeDefOne = DataType.RecordOf({
  foo: DataType.Number,
  bar: DataType.String,
  baz: DataType.ArrayOf(DataType.Number),
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
const typeDefOne = DataType.RecordOf({
  foo: { type: DataType.Number, required: false },
  bar: { type: DataType.String, required: false },
  baz: { type: DataType.ArrayOf(DataType.Number), required: false },
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
const typeDefOne = DataType.OneOf(
  DataType.String,
  DataType.Number,
  DataType.Boolean
);

const typeDefExcluded = Exclude(typeDefOne, DataType.Number);
// typeDefExcluded = string | boolean;
```

## Metadata

Each DataType can have metadata attached to it, this metadata can be used to
provide additional information about the data type, for example, you can attach
a description to a data type, or a title, or format.

**Metadata is completely ignored by the validation process**

### Assign Metadata

```ts
import { DataType } from "dilswer";

const UserNameDT =
  DataType.String.setTitle("User Name").setDescription("The user's name.");

const User = DataType.RecordOf({
  name: UserNameDT,
  id: DataType.String.setTitle("User ID").setFormat("uuid"),
  friends: DataType.ArrayOf(DataType.String).setDescription(
    "A list of the user's friends names."
  ),
})
  .setTitle("User")
  .setDescription(
    "A user object. Contains the user's name, id and friends list."
  );
```

### Read Metadata

```ts
import { DataType, getMetadata } from "dilswer";

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

### Metadata in JSON Schema

Metadata is also used when generating JSON Schema, if a DataType has a title,
description or format, it will be included in the generated JSON Schema.

```ts
import { DataType, toJsonSchema } from "dilswer";

const UserDT = DataType.RecordOf({
  name: DataType.String.setTitle("User Name").setDescription(
    "The user's name."
  ),
  id: DataType.String.setTitle("User ID").setFormat("uuid"),
  friends: DataType.ArrayOf(DataType.String).setDescription(
    "A list of the user's friends names."
  ),
})
  .setTitle("User")
  .setDescription(
    "A user object. Contains the user's name, id and friends list."
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
