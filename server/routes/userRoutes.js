const userController = require("../controller/userController");

const express = require("express");
const router = express.Router();


router.get("/all",userController.getAllUsers);

module.exports = router;
