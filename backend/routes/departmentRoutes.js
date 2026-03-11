const express = require("express")
const router = express.Router()

const {
  createDepartment,
  getDepartments
} = require("../controllers/departmentController")

router.post("/", createDepartment)
router.get("/", getDepartments)

module.exports = router