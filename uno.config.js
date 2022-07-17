import { defineConfig } from "unocss";
import transformerDirective from "@unocss/transformer-directives";
import transformerCompileClass from "@unocss/transformer-compile-class";

export default defineConfig({
  transformers: [transformerDirective(), transformerCompileClass()],
});
