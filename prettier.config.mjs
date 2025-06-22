/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 100,
  trailingComma: "es5",
  tabWidth: 2,
  semi: true,
  endOfLine: "lf",

  overrides: [
    {
      files: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx", "src/**/*.json"],
    },
  ],
};

export default config;
