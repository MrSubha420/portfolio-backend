import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dbConnection from "./database/dbConnection.js";
import {errorMiddleware} from "./middlewares/error.js";
import messageRouter from "./router/messageRoutes.js";
import userRouter from "./router/userRoutes.js";
import timelineRouter from "./router/timelineRoutes.js";
import softwareApplicationRouter from "./router/softwareApplicationRoutes.js";
import skillRouter from "./router/skillRoutes.js";
import projectRouter from "./router/projectRoutes.js";
const app = express();

dotenv.config({path: "./config/config.env"})
console.log(process.env.PORT)

app.use(cors({
   origin: [process.env.PORTFOLIO_URL,process.env.DASHBOARD_URL],
   methods: ["GET","POST","DELETE","PUT"],
   credentials : true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(fileUpload({
   useTempFiles: true,
   tempFileDir: "/tmp/",
}));
app.use("/api/v1/message",messageRouter);
app.use("/api/v1/user",userRouter);
app.use("/api/v1/timeline",timelineRouter);
app.use("/api/v1/softwareapplication",softwareApplicationRouter);
app.use("/api/v1/skill",skillRouter);
app.use("/api/v1/projrct",projectRouter);
dbConnection();
app.use(errorMiddleware);

export default app;