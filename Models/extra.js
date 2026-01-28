import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const familyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    age: { type: Number, required: true },
  },
  { _id: false } 
);

const userSchema = new mongoose.Schema(
  {
    // Permanent ID (never changes)
    familyId: { type: String, unique: true, index: true },

    // Current ID (can change if state/district changes)
    currentFamilyId: { type: String, unique: true, sparse: true, index: true },

    // Track old current IDs
    familyIdHistory: { type: [String], default: [] },

    // Track profile updates
    isProfileUpdated: { type: Boolean, default: false },
    profileUpdatedAt: { type: Date },
    profileUpdateCount: { type: Number, default: 0 },

    // Applicant Details
    applicantName: { type: String, required: true, trim: true },
    aadhaarNumber: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    fatherName: { type: String, required: true },
    maritalStatus: { type: String, required: true },

    // Contact
    mobileNumber: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },

    // Occupation
    occupation: { type: String, required: true },
    departmentName: { type: String },
    officeAddress: { type: String },

    // Address (these can change)
    stateCode: { type: String, required: true }, // UP
    districtCode: { type: String, required: true }, // 57
    districtName: { type: String, required: true },
    blockName: { type: String, required: true },
    addressFull: { type: String, required: true },

    // Nominee
    nomineeName: { type: String, required: true },
    nomineeRelation: { type: String, required: true },
    nomineeAge: { type: Number, required: true },
    nomineeMobile: { type: String, required: true },

    // Family Members
    familyMembers: { type: [familyMemberSchema], default: [] },

    // Payment
    transactionId: { type: String, required: true, unique: true },
    paymentReceiptUrl: { type: String, default: "PENDING_UPLOAD" },
    referralId: { type: String },

    // Auth
    passwordHash: { type: String, required: true },
    declarationAccepted: { type: Boolean, required: true },

    // Optional: soft delete for admin
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// helper function to generate id based on state/district/year
async function generateId(stateCode, districtCode, year2) {
  const s = String(stateCode).toUpperCase();
  const d = String(districtCode).padStart(2, "0");
  const counterKey = `${s}-${d}-${year2}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const running = String(counter.seq).padStart(4, "0");
  return `${s}${d}${year2}${running}`;
}

// ✅ Generate familyId once at registration
userSchema.pre("save", async function () {
  if (this.familyId) return;

  const year2 = String(new Date().getFullYear()).slice(-2);

  // permanent familyId
  this.familyId = await generateId(this.stateCode, this.districtCode, year2);

  // currentFamilyId first time same as familyId
  if (!this.currentFamilyId) this.currentFamilyId = this.familyId;
});

export const User = mongoose.model("User", userSchema);
