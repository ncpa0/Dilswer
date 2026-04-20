Benchmarks performed on:

CPU: AMD Ryzen 5800X

RAM: 16GB

OS: EndeavourOS Linux (6.18.22-1-lts)

NodeJS: v25.2.1

# Benchmark suites

1. `large_flat` - measures the validation time on a big JS object containing only primitive values, no nested object or arrays
2. `large_shallow` - measures the validation time on a big JS object containing primitive values, nested object, arrays and arrays of object, no deeper than 2 levels deep
3. `large_nested` - measures the validation time on a big JS object containing primitive values and deeply nested arrays and object
4. `extreme_nested` -  measures the validation time on a gigantic JS object containing way too many nested layers of objects and arrays
5. `medium` - measures the validation time on a moderately sized JS
object, with primitive values and only a few nested objects and arrays
6. `small` - measures the validation time on a small JS object, with primitive values and one array
7. `mini` - measures the validation time on a tiny JS object containing only two primitive values
8. `micro` - measures the validation time on primitive values


Each of the suites is ran with both valid object and invalid object to measure both success and fail paths.

__It is worth noting that `compileFastValidator`, unlike all other validators, does not produce a detailed report about what caused the validation to fail. Which allows it to skip a lot of the work that is being done by all the other solutions.__

# Valid data samples

### Running Suite: Validators benchmark, sample: large_flat - valid

    Dilswer validator x 457,026 ops/sec ±0.58% (94 runs sampled) 2.31%
    Dilswer compileFastValidator x 19,801,060 ops/sec ±0.85% (90 runs sampled) 100.00%
    Zod x 154,485 ops/sec ±3.67% (94 runs sampled) 0.78%
    Valibot x 190,649 ops/sec ±1.47% (93 runs sampled) 0.96%
    ArkType x 1,115,751 ops/sec ±0.96% (91 runs sampled) 5.63%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: large_shallow - valid

    Dilswer validator x 320,470 ops/sec ±1.08% (95 runs sampled) 5.12%
    Dilswer compileFastValidator x 6,258,224 ops/sec ±1.06% (84 runs sampled) 100.00%
    Zod x 90,644 ops/sec ±0.38% (92 runs sampled) 1.45%
    Valibot x 165,712 ops/sec ±0.62% (96 runs sampled) 2.65%
    ArkType x 465,588 ops/sec ±0.82% (90 runs sampled) 7.44%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: large_nested - valid

    Dilswer validator x 139,195 ops/sec ±1.31% (95 runs sampled) 34.09%
    Dilswer compileFastValidator x 408,291 ops/sec ±2.67% (95 runs sampled) 100.00%
    Zod x 10,446 ops/sec ±4.48% (92 runs sampled) 2.56%
    Valibot x 40,397 ops/sec ±0.56% (96 runs sampled) 9.89%
    ArkType x 147,248 ops/sec ±0.73% (90 runs sampled) 36.06%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: extreme_nested - valid

    Dilswer validator x 4,959 ops/sec ±0.58% (95 runs sampled) 25.83%
    Dilswer compileFastValidator x 19,202 ops/sec ±0.48% (95 runs sampled) 100.00%
    Zod x 687 ops/sec ±0.57% (88 runs sampled) 3.58%
    Valibot x 2,362 ops/sec ±0.79% (93 runs sampled) 12.30%
    ArkType x 18,268 ops/sec ±0.52% (94 runs sampled) 95.14%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: medium - valid

    Dilswer validator x 985,143 ops/sec ±1.89% (86 runs sampled) 10.69%
    Dilswer compileFastValidator x 9,211,719 ops/sec ±0.42% (96 runs sampled) 100.00%
    Zod x 246,189 ops/sec ±0.62% (92 runs sampled) 2.67%
    Valibot x 535,120 ops/sec ±0.52% (95 runs sampled) 5.81%
    ArkType x 7,086,196 ops/sec ±0.52% (92 runs sampled) 76.93%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: small - valid

    Dilswer validator x 4,062,321 ops/sec ±2.40% (88 runs sampled) 5.87%
    Dilswer compileFastValidator x 69,162,280 ops/sec ±2.44% (83 runs sampled) 100.00%
    Zod x 1,079,226 ops/sec ±0.76% (94 runs sampled) 1.56%
    Valibot x 2,216,327 ops/sec ±0.70% (94 runs sampled) 3.20%
    ArkType x 35,258,911 ops/sec ±1.16% (91 runs sampled) 50.98%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: mini - valid

    Dilswer validator x 12,336,140 ops/sec ±1.31% (89 runs sampled) 9.30%
    Dilswer compileFastValidator x 132,592,724 ops/sec ±4.30% (74 runs sampled) 100.00%
    Zod x 3,584,517 ops/sec ±0.62% (88 runs sampled) 2.70%
    Valibot x 7,374,281 ops/sec ±0.80% (89 runs sampled) 5.56%
    ArkType x 49,813,128 ops/sec ±1.90% (88 runs sampled) 37.57%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: micro - valid 1

    Dilswer validator x 26,046,919 ops/sec ±3.27% (84 runs sampled) 16.81%
    Dilswer compileFastValidator x 154,938,454 ops/sec ±5.45% (68 runs sampled) 100.00%
    Zod x 21,541,277 ops/sec ±1.02% (88 runs sampled) 13.90%
    Valibot x 45,199,266 ops/sec ±1.26% (87 runs sampled) 29.17%
    ArkType x 62,429,416 ops/sec ±2.40% (87 runs sampled) 40.29%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: micro - valid 2

    Dilswer validator x 26,612,320 ops/sec ±2.34% (84 runs sampled) 16.50%
    Dilswer compileFastValidator x 161,298,837 ops/sec ±5.69% (72 runs sampled) 100.00%
    Zod x 20,803,305 ops/sec ±1.00% (89 runs sampled) 12.90%
    Valibot x 45,318,285 ops/sec ±1.33% (92 runs sampled) 28.10%
    ArkType x 62,901,222 ops/sec ±2.70% (87 runs sampled) 39.00%

Fastest is Dilswer compileFastValidator

-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: discriminatorUnion - valid

    Dilswer validator x 956,515 ops/sec ±3.13% (90 runs sampled) 12.56%
    Dilswer compileFastValidator x 7,613,745 ops/sec ±0.85% (88 runs sampled) 100.00%
    Zod x 16,854 ops/sec ±0.63% (94 runs sampled) 0.22%
    Valibot x 157,554 ops/sec ±0.43% (95 runs sampled) 2.07%
    ArkType x 3,728,678 ops/sec ±0.49% (94 runs sampled) 48.97%

Fastest is Dilswer compileFastValidator

# Invalid data samples

### Running Suite: Validators benchmark, sample: large_flat - invalid

    Dilswer validator x 11,279,508 ops/sec ±0.70% (93 runs sampled) 42.15%
    Dilswer compileFastValidator x 26,757,392 ops/sec ±1.54% (86 runs sampled) 100.00%
    Zod x 59,714 ops/sec ±2.68% (90 runs sampled) 0.22%
    Valibot x 121,215 ops/sec ±0.69% (98 runs sampled) 0.45%
    ArkType x 10,079 ops/sec ±0.47% (92 runs sampled) 0.04%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: large_shallow - invalid

    Dilswer validator x 7,685,375 ops/sec ±3.17% (83 runs sampled) 68.27%
    Dilswer compileFastValidator x 11,257,392 ops/sec ±1.16% (92 runs sampled) 100.00%
    Zod x 24,885 ops/sec ±4.31% (90 runs sampled) 0.22%
    Valibot x 54,903 ops/sec ±0.59% (95 runs sampled) 0.49%
    ArkType x 3,423 ops/sec ±1.07% (96 runs sampled) 0.03%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: large_nested - invalid 1

    Dilswer validator x 565,118 ops/sec ±2.98% (94 runs sampled) 89.06%
    Dilswer compileFastValidator x 634,501 ops/sec ±0.46% (98 runs sampled) 100.00%
    Zod x 10,771 ops/sec ±2.86% (95 runs sampled) 1.70%
    Valibot x 43,448 ops/sec ±0.48% (93 runs sampled) 6.85%
    ArkType x 17,578 ops/sec ±0.53% (95 runs sampled) 2.77%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: large_nested - invalid 2

    Dilswer validator x 569,961 ops/sec ±3.14% (89 runs sampled) 86.56%
    Dilswer compileFastValidator x 658,460 ops/sec ±0.33% (99 runs sampled) 100.00%
    Zod x 10,871 ops/sec ±2.18% (90 runs sampled) 1.65%
    Valibot x 42,855 ops/sec ±0.95% (95 runs sampled) 6.51%
    ArkType x 17,710 ops/sec ±0.40% (94 runs sampled) 2.69%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: medium - invalid 1

    Dilswer validator x 1,301,118 ops/sec ±2.47% (91 runs sampled) 10.08%
    Dilswer compileFastValidator x 12,906,233 ops/sec ±0.51% (95 runs sampled) 100.00%
    Zod x 194,611 ops/sec ±3.56% (87 runs sampled) 1.51%
    Valibot x 501,272 ops/sec ±0.42% (96 runs sampled) 3.88%
    ArkType x 96,712 ops/sec ±0.94% (97 runs sampled) 0.75%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: small - invalid 1

    Dilswer validator x 6,390,628 ops/sec ±1.54% (92 runs sampled) 8.11%
    Dilswer compileFastValidator x 78,760,576 ops/sec ±2.74% (86 runs sampled) 100.00%
    Zod x 519,234 ops/sec ±3.54% (81 runs sampled) 0.66%
    Valibot x 1,622,453 ops/sec ±0.49% (94 runs sampled) 2.06%
    ArkType x 205,601 ops/sec ±0.77% (94 runs sampled) 0.26%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: small - invalid 2

    Dilswer validator x 9,329,218 ops/sec ±1.95% (88 runs sampled) 9.90%
    Dilswer compileFastValidator x 94,250,338 ops/sec ±2.20% (81 runs sampled) 100.00%
    Zod x 508,803 ops/sec ±3.58% (79 runs sampled) 0.54%
    Valibot x 1,808,023 ops/sec ±0.54% (94 runs sampled) 1.92%
    ArkType x 161,434 ops/sec ±0.56% (92 runs sampled) 0.17%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: mini - invalid

    Dilswer validator x 12,155,817 ops/sec ±2.19% (88 runs sampled) 9.63%
    Dilswer compileFastValidator x 126,231,864 ops/sec ±3.96% (75 runs sampled) 100.00%
    Zod x 785,406 ops/sec ±2.99% (75 runs sampled) 0.62%
    Valibot x 3,962,431 ops/sec ±0.68% (94 runs sampled) 3.14%
    ArkType x 387,301 ops/sec ±0.77% (91 runs sampled) 0.31%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: micro - invalid 1

    Dilswer validator x 26,723,227 ops/sec ±4.59% (84 runs sampled) 16.17%
    Dilswer compileFastValidator x 165,300,009 ops/sec ±5.33% (70 runs sampled) 100.00%
    Zod x 1,312,197 ops/sec ±3.28% (85 runs sampled) 0.79%
    Valibot x 11,811,207 ops/sec ±0.95% (92 runs sampled) 7.15%
    ArkType x 476,484 ops/sec ±0.68% (94 runs sampled) 0.29%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: micro - invalid 2

    Dilswer validator x 26,889,501 ops/sec ±2.31% (83 runs sampled) 15.61%
    Dilswer compileFastValidator x 172,261,760 ops/sec ±4.72% (74 runs sampled) 100.00%
    Zod x 1,290,577 ops/sec ±3.90% (75 runs sampled) 0.75%
    Valibot x 10,657,783 ops/sec ±0.74% (89 runs sampled) 6.19%
    ArkType x 490,206 ops/sec ±0.67% (96 runs sampled) 0.28%

Fastest is Dilswer compileFastValidator
-----------------------------------------------------------------

### Running Suite: Validators benchmark, sample: discriminatorUnion - invalid 1

    Dilswer validator x 4,506,261 ops/sec ±1.38% (90 runs sampled) 7.08%
    Dilswer compileFastValidator x 63,682,222 ops/sec ±1.80% (84 runs sampled) 100.00%
    Zod x 19,214 ops/sec ±2.05% (87 runs sampled) 0.03%
    Valibot x 245,613 ops/sec ±2.44% (93 runs sampled) 0.39%
    ArkType x 344,666 ops/sec ±0.67% (96 runs sampled) 0.54%

Fastest is Dilswer compileFastValidator
