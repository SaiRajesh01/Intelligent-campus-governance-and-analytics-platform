/**
 * Seed script — populates realistic sample complaints for analytics & charts visualization.
 *
 * Usage:
 *   node scripts/seedComplaints.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const User = require("../models/User");
const connectDB = require("../config/db");

const CATEGORIES = ["Infrastructure", "Academic", "Hostel", "IT/Network", "Harassment", "Administrative", "Other"];
const URGENCIES = ["low", "medium", "high", "critical"];
const STATUSES = ["open", "in-progress", "escalated", "resolved", "closed"];

const MOCK_TITLES = [
  { title: "Power supply disruption in EEE Power Electronics Lab", category: "Academic", dept: "EEE", urgency: "high" },
  { title: "CNC Machine calibration issue in Mechanical Workshop", category: "Academic", dept: "Mechanical", urgency: "medium" },
  { title: "Structural testing equipment error in Civil Hydraulics Lab", category: "Academic", dept: "Civil", urgency: "high" },
  { title: "Compiler server down in CSE Cloud Computing Lab", category: "IT/Network", dept: "CSE", urgency: "critical" },
  { title: "Oscilloscopes unavailable in ECE VLSI Lab", category: "Academic", dept: "ECE", urgency: "medium" },
  { title: "Smart TV screen mirroring issue in MBA Case Study Room", category: "Academic", dept: "MBA", urgency: "low" },
  { title: "Database server connection failure in MCA Lab", category: "IT/Network", dept: "MCA", urgency: "high" },
  { title: "Research software license renewal needed for M.Tech lab", category: "Academic", dept: "M.Tech", urgency: "medium" },
  { title: "Wi-Fi disconnected in Central Library", category: "IT/Network", dept: "IT/Network", urgency: "high" },
  { title: "Water leakage in Hostel Block B Restroom", category: "Hostel", dept: "Hostel", urgency: "critical" },
  { title: "Broken chairs in Seminar Room 1", category: "Infrastructure", dept: "Infrastructure", urgency: "low" },
  { title: "Delay in ID card issuance", category: "Administrative", dept: "Administrative", urgency: "medium" },
  { title: "Noise disturbance during quiet hours", category: "Student Affairs", dept: "Student Affairs", urgency: "low" }
];

async function seed() {
  await connectDB();

  console.log("Seeding sample complaints...");

  // Get departments
  const departments = await Department.find();
  if (departments.length === 0) {
    console.error("No departments found. Please run seedDepartments.js first.");
    process.exit(1);
  }

  const deptMap = {};
  departments.forEach((d) => {
    deptMap[d.name] = d._id;
  });

  // Get or create a dummy student user for submittedBy
  let student = await User.findOne({ role: "student" });
  if (!student) {
    student = await User.create({
      name: "Demo Student",
      email: "demostudent@campus.edu",
      password: "password123",
      role: "student"
    });
  }

  // Generate 35 sample complaints spread across past 3 months
  const now = new Date();
  const complaintsToCreate = [];

  for (let i = 0; i < 35; i++) {
    const item = MOCK_TITLES[i % MOCK_TITLES.length];
    const deptId = deptMap[item.dept] || departments[i % departments.length]._id;
    
    // Days ago (spread past 90 days)
    const daysAgo = Math.floor(Math.random() * 85);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const status = STATUSES[i % STATUSES.length];
    let resolvedAt = null;
    if (status === "resolved" || status === "closed") {
      // Resolved 1-3 days after creation
      const resolveDelayDays = Math.floor(Math.random() * 3) + 1;
      resolvedAt = new Date(createdAt.getTime() + resolveDelayDays * 24 * 60 * 60 * 1000);
    }

    // SLA deadline: 48 hours after creation
    const slaDeadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);

    complaintsToCreate.push({
      title: `${item.title} #${i + 1}`,
      description: `Detailed description of issue: ${item.title}. Requires attention from the ${item.dept} department staff.`,
      category: item.category,
      urgency: item.urgency,
      department: deptId,
      status: status,
      isAnonymous: i % 4 === 0,
      submittedBy: student._id,
      createdAt: createdAt,
      updatedAt: resolvedAt || createdAt,
      resolvedAt: resolvedAt,
      slaDeadline: slaDeadline,
      escalationLevel: status === "escalated" ? 1 : 0
    });
  }

  const created = await Complaint.insertMany(complaintsToCreate);
  console.log(`✓ Successfully created ${created.length} sample complaints!`);

  // Update department complaint & resolved counts
  for (const dept of departments) {
    const total = await Complaint.countDocuments({ department: dept._id });
    const resolved = await Complaint.countDocuments({ department: dept._id, status: { $in: ["resolved", "closed"] } });
    await Department.findByIdAndUpdate(dept._id, { complaintCount: total, resolvedCount: resolved });
  }

  console.log("✓ Updated department metrics.");
  console.log("\nDone! Refresh the application in your browser.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
