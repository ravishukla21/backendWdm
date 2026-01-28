import express from "express";
// import { adminAuth } from "../middlewares/adminAuth.js";
import { adminAuth } from "../Middlewares/adminAuth.js";
import {
  adminLogin,
  adminUpdateUser,
  adminDeleteUser,
  adminGetAllUsers,
  adminGetUserById, 
} from "../Controllers/adminController.js";

const router = express.Router();

// Public admin login
router.post("/login", adminLogin);

// Protected admin routes
router.put("/users/:id", adminAuth, adminUpdateUser);
router.delete("/users/:id", adminAuth, adminDeleteUser);

// ✅ List all users (admin)
router.get("/users", adminAuth, adminGetAllUsers);

// ✅ Single user details (admin)
router.get("/users/:id", adminAuth, adminGetUserById);

export default router;
