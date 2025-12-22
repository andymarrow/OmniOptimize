import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "OmniAnalytics",
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript({
      compilerOptions: {
        declaration: true,
        module: "esnext",
      },
    }),
    nodeResolve({
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"],
    }),
    commonjs(),
  ],
};
