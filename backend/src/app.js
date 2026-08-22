import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { config } from "./config/index.js";

export function createApp() {
  const app = express();

  // credentials:true + an explicit origin (never "*") because the frontend
  // sends cookies via `fetch(url, { credentials: "include" })`.
  app.use(
    cors({
      origin: config.frontendOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser(config.sessionSecret));

  app.use("/api", router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
