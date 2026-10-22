// Demo API for Vercel: json-server as a serverless function, served under /api
// (set VITE_API_URL=/api). Same endpoints as `npm run api`.
//
// LIMITATION: Vercel's filesystem is read-only, so data lives in MEMORY. Anything
// created or edited is lost when the function restarts (or another instance
// takes over). Persistent data needs a real database.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import jsonServer from "json-server";

// db.json is bundled into the function through includeFiles in vercel.json.
const db = JSON.parse(readFileSync(join(process.cwd(), "db.json"), "utf8"));

const app = jsonServer.create();
// router(object) uses an in-memory adapter: it never writes to disk.
app.use("/api", jsonServer.defaults({ logger: false }), jsonServer.router(db));

export default app;
