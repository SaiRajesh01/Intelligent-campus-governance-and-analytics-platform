const express = require("express");
const router = express.Router();

const {
  createDepartment,
  getDepartments
} = require("../controllers/departmentController");

const {
  validateCreateDepartment
} = require("../middleware/validationMiddleware");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("admin"), validateCreateDepartment, createDepartment);
router.get("/", getDepartments);

module.exports = router;
