import express from "express";
import candidateRoutes from "./routes/candidateRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/candidates", candidateRoutes);
app.use("/jobs", jobRoutes);
app.use("/recommendations", recommendationRoutes);

export default app;
