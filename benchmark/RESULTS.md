Benchmarks performed on:

CPU: AMD Ryzen 5800X

RAM: 16GB

OS: EndeavourOS Linux (6.18.22-1-lts)

NodeJS: v25.2.1

arktype: 2.2.0

valibot: 1.3.1

zod: 4.3.6

# Benchmark suites

1. `large_flat` - measures the validation time on a big JS object containing only primitive values, no nested object or arrays
2. `large_shallow` - measures the validation time on a big JS object containing primitive values, nested object, arrays and arrays of object, no deeper than 2 levels deep
3. `large_nested` - measures the validation time on a big JS object containing primitive values and deeply nested arrays and object
4. `extreme_nested` - measures the validation time on a gigantic JS object containing way too many nested layers of objects and arrays
5. `medium` - measures the validation time on a moderately sized JS
   object, with primitive values and only a few nested objects and arrays
6. `small` - measures the validation time on a small JS object, with primitive values and one array
7. `mini` - measures the validation time on a tiny JS object containing only two primitive values
8. `micro` - measures the validation time on primitive values
9. `discriminatorUnion` - measures the validation time on a union of three different object schemas

Each of the suites is ran with both valid object and invalid object to measure both success and fail paths.

**It is worth noting that `compileFastValidator`, unlike all other validators, does not produce a detailed report about what caused the validation to fail. Which allows it to skip a lot of the work that is being done by all the other solutions.**

# Valid data samples

Running Suite: Validators benchmark, sample: large_flat - valid

    Dilswer compileFastValidator x 19,931,697 ops/sec ±1.80% (91 runs sampled) 100.00%
    Dilswer validator x 467,363 ops/sec ±0.67% (93 runs sampled) 2.34%
    Zod x 767,963 ops/sec ±1.88% (92 runs sampled) 3.85%
    Valibot x 254,286 ops/sec ±1.68% (93 runs sampled) 1.28%
    ArkType x 997,307 ops/sec ±0.62% (94 runs sampled) 5.00%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: large_shallow - valid

    Dilswer compileFastValidator x 5,990,197 ops/sec ±2.37% (85 runs sampled) 100.00%
    Dilswer validator x 321,450 ops/sec ±0.88% (93 runs sampled) 5.37%
    Zod x 423,715 ops/sec ±1.73% (93 runs sampled) 7.07%
    Valibot x 174,074 ops/sec ±1.83% (90 runs sampled) 2.91%
    ArkType x 462,504 ops/sec ±0.65% (96 runs sampled) 7.72%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: large_nested - valid

    Dilswer compileFastValidator x 410,214 ops/sec ±2.54% (93 runs sampled) 100.00%
    Dilswer validator x 132,261 ops/sec ±2.06% (96 runs sampled) 32.24%
    Zod x 45,687 ops/sec ±2.44% (91 runs sampled) 11.14%
    Valibot x 40,662 ops/sec ±1.71% (93 runs sampled) 9.91%
    ArkType x 140,203 ops/sec ±2.13% (91 runs sampled) 34.18%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: extreme_nested - valid

    Dilswer compileFastValidator x 18,846 ops/sec ±0.40% (92 runs sampled) 100.00%
    Dilswer validator x 4,631 ops/sec ±1.64% (91 runs sampled) 24.57%
    Zod x 4,292 ops/sec ±0.67% (95 runs sampled) 22.77%
    Valibot x 2,373 ops/sec ±0.52% (94 runs sampled) 12.59%
    ArkType x 17,726 ops/sec ±0.59% (91 runs sampled) 94.05%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: medium - valid

    Dilswer compileFastValidator x 9,313,037 ops/sec ±0.75% (94 runs sampled) 100.00%
    Dilswer validator x 979,286 ops/sec ±1.75% (90 runs sampled) 10.52%
    Zod x 930,244 ops/sec ±0.51% (93 runs sampled) 9.99%
    Valibot x 538,176 ops/sec ±0.68% (93 runs sampled) 5.78%
    ArkType x 7,061,200 ops/sec ±0.55% (96 runs sampled) 75.82%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: small - valid

    Dilswer compileFastValidator x 71,758,060 ops/sec ±2.37% (85 runs sampled) 100.00%
    Dilswer validator x 4,085,574 ops/sec ±2.35% (88 runs sampled) 5.69%
    Zod x 4,461,079 ops/sec ±0.60% (89 runs sampled) 6.22%
    Valibot x 2,253,933 ops/sec ±0.62% (91 runs sampled) 3.14%
    ArkType x 34,553,556 ops/sec ±1.17% (87 runs sampled) 48.15%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: mini - valid

    Dilswer compileFastValidator x 142,637,902 ops/sec ±4.76% (79 runs sampled) 100.00%
    Dilswer validator x 12,257,202 ops/sec ±2.18% (89 runs sampled) 8.59%
    Zod x 16,899,355 ops/sec ±0.73% (93 runs sampled) 11.85%
    Valibot x 7,247,077 ops/sec ±0.81% (93 runs sampled) 5.08%
    ArkType x 47,909,258 ops/sec ±2.11% (88 runs sampled) 33.59%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: micro - valid 1

    Dilswer compileFastValidator x 163,921,860 ops/sec ±5.85% (72 runs sampled) 100.00%
    Dilswer validator x 26,473,410 ops/sec ±4.45% (82 runs sampled) 16.15%
    Zod x 32,552,914 ops/sec ±0.94% (91 runs sampled) 19.86%
    Valibot x 44,640,053 ops/sec ±1.34% (85 runs sampled) 27.23%
    ArkType x 60,418,563 ops/sec ±2.47% (84 runs sampled) 36.86%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: micro - valid 2

    Dilswer compileFastValidator x 169,279,438 ops/sec ±5.83% (75 runs sampled) 100.00%
    Dilswer validator x 27,340,799 ops/sec ±2.22% (88 runs sampled) 16.15%
    Zod x 32,562,972 ops/sec ±1.17% (93 runs sampled) 19.24%
    Valibot x 42,921,550 ops/sec ±2.65% (83 runs sampled) 25.36%
    ArkType x 60,450,864 ops/sec ±2.20% (88 runs sampled) 35.71%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: discriminatorUnion - valid

    Dilswer compileFastValidator x 6,972,342 ops/sec ±0.95% (91 runs sampled) 100.00%
    Dilswer validator x 949,456 ops/sec ±2.90% (90 runs sampled) 13.62%
    Zod x 128,639 ops/sec ±0.58% (96 runs sampled) 1.84%
    Valibot x 150,269 ops/sec ±0.42% (92 runs sampled) 2.16%
    ArkType x 3,539,078 ops/sec ±0.65% (92 runs sampled) 50.76%

Fastest is Dilswer compileFastValidator

# Invalid data samples

Running Suite: Validators benchmark, sample: large_flat - invalid

    Dilswer compileFastValidator x 26,828,212 ops/sec ±1.83% (83 runs sampled) 100.00%
    Dilswer validator x 11,361,449 ops/sec ±0.74% (95 runs sampled) 42.35%
    Zod x 16,813 ops/sec ±2.51% (85 runs sampled) 0.06%
    Valibot x 140,134 ops/sec ±2.15% (95 runs sampled) 0.52%
    ArkType x 9,369 ops/sec ±0.31% (96 runs sampled) 0.03%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: large_shallow - invalid

    Dilswer compileFastValidator x 11,437,498 ops/sec ±1.17% (92 runs sampled) 100.00%
    Dilswer validator x 7,982,685 ops/sec ±3.09% (89 runs sampled) 69.79%
    Zod x 6,215 ops/sec ±2.48% (85 runs sampled) 0.05%
    Valibot x 54,418 ops/sec ±0.41% (98 runs sampled) 0.48%
    ArkType x 3,400 ops/sec ±0.40% (98 runs sampled) 0.03%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: large_nested - invalid 1

    Dilswer compileFastValidator x 634,161 ops/sec ±0.59% (96 runs sampled) 100.00%
    Dilswer validator x 569,493 ops/sec ±2.87% (94 runs sampled) 89.80%
    Zod x 27,149 ops/sec ±2.03% (91 runs sampled) 4.28%
    Valibot x 45,469 ops/sec ±0.47% (96 runs sampled) 7.17%
    ArkType x 14,261 ops/sec ±0.38% (91 runs sampled) 2.25%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: large_nested - invalid 2

    Dilswer compileFastValidator x 644,492 ops/sec ±0.54% (90 runs sampled) 100.00%
    Dilswer validator x 557,088 ops/sec ±3.04% (93 runs sampled) 86.44%
    Zod x 26,550 ops/sec ±2.24% (95 runs sampled) 4.12%
    Valibot x 44,302 ops/sec ±0.84% (92 runs sampled) 6.87%
    ArkType x 13,984 ops/sec ±0.49% (92 runs sampled) 2.17%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: medium - invalid 1

    Dilswer compileFastValidator x 12,111,140 ops/sec ±0.71% (92 runs sampled) 100.00%
    Dilswer validator x 1,263,602 ops/sec ±1.60% (97 runs sampled) 10.43%
    Zod x 77,728 ops/sec ±2.07% (96 runs sampled) 0.64%
    Valibot x 490,725 ops/sec ±0.38% (95 runs sampled) 4.05%
    ArkType x 79,318 ops/sec ±0.55% (94 runs sampled) 0.65%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: small - invalid 1

    Dilswer compileFastValidator x 69,910,860 ops/sec ±2.31% (84 runs sampled) 100.00%
    Dilswer validator x 6,189,869 ops/sec ±1.48% (88 runs sampled) 8.85%
    Zod x 76,290 ops/sec ±2.06% (88 runs sampled) 0.11%
    Valibot x 1,588,508 ops/sec ±0.62% (93 runs sampled) 2.27%
    ArkType x 176,550 ops/sec ±0.37% (96 runs sampled) 0.25%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: small - invalid 2

    Dilswer compileFastValidator x 93,051,728 ops/sec ±2.90% (81 runs sampled) 100.00%
    Dilswer validator x 9,430,093 ops/sec ±1.51% (92 runs sampled) 10.13%
    Zod x 78,693 ops/sec ±2.23% (88 runs sampled) 0.08%
    Valibot x 1,756,363 ops/sec ±0.50% (93 runs sampled) 1.89%
    ArkType x 142,105 ops/sec ±0.43% (96 runs sampled) 0.15%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: mini - invalid

    Dilswer compileFastValidator x 120,119,103 ops/sec ±4.80% (82 runs sampled) 100.00%
    Dilswer validator x 12,283,068 ops/sec ±1.92% (90 runs sampled) 10.23%
    Zod x 83,696 ops/sec ±2.08% (90 runs sampled) 0.07%
    Valibot x 4,024,811 ops/sec ±0.50% (94 runs sampled) 3.35%
    ArkType x 327,654 ops/sec ±0.49% (97 runs sampled) 0.27%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: micro - invalid 1

    Dilswer compileFastValidator x 157,176,772 ops/sec ±3.76% (79 runs sampled) 100.00%
    Dilswer validator x 26,391,739 ops/sec ±4.27% (88 runs sampled) 16.79%
    Zod x 86,441 ops/sec ±2.00% (89 runs sampled) 0.05%
    Valibot x 12,467,572 ops/sec ±0.80% (95 runs sampled) 7.93%
    ArkType x 432,567 ops/sec ±0.40% (98 runs sampled) 0.28%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: micro - invalid 2

    Dilswer compileFastValidator x 144,201,794 ops/sec ±3.31% (86 runs sampled) 100.00%
    Dilswer validator x 27,083,438 ops/sec ±1.81% (88 runs sampled) 18.78%
    Zod x 86,280 ops/sec ±2.09% (92 runs sampled) 0.06%
    Valibot x 10,862,839 ops/sec ±0.67% (91 runs sampled) 7.53%
    ArkType x 434,803 ops/sec ±0.32% (95 runs sampled) 0.30%

Fastest is Dilswer compileFastValidator

---

Running Suite: Validators benchmark, sample: discriminatorUnion - invalid 1

    Dilswer compileFastValidator x 64,963,434 ops/sec ±1.79% (87 runs sampled) 100.00%
    Dilswer validator x 4,572,246 ops/sec ±1.22% (93 runs sampled) 7.04%
    Zod x 27,312 ops/sec ±2.87% (81 runs sampled) 0.04%
    Valibot x 251,469 ops/sec ±0.32% (99 runs sampled) 0.39%
    ArkType x 360,092 ops/sec ±0.39% (95 runs sampled) 0.55%

Fastest is Dilswer compileFastValidator
