# Dilswer

Small and lightweight data validation library with TypeScript integration.

Keep your type definitions in one place, and have but one source of truth for
both the runtime validation types and the TypeScript type definitions.

## Table Of Contents

1. [Quick Start](#quick-start)
   1. [Create type definitions](#create-type-definitions)
   2. [Create a TypeScript type from a Dilswer definition](#create-a-typescript-type-from-a-dilswer-definition)
   3. [Create a validation function](#create-a-validation-function)
   4. [Create a function with a validated input](#create-a-function-with-a-validated-input)
2. [Motivation](#motivation)
3. [Main exported functions](#main-exported-functions)
   1. [createValidator()](#dilswercreatevalidator)
   2. [createChecker()](#dilswercreatechecker)
   3. [createTypeGuardedFunction()](#dilswercreatetypeguardedfunction)
   4. [createValidatedFunction()](#dilswercreatevalidatedfunction)
   5. [ensureDataType()](#dilswerensuredatatype)
   6. [DataType](#dilswerdatatype)
4. [Data Types](#data-types)
   1. [String](#datatypestring)
   2. [Number](#datatypenumber)
   3. [Boolean](#datatypeboolean)
   4. [Symbol](#datatypesymbol)
   5. [Null](#datatypenull)
   6. [Undefined](#datatypeundefined)
   7. [Function](#datatypefunction)
   8. [Unknown](#datatypeunknown)
   9. [OneOf](#datatypeoneofdatatypes)
   10. [ArrayOf](#datatypearrayofdatatypes)
   11. [RecordOf](#datatyperecordofrecordstring-fielddescriptor)
   12. [SetOf](#datatypesetofdatatypes)
   13. [Literal](#datatypeliteralstring--number--boolean)
   14. [Enum](#datatypeenumenum)
   15. [EnumMember](#datatypeenummemberenum-member)
5. [Utility Functions](#utility-functions)
   1. [And](#and)
   1. [Omit](#omit)
   1. [Pick](#pick)
   1. [Partial](#partial)
   1. [Required](#required)
   1. [Exclude](#exclude)

## Quick Start

#### Create type definitions

```ts
// person-type.ts
import { DataType } from "dilswer";

export const PersonDataType = DataType.RecordOf({
  id: { type: DataType.String, required: true },
  name: { type: DataType.String },
  age: { type: DataType.Number },
  friends: { type: DataType.ArrayOf(DataType.String), required: false },
});
```

**NOTE:** the `required` attribute in a RecordOf fields is set to `true` by
default.

#### Create a TypeScript type from a Dilswer definition

```ts
import { GetDataType } from "dilswer";
import { PersonDataType } from "./person-type.ts";

type Person = GetDataType<typeof PersonDataType>;

// Result:
// type Person = {
//     friends?: string[];
//     id: string;
//     name: string;
//     age: number;
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

## Motivation

Whenever you use some kind of a type validation library in a TypeScript project
you will have to define those types twice: once as a TS `type` or `interface`
and once in a format that's understood by the data validation library which will
check the data types on runtime. This is a inconvenience and can sometimes lead
to bugs (when you change one of the definitions but forget to do the same with
the other).

This is the problem that **Dilswer** is trying to solve. To have one source of
truth for your type definitions. One that can be understood by both the
TypeScript engine and the data validation library.

**Dilswer** gives you a tool that you can use to define any kind of type, and
then validate data at runtime with against it or infer a TypeScript type
directly from it.

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

#### dilswer.createChecker()

Alias for the `createValidator()`.

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

#### dilswer.ensureDataType()

```ts
const ensureDataType: <DT extends AllDataTypes>(
  dataType: DT,
  data: unknown
) => void;
```

Checks the provided `data` against the `dataType` type definition and throws an
ValidationError if the `data` does not conform to the `dataType`.

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

const foo = DataType.Enum(MyEnum.A);

type T = GetDataType<typeof foo>; // type T = MyEnum.A

const validate = createValidator(foo);

validate("VALUE_A"); // => true
validate(MyEnum.A); // => true
validate(MyEnum.B); // => false
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
