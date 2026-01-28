import bcrypt from "bcryptjs";
import { User } from "../Models/User.js";

import { Counter } from "../Models/Counter.js";
import jwt from "jsonwebtoken";

// export const registerUser = async (req, res) => {
//   try {
//     let {
//       applicantName,
//       aadhaarNumber,
//       dob,
//       gender,
//       fatherName,
//       maritalStatus,
//       spouses,

//       mobileNumber,
//       email,

//       occupation,
//       departmentName,
//       officeAddress,

//       stateCode,
//       districtCode,
//       districtName,
//       blockName,
//       addressFull,

//       nomineeName,
//       nomineeRelation,
//       nomineeAge,
//       nomineeMobile,

//       familyMembers,

//       transactionId,
//       referralId,

//       password,
//       confirmPassword,
//       declarationAccepted,
//     } = req.body;
//     // console.log("REQ.FILE =>", req.file);
//     // console.log("REQ.BODY =>", req.body);

//     // ✅ Fix types for form-data
//     declarationAccepted =
//       declarationAccepted === true || declarationAccepted === "true";

//     nomineeAge = nomineeAge ? Number(nomineeAge) : nomineeAge;

//     // familyMembers may come as JSON string in form-data
//     if (typeof familyMembers === "string") {
//       try {
//         familyMembers = JSON.parse(familyMembers);
//       } catch (e) {
//         return res
//           .status(400)
//           .json({ message: "familyMembers must be valid JSON" });
//       }
//     }

//     if (typeof spouses === "string") {
//       try {
//         spouses = JSON.parse(spouses);
//       } catch {
//         return res.status(400).json({ message: "spouses must be valid JSON" });
//       }
//     }

//     // ✅ basic validations
//     if (!applicantName || !aadhaarNumber || !dob || !gender || !fatherName) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }
//     if (!password || password !== confirmPassword) {
//       return res.status(400).json({ message: "Password not matching" });
//     }
//     if (!declarationAccepted) {
//       return res.status(400).json({ message: "Please accept declaration" });
//     }

//     // ✅ duplicates check
//     const existingAadhaar = await User.findOne({ aadhaarNumber });
//     if (existingAadhaar) {
//       return res.status(400).json({ message: "Aadhaar already registered" });
//     }

//     if (email) {
//       email = email.toLowerCase();
//       const existingEmail = await User.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "Email already exists" });
//       }
//     }

//     const existingTxn = await User.findOne({ transactionId });
//     if (existingTxn) {
//       return res.status(400).json({ message: "Transaction ID already used" });
//     }

//     // ✅ hash password
//     const passwordHash = await bcrypt.hash(password, 10);

//     // ✅ Cloudinary file URL
//     let paymentReceiptUrl = "PENDING_UPLOAD";

//     console.log("FILE:", req.file);
//     if (req.file) {
//       paymentReceiptUrl = req.file.path;
//     }

//     // ✅ create user
//     const user = await User.create({
//       applicantName,
//       aadhaarNumber,
//       dob, // (send YYYY-MM-DD, mongoose will store as Date)
//       gender,
//       fatherName,
//       maritalStatus,

//       mobileNumber,
//       email: email ? email : undefined,

//       occupation,
//       departmentName,
//       officeAddress,

//       stateCode,
//       districtCode,
//       districtName,
//       blockName,
//       addressFull,

//       nomineeName,
//       nomineeRelation,
//       nomineeAge,
//       nomineeMobile,

//       familyMembers: Array.isArray(familyMembers) ? familyMembers : [],

//       transactionId,
//       referralId,

//       paymentReceiptUrl, // ✅ only once
//       passwordHash,
//       declarationAccepted,
//     });

//     // return res.status(201).json({
//     //   message: "User registered",
//     //   familyId: user.familyId,
//     //   userId: user._id,
//     //   paymentReceiptUrl: user.paymentReceiptUrl,
//     // });

//     return res.status(201).json({
//       message: "User registered",
//       familyId: user.familyId,
//       currentFamilyId: user.currentFamilyId,
//       userId: user._id,
//       paymentReceiptUrl: user.paymentReceiptUrl,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         message: "Duplicate field",
//         error: error.keyValue,
//       });
//     }
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

export const registerUser = async (req, res) => {
  try {
    let {
      applicantName,
      aadhaarNumber,
      dob,
      gender,
      fatherName,
      maritalStatus,
      spouses,

      mobileNumber,
      email,

      occupation,
      departmentName,
      officeAddress,

      stateCode,
      districtCode,
      districtName,
      blockName,
      addressFull,

      nomineeName,
      nomineeRelation,
      nomineeAge,
      nomineeMobile,

      familyMembers,

      transactionId,
      referralId,

      password,
      confirmPassword,
      declarationAccepted,
    } = req.body;

    // ✅ Fix types for form-data
    declarationAccepted =
      declarationAccepted === true || declarationAccepted === "true";

    nomineeAge = nomineeAge ? Number(nomineeAge) : nomineeAge;

    // ✅ Parse JSON strings coming from form-data
    if (typeof familyMembers === "string") {
      try {
        familyMembers = JSON.parse(familyMembers);
      } catch {
        return res
          .status(400)
          .json({ message: "familyMembers must be valid JSON" });
      }
    }

    if (typeof spouses === "string") {
      try {
        spouses = JSON.parse(spouses);
      } catch {
        return res.status(400).json({ message: "spouses must be valid JSON" });
      }
    }

    // ✅ basic validations
    if (!applicantName || !aadhaarNumber || !dob || !gender || !fatherName) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    if (!password || password !== confirmPassword) {
      return res.status(400).json({ message: "Password not matching" });
    }
    if (!declarationAccepted) {
      return res.status(400).json({ message: "Please accept declaration" });
    }

    // ✅ marital status + spouses validations
    const status = String(maritalStatus || "").toUpperCase(); // "MARRIED" or "UNMARRIED"
    const isMarried = status === "MARRIED";

    let spousesClean = [];
    if (isMarried) {
      if (!Array.isArray(spouses) || spouses.length === 0) {
        return res.status(400).json({
          message: "spouses is required when maritalStatus is MARRIED",
        });
      }

      spousesClean = spouses.map((s, i) => {
        const lifeStatus = String(s?.lifeStatus || "").toUpperCase();

        if (!lifeStatus || !["ALIVE", "DEAD"].includes(lifeStatus)) {
          throw new Error(`spouses[${i}].lifeStatus must be ALIVE or DEAD`);
        }

        const alive = lifeStatus === "ALIVE";

        const name = s?.name ? String(s.name).trim() : "";
        const spouseAadhaar = s?.aadhaarNumber
          ? String(s.aadhaarNumber).trim()
          : "";
        const spouseDobStr = s?.dob ? String(s.dob).trim() : "";

        if (alive) {
          if (!name || !spouseAadhaar || !spouseDobStr) {
            throw new Error(
              `spouses[${i}] name, aadhaarNumber and dob are required when spouse is ALIVE`,
            );
          }
        }

        let spouseDobDate;
        if (spouseDobStr) {
          spouseDobDate = new Date(spouseDobStr);
          if (isNaN(spouseDobDate.getTime())) {
            throw new Error(`spouses[${i}].dob must be YYYY-MM-DD`);
          }
        }

        return {
          lifeStatus,
          name: name || undefined,
          aadhaarNumber: spouseAadhaar || undefined,
          dob: spouseDobDate || undefined,
        };
      });
    } else {
      // if unmarried, ignore spouses if sent
      spousesClean = [];
    }

    // ✅ duplicates check
    const existingAadhaar = await User.findOne({ aadhaarNumber });
    if (existingAadhaar) {
      return res.status(400).json({ message: "Aadhaar already registered" });
    }

    if (email) {
      email = email.toLowerCase();
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const existingTxn = await User.findOne({ transactionId });
    if (existingTxn) {
      return res.status(400).json({ message: "Transaction ID already used" });
    }

    // ✅ hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Cloudinary file URL
    let paymentReceiptUrl = "PENDING_UPLOAD";
    if (req.file) {
      paymentReceiptUrl = req.file.path;
    }

    // ✅ create user
    const user = await User.create({
      applicantName,
      aadhaarNumber,
      dob, // send YYYY-MM-DD
      gender,
      fatherName,
      maritalStatus: status,

      spouses: spousesClean,

      mobileNumber,
      email: email ? email : undefined,

      occupation,
      departmentName,
      officeAddress,

      stateCode,
      districtCode,
      districtName,
      blockName,
      addressFull,

      nomineeName,
      nomineeRelation,
      nomineeAge,
      nomineeMobile,

      familyMembers: Array.isArray(familyMembers) ? familyMembers : [],

      transactionId,
      referralId,

      paymentReceiptUrl,
      passwordHash,
      declarationAccepted,
    });

    return res.status(201).json({
      message: "User registered",
      familyId: user.familyId,
      currentFamilyId: user.currentFamilyId,
      userId: user._id,
      paymentReceiptUrl: user.paymentReceiptUrl,
    });
  } catch (error) {
    // handle duplicate key
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate field",
        error: error.keyValue,
      });
    }

    // handle our custom spouse validation errors
    if (
      typeof error.message === "string" &&
      error.message.startsWith("spouses[")
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { aadhaarNumber, password } = req.body;

    // ✅ validations
    if (!aadhaarNumber || !password) {
      return res.status(400).json({
        message: "Aadhaar number and password are required",
      });
    }

    // ✅ find user by aadhaar
    const user = await User.findOne({ aadhaarNumber });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Aadhaar or password",
      });
    }

    // ✅ block deleted users
    if (user.isDeleted) {
      return res.status(403).json({ message: "User account is deleted" });
    }

    // ✅ compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Aadhaar or password",
      });
    }

    // ✅ generate JWT (1 hour expiry)
    const token = jwt.sign(
      {
        userId: user._id,
        aadhaarNumber: user.aadhaarNumber,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      expiresIn: "1h",
      user: {
        id: user._id,
        familyId: user.familyId,
        applicantName: user.applicantName,
        aadhaarNumber: user.aadhaarNumber,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-passwordHash"); // hide password hash
    if (user.isDeleted) {
      return res.status(403).json({ message: "User account is deleted" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User details",
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//update

// export const updateMe = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     // ✅ Only allow updating these fields
//     const allowedFields = [
//       "mobileNumber",
//       "email",
//       "occupation",
//       "departmentName",
//       "officeAddress",
//       "blockName",
//       "addressFull",
//       "nomineeName",
//       "nomineeRelation",
//       "nomineeAge",
//       "nomineeMobile",
//       "familyMembers",
//       "referralId",
//     ];

//     const updates = {};
//     for (const key of allowedFields) {
//       if (req.body[key] !== undefined) updates[key] = req.body[key];
//     }

//     // Convert types if needed
//     if (updates.nomineeAge !== undefined)
//       updates.nomineeAge = Number(updates.nomineeAge);

//     // familyMembers can come as string JSON sometimes
//     if (typeof updates.familyMembers === "string") {
//       try {
//         updates.familyMembers = JSON.parse(updates.familyMembers);
//       } catch {
//         return res
//           .status(400)
//           .json({ message: "familyMembers must be valid JSON" });
//       }
//     }

//     // ✅ NEVER allow these updates
//     delete updates.passwordHash;
//     delete updates.aadhaarNumber;
//     delete updates.familyId;

//     const user = await User.findByIdAndUpdate(userId, updates, {
//       new: true,
//       runValidators: true,
//       select: "-passwordHash",
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json({
//       message: "Profile updated",
//       user,
//     });
//   } catch (error) {
//     // Handle unique email duplicate, etc.
//     if (error.code === 11000) {
//       return res.status(400).json({
//         message: "Duplicate field",
//         error: error.keyValue,
//       });
//     }
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// helper to generate currentFamilyId
// async function generateCurrentId(stateCode, districtCode) {
//   const year2 = String(new Date().getFullYear()).slice(-2);
//   const s = String(stateCode).toUpperCase();
//   const d = String(districtCode).padStart(2, "0");

//   const counterKey = `${s}-${d}-${year2}`;

//   const counter = await Counter.findOneAndUpdate(
//     { key: counterKey },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true },
//   );

//   const running = String(counter.seq).padStart(4, "0");
//   return `${s}${d}${year2}${running}`;
// }

// export const updateMe = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     // ✅ Allowed update fields (including state/district/block)
//     const allowedFields = [
//       "mobileNumber",
//       "email",
//       "occupation",
//       "departmentName",
//       "officeAddress",

//       "stateCode",
//       "districtCode",
//       "districtName",
//       "blockName",
//       "addressFull",

//       "nomineeName",
//       "nomineeRelation",
//       "nomineeAge",
//       "nomineeMobile",

//       "familyMembers",
//       "referralId",
//     ];

//     const updates = {};
//     for (const key of allowedFields) {
//       if (req.body[key] !== undefined) updates[key] = req.body[key];
//     }

//     // type conversions
//     if (updates.nomineeAge !== undefined)
//       updates.nomineeAge = Number(updates.nomineeAge);

//     if (typeof updates.familyMembers === "string") {
//       try {
//         updates.familyMembers = JSON.parse(updates.familyMembers);
//       } catch {
//         return res
//           .status(400)
//           .json({ message: "familyMembers must be valid JSON" });
//       }
//     }

//     // Load user (so we can compare & run save)
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.isDeleted) {
//       return res.status(403).json({ message: "User account is deleted" });
//     }

//     // Detect what changed
//     const changedFields = [];
//     for (const key of Object.keys(updates)) {
//       const oldVal = user[key];
//       const newVal = updates[key];

//       // basic compare (good enough for your fields)
//       if (String(oldVal) !== String(newVal)) changedFields.push(key);
//     }

//     // Location change affects currentFamilyId (ONLY state/district)
//     const stateChanged =
//       updates.stateCode !== undefined && updates.stateCode !== user.stateCode;
//     const districtChanged =
//       updates.districtCode !== undefined &&
//       updates.districtCode !== user.districtCode;

//     const locationChanging = stateChanged || districtChanged;

//     // Apply updates
//     Object.assign(user, updates);

//     // If state/district changed -> new currentFamilyId, store history
//     if (locationChanging) {
//       const newCurrentId = await generateCurrentId(
//         user.stateCode,
//         user.districtCode,
//       );

//       if (user.currentFamilyId) user.familyIdHistory.push(user.currentFamilyId);
//       user.currentFamilyId = newCurrentId;
//     }

//     // Mark profile updated if anything changed
//     if (changedFields.length > 0) {
//       user.isProfileUpdated = true;
//       user.profileUpdatedAt = new Date();
//       user.profileUpdateCount = (user.profileUpdateCount || 0) + 1;
//     }

//     await user.save();

//     const safeUser = user.toObject();
//     delete safeUser.passwordHash;

//     return res.status(200).json({
//       message: "Profile updated",
//       changedFields,
//       user: safeUser,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         message: "Duplicate field",
//         error: error.keyValue,
//       });
//     }
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// updtate password

// export const resetPasswordWithKey = async (req, res) => {
//   try {
//     // ✅ simple protection
//     const adminKey = req.headers["x-admin-reset-key"];
//     if (!adminKey || adminKey !== process.env.ADMIN_RESET_KEY) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const { aadhaarNumber, applicantName, newPassword, confirmPassword } =
//       req.body;

//     if (!aadhaarNumber || !applicantName || !newPassword || !confirmPassword) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // ✅ verify user by aadhaar + name
//     const user = await User.findOne({
//       aadhaarNumber,
//       applicantName: applicantName.trim(),
//     });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found / details mismatch" });
//     }

//     // ✅ update password
//     user.passwordHash = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     return res.status(200).json({
//       message: "Password reset successful",
//       familyId: user.familyId,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

async function generateCurrentId(stateCode, districtCode) {
  const year2 = String(new Date().getFullYear()).slice(-2);
  const s = String(stateCode).toUpperCase();
  const d = String(districtCode).padStart(2, "0");

  const counterKey = `${s}-${d}-${year2}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const running = String(counter.seq).padStart(4, "0");
  return `${s}${d}${year2}${running}`;
}

// export const updateMe = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.isDeleted) {
//       return res.status(403).json({ message: "User account is deleted" });
//     }

//     // ✅ Allow more fields (based on your form screenshot)
//     const allowedFields = [
//       // Applicant
//       "applicantName",
//       "dob",
//       "gender",
//       "fatherName",
//       "maritalStatus",

//       // Contact
//       "mobileNumber",
//       "email",

//       // Occupation
//       "occupation",
//       "departmentName",
//       "officeAddress",

//       // Address / location
//       "stateCode",
//       "districtCode",
//       "districtName",
//       "blockName",
//       "addressFull",

//       // Nominee
//       "nomineeName",
//       "nomineeRelation",
//       "nomineeAge",
//       "nomineeMobile",

//       // Family members list
//       "familyMembers",

//       // Referral
//       "referralId",
//     ];

//     const updates = {};
//     for (const key of allowedFields) {
//       if (req.body[key] !== undefined) updates[key] = req.body[key];
//     }

//     // 🚫 Never allow these from user update
//     delete updates.aadhaarNumber;
//     delete updates.familyId;
//     delete updates.currentFamilyId;
//     delete updates.passwordHash;
//     delete updates.transactionId;
//     delete updates.paymentReceiptUrl;

//     // type fixes
//     if (updates.nomineeAge !== undefined)
//       updates.nomineeAge = Number(updates.nomineeAge);

//     // dob might come as "YYYY-MM-DD"
//     if (updates.dob !== undefined) {
//       const d = new Date(updates.dob);
//       if (isNaN(d.getTime())) {
//         return res
//           .status(400)
//           .json({ message: "Invalid dob format (use YYYY-MM-DD)" });
//       }
//       updates.dob = d;
//     }

//     // familyMembers can come as JSON string
//     if (typeof updates.familyMembers === "string") {
//       try {
//         updates.familyMembers = JSON.parse(updates.familyMembers);
//       } catch {
//         return res
//           .status(400)
//           .json({ message: "familyMembers must be valid JSON" });
//       }
//     }

//     // detect changes
//     const changedFields = [];
//     for (const k of Object.keys(updates)) {
//       if (String(user[k]) !== String(updates[k])) changedFields.push(k);
//     }

//     const stateChanged =
//       updates.stateCode !== undefined && updates.stateCode !== user.stateCode;
//     const districtChanged =
//       updates.districtCode !== undefined &&
//       updates.districtCode !== user.districtCode;

//     const locationChanging = stateChanged || districtChanged;

//     // apply updates
//     Object.assign(user, updates);

//     // if state/district changed => new currentFamilyId + history
//     if (locationChanging) {
//       const newCurrentId = await generateCurrentId(
//         user.stateCode,
//         user.districtCode,
//       );
//       if (user.currentFamilyId) user.familyIdHistory.push(user.currentFamilyId);
//       user.currentFamilyId = newCurrentId;
//     }

//     // mark profile updated if anything changed
//     if (changedFields.length > 0) {
//       user.isProfileUpdated = true;
//       user.profileUpdatedAt = new Date();
//       user.profileUpdateCount = (user.profileUpdateCount || 0) + 1;
//     }

//     await user.save();

//     const safe = user.toObject();
//     delete safe.passwordHash;

//     return res.status(200).json({
//       message: "Profile updated",
//       changedFields,
//       user: safe,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res
//         .status(400)
//         .json({ message: "Duplicate field", error: error.keyValue });
//     }
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isDeleted) {
      return res.status(403).json({ message: "User account is deleted" });
    }

    const allowedFields = [
      // Applicant
      "applicantName",
      "dob",
      "gender",
      "fatherName",
      "maritalStatus",
      "spouses", // ✅ added

      // Contact
      "mobileNumber",
      "email",

      // Occupation
      "occupation",
      "departmentName",
      "officeAddress",

      // Address / location
      "stateCode",
      "districtCode",
      "districtName",
      "blockName",
      "addressFull",

      // Nominee
      "nomineeName",
      "nomineeRelation",
      "nomineeAge",
      "nomineeMobile",

      // Family members list
      "familyMembers",

      // Referral
      "referralId",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // 🚫 Never allow these from user update
    delete updates.aadhaarNumber;
    delete updates.familyId;
    delete updates.currentFamilyId;
    delete updates.passwordHash;
    delete updates.transactionId;
    delete updates.paymentReceiptUrl;

    // type fixes
    if (updates.nomineeAge !== undefined)
      updates.nomineeAge = Number(updates.nomineeAge);

    // dob might come as "YYYY-MM-DD"
    if (updates.dob !== undefined) {
      const d = new Date(updates.dob);
      if (isNaN(d.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid dob format (use YYYY-MM-DD)" });
      }
      updates.dob = d;
    }

    // familyMembers can come as JSON string
    if (typeof updates.familyMembers === "string") {
      try {
        updates.familyMembers = JSON.parse(updates.familyMembers);
      } catch {
        return res
          .status(400)
          .json({ message: "familyMembers must be valid JSON" });
      }
    }

    // ✅ spouses can come as JSON string
    if (typeof updates.spouses === "string") {
      try {
        updates.spouses = JSON.parse(updates.spouses);
      } catch {
        return res.status(400).json({ message: "spouses must be valid JSON" });
      }
    }

    // ✅ spouse validation logic
    // maritalStatus might be updated, so determine "final" maritalStatus after updates
    const finalMaritalStatus = String(
      updates.maritalStatus !== undefined
        ? updates.maritalStatus
        : user.maritalStatus,
    ).toUpperCase();

    const isMarried = finalMaritalStatus === "MARRIED";

    // if user sends spouses OR maritalStatus married => validate & clean spouses
    if (updates.spouses !== undefined || updates.maritalStatus !== undefined) {
      let incomingSpouses = updates.spouses;

      // if not provided in request, use existing for validation
      if (incomingSpouses === undefined) incomingSpouses = user.spouses;

      if (isMarried) {
        if (!Array.isArray(incomingSpouses) || incomingSpouses.length === 0) {
          return res.status(400).json({
            message: "spouses is required when maritalStatus is MARRIED",
          });
        }

        const cleaned = incomingSpouses.map((s, i) => {
          const lifeStatus = String(s?.lifeStatus || "").toUpperCase();
          if (!["ALIVE", "DEAD"].includes(lifeStatus)) {
            throw new Error(`spouses[${i}].lifeStatus must be ALIVE or DEAD`);
          }

          const alive = lifeStatus === "ALIVE";

          const name = s?.name ? String(s.name).trim() : "";
          const spouseAadhaar = s?.aadhaarNumber
            ? String(s.aadhaarNumber).trim()
            : "";
          const dobStr = s?.dob ? String(s.dob).trim() : "";

          if (alive) {
            if (!name || !spouseAadhaar || !dobStr) {
              throw new Error(
                `spouses[${i}] name, aadhaarNumber and dob are required when spouse is ALIVE`,
              );
            }
          }

          let dobDate;
          if (dobStr) {
            dobDate = new Date(dobStr);
            if (isNaN(dobDate.getTime())) {
              throw new Error(`spouses[${i}].dob must be YYYY-MM-DD`);
            }
          }

          return {
            lifeStatus,
            name: name || undefined,
            aadhaarNumber: spouseAadhaar || undefined,
            dob: dobDate || undefined,
          };
        });

        updates.spouses = cleaned;
        updates.maritalStatus = finalMaritalStatus;
      } else {
        // if unmarried => clear spouses (or you can keep but generally should clear)
        updates.spouses = [];
        updates.maritalStatus = finalMaritalStatus;
      }
    }

    // detect changes (basic)
    const changedFields = [];
    for (const k of Object.keys(updates)) {
      if (String(user[k]) !== String(updates[k])) changedFields.push(k);
    }

    const stateChanged =
      updates.stateCode !== undefined && updates.stateCode !== user.stateCode;
    const districtChanged =
      updates.districtCode !== undefined &&
      updates.districtCode !== user.districtCode;

    const locationChanging = stateChanged || districtChanged;

    // apply updates
    Object.assign(user, updates);

    // if state/district changed => new currentFamilyId + history
    if (locationChanging) {
      const newCurrentId = await generateCurrentId(
        user.stateCode,
        user.districtCode,
      );
      if (user.currentFamilyId) user.familyIdHistory.push(user.currentFamilyId);
      user.currentFamilyId = newCurrentId;
    }

    // mark profile updated if anything changed
    if (changedFields.length > 0) {
      user.isProfileUpdated = true;
      user.profileUpdatedAt = new Date();
      user.profileUpdateCount = (user.profileUpdateCount || 0) + 1;
    }

    await user.save();

    const safe = user.toObject();
    delete safe.passwordHash;

    return res.status(200).json({
      message: "Profile updated",
      changedFields,
      user: safe,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate field", error: error.keyValue });
    }

    // spouse validation errors
    if (
      typeof error.message === "string" &&
      error.message.startsWith("spouses[")
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const resetPasswordWithKey = async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-reset-key"];
    if (!adminKey || adminKey !== process.env.ADMIN_RESET_KEY) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { aadhaarNumber, applicantName, newPassword, confirmPassword } =
      req.body;

    if (!aadhaarNumber || !applicantName || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      aadhaarNumber,
      applicantName: { $regex: `^${applicantName.trim()}$`, $options: "i" },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found / details mismatch" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
      familyId: user.familyId,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
