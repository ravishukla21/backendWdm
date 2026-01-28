import express from "express";
import { getMe, loginUser, registerUser, resetPasswordWithKey, updateMe } from "../Controllers/userController.js";
import upload from "../Middlewares/upload.js";
import { auth } from "../Middlewares/auth.js";
const router = express.Router(); 

//user register
//@api desc:- user register
//@api method :- post
//@api endpoint /api/user/register

// router.post("/register", upload.single("paymentReceipt"), registerUser);

// router.post(
//   "/register",
//   upload.single("paymentReceipt"),
//   (req, res, next) => {
//     console.log("HEADERS:", req.headers["content-type"]);
//     console.log("BODY IN ROUTE:", req.body);
//     console.log("FILE IN ROUTE:", req.file);
//     next();
//   },
//   registerUser,
// );

router.post("/register", (req, res) => {
  upload.single("paymentReceipt")(req, res, (err) => {
    if (err) {
      console.log("MULTER ERROR:", err);
      return res.status(400).json({
        message: "Upload failed",
        error: err.message,
      });
    }
    return registerUser(req, res);
  });
});

// Login (aadhaar + password)
router.post("/login", loginUser);

// Protected routes (token required)
router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);

router.post("/reset-password", resetPasswordWithKey);

export default router;
