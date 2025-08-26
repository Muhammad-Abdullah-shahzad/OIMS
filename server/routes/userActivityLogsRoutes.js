const express = require("express");
const router = express.Router();
// for routes protection
const {authenticateToken} = require("../middleware/verifyJWT");
const {authenticateRoles} = require("../middleware/authenticateRole");
const userActivityLogsController = require("../controller/userActivityLogsController");


router.get("/",userActivityLogsController.getAllApplicationLogs);
 
 module.exports = router;
 
 