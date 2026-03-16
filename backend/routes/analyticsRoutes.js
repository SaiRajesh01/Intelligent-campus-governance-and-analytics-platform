const express = require("express");
const router = express.Router();

const { analyticsSummary } = require("../controllers/analyticsController");

router.get("/summary", analyticsSummary);

module.exports = router