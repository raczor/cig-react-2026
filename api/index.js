// API de demostracion para Vercel: json-server como funcion serverless.
// Sirve los mismos endpoints que npm run api, bajo /api (VITE_API_URL=/api).
//
// LIMITE: el sistema de archivos de Vercel es de solo lectura, asi que los
// datos viven en MEMORIA. Lo que se cree o edite se pierde cuando la funcion
// se reinicia (o si Vercel levanta otra instancia). Para datos que persistan
// hace falta una base de datos real.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import jsonServer from "json-server";

// db.json se incluye en la funcion con includeFiles (vercel.json).
const db = JSON.parse(readFileSync(join(process.cwd(), "db.json"), "utf8"));

const app = jsonServer.create();
// router(objeto) usa un adaptador en memoria: nunca escribe en disco.
app.use("/api", jsonServer.defaults({ logger: false }), jsonServer.router(db));

export default app;
