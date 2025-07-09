const express = require("express");
const router = express.Router();

const dashboardController = require("../controller/dashboardController")

router.get("/get-stats",dashboardController.getDashboardStatsController)

module.exports = router