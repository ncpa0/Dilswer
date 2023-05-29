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
