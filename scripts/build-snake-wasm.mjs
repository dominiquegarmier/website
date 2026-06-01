import { mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "scripts/snake-web.c");
const output = resolve(root, "website/snake/snake-wasm.js");
const wasm = resolve(root, "website/snake/snake-wasm.wasm");

const emcc = spawnSync("emcc", ["--version"], { encoding: "utf8" });

if (emcc.error || emcc.status !== 0) {
  console.error(
    "emcc is required to build the Snake WebAssembly artifact. Install/activate Emscripten before running this script.",
  );
  process.exit(1);
}

await mkdir(dirname(output), { recursive: true });
await rm(output, { force: true });
await rm(wasm, { force: true });

const args = [
  source,
  "-Ofast",
  "-flto",
  "-msimd128",
  "-DNDEBUG",
  "-sMODULARIZE=1",
  "-sEXPORT_ES6=1",
  "-sENVIRONMENT=web",
  "-sALLOW_MEMORY_GROWTH=0",
  "-sINITIAL_MEMORY=33554432",
  '-sEXPORTED_FUNCTIONS=["_snake_web_init","_snake_web_reset","_snake_web_train","_snake_web_snapshot","_snake_web_iter","_snake_web_elapsed","_snake_web_envs","_snake_web_sample_s","_snake_web_score","_snake_web_best","_snake_web_peak_len","_snake_web_best_len","_snake_web_len_cov","_snake_web_visit_cov","_snake_web_p30_len","_snake_web_p30_visit","_snake_web_steps"]',
  '-sEXPORTED_RUNTIME_METHODS=["HEAPU8"]',
  "-o",
  output,
];

const build = spawnSync("emcc", args, {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit",
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}
