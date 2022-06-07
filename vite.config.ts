import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";
import * as path from "path";

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  plugins: [vue(), eslintPlugin()],
  build: {
    lib: {
      entry: resolvePath("lib/index.ts"),
      name: "lib",
      fileName: (format) => `lib.${format}.js`,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
