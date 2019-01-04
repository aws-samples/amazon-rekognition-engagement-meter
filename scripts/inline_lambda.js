const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const templatePath = path.resolve("./dist/template.yaml");
const doc = yaml.safeLoad(fs.readFileSync(templatePath, "utf-8"));

const inlinedLambda = fs.readFileSync(
  path.resolve("./scripts/temp/setup.js"),
  "utf-8"
);

delete doc.Resources.LambdaSetup.Properties.CodeUri;
doc.Resources.LambdaSetup.Properties.InlineCode = inlinedLambda;

fs.writeFileSync(templatePath, yaml.safeDump(doc), "utf-8");