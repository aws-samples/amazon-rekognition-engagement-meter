module.exports = {
  entry: ["./src/functions/setup/index.js"],
  target: "node",
  mode: "production",
  output: {
    path: `${process.cwd()}/scripts/temp/`,
    filename: "setup.js",
    libraryTarget: "commonjs2"
  },
  externals: {
    "aws-sdk": "aws-sdk"
  }
};
