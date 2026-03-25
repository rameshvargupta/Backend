import express from "express";
const router = express.Router();
import { addAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from "../controllers/addressController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

router.get("/address", authMiddleware, getAddresses);
router.post("/address", authMiddleware, addAddress);
router.put("/address/:id", authMiddleware, updateAddress);
router.delete("/address/:id", authMiddleware, deleteAddress);
router.put("/address/default/:Id", authMiddleware, setDefaultAddress);
export default router;
