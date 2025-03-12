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
