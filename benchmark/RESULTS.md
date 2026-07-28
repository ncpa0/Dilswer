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

**It is worth noting that `compile`, unlike all other validators, does not produce a detailed report about what caused the validation to fail. Which allows it to skip a lot of the work that is being done by all the other solutions.**

# Valid data samples

## large_flat - valid

| Validator         |    Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ---------: | --------- | ------: | -----------: |
| Dilswer compile   | 19,931,697 | ±1.80%    |      91 |      100.00% |
| Dilswer validator |    467,363 | ±0.67%    |      93 |        2.34% |
| Zod               |    767,963 | ±1.88%    |      92 |        3.85% |
| Valibot           |    254,286 | ±1.68%    |      93 |        1.28% |
| ArkType           |    997,307 | ±0.62%    |      94 |        5.00% |

**Fastest is `Dilswer compile`**

---

## large_shallow - valid

| Validator         |   Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | --------: | --------- | ------: | -----------: |
| Dilswer compile   | 5,990,197 | ±2.37%    |      85 |      100.00% |
| Dilswer validator |   321,450 | ±0.88%    |      93 |        5.37% |
| Zod               |   423,715 | ±1.73%    |      93 |        7.07% |
| Valibot           |   174,074 | ±1.83%    |      90 |        2.91% |
| ArkType           |   462,504 | ±0.65%    |      96 |        7.72% |

**Fastest is `Dilswer compile`**

---

## large_nested - valid

| Validator         | Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ------: | --------- | ------: | -----------: |
| Dilswer compile   | 410,214 | ±2.54%    |      93 |      100.00% |
| Dilswer validator | 132,261 | ±2.06%    |      96 |       32.24% |
| Zod               |  45,687 | ±2.44%    |      91 |       11.14% |
| Valibot           |  40,662 | ±1.71%    |      93 |        9.91% |
| ArkType           | 140,203 | ±2.13%    |      91 |       34.18% |

**Fastest is `Dilswer compile`**

---

## extreme_nested - valid

| Validator         | Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ------: | --------- | ------: | -----------: |
| Dilswer compile   |  18,846 | ±0.40%    |      92 |      100.00% |
| Dilswer validator |   4,631 | ±1.64%    |      91 |       24.57% |
| Zod               |   4,292 | ±0.67%    |      95 |       22.77% |
| Valibot           |   2,373 | ±0.52%    |      94 |       12.59% |
| ArkType           |  17,726 | ±0.59%    |      91 |       94.05% |

**Fastest is `Dilswer compile`**

---

## medium - valid

| Validator         |   Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | --------: | --------- | ------: | -----------: |
| Dilswer compile   | 9,313,037 | ±0.75%    |      94 |      100.00% |
| Dilswer validator |   979,286 | ±1.75%    |      90 |       10.52% |
| Zod               |   930,244 | ±0.51%    |      93 |        9.99% |
| Valibot           |   538,176 | ±0.68%    |      93 |        5.78% |
| ArkType           | 7,061,200 | ±0.55%    |      96 |       75.82% |

**Fastest is `Dilswer compile`**

---

## small - valid

| Validator         |    Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ---------: | --------- | ------: | -----------: |
| Dilswer compile   | 71,758,060 | ±2.37%    |      85 |      100.00% |
| Dilswer validator |  4,085,574 | ±2.35%    |      88 |        5.69% |
| Zod               |  4,461,079 | ±0.60%    |      89 |        6.22% |
| Valibot           |  2,253,933 | ±0.62%    |      91 |        3.14% |
| ArkType           | 34,553,556 | ±1.17%    |      87 |       48.15% |

**Fastest is `Dilswer compile`**

---

## mini - valid

| Validator         |     Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ----------: | --------- | ------: | -----------: |
| Dilswer compile   | 142,637,902 | ±4.76%    |      79 |      100.00% |
| Dilswer validator |  12,257,202 | ±2.18%    |      89 |        8.59% |
| Zod               |  16,899,355 | ±0.73%    |      93 |       11.85% |
| Valibot           |   7,247,077 | ±0.81%    |      93 |        5.08% |
| ArkType           |  47,909,258 | ±2.11%    |      88 |       33.59% |

**Fastest is `Dilswer compile`**

---

## micro - valid 1

| Validator         |     Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ----------: | --------- | ------: | -----------: |
| Dilswer compile   | 163,921,860 | ±5.85%    |      72 |      100.00% |
| Dilswer validator |  26,473,410 | ±4.45%    |      82 |       16.15% |
| Zod               |  32,552,914 | ±0.94%    |      91 |       19.86% |
| Valibot           |  44,640,053 | ±1.34%    |      85 |       27.23% |
| ArkType           |  60,418,563 | ±2.47%    |      84 |       36.86% |

**Fastest is `Dilswer compile`**

---

## micro - valid 2

| Validator         |     Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ----------: | --------- | ------: | -----------: |
| Dilswer compile   | 169,279,438 | ±5.83%    |      75 |      100.00% |
| Dilswer validator |  27,340,799 | ±2.22%    |      88 |       16.15% |
| Zod               |  32,562,972 | ±1.17%    |      93 |       19.24% |
| Valibot           |  42,921,550 | ±2.65%    |      83 |       25.36% |
| ArkType           |  60,450,864 | ±2.20%    |      88 |       35.71% |

**Fastest is `Dilswer compile`**

---

## discriminatorUnion - valid

| Validator         |   Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | --------: | --------- | ------: | -----------: |
| Dilswer compile   | 6,972,342 | ±0.95%    |      91 |      100.00% |
| Dilswer validator |   949,456 | ±2.90%    |      90 |       13.62% |
| Zod               |   128,639 | ±0.58%    |      96 |        1.84% |
| Valibot           |   150,269 | ±0.42%    |      92 |        2.16% |
| ArkType           | 3,539,078 | ±0.65%    |      92 |       50.76% |

**Fastest is `Dilswer compile`**

---

# Invalid data samples

## large_flat - invalid

| Validator         |    Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ---------: | --------- | ------: | -----------: |
| Dilswer compile   | 26,828,212 | ±1.83%    |      83 |      100.00% |
| Dilswer validator | 11,361,449 | ±0.74%    |      95 |       42.35% |
| Zod               |     16,813 | ±2.51%    |      85 |        0.06% |
| Valibot           |    140,134 | ±2.15%    |      95 |        0.52% |
| ArkType           |      9,369 | ±0.31%    |      96 |        0.03% |

**Fastest is `Dilswer compile`**

---

## large_shallow - invalid

| Validator         |    Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ---------: | --------- | ------: | -----------: |
| Dilswer compile   | 11,437,498 | ±1.17%    |      92 |      100.00% |
| Dilswer validator |  7,982,685 | ±3.09%    |      89 |       69.79% |
| Zod               |      6,215 | ±2.48%    |      85 |        0.05% |
| Valibot           |     54,418 | ±0.41%    |      98 |        0.48% |
| ArkType           |      3,400 | ±0.40%    |      98 |        0.03% |

**Fastest is `Dilswer compile`**

---

## large_nested - invalid 1

| Validator         | Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ------: | --------- | ------: | -----------: |
| Dilswer compile   | 634,161 | ±0.59%    |      96 |      100.00% |
| Dilswer validator | 569,493 | ±2.87%    |      94 |       89.80% |
| Zod               |  27,149 | ±2.03%    |      91 |        4.28% |
| Valibot           |  45,469 | ±0.47%    |      96 |        7.17% |
| ArkType           |  14,261 | ±0.38%    |      91 |        2.25% |

**Fastest is `Dilswer compile`**

---

## large_nested - invalid 2

| Validator         | Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ------: | --------- | ------: | -----------: |
| Dilswer compile   | 644,492 | ±0.54%    |      90 |      100.00% |
| Dilswer validator | 557,088 | ±3.04%    |      93 |       86.44% |
| Zod               |  26,550 | ±2.24%    |      95 |        4.12% |
| Valibot           |  44,302 | ±0.84%    |      92 |        6.87% |
| ArkType           |  13,984 | ±0.49%    |      92 |        2.17% |

**Fastest is `Dilswer compile`**

---

## medium - invalid 1

| Validator         |    Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ---------: | --------- | ------: | -----------: |
| Dilswer compile   | 12,111,140 | ±0.71%    |      92 |      100.00% |
| Dilswer validator |  1,263,602 | ±1.60%    |      97 |       10.43% |
| Zod               |     77,728 | ±2.07%    |      96 |        0.64% |
| Valibot           |    490,725 | ±0.38%    |      95 |        4.05% |
| ArkType           |     79,318 | ±0.55%    |      94 |        0.65% |

**Fastest is `Dilswer compile`**

---

## small - invalid 1

| Validator         |    Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ---------: | --------- | ------: | -----------: |
| Dilswer compile   | 69,910,860 | ±2.31%    |      84 |      100.00% |
| Dilswer validator |  6,189,869 | ±1.48%    |      88 |        8.85% |
| Zod               |     76,290 | ±2.06%    |      88 |        0.11% |
| Valibot           |  1,588,508 | ±0.62%    |      93 |        2.27% |
| ArkType           |    176,550 | ±0.37%    |      96 |        0.25% |

**Fastest is `Dilswer compile`**

---

## small - invalid 2

| Validator         |    Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ---------: | --------- | ------: | -----------: |
| Dilswer compile   | 93,051,728 | ±2.90%    |      81 |      100.00% |
| Dilswer validator |  9,430,093 | ±1.51%    |      92 |       10.13% |
| Zod               |     78,693 | ±2.23%    |      88 |        0.08% |
| Valibot           |  1,756,363 | ±0.50%    |      93 |        1.89% |
| ArkType           |    142,105 | ±0.43%    |      96 |        0.15% |

**Fastest is `Dilswer compile`**

---

## mini - invalid

| Validator         |     Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ----------: | --------- | ------: | -----------: |
| Dilswer compile   | 120,119,103 | ±4.80%    |      82 |      100.00% |
| Dilswer validator |  12,283,068 | ±1.92%    |      90 |       10.23% |
| Zod               |      83,696 | ±2.08%    |      90 |        0.07% |
| Valibot           |   4,024,811 | ±0.50%    |      94 |        3.35% |
| ArkType           |     327,654 | ±0.49%    |      97 |        0.27% |

**Fastest is `Dilswer compile`**

---

## micro - invalid 1

| Validator         |     Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ----------: | --------- | ------: | -----------: |
| Dilswer compile   | 157,176,772 | ±3.76%    |      79 |      100.00% |
| Dilswer validator |  26,391,739 | ±4.27%    |      88 |       16.79% |
| Zod               |      86,441 | ±2.00%    |      89 |        0.05% |
| Valibot           |  12,467,572 | ±0.80%    |      95 |        7.93% |
| ArkType           |     432,567 | ±0.40%    |      98 |        0.28% |

**Fastest is `Dilswer compile`**

---

## micro - invalid 2

| Validator         |     Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ----------: | --------- | ------: | -----------: |
| Dilswer compile   | 144,201,794 | ±3.31%    |      86 |      100.00% |
| Dilswer validator |  27,083,438 | ±1.81%    |      88 |       18.78% |
| Zod               |      86,280 | ±2.09%    |      92 |        0.06% |
| Valibot           |  10,862,839 | ±0.67%    |      91 |        7.53% |
| ArkType           |     434,803 | ±0.32%    |      95 |        0.30% |

**Fastest is `Dilswer compile`**

---

## discriminatorUnion - invalid 1

| Validator         |    Ops/sec | Tolerance | Samples | % of Fastest |
| ----------------- | ---------: | --------- | ------: | -----------: |
| Dilswer compile   | 64,963,434 | ±1.79%    |      87 |      100.00% |
| Dilswer validator |  4,572,246 | ±1.22%    |      93 |        7.04% |
| Zod               |     27,312 | ±2.87%    |      81 |        0.04% |
| Valibot           |    251,469 | ±0.32%    |      99 |        0.39% |
| ArkType           |    360,092 | ±0.39%    |      95 |        0.55% |

**Fastest is `Dilswer compile`**
