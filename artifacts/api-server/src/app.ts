import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import router from "./routes";
import { logger } from "./lib/logger";

const PgSession = ConnectPgSimple(session);

const app: Express = express();

// Skip pinoHttp for now - direct logging use karo
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url?.split("?")[0],
  });
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET ?? "fallback-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

app.use("/api", router);

export default app;
