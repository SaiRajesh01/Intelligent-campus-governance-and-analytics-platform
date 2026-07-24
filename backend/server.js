require("dotenv").config()

const express = require("express")
const cors = require("cors")
const cron = require("node-cron")
const connectDB = require("./config/db")
const departmentRoutes = require("./routes/departmentRoutes")
const authRoutes = require("./routes/authRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")
const complaintRoutes = require("./routes/complaintRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")
const { runEscalationCheck } = require("./services/escalationService")

const app = express()

connectDB()

// ---------------------------------------------------------------------------
// Cron Jobs
// ---------------------------------------------------------------------------
// Run SLA escalation check every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("[Cron] Running escalation check…")
  await runEscalationCheck()
})

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/complaints", complaintRoutes)
app.use("/api/notifications", notificationRoutes)

app.get("/", (req, res) => {
  res.send("Smart Campus Governance API Running")
})

// Centralized error handling — must be registered last
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
