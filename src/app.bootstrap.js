import express from "express";
import { connectDB } from "./DB/connection.db.js";
import { PORT } from "../config/config.service.js";
import { GlobalErrorException } from "./common/utils/response/error.response.js";
import { authRouter, userRouter } from "./modules/index.js";
import cors from "cors";

async function bootstrap() {
  await connectDB();

  const app = express();
  app.use(cors(), express.json());

  //routers
  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  //global error handling
  app.use(GlobalErrorException);
  app.listen(PORT, () => {
    console.log(`Server Is Running On PORT ${PORT}`);
  });
}

export default bootstrap;
