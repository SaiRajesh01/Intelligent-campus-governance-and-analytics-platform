/**
 * Seed script — creates initial departments if they don't exist.
 *
 * Usage:
 *   node scripts/seedDepartments.js
 *
 * Safe to run multiple times — skips departments that already exist.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Department = require("../models/Department");
const connectDB = require("../config/db");

const DEPARTMENTS = [
  { name: "Infrastructure" },
  { name: "Academic" },
  { name: "Hostel" },
  { name: "IT/Network" },
  { name: "Administrative" },
  { name: "Student Affairs" },
];

async function seed() {
  await connectDB();

  for (const dept of DEPARTMENTS) {
    const exists = await Department.findOne({ name: dept.name });
    if (exists) {
      console.log(`  ✓ "${dept.name}" already exists`);
    } else {
      await Department.create(dept);
      console.log(`  + Created "${dept.name}"`);
    }
  }

  console.log("\nDone! Departments seeded.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
