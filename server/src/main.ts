import { loadConfig } from "./config.js";
import { createApplication } from "./createApplication.js";

// Local development server: npm run api.
const port = Number(process.env.PORT ?? 3001);
const app = await createApplication(loadConfig(), { logger: { level: "info" } });

await app.listen({ port, host: "127.0.0.1" });
