import express from "express";
import cors from "cors";
import routes from "./routes/index.ts";

const app = express();

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/", routes);

export default app;
