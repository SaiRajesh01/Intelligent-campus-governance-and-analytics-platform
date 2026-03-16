require("dotenv").config()

const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")
const departmentRoutes = require("./routes/departmentRoutes")
const authRoutes = require("./routes/authRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")


const app = express()

connectDB()

app.use(cors())
app.use(express.json())
app.use("/api/auth",authRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/analytics",analyticsRoutes)

app.get("/", (req, res) => {
  res.send("Smart Campus Governance API Running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
