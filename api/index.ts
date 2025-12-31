import express from "express";
import serverless from "serverless-http";

const app = express();

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from TypeScript backend!" });
});

export default serverless(app);
