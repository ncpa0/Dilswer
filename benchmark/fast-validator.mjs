import * as ark from "arktype";
import Bench from "benchmark";
import fs from "fs";
import path from "path";
import * as valibot from "valibot";
import zod from "zod";
import _dilswer from "../dist/cjs/index.cjs";

/** @type {typeof import("../src/data-types/Type").Type} */
const Type = _dilswer.Type;

/** @type {typeof import("../src/validation-algorithms/compile-fast-validator").compileFastValidator} */
const compileFastValidator = _dilswer.compileFastValidator;

/** @type {typeof import("../src/validation-algorithms/create-validator").validator} */
const validator = _dilswer.validator;

const validOnly = process.argv.includes("--valid-only");
let suite;

const suiteArvIdx = process.argv.indexOf("--suite");
if (suiteArvIdx >= 0) {
  suite = process.argv[suiteArvIdx + 1];
}

async function main() {
  await large();
  await medium();
  await small();
  await mini();
  await micro();
  await discriminatorUnion();
  // await deeplyNestedRecord();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/**
 * Check if the given schemas are correct by validating the known correct data
 *
 * @param {{ dilswer: DilswerSchema; zod: ZodSchema; valibot: ValibotSchema; arkttype: ArkSchema; }} schemas
 * @param {any} correctData
 * @returns
 */
const checkSchemasCorrect = (schemas, correctData, incorrectData) => {
  const validate = validator(schemas.dilswer);
  const fastValidate = compileFastValidator(schemas.dilswer);

  const zodResult = schemas.zod.safeParse(correctData);
  const valibotResult = valibot.safeParse(schemas.valibot, correctData);
  const arktResult = schemas.arkttype(correctData);
  const dilswerResult = validate(correctData);
  const fastDilswerResult = fastValidate(correctData);

  if (
    !dilswerResult
    || !fastDilswerResult
    || !zodResult.success
    || !valibotResult.success
    || (arktResult instanceof ark.type.errors)
  ) {
    console.log("Schemas are incorrect");
    console.log("Dilswer:", dilswerResult);
    console.log("Fast Dilswer:", fastDilswerResult);
    console.log("Zod:", zodResult);
    console.log("Valibot:", valibotResult);
    console.log("ArkType:", arktResult);
    throw new Error("Schemas are incorrect");
  }

  const zodInvalidResult = schemas.zod.safeParse(incorrectData);
  const valibotInvalidResult = valibot.safeParse(
    schemas.valibot,
    incorrectData,
  );
  const arktInvalidResult = schemas.arkttype(incorrectData);
  const dilswerInvalidResult = validate(incorrectData);
  const fastDilswerInvalidResult = fastValidate(incorrectData);

  // console.log("arktInvalidResult", arktInvalidResult);

  if (
    dilswerInvalidResult
    || fastDilswerInvalidResult
    || zodInvalidResult.success
    || valibotInvalidResult.success
    || !(arktInvalidResult instanceof ark.type.errors)
  ) {
    console.log("Schemas are incorrect");
    console.log("Dilswer:", dilswerInvalidResult);
    console.log("Fast Dilswer:", fastDilswerInvalidResult);
    console.log("Zod:", zodInvalidResult);
    console.log("Valibot:", valibotInvalidResult);
    console.log("ArkType:", arktInvalidResult);
    throw new Error("Schemas are incorrect");
  }

  return true;
};

const asArray = (t) => {
  return Array.isArray(t) ? t : [t];
};

/**
 * @typedef {import("arktype").Type} ArkSchema
 */

/**
 * @typedef {import("valibot").AnySchema} ValibotSchema
 */

/**
 * @typedef {import("zod").AnyZodObject} ZodSchema
 */

/**
 * @typedef {import("../src/index").AnyDataType} DilswerSchema
 */

/**
 * @param {string} name
 * @param {() => any} getData
 * @param {{ dilswer: DilswerSchema; zod: ZodSchema; valibot: ValibotSchema; arkttype: ArkSchema; }} schemas
 * @returns
 */
const runSuiteForSample = (name, sub, getData, schemas) => {
  if (validOnly && sub.includes("invalid")) {
    return;
  }

  if (suite) {
    if (suite !== name) {
      return;
    }
  }

  const validate = validator(schemas.dilswer);
  const fastValidate = compileFastValidator(schemas.dilswer);
  // console.log(fastValidate.asString());

  console.log(separator + "\n");
  return new Promise((r) => {
    const suite = new Bench.Suite(
      `\u001b[1m\u001b[37mValidators benchmark, sample: \u001b[33m${name} - ${sub}\u001b[0m`,
    );
    suite
      .add("Dilswer validator", function() {
        const dataList = asArray(getData());
        for (let i = 0; i < dataList.length; i++) {
          validate(dataList[i]);
        }
      })
      .add("Dilswer compileFastValidator", function() {
        const dataList = asArray(getData());
        for (let i = 0; i < dataList.length; i++) {
          fastValidate(dataList[i]);
        }
      })
      .add("Zod", () => {
        const dataList = asArray(getData());
        for (let i = 0; i < dataList.length; i++) {
          schemas.zod.safeParse(dataList[i]);
        }
      })
      .add("Valibot", () => {
        const dataList = asArray(getData());
        for (let i = 0; i < dataList.length; i++) {
          valibot.safeParse(schemas.valibot, dataList[i]);
        }
      })
      .add("ArkType", () => {
        const dataList = asArray(getData());
        for (let i = 0; i < dataList.length; i++) {
          schemas.arkttype(dataList[i]);
        }
      })
      .on("start", function() {
        console.log("Running Suite: " + this.name);
      })
      .on("error", function(e) {
        console.log("Error in Suite: " + this.name, e);
      })
      .on("abort", function(e) {
        console.log("Aborting Suite: " + this.name, e);
      })
      .on("complete", function() {
        const fastest = this.filter("fastest");

        console.log("");

        for (let j = 0; j < this.length; j++) {
          console.log(
            "   ",
            this[j].toString(),
            "\u001b[94m"
              + ((this[j].hz / fastest[0].hz) * 100).toFixed(2)
              + "%\u001b[0m",
          );
        }

        console.log(
          "\n\u001b[1m\u001b[37mFastest is \u001b[92m" + fastest.map("name"),
          "\u001b[0m",
        );
        r();
      })
      // run async
      .run({ async: true });
  }).then(() => sleep(5000));
};

const separator = "\u001b[35m" + "-".repeat(65) + "\u001b[0m";

const micro = async () => {
  await runSuiteForSample("micro", "valid 1", () => "asdasd", {
    dilswer: Type.String,
    zod: zod.string(),
    valibot: valibot.string(),
    arkttype: ark.type("string"),
  });
  await runSuiteForSample("micro", "valid 2", () => 42, {
    dilswer: Type.Number,
    zod: zod.number(),
    valibot: valibot.number(),
    arkttype: ark.type("number"),
  });

  await runSuiteForSample("micro", "invalid 1", () => 42, {
    dilswer: Type.String,
    zod: zod.string(),
    valibot: valibot.string(),
    arkttype: ark.type("string"),
  });
  await runSuiteForSample("micro", "invalid 2", () => "asdasd", {
    dilswer: Type.Number,
    zod: zod.number(),
    valibot: valibot.number(),
    arkttype: ark.type("number"),
  });
};

const mini = async () => {
  const miniSchames = {
    dilswer: Type.Record({
      foo: Type.String,
      bar: Type.Number,
    }),
    zod: zod.object({ foo: zod.string(), bar: zod.number() }),
    valibot: valibot.object({ foo: valibot.string(), bar: valibot.number() }),
    arkttype: ark.type({ foo: "string", bar: "number" }),
  };

  const validData = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
  });

  const invalidData = () => ({
    foo: "abc",
    bar: "def",
  });

  checkSchemasCorrect(miniSchames, validData(), invalidData());

  await runSuiteForSample("mini", "valid", validData, miniSchames);
  await runSuiteForSample("mini", "invalid", invalidData, miniSchames);
};

const small = async () => {
  const smallSchemas = {
    dilswer: Type.Record({
      foo: Type.String,
      bar: Type.Number,
      baz: Type.Boolean,
      qux: Type.Array(Type.String),
      quux: Type.Null,
    }),
    zod: zod.object({
      foo: zod.string(),
      bar: zod.number(),
      baz: zod.boolean(),
      qux: zod.array(zod.string()),
      quux: zod.null(),
    }),
    valibot: valibot.object({
      foo: valibot.string(),
      bar: valibot.number(),
      baz: valibot.boolean(),
      qux: valibot.array(valibot.string()),
      quux: valibot.null(),
    }),
    arkttype: ark.type({
      foo: "string",
      bar: "number",
      baz: "boolean",
      qux: "string[]",
      quux: "null",
    }),
  };

  const validData = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
    baz: true,
    qux: ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur"],
    quux: null,
  });

  const invalidData1 = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
    baz: true,
    qux: ["lorem", "ipsum", "dolor", 1, "amet", "consectetur"],
    quux: null,
  });

  const invalidData2 = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
    baz: "true",
    qux: ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur"],
    quux: null,
  });

  checkSchemasCorrect(smallSchemas, validData(), invalidData1());

  await runSuiteForSample("small", "valid", validData, smallSchemas);
  await runSuiteForSample("small", "invalid 1", invalidData1, smallSchemas);
  await runSuiteForSample("small", "invalid 2", invalidData2, smallSchemas);
};

const medium = async () => {
  const mediumSchemas = {
    dilswer: Type.Record({
      rangeError: Type.Option(Type.InstanceOf(RangeError)),
      foo: Type.String,
      bar: Type.Number,
      baz: Type.Boolean,
      qux: Type.Array(
        Type.Record({
          quux: Type.String,
          quuz: Type.Number,
          corge: Type.Boolean,
          grault: Type.Array(Type.String),
          garply: Type.Null,
        }),
      ),
      waldo: Type.Null,
    }),
    zod: zod.object({
      rangeError: zod.instanceof(RangeError).optional(),
      foo: zod.string(),
      bar: zod.number(),
      baz: zod.boolean(),
      qux: zod.array(
        zod.object({
          quux: zod.string(),
          quuz: zod.number(),
          corge: zod.boolean(),
          grault: zod.array(zod.string()),
          garply: zod.null(),
        }),
      ),
      waldo: zod.null(),
    }),
    valibot: valibot.object({
      rangeError: valibot.optional(valibot.instance(RangeError)),
      foo: valibot.string(),
      bar: valibot.number(),
      baz: valibot.boolean(),
      qux: valibot.array(valibot.object({
        quux: valibot.string(),
        quuz: valibot.number(),
        corge: valibot.boolean(),
        grault: valibot.array(valibot.string()),
        garply: valibot.null(),
      })),
      waldo: valibot.null(),
    }),
    arkttype: ark.type({
      "rangeError?": ark.type.instanceOf(RangeError),
      foo: "string",
      bar: "number",
      baz: "boolean",
      qux: ark.type({
        quux: "string",
        quuz: "number",
        corge: "boolean",
        grault: "string[]",
        garply: "null",
      }).array(),
      waldo: "null",
    }),
  };

  const validData = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
    baz: true,
    qux: [
      {
        quux: "lorem ipsum dolor sit amet consectetur adipiscing elit",
        quuz: 42,
        corge: true,
        grault: [
          "lorem",
          "ipsum",
          "dolor",
          "sit",
          "amet",
          "consectetur",
          "adipiscing",
          "elit",
        ],
        garply: null,
      },
      {
        quux: "lorem ipsum dolor sit amet consectetur adipiscing elit",
        quuz: 42,
        corge: true,
        grault: [
          "lorem",
          "ipsum",
          "dolor",
          "sit",
          "amet",
          "consectetur",
          "adipiscing",
          "elit",
        ],
        garply: null,
      },
      {
        quux: "lorem ipsum dolor sit amet consectetur adipiscing elit",
        quuz: 42,
        corge: true,
        grault: [
          "lorem",
          "ipsum",
          "dolor",
          "sit",
          "amet",
          "consectetur",
          "adipiscing",
          "elit",
        ],
        garply: null,
      },
    ],
    waldo: null,
  });

  const invalidData1 = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
    baz: true,
    qux: [
      {
        quux: "lorem ipsum dolor sit amet consectetur adipiscing elit",
        quuz: 42,
        corge: true,
        grault: [
          "lorem",
          "ipsum",
          "dolor",
          "sit",
          "amet",
          "consectetur",
          "adipiscing",
          "elit",
        ],
        garply: null,
      },
      {
        quux: "lorem ipsum dolor sit amet consectetur adipiscing elit",
        quuz: 42,
        corge: true,
        grault: [
          "lorem",
          "ipsum",
          "dolor",
          "sit",
          "amet",
          "consectetur",
          "adipiscing",
          "elit",
        ],
        garply: null,
      },
      {
        quux: "lorem ipsum dolor sit amet consectetur adipiscing elit",
        quuz: 42,
        corge: true,
        grault: [
          "lorem",
          "ipsum",
          "dolor",
          "sit",
          "amet",
          "consectetur",
          "adipiscing",
          "elit",
        ],
        garply: null,
      },
    ],
    waldo: "null",
  });

  checkSchemasCorrect(mediumSchemas, validData(), invalidData1());

  await runSuiteForSample("medium", "valid", validData, mediumSchemas);
  await runSuiteForSample("medium", "invalid 1", invalidData1, mediumSchemas);
};

const large = async () => {
  const largeSchemas = {
    dilswer: Type.Record({
      foo: Type.String,
      bar: Type.Number,
      baz: Type.Boolean,
      qux: Type.Array(
        Type.Record({
          quux: Type.String.Int,
          quuz: Type.Int,
          corge: Type.Boolean,
          grault: Type.Array(
            Type.Record({
              garply: Type.String,
              waldo: Type.String.Float,
              fred: Type.Boolean,
              plugh: Type.Array(Type.String, Type.Number, Type.Boolean),
              xyzzy: Type.Null,
            }),
          ),
          thud: Type.Function,
          paparapr: Type.Dict(Type.String, Type.Number),
          regexp: Type.InstanceOf(RegExp),
          entries: Type.Array(
            Type.Tuple(
              Type.String,
              Type.Record({
                value: Type.String,
                done: Type.Boolean,
              }),
            ),
          ),
        }),
      ),
      wibble: Type.Null,
    }),
    zod: zod.object({
      foo: zod.string(),
      bar: zod.number(),
      baz: zod.boolean(),
      qux: zod.array(
        zod.object({
          quux: zod.string(),
          quuz: zod.number(),
          corge: zod.boolean(),
          grault: zod.array(
            zod.object({
              garply: zod.string(),
              waldo: zod.string(),
              fred: zod.boolean(),
              plugh: zod.array(
                zod.union([zod.string(), zod.number(), zod.boolean()]),
              ),
              xyzzy: zod.null(),
            }),
          ),
          thud: zod.function(),
          paparapr: zod.record(zod.union([zod.string(), zod.number()])),
          regexp: zod.instanceof(RegExp),
          entries: zod.array(
            zod.tuple([
              zod.string(),
              zod.object({ value: zod.string(), done: zod.boolean() }),
            ]),
          ),
        }),
      ),
      wibble: zod.null(),
    }),
    valibot: valibot.object({
      foo: valibot.string(),
      bar: valibot.number(),
      baz: valibot.boolean(),
      qux: valibot.array(valibot.object({
        quux: valibot.string(),
        quuz: valibot.number(),
        corge: valibot.boolean(),
        grault: valibot.array(valibot.object({
          garply: valibot.string(),
          waldo: valibot.string(),
          fred: valibot.boolean(),
          plugh: valibot.array(
            valibot.union([
              valibot.string(),
              valibot.number(),
              valibot.boolean(),
            ]),
          ),
          xyzzy: valibot.null(),
        })),
        thud: valibot.function(),
        paparapr: valibot.record(valibot.string(), valibot.number()),
        regexp: valibot.instance(RegExp),
        entries: valibot.array(
          valibot.tuple([
            valibot.string(),
            valibot.object({
              value: valibot.string(),
              done: valibot.boolean(),
            }),
          ]),
        ),
      })),
      wibble: valibot.null(),
    }),
    arkttype: ark.type({
      foo: "string",
      bar: "number",
      baz: "boolean",
      qux: ark.type({
        quux: "string.integer",
        quuz: "number.integer",
        corge: "boolean",
        grault: ark.type({
          garply: "string",
          waldo: "string.numeric",
          fred: "boolean",
          plugh: "(string | number | boolean)[]",
          xyzzy: "null",
        }).array(),
        thud: "Function",
        paparapr: ark.type({
          "[string | symbol]": "number | string",
        }),
        regexp: "RegExp",
        entries: ark.type(["string", { value: "string", done: "boolean" }])
          .array(),
      }).array(),
      wibble: "null",
    }),
  };

  const validData = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
    baz: true,
    qux: [
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "012312342346545675686796123123523465",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: false }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "01231235234",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: false }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "12",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: false }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
    ],
    wibble: null,
  });

  const invalidData1 = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
    baz: true,
    qux: [
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: 42,
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "0",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: false }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "1",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: false }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "1",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: false }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
    ],
    wibble: null,
  });

  const invalidData2 = () => ({
    foo: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    bar: 42,
    baz: true,
    qux: [
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: 42,
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "0",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: false }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "9567567",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: false }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
      {
        quux: "1234",
        quuz: 42,
        corge: true,
        grault: [
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
          {
            garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
            waldo: "42",
            fred: true,
            plugh: [
              "lorem",
              "ipsum",
              2,
              "dolor",
              true,
              "sit",
              false,
              "amet",
              123.123,
              "consectetur",
              "adipiscing",
              "elit",
              0.111,
            ],
            xyzzy: null,
          },
        ],
        thud: () => {},
        paparapr: {
          foo: 42,
          bar: 421,
          baz: 4132,
          qux: 42352,
          quux: 13442,
          quuz: 42.123,
          corge: 0.42,
          grault: 42,
          garply: 42,
          waldo: 42,
          fred: 42,
          plugh: 42,
          xyzzy: 42,
          thud: 42,
          paparapr: 42,
          regexp: 42,
          entries: 42,
          circ: 42,
        },
        regexp: /foo/,
        entries: [
          ["foo", { value: "bar", done: false }],
          ["bar", { value: "baz", done: false }],
          ["baz", { value: "qux", done: false }],
          ["qux", { value: "quux", done: false }],
          ["quux", { value: "quuz", done: false }],
        ],
        circ: {
          quux: "0",
          quuz: 42,
          corge: true,
          grault: [
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
            {
              garply: "lorem ipsum dolor sit amet consectetur adipiscing elit",
              waldo: "42",
              fred: true,
              plugh: [
                "lorem",
                "ipsum",
                2,
                "dolor",
                true,
                "sit",
                false,
                "amet",
                123.123,
                "consectetur",
                "adipiscing",
                "elit",
                0.111,
              ],
              xyzzy: null,
            },
          ],
          thud: () => {},
          paparapr: {
            foo: 42,
            bar: 42,
            baz: 42,
            qux: 42,
            quux: 42,
            quuz: 42,
            corge: 42,
            grault: 42,
            garply: 42,
          },
          regexp: /foo/,
          entries: [
            ["foo", { value: "bar", done: false }],
            ["bar", { value: "baz", done: false }],
            ["baz", { value: "qux", done: false }],
            ["qux", { value: "quux", done: 1 }],
            ["quux", { value: "quuz", done: false }],
          ],
        },
      },
    ],
    wibble: null,
  });

  checkSchemasCorrect(largeSchemas, validData(), invalidData1());

  await runSuiteForSample("large", "valid", validData, largeSchemas);
  await runSuiteForSample("large", "invalid 1", invalidData1, largeSchemas);
  await runSuiteForSample("large", "invalid 2", invalidData2, largeSchemas);
};

const discriminatorUnion = async () => {
  const discriminatorUnionSchemas = {
    dilswer: Type.OneOf(
      Type.Record({
        foo: Type.Record({
          arr: Type.Array(Type.String),
          set: Type.Set(Type.String),
        }),
        bar: Type.Array(Type.Dict(Type.String)),
        baz: Type.OneOf(Type.String, Type.Int, Type.Function),
        t: Type.Literal("t1"),
      }),
      Type.Record({
        foo: Type.Array(Type.String),
        bar: Type.Function,
        baz: Type.Tuple(Type.String, Type.String, Type.String, Type.String),
        t: Type.Literal("t2"),
      }),
      Type.Record({
        foo: Type.String,
        bar: Type.Number,
        baz: Type.Boolean,
        t: Type.Literal("t3"),
      }),
    ),
    zod: zod.union([
      zod.object({
        foo: zod.object({
          arr: zod.array(zod.string()),
          set: zod.set(zod.string()),
        }),
        bar: zod.array(zod.record(zod.string(), zod.string())),
        baz: zod.union([zod.string(), zod.number().int(), zod.function()]),
        t: zod.literal("t1"),
      }),
      zod.object({
        foo: zod.array(zod.string()),
        bar: zod.function(),
        baz: zod.tuple([
          zod.string(),
          zod.string(),
          zod.string(),
          zod.string(),
        ]),
        t: zod.literal("t2"),
      }),
      zod.object({
        foo: zod.string(),
        bar: zod.number(),
        baz: zod.boolean(),
        t: zod.literal("t3"),
      }),
    ]),
    valibot: valibot.union([
      valibot.object({
        foo: valibot.object({
          arr: valibot.array(valibot.string()),
          set: valibot.set(valibot.string()),
        }),
        bar: valibot.array(
          valibot.record(
            valibot.string(),
            valibot.string(),
          ),
        ),
        baz: valibot.union([
          valibot.string(),
          valibot.pipe(valibot.number(), valibot.integer()),
          valibot.function(),
        ]),
        t: valibot.literal("t1"),
      }),
      valibot.object({
        foo: valibot.array(valibot.string()),
        bar: valibot.function(),
        baz: valibot.tuple([
          valibot.string(),
          valibot.string(),
          valibot.string(),
          valibot.string(),
        ]),
        t: valibot.literal("t2"),
      }),
      valibot.object({
        foo: valibot.string(),
        bar: valibot.number(),
        baz: valibot.boolean(),
        t: valibot.literal("t3"),
      }),
    ]),
    arkttype: ark.type({
      foo: {
        arr: "string[]",
        set: ark.type.instanceOf(Set),
      },
      bar: ark.type({
        "[string]": "string",
      }).array(),
      baz: "string | number.integer | Function",
      t: "\"t1\"",
    })
      .or(
        ark.type({
          foo: "string[]",
          bar: "Function",
          baz: ark.type(["string", "string", "string", "string"]),
          t: "\"t2\"",
        }),
      )
      .or(
        ark.type({
          foo: "string",
          bar: "number",
          baz: "boolean",
          t: "\"t3\"",
        }),
      ),
  };

  const valid1 = () => [{
    t: "t1",
    foo: {
      arr: ["hello", "world"],
      set: new Set(["a", "b", "c"]),
    },
    bar: [{ key1: "value1" }, { key2: "value2" }],
    baz: 42, // integer — passes number.integer
  }, {
    foo: ["apple", "banana", "cherry"],
    bar: (x) => x * 2,
    baz: ["one", "two", "three", "four"],
    t: "t2",
  }, {
    foo: "just a string",
    bar: 3.14, // plain number — valid for variant 3
    baz: true,
    t: "t3",
  }];

  // ❌ Fails all variants
  const invalid1 = () => ({
    t: "t2", // claims to be variant 2...
    foo: ["a", "b"], // ✅ foo is fine
    bar: "oops", // ❌ should be a Function, got a string
    baz: ["one", "two"], // ❌ tuple needs exactly 4 strings, got 2
  });

  checkSchemasCorrect(discriminatorUnionSchemas, valid1()[0], invalid1());
  checkSchemasCorrect(discriminatorUnionSchemas, valid1()[1], invalid1());
  checkSchemasCorrect(discriminatorUnionSchemas, valid1()[2], invalid1());

  await runSuiteForSample(
    "discriminatorUnion",
    "valid",
    valid1,
    discriminatorUnionSchemas,
  );
  await runSuiteForSample(
    "discriminatorUnion",
    "invalid 1",
    invalid1,
    discriminatorUnionSchemas,
  );
};

main();
