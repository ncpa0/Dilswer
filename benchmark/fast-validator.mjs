import * as _ark from "arktype";
import Bench from "benchmark";
import fs from "fs";
import { parseArgs } from "node:util";
import path from "path";
import * as valibot from "valibot";
import zod from "zod";
import _dilswer from "../dist/cjs/index.cjs";
import { getExtremelyNestedData } from "./extreme-nested.mjs";

const ark = { ..._ark };
ark.list = (t) => t.array();

/** @type {typeof import("../src/data-types/Type").Type} */
const Type = _dilswer.Type;

/** @type {typeof import("../src/validation-algorithms/compile-fast-validator").compileFastValidator} */
const compileFastValidator = _dilswer.compileFastValidator;

/** @type {typeof import("../src/validation-algorithms/create-validator").validator} */
const validator = _dilswer.validator;

const { values } = parseArgs({
  options: {
    validOnly: { type: "boolean" },
    invalidOnly: { type: "boolean" },
    suite: { type: "string", multiple: true },
  },
});

async function main() {
  await large_flat();
  await large_shallow();
  await large_nested();
  await extreme_nested();
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
  if (values.validOnly && sub.includes("invalid")) {
    return;
  } else if (values.invalidOnly && !sub.includes("invalid")) {
    return;
  }

  if (values.suite != null) {
    if (!values.suite.includes(name)) {
      return;
    }
  }

  const validate = validator(schemas.dilswer);
  const fastValidate = compileFastValidator(schemas.dilswer);
  console.log(fastValidate.info());

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

const large_flat = async () => {
  const largeSchemas = {
    dilswer: Type.Record({
      id: Type.String,
      name: Type.String,
      age: Type.Number,
      email: Type.String,
      isActive: Type.Boolean,
      score: Type.Number,
      username: Type.String,
      rating: Type.Number,
      isPremium: Type.Boolean,
      tag: Type.String,
      count: Type.Int,
      label: Type.String,
      weight: Type.Number,
      isVerified: Type.Boolean,
      code: Type.String,
      index: Type.Int,
      flag: Type.Boolean,
      title: Type.String,
      rank: Type.Number,
      slug: Type.String,
      total: Type.Number,
      isPublic: Type.Boolean,
      key: Type.String,
      priority: Type.Int,
      memo: Type.String,
      timestamp: Type.Number,
      isDeleted: Type.Boolean,
      token: Type.String,
      balance: Type.Number,
      optional: Type.Null,
      secondid: Type.String,
      secondname: Type.String,
      secondage: Type.Number,
      secondemail: Type.String,
      secondisActive: Type.Boolean,
      secondscore: Type.Number,
      secondusername: Type.String,
      secondrating: Type.Number,
      secondisPremium: Type.Boolean,
      secondtag: Type.String,
      secondcount: Type.Int,
      secondlabel: Type.String,
      secondweight: Type.Number,
      secondisVerified: Type.Boolean,
      secondcode: Type.String,
      secondindex: Type.Int,
      secondflag: Type.Boolean,
      secondtitle: Type.String,
      secondrank: Type.Number,
      secondslug: Type.String,
      secondtotal: Type.Number,
      secondisPublic: Type.Boolean,
      secondkey: Type.String,
      secondpriority: Type.Int,
      secondmemo: Type.String,
      secondtimestamp: Type.Number,
      secondisDeleted: Type.Boolean,
      secondtoken: Type.String,
      secondbalance: Type.Number,
      secondoptional: Type.Null,
    }),
    zod: zod.object({
      id: zod.string(),
      name: zod.string(),
      age: zod.number(),
      email: zod.string(),
      isActive: zod.boolean(),
      score: zod.number(),
      username: zod.string(),
      rating: zod.number(),
      isPremium: zod.boolean(),
      tag: zod.string(),
      count: zod.number(),
      label: zod.string(),
      weight: zod.number(),
      isVerified: zod.boolean(),
      code: zod.string(),
      index: zod.number(),
      flag: zod.boolean(),
      title: zod.string(),
      rank: zod.number(),
      slug: zod.string(),
      total: zod.number(),
      isPublic: zod.boolean(),
      key: zod.string(),
      priority: zod.number(),
      memo: zod.string(),
      timestamp: zod.number(),
      isDeleted: zod.boolean(),
      token: zod.string(),
      balance: zod.number(),
      optional: zod.null(),

      secondid: zod.string(),
      secondname: zod.string(),
      secondage: zod.number(),
      secondemail: zod.string(),
      secondisActive: zod.boolean(),
      secondscore: zod.number(),
      secondusername: zod.string(),
      secondrating: zod.number(),
      secondisPremium: zod.boolean(),
      secondtag: zod.string(),
      secondcount: zod.number(),
      secondlabel: zod.string(),
      secondweight: zod.number(),
      secondisVerified: zod.boolean(),
      secondcode: zod.string(),
      secondindex: zod.number(),
      secondflag: zod.boolean(),
      secondtitle: zod.string(),
      secondrank: zod.number(),
      secondslug: zod.string(),
      secondtotal: zod.number(),
      secondisPublic: zod.boolean(),
      secondkey: zod.string(),
      secondpriority: zod.number(),
      secondmemo: zod.string(),
      secondtimestamp: zod.number(),
      secondisDeleted: zod.boolean(),
      secondtoken: zod.string(),
      secondbalance: zod.number(),
      secondoptional: zod.null(),
    }),
    valibot: valibot.object({
      id: valibot.string(),
      name: valibot.string(),
      age: valibot.number(),
      email: valibot.string(),
      isActive: valibot.boolean(),
      score: valibot.number(),
      username: valibot.string(),
      rating: valibot.number(),
      isPremium: valibot.boolean(),
      tag: valibot.string(),
      count: valibot.number(),
      label: valibot.string(),
      weight: valibot.number(),
      isVerified: valibot.boolean(),
      code: valibot.string(),
      index: valibot.number(),
      flag: valibot.boolean(),
      title: valibot.string(),
      rank: valibot.number(),
      slug: valibot.string(),
      total: valibot.number(),
      isPublic: valibot.boolean(),
      key: valibot.string(),
      priority: valibot.number(),
      memo: valibot.string(),
      timestamp: valibot.number(),
      isDeleted: valibot.boolean(),
      token: valibot.string(),
      balance: valibot.number(),
      optional: valibot.null(),

      secondid: valibot.string(),
      secondname: valibot.string(),
      secondage: valibot.number(),
      secondemail: valibot.string(),
      secondisActive: valibot.boolean(),
      secondscore: valibot.number(),
      secondusername: valibot.string(),
      secondrating: valibot.number(),
      secondisPremium: valibot.boolean(),
      secondtag: valibot.string(),
      secondcount: valibot.number(),
      secondlabel: valibot.string(),
      secondweight: valibot.number(),
      secondisVerified: valibot.boolean(),
      secondcode: valibot.string(),
      secondindex: valibot.number(),
      secondflag: valibot.boolean(),
      secondtitle: valibot.string(),
      secondrank: valibot.number(),
      secondslug: valibot.string(),
      secondtotal: valibot.number(),
      secondisPublic: valibot.boolean(),
      secondkey: valibot.string(),
      secondpriority: valibot.number(),
      secondmemo: valibot.string(),
      secondtimestamp: valibot.number(),
      secondisDeleted: valibot.boolean(),
      secondtoken: valibot.string(),
      secondbalance: valibot.number(),
      secondoptional: valibot.null(),
    }),
    arkttype: ark.type({
      id: "string",
      name: "string",
      age: "number",
      email: "string",
      isActive: "boolean",
      score: "number",
      username: "string",
      rating: "number",
      isPremium: "boolean",
      tag: "string",
      count: "number.integer",
      label: "string",
      weight: "number",
      isVerified: "boolean",
      code: "string",
      index: "number.integer",
      flag: "boolean",
      title: "string",
      rank: "number",
      slug: "string",
      total: "number",
      isPublic: "boolean",
      key: "string",
      priority: "number.integer",
      memo: "string",
      timestamp: "number",
      isDeleted: "boolean",
      token: "string",
      balance: "number",
      optional: "null",

      secondid: "string",
      secondname: "string",
      secondage: "number",
      secondemail: "string",
      secondisActive: "boolean",
      secondscore: "number",
      secondusername: "string",
      secondrating: "number",
      secondisPremium: "boolean",
      secondtag: "string",
      secondcount: "number.integer",
      secondlabel: "string",
      secondweight: "number",
      secondisVerified: "boolean",
      secondcode: "string",
      secondindex: "number.integer",
      secondflag: "boolean",
      secondtitle: "string",
      secondrank: "number",
      secondslug: "string",
      secondtotal: "number",
      secondisPublic: "boolean",
      secondkey: "string",
      secondpriority: "number.integer",
      secondmemo: "string",
      secondtimestamp: "number",
      secondisDeleted: "boolean",
      secondtoken: "string",
      secondbalance: "number",
      secondoptional: "null",
    }),
  };

  const validData = () => ({
    id: "abc-123",
    name: "Alice",
    age: 30,
    email: "alice@example.com",
    isActive: true,
    score: 9.5,
    username: "alice99",
    rating: 4.2,
    isPremium: false,
    tag: "beta",
    count: 7,
    label: "primary",
    weight: 68.4,
    isVerified: true,
    code: "XYZ",
    index: 0,
    flag: false,
    title: "Engineer",
    rank: 3.14,
    slug: "alice-engineer",
    total: 1500.0,
    isPublic: true,
    key: "k_001",
    priority: 1,
    memo: "No notes",
    timestamp: 1700000000,
    isDeleted: false,
    token: "tok_abc",
    balance: 250.75,
    optional: null,

    secondid: "abc-123",
    secondname: "Alice",
    secondage: 30,
    secondemail: "alice@example.com",
    secondisActive: true,
    secondscore: 9.5,
    secondusername: "alice99",
    secondrating: 4.2,
    secondisPremium: false,
    secondtag: "beta",
    secondcount: 7,
    secondlabel: "primary",
    secondweight: 68.4,
    secondisVerified: true,
    secondcode: "XYZ",
    secondindex: 0,
    secondflag: false,
    secondtitle: "Engineer",
    secondrank: 3.14,
    secondslug: "alice-engineer",
    secondtotal: 1500.0,
    secondisPublic: true,
    secondkey: "k_001",
    secondpriority: 1,
    secondmemo: "No notes",
    secondtimestamp: 1700000000,
    secondisDeleted: false,
    secondtoken: "tok_abc",
    secondbalance: 250.75,
    secondoptional: null,
  });

  const invalidData1 = () => ({
    id: 123, // should be string
    name: null, // should be string
    age: "thirty", // should be number
    email: true, // should be string
    isActive: "yes", // should be boolean
    score: "high",
    username: 42,
    rating: false,
    isPremium: 0,
    tag: 99,
    count: "seven",
    label: true,
    weight: "heavy",
    isVerified: "true",
    code: 3,
    index: "zero",
    flag: 1,
    title: null,
    rank: "top",
    slug: false,
    total: "many",
    isPublic: null,
    key: 0,
    priority: "high",
    memo: 404,
    timestamp: "now",
    isDeleted: "no",
    token: 9876,
    balance: "rich",
    optional: "not-null", // should be null

    secondid: "abc-123",
    secondname: "Alice",
    secondage: 30,
    secondemail: "alice@example.com",
    secondisActive: true,
    secondscore: 9.5,
    secondusername: "alice99",
    secondrating: 4.2,
    secondisPremium: false,
    secondtag: "beta",
    secondcount: 7,
    secondlabel: "primary",
    secondweight: 68.4,
    secondisVerified: true,
    secondcode: "XYZ",
    secondindex: 0,
    secondflag: false,
    secondtitle: "Engineer",
    secondrank: 3.14,
    secondslug: "alice-engineer",
    secondtotal: 1500.0,
    secondisPublic: true,
    secondkey: "k_001",
    secondpriority: 1,
    secondmemo: "No notes",
    secondtimestamp: 1700000000,
    secondisDeleted: false,
    secondtoken: "tok_abc",
    secondbalance: 250.75,
    secondoptional: null,
  });

  checkSchemasCorrect(largeSchemas, validData(), invalidData1());

  await runSuiteForSample("large_flat", "valid", validData, largeSchemas);
  await runSuiteForSample("large_flat", "invalid", invalidData1, largeSchemas);
};

const large_shallow = async () => {
  const largeSchemas = {
    dilswer: Type.Record({
      id: Type.String,
      name: Type.String,
      email: Type.String,
      score: Type.Number,
      isActive: Type.Boolean,
      createdAt: Type.Number,
      tags: Type.Array(Type.String),
      ratings: Type.Array(Type.Number),
      flags: Type.Array(Type.Boolean),
      counts: Type.Array(Type.Number),
      optional: Type.Null,
      meta: Type.Record({
        createdAt: Type.Number,
        updatedAt: Type.Number,
        version: Type.String,
        author: Type.String,
        source: Type.String,
        checksum: Type.String,
        isPublic: Type.Boolean,
        locale: Type.String,
      }),
      address: Type.Record({
        street: Type.String,
        city: Type.String,
        zip: Type.String,
        country: Type.String,
        state: Type.String,
        building: Type.String,
        floor: Type.Int,
        isVerified: Type.Boolean,
      }),
      stats: Type.Record({
        views: Type.Int,
        clicks: Type.Int,
        conversions: Type.Number,
        bounceRate: Type.Number,
        avgDuration: Type.Number,
        impressions: Type.Int,
        shares: Type.Int,
        saves: Type.Int,
      }),
      config: Type.Record({
        timeout: Type.Number,
        retries: Type.Int,
        enabled: Type.Boolean,
        maxConnections: Type.Int,
        debugMode: Type.Boolean,
        logLevel: Type.String,
        region: Type.String,
        apiVersion: Type.String,
      }),
      profile: Type.Record({
        bio: Type.String,
        age: Type.Int,
        isPremium: Type.Boolean,
        displayName: Type.String,
        avatarUrl: Type.String,
        website: Type.String,
        company: Type.String,
        jobTitle: Type.String,
      }),
      items: Type.Array(
        Type.Record({
          id: Type.String,
          name: Type.String,
          price: Type.Number,
          quantity: Type.Int,
          sku: Type.String,
          isAvailable: Type.Boolean,
          category: Type.String,
          weight: Type.Number,
        }),
      ),
      members: Type.Array(
        Type.Record({
          userId: Type.String,
          role: Type.String,
          joinedAt: Type.Number,
          isAdmin: Type.Boolean,
          displayName: Type.String,
          email: Type.String,
          karma: Type.Int,
          isActive: Type.Boolean,
        }),
      ),
      events: Type.Array(
        Type.Record({
          eventId: Type.String,
          type: Type.String,
          timestamp: Type.Number,
          payload: Type.String,
          severity: Type.String,
          source: Type.String,
          resolved: Type.Boolean,
          code: Type.Int,
        }),
      ),
    }),
    zod: zod.object({
      id: zod.string(),
      name: zod.string(),
      email: zod.string(),
      score: zod.number(),
      isActive: zod.boolean(),
      createdAt: zod.number(),
      tags: zod.array(zod.string()),
      ratings: zod.array(zod.number()),
      flags: zod.array(zod.boolean()),
      counts: zod.array(zod.number()),
      optional: zod.null(),
      meta: zod.object({
        createdAt: zod.number(),
        updatedAt: zod.number(),
        version: zod.string(),
        author: zod.string(),
        source: zod.string(),
        checksum: zod.string(),
        isPublic: zod.boolean(),
        locale: zod.string(),
      }),
      address: zod.object({
        street: zod.string(),
        city: zod.string(),
        zip: zod.string(),
        country: zod.string(),
        state: zod.string(),
        building: zod.string(),
        floor: zod.number(),
        isVerified: zod.boolean(),
      }),
      stats: zod.object({
        views: zod.number(),
        clicks: zod.number(),
        conversions: zod.number(),
        bounceRate: zod.number(),
        avgDuration: zod.number(),
        impressions: zod.number(),
        shares: zod.number(),
        saves: zod.number(),
      }),
      config: zod.object({
        timeout: zod.number(),
        retries: zod.number(),
        enabled: zod.boolean(),
        maxConnections: zod.number(),
        debugMode: zod.boolean(),
        logLevel: zod.string(),
        region: zod.string(),
        apiVersion: zod.string(),
      }),
      profile: zod.object({
        bio: zod.string(),
        age: zod.number(),
        isPremium: zod.boolean(),
        displayName: zod.string(),
        avatarUrl: zod.string(),
        website: zod.string(),
        company: zod.string(),
        jobTitle: zod.string(),
      }),
      items: zod.array(
        zod.object({
          id: zod.string(),
          name: zod.string(),
          price: zod.number(),
          quantity: zod.number(),
          sku: zod.string(),
          isAvailable: zod.boolean(),
          category: zod.string(),
          weight: zod.number(),
        }),
      ),
      members: zod.array(
        zod.object({
          userId: zod.string(),
          role: zod.string(),
          joinedAt: zod.number(),
          isAdmin: zod.boolean(),
          displayName: zod.string(),
          email: zod.string(),
          karma: zod.number(),
          isActive: zod.boolean(),
        }),
      ),
      events: zod.array(
        zod.object({
          eventId: zod.string(),
          type: zod.string(),
          timestamp: zod.number(),
          payload: zod.string(),
          severity: zod.string(),
          source: zod.string(),
          resolved: zod.boolean(),
          code: zod.number(),
        }),
      ),
    }),
    valibot: valibot.object({
      id: valibot.string(),
      name: valibot.string(),
      email: valibot.string(),
      score: valibot.number(),
      isActive: valibot.boolean(),
      createdAt: valibot.number(),
      tags: valibot.array(valibot.string()),
      ratings: valibot.array(valibot.number()),
      flags: valibot.array(valibot.boolean()),
      counts: valibot.array(valibot.number()),
      optional: valibot.null(),
      meta: valibot.object({
        createdAt: valibot.number(),
        updatedAt: valibot.number(),
        version: valibot.string(),
        author: valibot.string(),
        source: valibot.string(),
        checksum: valibot.string(),
        isPublic: valibot.boolean(),
        locale: valibot.string(),
      }),
      address: valibot.object({
        street: valibot.string(),
        city: valibot.string(),
        zip: valibot.string(),
        country: valibot.string(),
        state: valibot.string(),
        building: valibot.string(),
        floor: valibot.number(),
        isVerified: valibot.boolean(),
      }),
      stats: valibot.object({
        views: valibot.number(),
        clicks: valibot.number(),
        conversions: valibot.number(),
        bounceRate: valibot.number(),
        avgDuration: valibot.number(),
        impressions: valibot.number(),
        shares: valibot.number(),
        saves: valibot.number(),
      }),
      config: valibot.object({
        timeout: valibot.number(),
        retries: valibot.number(),
        enabled: valibot.boolean(),
        maxConnections: valibot.number(),
        debugMode: valibot.boolean(),
        logLevel: valibot.string(),
        region: valibot.string(),
        apiVersion: valibot.string(),
      }),
      profile: valibot.object({
        bio: valibot.string(),
        age: valibot.number(),
        isPremium: valibot.boolean(),
        displayName: valibot.string(),
        avatarUrl: valibot.string(),
        website: valibot.string(),
        company: valibot.string(),
        jobTitle: valibot.string(),
      }),
      items: valibot.array(
        valibot.object({
          id: valibot.string(),
          name: valibot.string(),
          price: valibot.number(),
          quantity: valibot.number(),
          sku: valibot.string(),
          isAvailable: valibot.boolean(),
          category: valibot.string(),
          weight: valibot.number(),
        }),
      ),
      members: valibot.array(
        valibot.object({
          userId: valibot.string(),
          role: valibot.string(),
          joinedAt: valibot.number(),
          isAdmin: valibot.boolean(),
          displayName: valibot.string(),
          email: valibot.string(),
          karma: valibot.number(),
          isActive: valibot.boolean(),
        }),
      ),
      events: valibot.array(
        valibot.object({
          eventId: valibot.string(),
          type: valibot.string(),
          timestamp: valibot.number(),
          payload: valibot.string(),
          severity: valibot.string(),
          source: valibot.string(),
          resolved: valibot.boolean(),
          code: valibot.number(),
        }),
      ),
    }),
    arkttype: ark.type({
      id: "string",
      name: "string",
      email: "string",
      score: "number",
      isActive: "boolean",
      createdAt: "number",
      tags: "string[]",
      ratings: "number[]",
      flags: "boolean[]",
      counts: "number[]",
      optional: "null",
      meta: {
        createdAt: "number",
        updatedAt: "number",
        version: "string",
        author: "string",
        source: "string",
        checksum: "string",
        isPublic: "boolean",
        locale: "string",
      },
      address: {
        street: "string",
        city: "string",
        zip: "string",
        country: "string",
        state: "string",
        building: "string",
        floor: "number.integer",
        isVerified: "boolean",
      },
      stats: {
        views: "number.integer",
        clicks: "number.integer",
        conversions: "number",
        bounceRate: "number",
        avgDuration: "number",
        impressions: "number.integer",
        shares: "number.integer",
        saves: "number.integer",
      },
      config: {
        timeout: "number",
        retries: "number.integer",
        enabled: "boolean",
        maxConnections: "number.integer",
        debugMode: "boolean",
        logLevel: "string",
        region: "string",
        apiVersion: "string",
      },
      profile: {
        bio: "string",
        age: "number.integer",
        isPremium: "boolean",
        displayName: "string",
        avatarUrl: "string",
        website: "string",
        company: "string",
        jobTitle: "string",
      },
      items: ark.type({
        id: "string",
        name: "string",
        price: "number",
        quantity: "number.integer",
        sku: "string",
        isAvailable: "boolean",
        category: "string",
        weight: "number",
      }).array(),
      members: ark.type({
        userId: "string",
        role: "string",
        joinedAt: "number",
        isAdmin: "boolean",
        displayName: "string",
        email: "string",
        karma: "number.integer",
        isActive: "boolean",
      }).array(),
      events: ark.type({
        eventId: "string",
        type: "string",
        timestamp: "number",
        payload: "string",
        severity: "string",
        source: "string",
        resolved: "boolean",
        code: "number.integer",
      }).array(),
    }),
  };

  const validData = () => ({
    id: "user-42",
    name: "Bob",
    email: "bob@example.com",
    score: 88.5,
    isActive: true,
    createdAt: 1700000000,
    tags: ["admin", "editor"],
    ratings: [4.5, 3.0, 5.0],
    flags: [true, false, true],
    counts: [1, 2, 3],
    optional: null,
    meta: {
      createdAt: 1700000000,
      updatedAt: 1700001000,
      version: "1.2.3",
      author: "alice",
      source: "api",
      checksum: "abc123",
      isPublic: true,
      locale: "en-US",
    },
    address: {
      street: "123 Main St",
      city: "Springfield",
      zip: "12345",
      country: "US",
      state: "IL",
      building: "A",
      floor: 3,
      isVerified: true,
    },
    stats: {
      views: 1000,
      clicks: 42,
      conversions: 3.14,
      bounceRate: 0.25,
      avgDuration: 120.5,
      impressions: 5000,
      shares: 18,
      saves: 7,
    },
    config: {
      timeout: 30,
      retries: 3,
      enabled: true,
      maxConnections: 10,
      debugMode: false,
      logLevel: "info",
      region: "us-east-1",
      apiVersion: "v2",
    },
    profile: {
      bio: "Just a user.",
      age: 25,
      isPremium: false,
      displayName: "Bobby",
      avatarUrl: "https://example.com/avatar.png",
      website: "https://bob.dev",
      company: "Acme Inc.",
      jobTitle: "Engineer",
    },
    items: [
      {
        id: "item-1",
        name: "Widget",
        price: 9.99,
        quantity: 100,
        sku: "WGT-001",
        isAvailable: true,
        category: "hardware",
        weight: 0.5,
      },
      {
        id: "item-2",
        name: "Gadget",
        price: 24.99,
        quantity: 50,
        sku: "GDG-002",
        isAvailable: false,
        category: "electronics",
        weight: 1.2,
      },
    ],
    members: [
      {
        userId: "u-001",
        role: "owner",
        joinedAt: 1690000000,
        isAdmin: true,
        displayName: "Alice",
        email: "alice@example.com",
        karma: 420,
        isActive: true,
      },
      {
        userId: "u-002",
        role: "member",
        joinedAt: 1695000000,
        isAdmin: false,
        displayName: "Charlie",
        email: "charlie@example.com",
        karma: 55,
        isActive: true,
      },
    ],
    events: [
      {
        eventId: "evt-001",
        type: "login",
        timestamp: 1700000500,
        payload: "{\"ip\":\"1.2.3.4\"}",
        severity: "info",
        source: "auth-service",
        resolved: true,
        code: 200,
      },
      {
        eventId: "evt-002",
        type: "error",
        timestamp: 1700001000,
        payload: "{\"msg\":\"timeout\"}",
        severity: "critical",
        source: "api-gateway",
        resolved: false,
        code: 504,
      },
    ],
  });

  const invalidData1 = () => ({
    id: 42, // should be string
    name: null,
    email: true,
    score: "high",
    isActive: "yes",
    createdAt: "yesterday",
    tags: [1, 2, 3], // should be string[]
    ratings: ["good", "bad"],
    flags: [1, 0], // should be boolean[]
    counts: ["one", "two"],
    optional: "not-null",
    meta: {
      createdAt: "yesterday",
      updatedAt: true,
      version: 123,
      author: false,
      source: 99,
      checksum: null,
      isPublic: "true",
      locale: 42,
    },
    address: {
      street: 99,
      city: false,
      zip: null,
      country: 12,
      state: true,
      building: 3,
      floor: "third", // should be number/integer
      isVerified: "yes",
    },
    stats: {
      views: "many",
      clicks: "few",
      conversions: "some",
      bounceRate: "high",
      avgDuration: null,
      impressions: false,
      shares: "eighteen",
      saves: true,
    },
    config: {
      timeout: "fast",
      retries: "three",
      enabled: 1, // should be boolean
      maxConnections: "ten",
      debugMode: "false",
      logLevel: true,
      region: 42,
      apiVersion: false,
    },
    profile: {
      bio: true,
      age: "young",
      isPremium: null,
      displayName: 9,
      avatarUrl: false,
      website: 0,
      company: true,
      jobTitle: null,
    },
    items: [
      {
        id: 1, // should be string
        name: false,
        price: "expensive",
        quantity: "lots",
        sku: null,
        isAvailable: "yes",
        category: 7,
        weight: "heavy",
      },
    ],
    members: [
      {
        userId: 123,
        role: true,
        joinedAt: "long ago",
        isAdmin: "yes",
        displayName: null,
        email: 42,
        karma: "high",
        isActive: 1,
      },
    ],
    events: [
      {
        eventId: false,
        type: null,
        timestamp: "now",
        payload: 404,
        severity: true,
        source: 0,
        resolved: "no",
        code: "OK", // should be number/integer
      },
    ],
  });

  checkSchemasCorrect(largeSchemas, validData(), invalidData1());

  await runSuiteForSample("large_shallow", "valid", validData, largeSchemas);
  await runSuiteForSample(
    "large_shallow",
    "invalid",
    invalidData1,
    largeSchemas,
  );
};

const large_nested = async () => {
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

  await runSuiteForSample("large_nested", "valid", validData, largeSchemas);
  await runSuiteForSample(
    "large_nested",
    "invalid 1",
    invalidData1,
    largeSchemas,
  );
  await runSuiteForSample(
    "large_nested",
    "invalid 2",
    invalidData2,
    largeSchemas,
  );
};

const extreme_nested = async () => {
  const largeSchemas = {
    dilswer: Type.Record({
      foo: Type.String,
      arr: Type.Array(
        Type.Record({
          bar: Type.String,
          arr: Type.Array(
            Type.Record({
              baz: Type.String,
              arr: Type.Array(
                Type.Record({
                  quux: Type.String,
                  arr: Type.Array(
                    Type.Record({
                      corge: Type.String,
                      arr: Type.Array(
                        Type.Record({
                          grault: Type.String,
                          arr: Type.Array(
                            Type.Record({
                              fred: Type.String,
                            }),
                          ),
                        }),
                      ),
                    }),
                  ),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
    zod: zod.object({
      foo: zod.string(),
      arr: zod.array(
        zod.object({
          bar: zod.string(),
          arr: zod.array(
            zod.object({
              baz: zod.string(),
              arr: zod.array(
                zod.object({
                  quux: zod.string(),
                  arr: zod.array(
                    zod.object({
                      corge: zod.string(),
                      arr: zod.array(
                        zod.object({
                          grault: zod.string(),
                          arr: zod.array(
                            zod.object({
                              fred: zod.string(),
                            }),
                          ),
                        }),
                      ),
                    }),
                  ),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
    valibot: valibot.object({
      foo: valibot.string(),
      arr: valibot.array(
        valibot.object({
          bar: valibot.string(),
          arr: valibot.array(
            valibot.object({
              baz: valibot.string(),
              arr: valibot.array(
                valibot.object({
                  quux: valibot.string(),
                  arr: valibot.array(
                    valibot.object({
                      corge: valibot.string(),
                      arr: valibot.array(
                        valibot.object({
                          grault: valibot.string(),
                          arr: valibot.array(
                            valibot.object({
                              fred: valibot.string(),
                            }),
                          ),
                        }),
                      ),
                    }),
                  ),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
    arkttype: ark.type({
      foo: "string",
      arr: ark.list(
        ark.type({
          bar: "string",
          arr: ark.list(
            ark.type({
              baz: "string",
              arr: ark.list(
                ark.type({
                  quux: "string",
                  arr: ark.list(
                    ark.type({
                      corge: "string",
                      arr: ark.list(
                        ark.type({
                          grault: "string",
                          arr: ark.list(
                            ark.type({
                              fred: "string",
                            }),
                          ),
                        }),
                      ),
                    }),
                  ),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
  };

  await runSuiteForSample(
    "extreme_nested",
    "valid",
    getExtremelyNestedData,
    largeSchemas,
  );
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
