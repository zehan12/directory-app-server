import express, { Application, Request, Response } from "express";
import appRouter from "./routes/app.route";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", appRouter);

app.get("/", (req: Request, res: Response) => {
  res.end("server is running");
});

// handle unknown routes
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    type: "error",
    message: "API endpoint does not exist!",
  });
});

export default app;