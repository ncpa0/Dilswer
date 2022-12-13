const path = require("path");
const build = require("@ncpa0cpl/nodepack").build;

async function main() {
  try {
    await build({
      target: "es6",
      srcDir: path.resolve(__dirname, "../src"),
      outDir: path.resolve(__dirname, "../dist"),
      formats: ["cjs", "esm", "legacy"],
      tsConfig: path.resolve(__dirname, "../tsconfig.build.json"),
      declarations: true,
      pathAliases: {
        "@DataTypes/*": "./data-types/*",
        "@Utilities/*": "./utilities/*",
        "@Validation/*": "./validation-algorithms/*",
        "@Intrinsic/*": "./intrinsic-type-utils/*",
        "@JSONSchemaParser/*": "./json-schema-parser/*",
        "@TsTypeGenerator/*": "./ts-type-generator/*",
      },
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
