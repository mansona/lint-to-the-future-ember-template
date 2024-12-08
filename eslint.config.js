import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: { globals: globals.node }
  },
  pluginJs.configs.recommended,
  {
    languageOptions: {

      globals: globals.mocha,
    },
    files: ['test/*.js']
  }
];
