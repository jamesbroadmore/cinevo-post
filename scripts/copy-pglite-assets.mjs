import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "node_modules/@electric-sql/pglite/dist");
const dest = join(process.cwd(), ".vercel/output/functions/__server.func/_libs");

if (!existsSync(dest)) {
  console.log("[pglite] server bundle is not built yet");
  process.exit(0);
}

for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  copyFileSync(join(src, name), join(dest, name));
}

console.log("[pglite] runtime assets copied into the server bundle");
