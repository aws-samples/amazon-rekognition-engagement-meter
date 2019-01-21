module.exports = {
  entry: ["./index.js"],
  target: "node",
  mode: "production",
  output: {
    path: `${process.cwd()}/dist/`,
    filename: "setup.js",
    libraryTarget: "commonjs2"
  },
  externals: {
    "aws-sdk": "aws-sdk"
  }
};
