import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/error";
import { env } from "./config/env";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (req, res) => {
  res.json({ ok: true, name: "Fadel API", version: "0.1.0" });
});

app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
