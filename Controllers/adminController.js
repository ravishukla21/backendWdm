import jwt from "jsonwebtoken";
import { User } from "../Models/User.js";
import { Counter } from "../Models/Counter.js";

// same ID generator logic used earlier
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

// ✅ Admin login (fixed env credentials)
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { role: "ADMIN", username },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || "1h" },
  );

  return res.json({
    message: "Admin login successful",
    token,
    expiresIn: "1h",
  });
};

// ✅ Admin update ANY user (by Mongo _id)
export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Allowed fields admin can change
    const allowed = [
      "applicantName",
      "dob",
      "gender",
      "fatherName",
      "maritalStatus",

      "mobileNumber",
      "email",

      "occupation",
      "departmentName",
      "officeAddress",

      "stateCode",
      "districtCode",
      "districtName",
      "blockName",
      "addressFull",

      "nomineeName",
      "nomineeRelation",
      "nomineeAge",
      "nomineeMobile",

      "familyMembers",
      "referralId",

      // payment link if you want admin to change manually
      "paymentReceiptUrl",
    ];

    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }

    if (updates.nomineeAge !== undefined)
      updates.nomineeAge = Number(updates.nomineeAge);

    if (typeof updates.familyMembers === "string") {
      try {
        updates.familyMembers = JSON.parse(updates.familyMembers);
      } catch {
        return res
          .status(400)
          .json({ message: "familyMembers must be valid JSON" });
      }
    }

    // Load user
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Detect location change (state/district)
    const stateChanged =
      updates.stateCode !== undefined && updates.stateCode !== user.stateCode;
    const districtChanged =
      updates.districtCode !== undefined &&
      updates.districtCode !== user.districtCode;

    const locationChanging = stateChanged || districtChanged;

    // Apply updates
    Object.assign(user, updates);

    // If location changed => new currentFamilyId + history
    if (locationChanging) {
      const newCurrentId = await generateCurrentId(
        user.stateCode,
        user.districtCode,
      );
      if (user.currentFamilyId) user.familyIdHistory.push(user.currentFamilyId);
      user.currentFamilyId = newCurrentId;
    }

    // Mark updated
    user.isProfileUpdated = true;
    user.profileUpdatedAt = new Date();
    user.profileUpdateCount = (user.profileUpdateCount || 0) + 1;

    await user.save();

    const safe = user.toObject();
    delete safe.passwordHash;

    return res.json({ message: "User updated by admin", user: safe });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate field", error: error.keyValue });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin delete user (soft delete recommended)
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Soft delete (recommended)
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    return res.json({ message: "User deleted (soft)", userId: id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// (Optional) HARD delete if you really want:
// await User.findByIdAndDelete(id);

// ✅ Get all users (list page)
// export const adminGetAllUsers = async (req, res) => {
//   try {
//     // optional filters
//     const {
//       districtCode,
//       stateCode,
//       isDeleted,
//       isProfileUpdated,
//       search, // search by name/aadhaar/mobile
//       page = 1,
//       limit = 20,
//     } = req.query;

//     const query = {};

//     if (stateCode) query.stateCode = String(stateCode).toUpperCase();
//     if (districtCode) query.districtCode = String(districtCode);
//     if (isDeleted !== undefined) query.isDeleted = isDeleted === "true";
//     if (isProfileUpdated !== undefined)
//       query.isProfileUpdated = isProfileUpdated === "true";

//     if (search) {
//       const s = String(search).trim();
//       query.$or = [
//         { applicantName: { $regex: s, $options: "i" } },
//         { aadhaarNumber: { $regex: s, $options: "i" } },
//         { mobileNumber: { $regex: s, $options: "i" } },
//         { familyId: { $regex: s, $options: "i" } },
//         { currentFamilyId: { $regex: s, $options: "i" } },
//       ];
//     }

//     const pageNum = Math.max(parseInt(page, 10) || 1, 1);
//     const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
//     const skip = (pageNum - 1) * limitNum;

//     const [users, total] = await Promise.all([
//       User.find(query)
//         .select("-passwordHash")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limitNum),
//       User.countDocuments(query),
//     ]);

//     return res.status(200).json({
//       message: "Users fetched",
//       total,
//       page: pageNum,
//       limit: limitNum,
//       users,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

export const adminGetAllUsers = async (req, res) => {
  try {
    const {
      districtCode,
      stateCode,
      isProfileUpdated,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    // 🔒 Hide deleted users ALWAYS
    const query = { isDeleted: false };

    if (stateCode) query.stateCode = String(stateCode).toUpperCase();
    if (districtCode) query.districtCode = String(districtCode);
    if (isProfileUpdated !== undefined)
      query.isProfileUpdated = isProfileUpdated === "true";

    if (search) {
      const s = String(search).trim();
      query.$or = [
        { applicantName: { $regex: s, $options: "i" } },
        { aadhaarNumber: { $regex: s, $options: "i" } },
        { mobileNumber: { $regex: s, $options: "i" } },
        { familyId: { $regex: s, $options: "i" } },
        { currentFamilyId: { $regex: s, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Users fetched",
      total,
      page: pageNum,
      limit: limitNum,
      users,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ✅ Get single user by Mongo ID (detail page)
// export const adminGetUserById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findById(id).select("-passwordHash");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     return res.status(200).json({
//       message: "User fetched",
//       user,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

export const adminGetUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      isDeleted: false, // 🔒 block deleted
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched",
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
