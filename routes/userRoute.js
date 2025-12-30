import express from "express";

import { register, verifyUserEmail,reVerifyEmail } from "../constrollers/userConstroller.js";

const router = express.Router();

router.post("/register", register);

// ✅ FIXED ROUTE
router.get("/verify/:token", verifyUserEmail);
router.post("/reverify", reVerifyEmail);

export default router;
