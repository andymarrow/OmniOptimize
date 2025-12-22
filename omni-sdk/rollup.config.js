import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createConfig = (pkgName) => ({
  input: path.join(__dirname, `packages/${pkgName}/src/index.ts`),
  output: [
    {
      file: path.join(__dirname, `packages/${pkgName}/dist/index.cjs.js`),
      format: "cjs",
      sourcemap: true,
    },
    {
      file: path.join(__dirname, `packages/${pkgName}/dist/index.esm.js`),
      format: "esm",
      sourcemap: true,
    },
    // UMD format is primarily for the core SDK for direct <script> use
    ...(pkgName === "sdk"
      ? [
          {
            file: path.join(__dirname, `packages/${pkgName}/dist/index.umd.js`),
            format: "umd",
            name: "OmniAnalytics", // Global variable name
            sourcemap: true,
            plugins: [terser()], // Minify UMD output
          },
        ]
      : []),
  ],
  plugins: [
    typescript({
      tsconfig: path.join(__dirname, `packages/${pkgName}/tsconfig.json`),
      compilerOptions: {
        declaration: true,
        module: "esnext",
      },
      exclude: ["node_modules/**"],
      sourceMap: true,
    }),
    nodeResolve({
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"],
    }),
    commonjs(),
  ],
  // For react package, externalize react/react-dom and SDK
  external:
    pkgName === "react" ? ["react", "react-dom", "@omni-analytics/sdk", "@omni-analytics/react"] : [],
});

// Build configurations for both packages
import { env } from "process";

// Determine which packages to build based on working directory or environment
const packagesToBuild = env.ONLY_PACKAGE
  ? [env.ONLY_PACKAGE]
  : ["sdk", "react"];

export default packagesToBuild.map((pkg) => createConfig(pkg));
