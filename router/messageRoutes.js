import express from "express";
import {getAllMessages,sendMessage,deleteMessage } from "../controller/messageController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send", sendMessage);
router.delete("/delete/:id",isAuthenticated,deleteMessage);
router.get("/getall",getAllMessages);

export default router;