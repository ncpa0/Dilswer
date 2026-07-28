# Dilswer

![GitHub](https://img.shields.io/github/license/ncpa0cpl/Dilswer?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ncpa0cpl/dilswer/test.yml?branch=master&style=for-the-badge)
[![npm](https://img.shields.io/npm/v/dilswer?style=for-the-badge)](https://www.npmjs.com/package/dilswer)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/dilswer?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/ncpa0cpl/Dilswer?style=for-the-badge)

Blazingly fast data validation library with TypeScript integration.

## Table of Contents

1. [Quick Start](#quick-start)
   1. [Compile a Validator](#compile-a-validator)
   2. [Create Type Definitions](#create-type-definitions)
   3. [Infer TypeScript Types](#infer-typescript-types-from-dilswer-definitions)
   4. [Get Validation Details](#get-validation-details)
   5. [Assertion Function](#assertion-function)
   6. [Standard Schema Support](#standard-schema-support)
2. [Available Types](#available-types)
   1. [Primitives](#primitives)
   2. [Compound Types](#compound-types)
   3. [Special Types](#special-types)
3. [Utility Functions](#utility-functions)
4. [Metadata](#metadata)
5. [JSON Schema Generation](#json-schema-generation)
6. [TypeScript Type Generation](#typescript-type-generation)
7. [Parsing](#parsing)

## Quick Start

### Compile a Validator

The fastest way to validate data is using the `compile()` function:

```ts
import { compile, Type } from "dilswer";

// Compile a validation function from a type definition
const isString = compile(Type.String);

isString("hello"); // true
isString(123); // false
```

For complex types:

```ts
import { compile, Type } from "dilswer";

const PersonValidator = compile(
  Type.Record({
    id: Type.String,
    name: Type.String,
    age: Type.Number,
    email: Type.Option(Type.String),
    friends: Type.Option(Type.Array(Type.String)),
  }),
);

// Valid data
PersonValidator({
  id: "abc123",
  name: "Alice",
  age: 30,
}); // true

// Invalid data
PersonValidator({
  name: "Bob",
  age: "not a number", // age should be a number
}); // false
```

**Performance note:** Compiled validators are extremely fast but provide minimal error messages. For detailed error information, use the `validator()` function instead.

### Create Type Definitions

```ts
import { Type } from "dilswer";

// Define a record type with various field types
const PersonDataType = Type.Record({
  id: Type.String,
  name: Type.String,
  age: Type.Number,
  email: Type.Option(Type.String),
  friends: Type.Option(Type.Array(Type.String)),
});

// The equivalent TypeScript type would be:
// {
//   id: string;
//   name: string;
//   age: number;
//   email?: string;
//   friends?: string[];
// }
```

### Infer TypeScript Types from Dilswer Definitions

```ts
import { compile, Infer, Type } from "dilswer";

const PersonDataType = Type.Record({
  id: Type.String,
  name: Type.String,
  age: Type.Number,
});

type Person = Infer<typeof PersonDataType>;

// type Person = {
//   id: string;
//   name: string;
//   age: number;
// }

// Works with compiled validators too
const PersonValidator = compile(PersonDataType);
// PersonValidator(v: any): v is {
//   id: string;
//   name: string;
//   age: number;
// }
```

### Get Validation Details

If you need detailed information about validation failures, use `validator()` with the `details` option:

```ts
import { Type, validator } from "dilswer";

const isPerson = validator(PersonDataType, { details: true });

const result = isPerson({ name: "Alice" });

if (result.success) {
  console.log(result.value.name);
} else {
  console.error("Validation failed:", result.error.message);
  // Access the path where validation failed:
  console.error("Failed at:", result.error.fieldPath);
  console.error("Details:", result.error.details());
  console.error("DetailsObject:", JSON.stringify(result.error.detailsJson()));
}
```

`details()` returns a string containing information about the error more detailed than just the error message.

#### Details Examples

```
ValidationError: not an array
Path: $.foo.bar
Expected: ArraySchema[ PrimitiveSchema[ string ] ]
Got: object
```

```
AggregateValidationError: does not match any of the types in the union
Path: $
Errors:
  ValidationError: not an object
  Path: $
  Expected: RecordSchema[ type=LiteralSchema[ a ]; foo=PrimitiveSchema[ number ]; bar=PrimitiveSchema[ string ] ]
  Got: object

  ValidationError: not an object
  Path: $
  Expected: RecordSchema[ type=LiteralSchema[ b ]; foo=PrimitiveSchema[ string ]; baz=PrimitiveSchema[ string ] ]
  Got: object

  ValidationError: not an object
  Path: $
  Expected: RecordSchema[ type=LiteralSchema[ c ]; foo=PrimitiveSchema[ boolean ]; qux=PrimitiveSchema[ string ] ]
  Got: object
```

### ValidateWith

A shorthand for validate with details.

```ts
import { Type, validateWith } from "dilswer";

const result = validateWith(Type.String, value);

if (result.success) {
  console.log(result.value);
} else {
  console.error("Validation failed:", result.error.message);
}
```

### Assertion Function

The assertion function throws an error if validation fails, which is useful for early returns:

```ts
import { assertType, Type } from "dilswer";

function greet(value: unknown) {
  try {
    assertType(Type.String, value);
    value.toUpperCase(); // value is now typed as string
  } catch (error) {
    console.error("Value is not a string");
  }
}
```

### Standard Schema Support

Dilswer schemas are compatible with libraries that support the Standard Schema specification, such as tRPC and OpenAPI.

```ts
import { initTRPC } from "@trpc/server";
import { compile, Type } from "dilswer";

const t = initTRPC.create();

// For maximum performance, compile schemas before passing them to procedures
const router = t.router({
  greeting: t.procedure
    .input(
      Type.Record({
        name: Type.String,
      }).compile(),
    )
    .query(async ({ input }) => {
      return `Hello, ${input.name}!`;
    }),
});
```

Uncompiled schemas also work but may have slightly lower performance:

```ts
const router = t.router({
  greeting: t.procedure
    .input(
      Type.Record({
        name: Type.String,
      }),
    )
    .query(async ({ input }) => {
      return `Hello, ${input.name}!`;
    }),
});
```

## Available Types

### Primitives

#### Type.String

Matches any string value.

```ts
const validator = compile(Type.String);
validator("hello"); // true
validator(123); // false
```

#### Type.Number

Matches any numeric value (including floats and integers).

```ts
const validator = compile(Type.Number);
validator(1.5); // true
validator(42); // true
validator("123"); // false
```

#### Type.Int

Matches only integer values.

```ts
const validator = compile(Type.Int);
validator(42); // true
validator(1.5); // false
```

#### Type.Boolean

Matches `true` and `false` values.

```ts
const validator = compile(Type.Boolean);
validator(true); // true
validator(false); // true
validator(1); // false
```

#### Type.Symbol

Matches symbol values.

```ts
const validator = compile(Type.Symbol);
validator(Symbol("test")); // true
validator("sym"); // false
```

#### Type.Null

Matches only the `null` value.

```ts
const validator = compile(Type.Null);
validator(null); // true
validator(undefined); // false
```

#### Type.Undefined

Matches only the `undefined` value.

```ts
const validator = compile(Type.Undefined);
validator(undefined); // true
validator(null); // false
```

#### Type.Function

Matches any function.

```ts
const validator = compile(Type.Function);
validator(() => {}); // true
validator(async () => {}); // true
validator("not a fn"); // false
```

#### Type.Unknown

Matches any value.

```ts
const validator = compile(Type.Unknown);
validator("anything"); // true
validator(123); // true
validator(null); // true
```

#### String Variations

```ts
// Matches strings containing only numeric characters
// Safe to convert to number without producing NaN
const numeralValidator = compile(Type.String.Float);
numeralValidator("123"); // true
numeralValidator("12.5"); // true (float strings match)
numeralValidator("abc"); // false

// Matches strings containing only integer characters
const intValidator = compile(Type.String.Int);
intValidator("123"); // true
intValidator("12.5"); // false

// Matches strings containing only positive integer characters
const positiveIntValidator = compile(Type.String.Int.positive());
positiveIntValidator("123"); // true
positiveIntValidator("-1"); // false

// Matches strings that conform to a regular expression
const hexValidator = compile(Type.String.matching(/^[0-9a-f]+$/i));
hexValidator("abc123"); // true
hexValidator("xyz"); // false

// Matches strings with length contraints
const lenValidator = compile(Type.String.len({ min: 2, max: 5 }));
lenValidator("abc"); // true
lenValidator("x"); // false
lenValidator("12345678"); // false
```

### Compound Types

#### Type.Record

Matches objects with specified properties.

```ts
const PersonValidator = compile(
  Type.Record({
    name: Type.String,
    age: Type.Number,
    active: Type.Option(Type.Boolean),
  }),
);

PersonValidator({ name: "Alice", age: 30 }); // true
PersonValidator({ name: "Bob", age: 25, active: true }); // true
PersonValidator({ name: "Carol" }); // false (age is required)
```

#### Type.Array

Matches arrays containing elements of specified types.

```ts
const ArrayValidator = compile(Type.Array(Type.String, Type.Number));

ArrayValidator(["a", "b", 1, 2]); // true
ArrayValidator(["a", "b", "c"]); // true
ArrayValidator([1, 2, 3]); // true
ArrayValidator("not an array"); // false
```

#### Type.Tuple

Matches arrays with a fixed number of elements of specific types.

```ts
const TupleValidator = compile(
  Type.Tuple(Type.String, Type.Number, Type.Boolean),
);

TupleValidator(["hello", 42, true]); // true
TupleValidator(["hello", 42]); // false (wrong length)
TupleValidator(["hello", "world"]); // false (second element is not a number)
```

#### Type.Set

Matches Set objects containing elements of specified types.

```ts
const SetValidator = compile(Type.Set(Type.String));

SetValidator(new Set(["a", "b", "c"])); // true
SetValidator(new Set([1, 2, 3])); // false
SetValidator(["a", "b"]); // false (not a Set)
```

#### Type.Dict

Matches objects where all values match the specified types.

```ts
const DictValidator = compile(Type.Dict(Type.String));

DictValidator({ a: "x", b: "y" }); // true
DictValidator({ a: 1, b: 2 }); // false
DictValidator("not an object"); // false
```

#### Type.OneOf

Matches values that match any one of the provided types (union).

```ts
const UnionValidator = compile(Type.OneOf(Type.String, Type.Number));

UnionValidator("hello"); // true
UnionValidator(123); // true
UnionValidator(true); // false
```

#### Type.AllOf

Matches values that match all of the provided types (intersection).

```ts
const A = Type.Record({ foo: Type.String });
const B = Type.Record({ bar: Type.Number });

const IntersectedValidator = compile(Type.AllOf(A, B));

IntersectedValidator({ foo: "hello", bar: 42 }); // true
IntersectedValidator({ foo: "hello" }); // false (missing bar)
```

#### Type.Literal

Matches exact values.

```ts
const TrueValidator = compile(Type.Literal(true));
const StrValidator = compile(Type.Literal("hello"));
const NumValidator = compile(Type.Literal(42));

TrueValidator(true); // true
TrueValidator(false); // false
StrValidator("hello"); // true
StrValidator("world"); // false
NumValidator(42); // true
NumValidator(100); // false
```

#### Type.Enum

Matches TypeScript enum values.

```ts
enum MyEnum {
  A = "A",
  B = "B",
}

const EnumValidator = compile(Type.Enum(MyEnum));

EnumValidator(MyEnum.A); // true
EnumValidator(MyEnum.B); // true
EnumValidator("C"); // false
```

#### Type.EnumMember

Matches a specific enum member.

```ts
enum MyEnum {
  A = "VALUE_A",
  B = "VALUE_B",
}

const MemberValidator = compile(Type.EnumMember(MyEnum.A));

MemberValidator(MyEnum.A); // true
MemberValidator("VALUE_A"); // true (string value matches)
MemberValidator(MyEnum.B); // false
```

#### Type.InstanceOf

Matches instances of a class.

```ts
class User {
  constructor(public name: string) {}
}

const UserValidator = compile(Type.InstanceOf(User));

UserValidator(new User("Alice")); // true
UserValidator({ name: "Bob" }); // false
```

#### Type.Custom

Matches values using a custom validation function. The function must be a type guard (`(v: any) => v is T`).

```ts
const NonEmptyString = Type.Custom(
  (v: any): v is string => typeof v === "string" && v.length > 0,
);

const NonEmptyValidator = compile(NonEmptyString);

NonEmptyValidator("hello"); // true
NonEmptyValidator(""); // false
NonEmptyValidator(123); // false
```

### Special Types

#### Type.Recursive

Defines types that reference themselves.

```ts
const Node = Type.Recursive(self =>
  Type.Record({
    tag: Type.String,
    children: Type.Array(self),
  })
);

const NodeValidator = compile(Node);

NodeValidator({
  tag: "div",
  children: [
    { tag: "span", children: [] },
    { tag: "p", children: [] },
  ],
}); // true
```

#### Type.Option

Makes a field optional (can be `undefined`).

```ts
const Validator = compile(
  Type.Record({
    name: Type.String,
    email: Type.Option(Type.String),
  }),
);

Validator({ name: "Alice" }); // true
Validator({ name: "Bob", email: "bob@example.com" }); // true
Validator({ name: "Carol", email: undefined }); // true
Validator({ email: "dan@example.com" }); // false (name is required)
```

## Utility Functions

### And()

Combines two Record types. Properties from the second type override conflicting properties from the first.

```ts
const TypeA = Type.Record({
  foo: Type.String,
  bar: Type.Number,
});

const TypeB = Type.Record({
  bar: Type.Boolean,
  baz: Type.String,
});

const Combined = compile(And(TypeA, TypeB));
// Validates: { foo: string, bar: boolean, baz: string }
```

### Omit()

Removes specified keys from a Record type.

```ts
const Original = Type.Record({
  foo: Type.String,
  bar: Type.Number,
  baz: Type.Boolean,
});

const Simplified = compile(Omit(Original, "bar", "baz"));
// Validates: { foo: string }
```

### Pick()

Keeps only the specified keys from a Record type.

```ts
const Original = Type.Record({
  foo: Type.String,
  bar: Type.Number,
  baz: Type.Boolean,
});

const Selected = compile(Pick(Original, "foo", "bar"));
// Validates: { foo: string, bar: number }
```

### Partial()

Makes all properties of a Record type optional.

```ts
const Original = Type.Record({
  name: Type.String,
  age: Type.Number,
});

const OptionalProps = compile(Partial(Original));
// Validates: { name?: string, age?: number }
```

### Required()

Makes all properties of a Record type required (removes optionality).

```ts
const Original = Type.Record({
  name: Type.Option(Type.String),
  age: Type.Option(Type.Number),
});

const RequiredProps = compile(Required(Original));
// Validates: { name: string, age: number }
```

### Exclude()

Removes types from a union.

```ts
const Union = Type.OneOf(Type.String, Type.Number, Type.Boolean);

const StringOrBool = compile(Exclude(Union, Type.Number));
// Validates: string | boolean
```

## Metadata

Each type can have metadata attached to it, such as titles, descriptions, and formats. Metadata is ignored during validation but is used by code generators.

### Assign Metadata

```ts
const UserDT = Type.Record({
  name: Type.String.meta.title("User Name").meta.description(
    "The user's full name",
  ),
  email: Type.String.meta.title("Email").meta.format("email"),
}).meta.title("User")
  .meta.description("A user account with contact information");
```

### Read Metadata

```ts
import { getMetadata, Type } from "dilswer";

const EmailDT = Type.String.meta.title("Email Address").meta.format("email");

const metadata = getMetadata(EmailDT);
// metadata = {
//   title: "Email Address",
//   format: "email",
// }
```

## JSON Schema Generation

Generate JSON Schema from Dilswer types:

```ts
import { toJsonSchema, Type } from "dilswer";

const UserSchema = Type.Record({
  name: Type.String.meta.title("Name"),
  age: Type.Number,
});

const schema = toJsonSchema(UserSchema);
// schema = {
//   type: "object",
//   properties: {
//     name: { type: "string", title: "Name" },
//     age: { type: "number" },
//   },
//   required: ["name", "age"],
// }
```

### ParseToJsonSchemaOptions

```ts
type ParseToJsonSchemaOptions = {
  /** How to handle types without JSON Schema equivalents (Sets, Symbols, etc.) */
  incompatibleTypes?: "throw" | "omit" | "set-as-any";
  /** Whether to allow additional properties in records */
  additionalProperties?: boolean;
  /** Custom parsers for specific types */
  customParser?: {
    Set?: (
      schemas: JSONSchema6[],
      type: SetType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Custom?: (
      fn: Function,
      type: CustomType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Undefined?: (
      type: BasicType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Symbol?: (
      type: BasicType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Function?: (
      type: BasicType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
  };
};
```

## TypeScript Type Generation

Generate TypeScript type definitions from Dilswer types:

```ts
import { toTsType, Type } from "dilswer";

const UserDT = Type.Record({
  name: Type.String,
  age: Type.Number,
}).meta.title("User");

const tsDefinition = toTsType(UserDT);
// Output:
// export type User = {
//   name: string;
//   age: number;
// };
```

### TsParsingOptions

```ts
type TsParsingOptions = {
  /** How to structure the output type */
  mode?: "compact" | "fully-expanded" | "named-expanded";
  /** Which types to export */
  exports?: "main" | "named" | "all" | "none";
  /** Generate type declarations */
  declaration?: boolean;
  /** How to handle duplicate names */
  onDuplicateName?: "error" | "rename";
  /** Custom import paths for external types */
  getExternalTypeImport?: (
    type:
      | EnumType
      | EnumMemberType
      | InstanceOfType
      | CustomType
      | FunctionType,
  ) => ExternalTypeImport | undefined;
};
```

## Parsing

Dilswer types can be parsed into custom data structures using `parseWith()`:

```ts
import { parseWith, Type } from "dilswer";

type TypeNode = {
  typeName: string;
  children?: TypeNode[] | Record<string, TypeNode>;
};

const visitor = {
  visit(type: AnyType, children?: any): TypeNode {
    switch (type.kind) {
      case "simple":
        return { typeName: type.simpleType };
      case "record":
        return {
          typeName: "record",
          children: children
            ? Object.fromEntries(
              children.map(({ propertyName, child }) => [propertyName, child]),
            )
            : undefined,
        };
      default:
        return { typeName: type.kind, children: children as TypeNode[] };
    }
  },
};

const MyType = Type.Record({
  foo: Type.String,
  bar: Type.Array(Type.Number),
});

const tree = parseWith(visitor, MyType);
```

##### Example output

```json
{
  "typeName": "record",
  "children": {
    "foo": { "typeName": "string" },
    "bar": { "typeName": "array", "children": [{ "typeName": "number" }] }
  }
}
```
