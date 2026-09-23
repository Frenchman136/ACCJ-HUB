import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/db.js";
import mediaRoutes from "./routes/media.js";
import categoryRoutes from "./routes/categories.js";
import commentRoutes from "./routes/comments.js";
import userRoutes from "./routes/users.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();
const allowedOrigins = (
  process.env.CLIENT_URL || "https://accj-hub.vercel.app,http://localhost:5173"
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return (
    /^https:\/\/.*\.vercel\.app$/.test(origin) ||
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
  );
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-clerk-auth"],
  }),
);
app.options(
  "*",
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(clerkMiddleware()); // attaches req.auth

app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "sound-groove" }),
);

app.use("/api/media", mediaRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", commentRoutes); // /api/media/:id/comments + /api/comments/:id
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Sound Groove API running on port ${PORT}`),
  );
});
