const path = require("path");
const build = require("@ncpa0cpl/nodepack").build;

build({
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
  },
});
