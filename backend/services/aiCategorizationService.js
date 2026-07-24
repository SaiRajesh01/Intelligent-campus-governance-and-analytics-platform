const Department = require("../models/Department");

// ---------------------------------------------------------------------------
// AI Categorization Service — Rule-Based / Keyword Classifier
// ---------------------------------------------------------------------------
//
// HOW TO SWAP FOR A REAL NLP / LLM API LATER:
// ─────────────────────────────────────────────
// This module exports a single async function with the signature:
//
//   async function aiCategorization(title, description) → { category, urgency, departmentId }
//
// To upgrade to a real AI backend:
//
// 1. Replace the keyword-matching logic below with an HTTP call to an
//    NLP / LLM endpoint (e.g. OpenAI, Google Vertex AI, Hugging Face, or a
//    self-hosted classifier).
//
//    Example with OpenAI:
//      const { Configuration, OpenAIApi } = require("openai");
//      const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
//      const response = await openai.createChatCompletion({
//        model: "gpt-4",
//        messages: [
//          { role: "system", content: "Classify the following campus complaint ..." },
//          { role: "user", content: `${title}\n${description}` }
//        ],
//        response_format: { type: "json_object" }
//      });
//      const { category, urgency } = JSON.parse(response.data.choices[0].message.content);
//
// 2. Validate / sanitize the AI output — ensure category is one of the allowed
//    enum values and urgency is one of low|medium|high|critical.
//
// 3. Keep the department-lookup logic (or let the AI return a department name
//    that you resolve to an ObjectId).
//
// 4. Add retry / fallback: if the external API is down, fall back to the
//    keyword classifier below so the system stays functional.
// ---------------------------------------------------------------------------

// ── Keyword → Category mapping ──────────────────────────────────────────────
// Each entry: { keywords: string[], category: string, departmentHint: string }
// departmentHint is a loose suggestion; the final department is resolved from DB.

const CATEGORY_RULES = [
  {
    keywords: [
      "wifi", "internet", "network", "lan", "server", "email",
      "website", "login", "password", "software", "computer",
      "printer", "projector", "it support", "system down"
    ],
    category: "IT/Network",
    departmentHint: "CSE"
  },
  {
    keywords: [
      "building", "road", "electricity", "power", "water",
      "plumbing", "leak", "broken", "furniture", "renovation",
      "construction", "elevator", "lift", "air conditioning", "ac",
      "fan", "light", "bulb", "maintenance", "parking"
    ],
    category: "Infrastructure",
    departmentHint: "Infrastructure"
  },
  {
    keywords: [
      "exam", "grade", "marks", "professor", "lecturer",
      "class", "timetable", "schedule", "syllabus", "attendance",
      "assignment", "lab", "library", "course", "registration",
      "semester", "academic", "faculty", "teacher", "lecture"
    ],
    category: "Academic",
    departmentHint: "A-CSE"
  },
  {
    keywords: [
      "hostel", "room", "roommate", "mess", "food", "canteen",
      "laundry", "warden", "curfew", "noise", "dormitory",
      "bed", "mattress", "kitchen", "dining"
    ],
    category: "Hostel",
    departmentHint: "Hostel"
  },
  {
    keywords: [
      "harassment", "bully", "bullying", "threat", "abuse",
      "stalking", "discrimination", "ragging", "sexual",
      "molestation", "intimidation", "assault"
    ],
    category: "Harassment",
    departmentHint: "Administration"
  },
  {
    keywords: [
      "fee", "scholarship", "admission", "certificate",
      "document", "id card", "administration", "office",
      "transfer", "bonafide", "form", "application",
      "refund", "payment", "registration"
    ],
    category: "Administrative",
    departmentHint: "Administration"
  }
];

// ── Urgency escalation keywords ─────────────────────────────────────────────
// If any of these appear, urgency is bumped to at least "high".
// A subset triggers "critical".
const CRITICAL_KEYWORDS = [
  "fire", "injury", "collapse", "electrocution", "explosion",
  "gas leak", "emergency", "death", "blood", "unconscious"
];
const HIGH_KEYWORDS = [
  "safety", "harassment", "threat", "assault", "abuse",
  "stalking", "ragging", "accident", "flood", "violence",
  "weapon", "dangerous", "urgent"
];

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Classify a complaint by title + description.
 *
 * @param {string} title       - complaint title
 * @param {string} description - complaint description body
 * @returns {Promise<{ category: string, urgency: string, departmentId: ObjectId }>}
 */
module.exports = async function aiCategorization(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  // ── 1. Determine category ────────────────────────────────────────────────
  let matchedCategory = "Other";
  let departmentHint = "CSE"; // fallback department
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    const score = rule.keywords.reduce((count, kw) => {
      return count + (text.includes(kw) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      matchedCategory = rule.category;
      departmentHint = rule.departmentHint;
    }
  }

  // ── 2. Determine urgency ─────────────────────────────────────────────────
  let urgency = "medium"; // default

  const hasCritical = CRITICAL_KEYWORDS.some((kw) => text.includes(kw));
  const hasHigh = HIGH_KEYWORDS.some((kw) => text.includes(kw));

  if (hasCritical) {
    urgency = "critical";
  } else if (hasHigh) {
    urgency = "high";
  } else if (matchedCategory === "Harassment") {
    // Harassment category always escalates to at least high
    urgency = "high";
  }

  // ── 3. Resolve department from DB ────────────────────────────────────────
  // Try the hint first; fall back to any department, then null.
  let department = await Department.findOne({ name: departmentHint });
  if (!department) {
    department = await Department.findOne({ name: "CSE" });
  }

  const departmentId = department ? department._id : null;

  return { category: matchedCategory, urgency, departmentId };
};