const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT")
const {authenticateRoles} = require("../middleware/authenticateRole")


const dashboardController = require("../controller/dashboardController")

router.get("/get-stats",authenticateToken,authenticateRoles("super_admin"),dashboardController.getDashboardStatsController)

module.exports = router