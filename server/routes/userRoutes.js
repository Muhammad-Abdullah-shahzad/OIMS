const userController = require("../controller/userController");

const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT")
const {authenticateRoles} = require("../middleware/authenticateRole")


router.get("/all",authenticateToken,authenticateRoles("super_admin"),userController.getAllUsers);

module.exports = router;
