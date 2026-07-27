## 3.2.1 (July 17, 2026)

### Features

- #### feat: allow multiple arguments to the Type.Literal type ([#281](https://github.com/ncpa0/Dilswer/pull/281))

  Updated the function signature to allow multiple arguments, where each argument is an another literal type also allowed. This change allows creating literal unions without using the Type.OneOf (i.e. `Type.OneOf(Type.Literal("foo"), Type.Literal("bar"))` can now be written as `Type.Literal("foo", "bar")`)

### Bug Fixes

- #### feat: export all internal types ([#282](https://github.com/ncpa0/Dilswer/pull/282))

  Exported all internal types and type utilities to fix potential issues with typescripts The inferred type of '...' cannot be named without a reference to errors

## 3.2.0

### Breaking Changes

- #### feat: better error messages and details

  The error returned by the validation function may now also be of AggregateValidationError. Existing ValidationError
  checks will not identify this error.

### Features

- #### feat: better error messages and details
  
  Added `details()` and `detailsJson()` methods to the ValidationError.

  Added a AggregateValidationError which is used if a Union Type Schema (OneOf) fails on every union member, which 
  previously would give a ValidationError with a basic message without indication on why each union type failed.

  `toString()` methods of all Type schemas has ben overridden to return a better representation of how the schema
   looks like.

## 3.1.0 (April 21, 2026)

### Features

- #### Perf improvements ([#260](https://github.com/ncpa0/Dilswer/pull/260))

  Added a few performance improvements to the compiled validators.

### Misc

- renamed `compileFastValidator()` to `compile()`, compileFastValidator will remain as exported alias until 4.0.0
- renamed some internal types

## 3.0.0 (March 12, 2025)

### Breaking Changes

- #### big api changes ([#259](https://github.com/ncpa0/Dilswer/pull/259))

  Many types were renamed (`RecordOf` -> `Record`, `ArrayOf` -> `Array`, etc.)
  Some functions were completely removed. Others were renamed. Changed how metadata is set and read.
  Refer to the README for the new API.

### Features

- #### added more restriction options to string and numeral types ([#259](https://github.com/ncpa0/Dilswer/pull/259))

  Strings can now be defined with a max and min length. String with numbers can define if the string can be positive, negative or zero. Numbers can define min and max values.

- #### more precise error messages when validating ([#259](https://github.com/ncpa0/Dilswer/pull/259))

  When validating with details, errors will containt more precies error messages (before any validation issue would raise an error with the exact same message.)

- #### optimized the validation algorithms ([#259](https://github.com/ncpa0/Dilswer/pull/259))

  Both validation functions should now be a little bit faster.

## 2.1.1 (May 29, 2023)

### Bug Fixes

- #### fix: removed a console.log that was mistakenly left in the compileFastValidator ([#164](https://github.com/ncpa0/Dilswer/pull/164))

  Removed a console.log that was mistakenly left in the compileFastValidator.

## 2.1.0 (May 29, 2023)

### Features

- #### feat: implemented a factory for a high performance validator ([#157](https://github.com/ncpa0/Dilswer/pull/157))

  Added a new factory function - `compileFastValidator`. Validation function
  produced by this factory are much more performant than all the other ones
  provided by Dilswer. `compileFastValidator` leverages JIT compilation via
  `eval()` to generated a highly optimized code specially for the given Data
  Type.
