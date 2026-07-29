require("dotenv").config()

const express = require("express")
const http = require("http")
const cors = require("cors")
const cron = require("node-cron")
const connectDB = require("./config/db")
const initSocket = require("./sockets/notificationSocket")
const { setIO } = require("./sockets/socketInstance")
const departmentRoutes = require("./routes/departmentRoutes")
const authRoutes = require("./routes/authRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")
const complaintRoutes = require("./routes/complaintRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")
const { runEscalationCheck } = require("./services/escalationService")

const app = express()

// ---------------------------------------------------------------------------
// HTTP Server + Socket.io
// ---------------------------------------------------------------------------
const server = http.createServer(app)
const io = initSocket(server)

// Store io in the shared singleton so any controller / service can import it
setIO(io)

// Also store on app for convenience (optional, but common pattern)
app.set("io", io)

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

// Listen via the http server (not app.listen) so Socket.io is attached
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
